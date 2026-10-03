import { parse } from '@babel/parser';
import type * as t from '@babel/types';

import { stripClasses } from './classes';
import {
  findPrimitive,
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

    // `import { Accordion as AccordionPrimitive } from "radix-ui"`: one
    // namespace per primitive, possibly several per declaration.
    if (source === 'radix-ui') {
      const moved: string[] = [];
      const kept: t.ImportSpecifier[] = [];
      for (const specifier of node.specifiers) {
        if (specifier.type !== 'ImportSpecifier') continue;
        const name = specifierName(specifier);
        const primitive = findPrimitive('radix-ui', toKebab(name));
        if (!primitive) {
          kept.push(specifier);
          if (!NOT_ANIMATED.has(toKebab(name)))
            unsupported.push(`radix-ui ${name}`);
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
          `import { ${kept.map(printSpecifier).join(', ')} } from ${quote}radix-ui${quote}${semi}`,
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

    const visitString = (node: t.StringLiteral | t.TemplateElement) => {
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
