import { parse } from '@babel/parser';
import type * as t from '@babel/types';

import { stripClasses } from './classes';
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
  unsupported: string[];
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
  return source.match(/^@base-ui(?:-components)?\/react\/([a-z-]+)$/)?.[1];
}

function specifierName(specifier: t.ImportSpecifier) {
  return specifier.imported.type === 'Identifier'
    ? specifier.imported.name
    : specifier.imported.value;
}

export function transform(code: string): TransformResult {
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  const edits: Edit[] = [];
  const imports: ImportChange[] = [];
  const unsupported: string[] = [];
  const swapped: Primitive[] = [];

  for (const node of ast.program.body) {
    if (node.type !== 'ImportDeclaration' || node.importKind === 'type')
      continue;
    const source = node.source.value;
    const quote = code[node.source.start!];

    if (source === 'react-aria-components') {
      const names = node.specifiers.flatMap((specifier) =>
        specifier.type === 'ImportSpecifier' ? [specifierName(specifier)] : [],
      );
      const animated = names.flatMap((name) => {
        const primitive = findReactAriaPrimitive(name);
        return primitive ? [{ name, primitive }] : [];
      });
      if (animated.length === 0) continue;
      const to = primitiveModule(animated[0]!.primitive);
      edits.push({
        start: node.source.start!,
        end: node.source.end!,
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
      for (const specifier of node.specifiers) {
        if (specifier.type !== 'ImportSpecifier') continue;
        const name = specifierName(specifier);
        const primitive = findPrimitive(umbrella, toKebab(name));
        if (primitive) animated.push({ name, primitive });
        else if (!NOT_ANIMATED.has(toKebab(name)))
          unsupported.push(`${source} ${name}`);
      }
      if (animated.length === 0) continue;
      edits.push({
        start: node.source.start!,
        end: node.source.end!,
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
        start: node.source.start!,
        end: node.source.end!,
        text: `${quote}${to}${quote}`,
      });
      imports.push({ from: source, to, name });
      swapped.push(primitive);
      break;
    }
  }

  const removedClasses: string[] = [];

  if (swapped.length > 0) {
    const extra = swapped.flatMap((primitive) => primitive.strip ?? []);

    const handled = new Set<t.Node>();

    const visitString = (node: t.StringLiteral | t.TemplateElement) => {
      if (handled.has(node)) return;
      const value = node.type === 'StringLiteral' ? node.value : node.value.raw;
      const result = stripClasses(value, extra);
      if (result.removed.length === 0) return;
      removedClasses.push(...result.removed);
      if (node.type === 'StringLiteral') {
        const delimiter = code[node.start!];
        edits.push({
          start: node.start!,
          end: node.end!,
          text: `${delimiter}${result.value}${delimiter}`,
        });
      } else {
        edits.push({ start: node.start!, end: node.end!, text: result.value });
      }
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

  return { code: output, imports, removedClasses, unsupported };
}
