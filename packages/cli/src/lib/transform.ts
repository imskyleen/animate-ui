import { parse } from '@babel/parser';
import type * as t from '@babel/types';

import { centerWithMargins, stripClasses } from './classes';
import {
  findPrimitive,
  barrelModule,
  findReactAriaPrimitive,
  primitiveModule,
  toKebab,
  type Library,
  type Primitive,
} from './primitives';

export type ImportChange = { from: string; to: string; name: string };

export type TransformResult = {
  code: string;
  imports: ImportChange[];
  removedClasses: string[];
  centering: string[];
  unsupported: string[];
  beta: string[];
};

type Edit = { start: number; end: number; text: string };

const MERGE_FUNCTIONS = new Set(['cn', 'clsx', 'cx', 'twMerge', 'twJoin']);

const CLASS_FUNCTIONS = new Set([
  'cn',
  'clsx',
  'cx',
  'cva',
  'tv',
  'twMerge',
  'twJoin',
]);

const NOT_ANIMATED = new Set([
  'slot',
  'label',
  'separator',
  'visually-hidden',
  'accessible-icon',
  'direction',
  'portal',
  'aspect-ratio',
  'use-render',
  'merge-props',
  'button',
  'input',
  'field',
  'fieldset',
  'form',
]);

function radixPackageName(source: string) {
  return source.match(/^@radix-ui\/react-(.+)$/)?.[1];
}

function baseUiPackageName(source: string) {
  return source.match(/^@base-ui\/react\/([a-z-]+)$/)?.[1];
}

function nameOf(node: t.Identifier | t.StringLiteral) {
  return node.type === 'Identifier' ? node.name : node.value;
}

type Specifier =
  | t.ImportSpecifier
  | t.ImportDefaultSpecifier
  | t.ImportNamespaceSpecifier
  | t.ExportSpecifier
  | t.ExportDefaultSpecifier
  | t.ExportNamespaceSpecifier;

function specifierName(specifier: t.ImportSpecifier | t.ExportSpecifier) {
  return nameOf(
    specifier.type === 'ImportSpecifier' ? specifier.imported : specifier.local,
  );
}

export type TransformOptions = { tailwind?: 3 | 4 };

export function transform(
  code: string,
  file = 'file.tsx',
  options: TransformOptions = {},
): TransformResult {
  const ast = parse(code, {
    sourceType: 'module',
    plugins: /\.[cm]?ts$/.test(file) ? ['typescript'] : ['typescript', 'jsx'],
  });

  const edits: Edit[] = [];
  const imports: ImportChange[] = [];
  const unsupported: string[] = [];
  const beta: string[] = [];
  const swapped: Primitive[] = [];

  const membersOf = (local: string) =>
    [
      ...code.matchAll(new RegExp(`\\b${local}\\.([A-Za-z_$][\\w$]*)`, 'g')),
    ].map((match) => match[1]!);

  for (const node of ast.program.body) {
    if (!(
      (node.type === 'ImportDeclaration' && node.importKind !== 'type') ||
      (node.type === 'ExportNamedDeclaration' &&
        node.source &&
        node.exportKind !== 'type') ||
      (node.type === 'ExportAllDeclaration' && node.exportKind !== 'type')
    ))
      continue;
    const source = node.source!.value;
    const quote = code[node.source!.start!];
    const specifiers: Specifier[] =
      node.type === 'ExportAllDeclaration' ? [] : node.specifiers;
    const everything = node.type === 'ExportAllDeclaration';
    const namesOf = () =>
      specifiers.flatMap((specifier) =>
        specifier.type === 'ImportSpecifier' ||
        specifier.type === 'ExportSpecifier'
          ? [specifierName(specifier)]
          : specifier.type === 'ImportNamespaceSpecifier'
            ? membersOf(specifier.local.name)
            : [],
      );

    if (/^@base-ui-components\/react(\/|$)/.test(source)) {
      beta.push(source);
      continue;
    }

    if (source === 'react-aria-components') {
      const animated = namesOf().flatMap((name) => {
        const primitive = findReactAriaPrimitive(name);
        return primitive ? [{ name, primitive }] : [];
      });
      if (animated.length === 0) continue;
      const to = primitiveModule(animated[0]!.primitive);
      edits.push({
        start: node.source!.start!,
        end: node.source!.end!,
        text: `${quote}${to}${quote}`,
      });
      for (const { name, primitive } of animated) {
        imports.push({ from: source, to, name });
        swapped.push(primitive);
      }
      continue;
    }

    const umbrella: Library | undefined =
      source === 'radix-ui'
        ? 'radix-ui'
        : source === '@base-ui/react'
          ? 'base-ui'
          : undefined;
    if (umbrella) {
      const to = barrelModule(umbrella);
      const animated: { name: string; primitive: Primitive }[] = [];
      for (const name of new Set(namesOf())) {
        const primitive = findPrimitive(umbrella, toKebab(name));
        if (primitive) animated.push({ name, primitive });
        else if (!NOT_ANIMATED.has(toKebab(name)))
          unsupported.push(`${source} ${name}`);
      }
      if (everything) {
        edits.push({
          start: node.source!.start!,
          end: node.source!.end!,
          text: `${quote}${to}${quote}`,
        });
        imports.push({ from: source, to, name: '*' });
        continue;
      }
      if (animated.length === 0) continue;
      edits.push({
        start: node.source!.start!,
        end: node.source!.end!,
        text: `${quote}${to}${quote}`,
      });
      for (const { name, primitive } of animated) {
        imports.push({ from: source, to, name });
        swapped.push(primitive);
      }
      continue;
    }

    const perPackage: [Library, string | undefined][] = [
      ['radix-ui', radixPackageName(source)],
      ['base-ui', baseUiPackageName(source)],
      ['radix-ui', source === 'vaul' ? 'drawer' : undefined],
      ['animate-ui', source === 'input-otp' ? 'input-otp' : undefined],
      [
        'animate-ui',
        source === '@shadcn/react/questionnaire' ? 'questionnaire' : undefined,
      ],
    ];
    for (const [library, name] of perPackage) {
      if (!name) continue;
      const primitive = findPrimitive(library, name);
      if (!primitive) {
        if (!NOT_ANIMATED.has(name)) unsupported.push(source);
        break;
      }
      const to = primitiveModule(primitive);
      edits.push({
        start: node.source!.start!,
        end: node.source!.end!,
        text: `${quote}${to}${quote}`,
      });
      if (source.startsWith('@radix-ui/'))
        for (const specifier of specifiers) {
          if (
            (specifier.type !== 'ImportSpecifier' &&
              specifier.type !== 'ExportSpecifier') ||
            toKebab(specifierName(specifier)) !== name
          )
            continue;
          edits.push({
            start: specifier.start!,
            end: specifier.end!,
            text: `Root as ${
              specifier.type === 'ImportSpecifier'
                ? specifier.local.name
                : nameOf(specifier.exported)
            }`,
          });
        }
      imports.push({ from: source, to, name });
      swapped.push(primitive);
      break;
    }
  }

  const removedClasses: string[] = [];
  const centering: string[] = [];

  if (swapped.length > 0) {
    const extra = swapped.flatMap((primitive) => primitive.strip ?? []);

    const handled = new Set<t.Node>();

    const visitString = (node: t.StringLiteral | t.TemplateElement) => {
      if (handled.has(node)) return;
      const quoted = node.type === 'StringLiteral' ? 1 : 0;
      const start = node.start! + quoted;
      const end = node.end! - quoted;
      const result = stripClasses(code.slice(start, end), extra);
      const centered =
        options.tailwind === 3
          ? centerWithMargins(result.value)
          : { value: result.value, replaced: [] as string[] };
      if (result.removed.length === 0 && centered.replaced.length === 0) return;
      removedClasses.push(...result.removed);
      centering.push(...centered.replaced);
      edits.push({ start, end, text: centered.value });
    };

    const walk = (node: unknown, inClasses: boolean): void => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) {
        for (const child of node) walk(child, inClasses);
        return;
      }
      const n = node as t.Node;
      if (typeof n.type !== 'string') return;

      if (
        inClasses &&
        (n.type === 'StringLiteral' || n.type === 'TemplateElement')
      ) {
        visitString(n);
        return;
      }

      if (n.type === 'ObjectProperty') {
        walk(n.value, inClasses);
        return;
      }

      let childInClasses = inClasses;
      if (
        n.type === 'JSXAttribute' &&
        n.name.type === 'JSXIdentifier' &&
        (n.name.name === 'className' || n.name.name === 'class')
      ) {
        childInClasses = true;
      } else if (
        n.type === 'CallExpression' &&
        n.callee.type === 'Identifier' &&
        CLASS_FUNCTIONS.has(n.callee.name)
      ) {
        childInClasses = true;
        if (MERGE_FUNCTIONS.has(n.callee.name)) {
          const args = n.arguments;
          const emptied = new Set<number>();
          args.forEach((arg, i) => {
            if (arg.type !== 'StringLiteral' || !arg.value.trim()) return;
            if (stripClasses(arg.value, extra).value.trim() === '')
              emptied.add(i);
          });
          if (emptied.size > 0 && emptied.size < args.length) {
            const lastKept = Math.max(
              ...args.map((_, i) => (emptied.has(i) ? -1 : i)),
            );
            args.forEach((arg, i) => {
              if (!emptied.has(i)) return;
              removedClasses.push(
                ...stripClasses((arg as t.StringLiteral).value, extra).removed,
              );
              handled.add(arg);
              if (i < lastKept) {
                edits.push({
                  start: arg.start!,
                  end: args[i + 1]!.start!,
                  text: '',
                });
              } else if (i === lastKept + 1) {
                edits.push({
                  start: args[lastKept]!.end!,
                  end: args[args.length - 1]!.end!,
                  text: '',
                });
              }
            });
          }
        }
      }

      for (const key of Object.keys(n)) {
        if (
          key === 'loc' ||
          key === 'start' ||
          key === 'end' ||
          key.endsWith('Comments')
        )
          continue;
        walk((n as unknown as Record<string, unknown>)[key], childInClasses);
      }
    };

    walk(ast.program, false);
  }

  let output = code;
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  }

  return {
    code: output,
    imports,
    removedClasses,
    centering,
    unsupported,
    beta,
  };
}
