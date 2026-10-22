// Writes the Vue icons (registry/vue/{icons,hugeicons}/<name>/<Name>.vue) from
// the React ones, and the icon map of apps/vue-demos. Both draw from the same
// animations, copied as they are; the JSX becomes the SFC's template.
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..');
const registry = path.join(root, 'registry');

const KEEP_CAMEL = new Set([
  'viewBox',
  'preserveAspectRatio',
  'pathLength',
  'gradientUnits',
  'gradientTransform',
  'patternUnits',
  'patternTransform',
  'clipPathUnits',
  'maskUnits',
  'maskContentUnits',
  'spreadMethod',
  'startOffset',
  'textLength',
  'lengthAdjust',
  'markerWidth',
  'markerHeight',
  'refX',
  'refY',
  'attributeName',
]);

const kebab = (name: string) =>
  KEEP_CAMEL.has(name)
    ? name
    : name === 'className'
      ? 'class'
      : name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const pascal = (name: string) =>
  name
    .split('-')
    .map((part) =>
      /^\d/.test(part) ? part : part[0]!.toUpperCase() + part.slice(1),
    )
    .join('');

/** Index past the closing brace that matches the one at `start`. */
function closeBrace(source: string, start: number) {
  let depth = 0;
  for (let i = start; i < source.length; i++) {
    const c = source[i]!;
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return i;
    } else if (c === '"' || c === "'" || c === '`') {
      i = source.indexOf(c, i + 1);
    }
  }
  throw new Error('unbalanced braces');
}

/** A JSX attribute list as Vue template attributes (`{...props}` last, as React spreads it). */
function attributes(source: string) {
  const out: string[] = [];
  let i = 0;
  while (i < source.length) {
    if (/\s/.test(source[i]!)) {
      i++;
      continue;
    }
    if (source.startsWith('{...props}', i)) {
      out.push('v-bind="attrs"');
      i += '{...props}'.length;
      continue;
    }
    const name = /^[A-Za-z_][\w-]*/.exec(source.slice(i))![0];
    i += name.length;
    if (source[i] !== '=') {
      out.push(kebab(name));
      continue;
    }
    i++;
    if (source[i] === '"') {
      const end = source.indexOf('"', i + 1);
      // A DOM-rendered svg needs no namespace, and Volar trips on it.
      if (name !== 'xmlns')
        out.push(`${kebab(name)}="${source.slice(i + 1, end)}"`);
      i = end + 1;
    } else {
      const end = closeBrace(source, i);
      const expression = source
        .slice(i + 1, end)
        .trim()
        .replaceAll('"', "'");
      out.push(`:${kebab(name)}="${expression}"`);
      i = end + 1;
    }
  }
  return out;
}

/** The icon's JSX tree as an indented Vue template. */
function template(jsx: string) {
  const lines: string[] = [];
  let depth = 0;
  const tag = /<(\/?)([A-Za-z.]+)/g;
  let match: RegExpExecArray | null;
  while ((match = tag.exec(jsx))) {
    const [, closing, name] = match;
    let end = match.index + match[0].length;
    let braces = 0;
    for (; ; end++) {
      const c = jsx[end]!;
      if (c === '{') braces++;
      else if (c === '}') braces--;
      else if (c === '"' || c === "'" || c === '`')
        end = jsx.indexOf(c, end + 1);
      else if (c === '>' && braces === 0) break;
    }
    let inner = jsx.slice(match.index + match[0].length, end);
    tag.lastIndex = end + 1;
    const pad = '  '.repeat(depth);
    if (closing) {
      depth--;
      lines.push(`${'  '.repeat(depth)}</${name}>`);
      continue;
    }
    const selfClosing = inner.trimEnd().endsWith('/');
    if (selfClosing) inner = inner.trimEnd().slice(0, -1);
    const attrs = attributes(inner);
    if (attrs.length === 0)
      lines.push(`${pad}<${name}${selfClosing ? ' />' : '>'}`);
    else {
      lines.push(`${pad}<${name}`);
      for (const attr of attrs) lines.push(`${pad}  ${attr}`);
      lines.push(`${pad}${selfClosing ? '/>' : '>'}`);
    }
    if (!selfClosing) depth++;
  }
  return lines;
}

function convert(file: string, library: string) {
  const source = readFileSync(file, 'utf8');
  const name = path.basename(path.dirname(file));
  const component = pascal(name);
  const importsEnd = source.indexOf(
    '\n\n',
    source.lastIndexOf("} from '@animate-ui/react/icons';"),
  );
  const iconStart = source.indexOf('function IconComponent');
  const head = source
    .slice(importsEnd, iconStart)
    .trim()
    .replace(/^type (\w+)Props = /m, 'export type $1Props = ')
    .replace('const animations = {', 'export const animations = {');
  const body =
    /function IconComponent\([^)]*\)\s*\{[\s\S]*?\n {2}return \(\n([\s\S]*?)\n {2}\);\n\}/.exec(
      source.slice(iconStart),
    )!;
  let jsx = body[1]!;
  const drawsPaths = jsx.includes('IconPathStyle');
  if (drawsPaths)
    jsx = jsx
      .replace('<>', '')
      .replace('</>', '')
      .replace('<IconPathStyle />', '')
      .replace(
        "className={[pathClassName, className].filter(Boolean).join(' ')}",
        'className={pathClassName}',
      );
  const scriptImports = [
    ...(head.includes('Variants')
      ? ["import type { Variants } from 'motion-v'"]
      : []),
    ...(/export type \w+Props/.test(head)
      ? ["import type { IconProps } from '@animate-ui/vue/icons'"]
      : []),
  ];
  const setupImports = drawsPaths
    ? "import { IconWrapper, pathClassName, usePathStyle } from '@animate-ui/vue/icons'"
    : "import { IconWrapper } from '@animate-ui/vue/icons'";
  const sfc = `<script lang="ts">
${scriptImports.join('\n')}

${head}
</script>

<script setup lang="ts">
${setupImports}
import { motion } from 'motion-v'

defineOptions({ name: '${component}', inheritAttrs: false })
${drawsPaths ? 'usePathStyle()\n' : ''}</script>

<template>
  <IconWrapper
    v-slot="{ variants, controls, size, attrs }"
    :animations="animations"
    v-bind="$attrs"
  >
${template(jsx.trim())
  .map((line) => `    ${line}`)
  .join('\n')}
  </IconWrapper>
</template>
`;
  const out = path.join(registry, 'vue', library, name);
  mkdirSync(out, { recursive: true });
  writeFileSync(path.join(out, `${component}.vue`), sfc);
  const meta = path.join(path.dirname(file), 'meta.json');
  if (existsSync(meta))
    writeFileSync(path.join(out, 'meta.json'), readFileSync(meta));
  return `${name}/${component}.vue`;
}

const map: string[] = [];
for (const [library, key] of [
  ['icons', 'lucide'],
  ['hugeicons', 'hugeicons'],
] as const) {
  rmSync(path.join(registry, 'vue', library), { recursive: true, force: true });
  for (const name of readdirSync(path.join(registry, library)).sort()) {
    const file = path.join(registry, library, name, 'index.tsx');
    if (!existsSync(file)) continue;
    const vue = convert(file, library);
    map.push(
      `  '${key}/${name}': () => import('../../v2/registry/vue/${library}/${vue}'),`,
    );
  }
}

writeFileSync(
  path.join(root, '..', 'vue-demos', 'src', 'icons.ts'),
  `// Generated from apps/v2/registry/vue. Do not edit.\n\nexport const icons: Record<string, () => Promise<{ default: unknown }>> = {\n${map.join('\n')}\n}\n`,
);
console.log(`Vue icons: ${map.length}`);
