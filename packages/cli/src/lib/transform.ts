import { parse } from '@babel/parser';
import type * as t from '@babel/types';

import { stripClasses } from './classes';
import {
  findPrimitive,
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
  /** Primitives imported from a supported library that Animate UI doesn't animate yet. */
  unsupported: string[];
};

type Edit = { start: number; end: number; text: string };

// Calls whose string arguments are class lists.

// Class mergers: an emptied argument can simply go.
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

// Primitives with nothing to animate: never reported as missing.
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

/** `@radix-ui/react-alert-dialog` → `alert-dialog`. */
function radixPackageName(source: string) {
  return source.match(/^@radix-ui\/react-(.+)$/)?.[1];
}

/** `@base-ui/react/accordion` (or the old `@base-ui-components/react/…`) → `accordion`. */
function baseUiPackageName(source: string) {
  return source.match(/^@base-ui(?:-components)?\/react\/([a-z-]+)$/)?.[1];
}

function specifierName(specifier: t.ImportSpecifier) {
  return specifier.imported.type === 'Identifier'
    ? specifier.imported.name
    : specifier.imported.value;
}

function printSpecifier(specifier: t.ImportSpecifier) {
  const imported = specifierName(specifier);
  const local = specifier.local.name;
  const typePrefix = specifier.importKind === 'type' ? 'type ' : '';
  return local === imported
    ? `${typePrefix}${imported}`
    : `${typePrefix}${imported} as ${local}`;
}

/**
 * Swaps the primitive imports of one file for Animate UI's and removes the
 * CSS animation classes they made redundant. Pure: returns the new code.
 */
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
    const raw = code.slice(node.start!, node.end!);
    const semi = raw.trimEnd().endsWith(';') ? ';' : '';
    const quote = code[node.source.start!];

    // `import { Popover, Button } from "react-aria-components"`: the whole
    // import moves to Animate UI's mirror, which re-exports everything.
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

    // `import { Accordion as AccordionPrimitive } from "radix-ui"` (or
    // `{ Combobox } from "@base-ui/react"`): one namespace per primitive,
    // possibly several per declaration.
    const umbrella: Library | undefined =
      source === 'radix-ui'
        ? 'radix-ui'
        : source === '@base-ui/react'
          ? 'base-ui'
          : undefined;
    if (umbrella) {
      const moved: string[] = [];
      const kept: t.ImportSpecifier[] = [];
      for (const specifier of node.specifiers) {
        if (specifier.type !== 'ImportSpecifier') continue;
        const name = specifierName(specifier);
        const primitive = findPrimitive(umbrella, toKebab(name));
        if (!primitive) {
          kept.push(specifier);
          if (!NOT_ANIMATED.has(toKebab(name)))
            unsupported.push(`${source} ${name}`);
          continue;
        }
        const to = primitiveModule(primitive);
        moved.push(
          `import { ${printSpecifier(specifier)} } from ${quote}${to}${quote}${semi}`,
        );
        imports.push({ from: source, to, name });
        swapped.push(primitive);
      }
      if (moved.length === 0) continue;
      const lines = [...moved];
      if (kept.length > 0) {
        lines.unshift(
          `import { ${kept.map(printSpecifier).join(', ')} } from ${quote}${source}${quote}${semi}`,
        );
      }
      edits.push({
        start: node.start!,
        end: node.end!,
        text: lines.join('\n'),
      });
      continue;
    }

    // One package per primitive: only the source changes.
    const perPackage: [Library, string | undefined][] = [
      ['radix-ui', radixPackageName(source)],
      ['base-ui', baseUiPackageName(source)],
      // shadcn/ui's Radix Drawer imports Vaul: its replacement has its API.
      ['radix-ui', source === 'vaul' ? 'drawer' : undefined],
      // shadcn/ui's InputOTP (every base) imports input-otp: Animate UI's
      // own input-otp is a drop-in replacement.
      ['animate-ui', source === 'input-otp' ? 'input-otp' : undefined],
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

  // Only files whose primitives now animate lose their CSS animations.
  if (swapped.length > 0) {
    const extra = swapped.flatMap((primitive) => primitive.strip ?? []);

    // Strings already removed whole (emptied class-merger arguments).
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
        // A class-list argument left empty is dropped with its comma, so
        // `cn("animate-in", className)` becomes `cn(className)`. cva/tv keep
        // their (base classes) first argument.
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
              // Before a kept argument: remove it up to the next one. After
              // the last kept one: remove the whole trailing run at once.
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
