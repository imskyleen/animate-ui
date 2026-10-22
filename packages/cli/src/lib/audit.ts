import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { parse } from '@babel/parser';
import type * as t from '@babel/types';

export type Cost = 'compositor' | 'main-thread' | 'paint' | 'layout' | 'other';

export type FactKind =
  | 'animated-properties'
  | 'transition-all'
  | 'ease-in'
  | 'long-duration'
  | 'hover-scale'
  | 'scale-from-zero'
  | 'infinite-loop'
  | 'layout-animation'
  | 'will-change'
  | 'no-origin'
  | 'css-transition-conflict'
  | 'hidden-on-first-paint'
  | 'hover-not-gated'
  | 'no-reduced-motion';

export type Fact = {
  file: string;
  line: number;
  kind: FactKind;
  detail: string;
  properties?: { name: string; cost: Cost }[];
};

export type AuditReport = {
  root: string;
  files: number;
  filesWithMotion: string[];
  facts: Fact[];
  reducedMotion: { files: string[]; project: string[] };
  unreadable: string[];
};

const SOURCE = ['.tsx', '.jsx', '.ts', '.js', '.mts', '.mjs', '.vue'];
const STYLES = ['.css', '.scss'];
const SKIP = new Set([
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'out',
  'coverage',
  '.turbo',
  '.vercel',
  '.output',
  '.svelte-kit',
]);

const COMPOSITOR = new Set([
  'x',
  'y',
  'z',
  'scale',
  'scaleX',
  'scaleY',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
  'skew',
  'skewX',
  'skewY',
  'translate',
  'translateX',
  'translateY',
  'transform',
  'opacity',
  'filter',
  'backdropFilter',
  'backdrop-filter',
]);
const LAYOUT = new Set([
  'width',
  'height',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'top',
  'left',
  'right',
  'bottom',
  'inset',
  'margin',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'padding',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'gap',
  'fontSize',
  'lineHeight',
  'letterSpacing',
  'borderWidth',
  'flexBasis',
  'gridTemplateColumns',
  'gridTemplateRows',
]);
const PAINT = new Set([
  'colors',
  'r',
  'cx',
  'cy',
  'rx',
  'ry',
  'x1',
  'x2',
  'y1',
  'y2',
  'points',
  'strokeOpacity',
  'fillOpacity',
  'stopColor',
  'color',
  'background',
  'backgroundColor',
  'backgroundPosition',
  'backgroundSize',
  'borderColor',
  'borderRadius',
  'boxShadow',
  'outline',
  'outlineColor',
  'textShadow',
  'fill',
  'stroke',
  'strokeWidth',
  'strokeDasharray',
  'strokeDashoffset',
  'pathLength',
  'pathOffset',
  'clipPath',
  'maskImage',
  'visibility',
]);

const SHORTHANDS =
  /^(x|y|z|scale|scaleX|scaleY|rotate|rotateX|rotateY|rotateZ|skew|skewX|skewY)$/;

export function costOf(name: string, motion = false): Cost {
  const raw = name.trim().replace(/^_+/, '');
  if (motion && SHORTHANDS.test(raw)) return 'main-thread';
  if (raw.startsWith('--')) return 'paint';
  const key = camel(raw);
  if (COMPOSITOR.has(key)) return 'compositor';
  if (LAYOUT.has(key) || /^(margin|padding|inset)/.test(key)) return 'layout';
  if (PAINT.has(key) || /^(border|background)/.test(key)) return 'paint';
  if (key === 'd') return 'paint';
  return 'other';
}

const MOTION_TARGETS = new Set([
  'initial',
  'animate',
  'exit',
  'whileHover',
  'whileTap',
  'whilePress',
  'whileFocus',
  'whileInView',
  'whileDrag',
]);
const REDUCED = [
  /useReducedMotion\b/,
  /useShouldReduceMotion\b/,
  /ReducedMotionConfig\b/,
  /reducedMotion\s*=/,
  /\bmotion-(reduce|safe):/,
  /prefers-reduced-motion/,
];
const PROJECT_REDUCED = [
  /<MotionConfig[^>]*reducedMotion\s*=\s*["{]/,
  /<ReducedMotionConfig[^>]*>\s*\{\s*(props\.)?children\s*\}/,
  /@media[^{]*prefers-reduced-motion[^{]*\{\s*(\*|html|:root|body)[\s,{:]/,
];
const LONG = 0.4;

function walk(dir: string, out: string[]) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.name.startsWith('.') ||
      entry.name.startsWith('__') ||
      SKIP.has(entry.name)
    )
      continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (
      [...SOURCE, ...STYLES].includes(path.extname(entry.name)) &&
      !/\.(test|spec|stories|d)\.[cm]?[jt]sx?$/.test(entry.name)
    ) {
      out.push(full);
    }
  }
}

export function listAuditFiles(root: string, targets: string[]) {
  const files: string[] = [];
  if (!existsSync(root)) throw new Error(`No folder at ${root}.`);
  const starts = targets.length ? targets : ['.'];
  for (const target of starts) {
    const full = path.resolve(root, target);
    if (!existsSync(full)) throw new Error(`No file or folder at ${target}.`);
    if (statSync(full).isDirectory()) walk(full, files);
    else files.push(full);
  }
  return [...new Set(files)].sort();
}

const lineAt = (text: string, index: number) =>
  text.slice(0, index).split('\n').length;

const seconds = (value: string) => {
  const match = value.match(/(-?[\d.]+)(ms|s)\b/);
  if (!match) return undefined;
  return match[2] === 'ms' ? Number(match[1]) / 1000 : Number(match[1]);
};

function splitTop(value: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '(') depth++;
    else if (value[i] === ')') depth--;
    else if (value[i] === ',' && depth === 0) {
      parts.push(value.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(value.slice(start));
  return parts.map((part) => part.trim()).filter(Boolean);
}

const EASE_IN =
  /(^|[\s,(])ease-in(?![-\w])|cubic-bezier\(\s*0?\.[4-9]\d*\s*,\s*0\s*,\s*1\s*,\s*1\s*\)/;

function mediaBlocks(text: string) {
  const blocks: { start: number; end: number; query: string }[] = [];
  for (const match of text.matchAll(/@media([^{]*)\{/g)) {
    let depth = 1;
    let i = match.index + match[0].length;
    for (; i < text.length && depth; i++) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') depth--;
    }
    blocks.push({ start: match.index, end: i, query: match[1] ?? '' });
  }
  return blocks;
}

function auditCss(file: string, text: string, facts: Fact[]) {
  const media = mediaBlocks(text);
  for (const match of text.matchAll(/([^{};]*:hover[^{]*)\{([^}]*)\}/g)) {
    const body = match[2] ?? '';
    if (!/\b(transform|translate|scale|rotate)\s*:/.test(body)) continue;
    const inside = (query: RegExp) =>
      media.some(
        (block) =>
          block.start < match.index &&
          block.end > match.index &&
          query.test(block.query),
      );
    if (inside(/prefers-reduced-motion\s*:\s*reduce/)) continue;
    if (/\b(transform|translate|scale|rotate)\s*:\s*none\s*(;|$)/.test(body))
      continue;
    const line = lineAt(
      text,
      match.index + (match[0].length - match[0].trimStart().length),
    );
    const grows =
      body.match(/\bscale\s*:\s*([\d.]+)/)?.[1] ??
      body.match(/scale[XY]?\(\s*([\d.]+)/)?.[1];
    if (grows !== undefined && Number(grows) !== 1)
      facts.push({
        file,
        line,
        kind: 'hover-scale',
        detail: `${(match[1] ?? '').trim()} scales to ${grows} on hover`,
      });
    if (!inside(/hover\s*:\s*hover/))
      facts.push({
        file,
        line,
        kind: 'hover-not-gated',
        detail: `${(match[1] ?? '').trim()} moves on hover outside @media (hover: hover): a tap on a touch screen leaves it there`,
      });
  }

  const keyframes = new Map<
    string,
    { line: number; names: string[]; enters: boolean }
  >();
  for (const match of text.matchAll(
    /@keyframes\s+([\w-]+)\s*\{((?:[^{}]*\{[^{}]*\})*)[^{}]*\}/g,
  )) {
    const names = new Set<string>();
    for (const declaration of match[2]!.matchAll(/([\w-]+)\s*:/g))
      names.add(declaration[1]!);
    keyframes.set(match[1]!, {
      line: lineAt(text, match.index),
      names: [...names],
      enters:
        /^\s*(from|0%)\s*\{[^}]*(opacity:\s*0(?![.\d])|translate|scale\(0)/.test(
          match[2] ?? '',
        ),
    });
  }

  for (const match of text.matchAll(
    /(?<![\w-])(transition|transition-property|animation|will-change)\s*:\s*([^;{}]+)/g,
  )) {
    const [, property = '', value = ''] = match;
    const line = lineAt(text, match.index);
    if (property === 'will-change') {
      facts.push({ file, line, kind: 'will-change', detail: value.trim() });
      continue;
    }
    if (property === 'animation') {
      for (const part of splitTop(value)) {
        const name = part
          .split(/\s+/)
          .find(
            (token) =>
              keyframes.has(token) ||
              (/^[a-z][\w-]*$/i.test(token) &&
                !/^(ease|linear|infinite|forwards|backwards|both|none|alternate|reverse|normal|running|paused|step)/.test(
                  token,
                )),
          );
        const frames = name ? keyframes.get(name) : undefined;
        if (frames)
          facts.push({
            file,
            line,
            kind: 'animated-properties',
            detail: `animation ${name}`,
            properties: frames.names.map((n) => ({ name: n, cost: costOf(n) })),
          });
        if (/\binfinite\b/.test(part))
          facts.push({
            file,
            line,
            kind: 'infinite-loop',
            detail: `animation ${name ?? part} repeats forever`,
          });
        if (EASE_IN.test(part))
          facts.push({
            file,
            line,
            kind: 'ease-in',
            detail: `animation ${part}${frames?.enters ? ' (its keyframes enter: they start hidden or off place)' : ''}`,
          });
        const duration = seconds(part);
        if (
          duration !== undefined &&
          duration >= LONG &&
          !/\binfinite\b/.test(part)
        )
          facts.push({
            file,
            line,
            kind: 'long-duration',
            detail:
              `${Math.round(duration * 1000)}ms (animation ${name ?? ''})`.replace(
                ' ()',
                '',
              ),
          });
      }
      continue;
    }
    const parts = splitTop(value);
    const names =
      property === 'transition-property'
        ? parts
        : parts.map((part) => part.split(/\s+/)[0] ?? '');
    if (names.includes('all'))
      facts.push({
        file,
        line,
        kind: 'transition-all',
        detail: `${property}: ${value.trim()}`,
      });
    const listed = names.filter((name) => name !== 'all' && name !== 'none');
    if (listed.length)
      facts.push({
        file,
        line,
        kind: 'animated-properties',
        detail: property,
        properties: listed.map((name) => ({ name, cost: costOf(name) })),
      });
    if (property === 'transition') {
      for (const part of parts) {
        if (EASE_IN.test(part))
          facts.push({
            file,
            line,
            kind: 'ease-in',
            detail: `transition ${part}`,
          });
        const duration = seconds(part);
        if (duration !== undefined && duration >= LONG)
          facts.push({
            file,
            line,
            kind: 'long-duration',
            detail: `${Math.round(duration * 1000)}ms (transition ${part.split(/\s+/)[0] ?? ''})`,
          });
      }
    }
  }
}

const TAILWIND_TRANSITION: Record<string, string[]> = {
  transition: ['colors', 'box-shadow', 'opacity', 'transform', 'filter'],
  'transition-colors': ['colors'],
  'transition-opacity': ['opacity'],
  'transition-shadow': ['box-shadow'],
  'transition-transform': ['transform'],
};

type Segment = { text: string; line: number };

function auditClasses(file: string, segments: Segment[], facts: Fact[]) {
  const prefix = String.raw`(?<=^|\s)((?:[\w-]+:)*)`;
  const each = (
    pattern: string,
    run: (
      p: string,
      v: string,
      line: number,
      all: string,
      text: string,
    ) => void,
  ) => {
    for (const segment of segments)
      for (const match of segment.text.matchAll(
        new RegExp(prefix + pattern + String.raw`(?=$|\s)`, 'gm'),
      ))
        run(
          match[1] ?? '',
          match[2] ?? '',
          segment.line +
            segment.text.slice(0, match.index).split('\n').length -
            1,
          match[0],
          segment.text,
        );
  };
  each(String.raw`transition-all`, (p, v, line) =>
    facts.push({
      file,
      line,
      kind: 'transition-all',
      detail: `${p}transition-all`,
    }),
  );
  each(
    String.raw`(transition(?:-colors|-opacity|-shadow|-transform)?)`,
    (p, v, line) => {
      const names = TAILWIND_TRANSITION[v] ?? [];
      facts.push({
        file,
        line,
        kind: 'animated-properties',
        detail: `${p}${v}`,
        properties: names.map((name) => ({ name, cost: costOf(name) })),
      });
    },
  );
  each(String.raw`transition-\[([^\]\s]+)\]`, (p, v, line) => {
    const names = v
      .split(',')
      .map((name) => name.replace(/^_+|_+$/g, ''))
      .filter(Boolean);
    facts.push({
      file,
      line,
      kind: 'animated-properties',
      detail: `${p}transition-[${v}]`,
      properties: names.map((name) => ({ name, cost: costOf(name) })),
    });
  });
  each(String.raw`duration-(\d+)`, (p, v, line) => {
    if (Number(v) >= LONG * 1000)
      facts.push({
        file,
        line,
        kind: 'long-duration',
        detail: `${p}duration-${v}`,
      });
  });
  each(String.raw`ease-in`, (p, v, line) =>
    facts.push({ file, line, kind: 'ease-in', detail: `${p}ease-in` }),
  );
  each(String.raw`(scale-[\w.\[\]]+)`, (p, v, line) => {
    if (/(^|:)hover:/.test(p) && !/scale-100\b/.test(v))
      facts.push({
        file,
        line,
        kind: 'hover-scale',
        detail: `${p}${v}`,
      });
  });
  each(
    String.raw`animate-(spin|ping|pulse|bounce)`,
    (p, v, line, _all, text) => {
      if (/motion-safe:/.test(p)) return;
      facts.push({
        file,
        line,
        kind: 'infinite-loop',
        detail: `${p}animate-${v}${/(^|\s)motion-reduce:/.test(text) ? '' : ', no motion-reduce: class beside it'}`,
      });
    },
  );
  each(String.raw`will-change-[\w[\]-]+`, (p, v, line, all) =>
    facts.push({ file, line, kind: 'will-change', detail: all }),
  );
}

type Node = t.Node;

function keyName(key: Node): string | undefined {
  if (key.type === 'Identifier') return key.name;
  if (key.type === 'StringLiteral') return key.value;
  return undefined;
}

function literal(node: Node | undefined): unknown {
  if (!node) return undefined;
  if (node.type === 'NumericLiteral' || node.type === 'StringLiteral')
    return node.value;
  if (
    node.type === 'UnaryExpression' &&
    node.operator === '-' &&
    node.argument.type === 'NumericLiteral'
  )
    return -node.argument.value;
  if (node.type === 'Identifier' && node.name === 'Infinity') return Infinity;
  if (node.type === 'ArrayExpression')
    return node.elements.map((element) =>
      element ? literal(element) : undefined,
    );
  return undefined;
}

function jsxName(name: Node): string {
  if (name.type === 'JSXIdentifier') return name.name;
  if (name.type === 'JSXMemberExpression')
    return `${jsxName(name.object)}.${name.property.name}`;
  if (name.type === 'JSXNamespacedName')
    return `${name.namespace.name}:${name.name.name}`;
  return '';
}

function stringsIn(node: Node): string[] {
  if (node.type === 'StringLiteral') return [node.value];
  if (node.type === 'TemplateLiteral')
    return node.quasis.map((quasi) => quasi.value.raw);
  if (node.type === 'CallExpression')
    return node.arguments.flatMap((argument) => stringsIn(argument as Node));
  if (node.type === 'LogicalExpression' || node.type === 'BinaryExpression')
    return [...stringsIn(node.left as Node), ...stringsIn(node.right)];
  if (node.type === 'ConditionalExpression')
    return [...stringsIn(node.consequent), ...stringsIn(node.alternate)];
  return [];
}

function auditScript(file: string, text: string, facts: Fact[]): boolean {
  const textOf = (node: Node | undefined) =>
    node && node.start != null && node.end != null
      ? text.slice(node.start, node.end)
      : '';
  let ast;
  try {
    ast = parse(text, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
      errorRecovery: true,
    });
  } catch {
    return false;
  }

  const objects = new Map<string, t.ObjectExpression>();
  const segments: Segment[] = [];
  const visit = (node: Node | null | undefined, fn: (node: Node) => void) => {
    if (!node || typeof node !== 'object') return;
    fn(node);
    for (const key of Object.keys(node)) {
      if (
        key === 'loc' ||
        key === 'start' ||
        key === 'end' ||
        key === 'leadingComments' ||
        key === 'trailingComments'
      )
        continue;
      const value = (node as unknown as Record<string, unknown>)[key];
      if (Array.isArray(value))
        value.forEach((child) => visit(child as Node, fn));
      else if (value && typeof value === 'object' && 'type' in value)
        visit(value as Node, fn);
    }
  };

  visit(ast.program, (node) => {
    if (node.type === 'StringLiteral' && node.loc)
      segments.push({ text: node.value, line: node.loc.start.line });
    if (node.type === 'TemplateElement' && node.loc)
      segments.push({ text: node.value.raw, line: node.loc.start.line });
    if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier') {
      let init = node.init;
      while (
        init &&
        (init.type === 'TSAsExpression' ||
          init.type === 'TSSatisfiesExpression')
      )
        init = init.expression;
      if (init?.type === 'ObjectExpression') objects.set(node.id.name, init);
    }
  });

  const resolve = (
    node: Node | null | undefined,
  ): t.ObjectExpression | undefined => {
    let current = node;
    while (
      current &&
      (current.type === 'TSAsExpression' ||
        current.type === 'TSSatisfiesExpression')
    )
      current = current.expression;
    if (!current) return undefined;
    if (current.type === 'ObjectExpression') return current;
    if (current.type === 'Identifier') return objects.get(current.name);
    if (
      current.type === 'MemberExpression' &&
      current.object.type === 'Identifier' &&
      !current.computed &&
      current.property.type === 'Identifier'
    ) {
      const parent = objects.get(current.object.name);
      const property = parent?.properties.find(
        (p) =>
          p.type === 'ObjectProperty' &&
          keyName(p.key) === (current.property as t.Identifier).name,
      ) as t.ObjectProperty | undefined;
      return property ? resolve(property.value) : undefined;
    }
    return undefined;
  };

  const timing = (
    transition: t.ObjectExpression,
    line: number,
    label: string,
  ) => {
    const get = (name: string) =>
      (
        transition.properties.find(
          (p) => p.type === 'ObjectProperty' && keyName(p.key) === name,
        ) as t.ObjectProperty | undefined
      )?.value;
    const duration = literal(get('duration'));
    const ease = literal(get('ease'));
    const repeat = literal(get('repeat'));
    if (typeof duration === 'number' && duration >= LONG && repeat !== Infinity)
      facts.push({
        file,
        line,
        kind: 'long-duration',
        detail: `${Math.round(duration * 1000)}ms (${label})`,
      });
    if (
      ease === 'easeIn' ||
      ease === 'circIn' ||
      ease === 'backIn' ||
      ease === 'anticipate'
    )
      facts.push({
        file,
        line,
        kind: 'ease-in',
        detail: `ease "${ease}" (${label})`,
      });
    if (repeat === Infinity)
      facts.push({
        file,
        line,
        kind: 'infinite-loop',
        detail: `repeat: Infinity (${label})`,
      });
    for (const p of transition.properties) {
      if (p.type !== 'ObjectProperty') continue;
      const nested = resolve(p.value);
      const name = keyName(p.key);
      if (nested && name && !['ease', 'times'].includes(name))
        timing(nested, line, `${label} › ${name}`);
    }
  };

  const target = (
    object: t.ObjectExpression,
    line: number,
    label: string,
    push = true,
  ) => {
    const properties: { name: string; cost: Cost }[] = [];
    for (const p of object.properties) {
      if (p.type !== 'ObjectProperty') continue;
      const name = keyName(p.key);
      if (!name) continue;
      if (name === 'transition') {
        const nested = resolve(p.value);
        if (nested) timing(nested, line, `${label} transition`);
        continue;
      }
      if (name === 'transitionEnd') continue;
      properties.push({ name, cost: costOf(name, true) });
      const value = literal(p.value);
      const first = Array.isArray(value) ? value[0] : value;
      if (/^scale[XY]?$/.test(name) && label === 'initial' && first === 0)
        facts.push({
          file,
          line,
          kind: 'scale-from-zero',
          detail: `initial ${name}: 0`,
        });
      if (
        /^scale[XY]?$/.test(name) &&
        label === 'whileHover' &&
        first !== 1 &&
        first !== undefined
      )
        facts.push({
          file,
          line,
          kind: 'hover-scale',
          detail: `whileHover ${name}: ${JSON.stringify(value)}`,
        });
      if (
        name === 'transform' &&
        typeof first === 'string' &&
        label === 'whileHover' &&
        /scale\((?!1\))/.test(first)
      )
        facts.push({
          file,
          line,
          kind: 'hover-scale',
          detail: `whileHover transform: ${first}`,
        });
      if (
        name === 'transform' &&
        typeof first === 'string' &&
        label === 'initial' &&
        /scale\(0\)/.test(first)
      )
        facts.push({
          file,
          line,
          kind: 'scale-from-zero',
          detail: `initial transform: ${first}`,
        });
    }
    if (properties.length && push)
      facts.push({
        file,
        line,
        kind: 'animated-properties',
        detail: label,
        properties,
      });
    return properties;
  };

  visit(ast.program, (node) => {
    if (node.type === 'JSXOpeningElement') {
      const tag = jsxName(node.name);
      const line = node.loc?.start.line ?? 0;
      const attributes = new Map<string, t.Expression | undefined>();
      let className = '';
      for (const attribute of node.attributes) {
        if (
          attribute.type !== 'JSXAttribute' ||
          attribute.name.type !== 'JSXIdentifier'
        )
          continue;
        const value = attribute.value;
        const expression =
          value?.type === 'JSXExpressionContainer' &&
          value.expression.type !== 'JSXEmptyExpression'
            ? value.expression
            : undefined;
        attributes.set(attribute.name.name, expression);
        if (attribute.name.name === 'className') {
          if (value?.type === 'StringLiteral') className = value.value;
          else if (expression) className = stringsIn(expression).join(' ');
        }
      }
      const labels: string[] = [];
      const properties: { name: string; cost: Cost }[] = [];
      for (const [name, expression] of attributes) {
        if (!MOTION_TARGETS.has(name)) continue;
        const object = resolve(expression);
        if (!object) continue;
        labels.push(name);
        for (const property of target(object, line, name, false))
          if (!properties.some((known) => known.name === property.name))
            properties.push(property);
      }
      if (properties.length)
        facts.push({
          file,
          line,
          kind: 'animated-properties',
          detail: labels.join(', '),
          properties,
        });
      const variants = resolve(attributes.get('variants'));
      for (const p of variants?.properties ?? []) {
        if (p.type !== 'ObjectProperty') continue;
        const variant = resolve(p.value);
        if (!variant) continue;
        for (const property of target(
          variant,
          variant.loc?.start.line ?? line,
          `variant ${keyName(p.key) ?? ''}`.trim(),
        ))
          if (!properties.some((known) => known.name === property.name))
            properties.push(property);
      }
      const enters =
        attributes.has('initial') &&
        !(attributes.get('initial')?.type === 'BooleanLiteral');
      const transition = resolve(attributes.get('transition'));
      if (transition)
        timing(
          transition,
          line,
          enters ? 'transition, on an element that enters' : 'transition',
        );
      for (const name of ['layout', 'layoutId'])
        if (attributes.has(name))
          facts.push({
            file,
            line,
            kind: 'layout-animation',
            detail:
              name === 'layoutId' ? 'layoutId (shared element)' : 'layout',
          });

      const scales = properties.some((p) => /^scale|^transform$/.test(p.name));
      const transforms = properties.some(
        (p) => p.cost === 'main-thread' || p.name === 'transform',
      );
      const classes = className.split(/\s+/);
      if (
        scales &&
        classes.some((c) => c === 'absolute' || c === 'fixed') &&
        !classes.some((c) => /(^|:)origin-/.test(c)) &&
        !/origin/i.test(textOf(attributes.get('style')))
      )
        facts.push({
          file,
          line,
          kind: 'no-origin',
          detail: `${tag} is positioned and scales without a transform origin: it grows from its own center`,
        });
      const cssTransition = classes.find((c) =>
        /^(transition|transition-all|transition-transform)$/.test(
          c.replace(/^([\w-]+:)+/, ''),
        ),
      );
      if (/^(motion|m)\./.test(tag) && transforms && cssTransition)
        facts.push({
          file,
          line,
          kind: 'css-transition-conflict',
          detail: `${cssTransition} on ${tag}, which Motion also animates: the CSS transition eases every frame Motion writes`,
        });
      if (/^(motion|m)\.h1$/.test(tag)) {
        const initial = resolve(attributes.get('initial'));
        const opacity = initial?.properties.find(
          (p) => p.type === 'ObjectProperty' && keyName(p.key) === 'opacity',
        ) as t.ObjectProperty | undefined;
        const value = literal(opacity?.value);
        if (value === 0 || (Array.isArray(value) && value[0] === 0))
          facts.push({
            file,
            line,
            kind: 'hidden-on-first-paint',
            detail: `${tag} starts at opacity 0: the page's main heading is invisible until JavaScript runs`,
          });
      }
    }
    if (
      node.type === 'CallExpression' &&
      node.callee.type === 'Identifier' &&
      node.callee.name === 'animate' &&
      node.arguments.length >= 2
    ) {
      const line = node.loc?.start.line ?? 0;
      const object = resolve(node.arguments[1] as Node);
      if (object) target(object, line, 'animate()');
      const options = resolve(node.arguments[2] as Node | undefined);
      if (options) timing(options, line, 'animate()');
    }
  });
  auditClasses(file, segments, facts);
  return true;
}

/** The text with only the ranges kept, the rest blanked out line for line. */
function keepOnly(text: string, ranges: [number, number][]) {
  let out = '';
  let last = 0;
  for (const [start, end] of ranges) {
    out += text.slice(last, start).replace(/[^\n]/g, ' ');
    out += text.slice(start, end);
    last = end;
  }
  return out + text.slice(last).replace(/[^\n]/g, ' ');
}

const camel = (name: string) =>
  name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());

const TAG =
  /<([A-Za-z][\w.-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)\s*\/?>/g;
const ATTRIBUTE = /([^\s=>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g;

/** A Vue template's opening tags as JSX, each on its own line, so the script audit reads them. */
function templateAsJsx(template: string, offset: number, text: string) {
  const lines = text.split('\n').map(() => '');
  for (const tag of template.matchAll(TAG)) {
    const props: string[] = [];
    for (const [, raw, double, single] of tag[2]!.matchAll(ATTRIBUTE)) {
      const value = (double ?? single)?.replace(/\s+/g, ' ');
      const bound = /^(:|v-bind:)/.test(raw!);
      if (!bound && /^(@|v-|#)/.test(raw!)) continue;
      const name = camel(raw!.replace(/^(:|v-bind:)/, ''));
      const prop = name === 'class' ? 'className' : name;
      if (value === undefined) props.push(prop);
      else if (bound) props.push(`${prop}={${value}}`);
      else props.push(`${prop}=${JSON.stringify(value)}`);
    }
    const line = text.slice(0, offset + tag.index).split('\n').length - 1;
    lines[line] += `;<${tag[1]} ${props.join(' ')} />`;
  }
  return lines.join('\n');
}

function auditVue(file: string, text: string, facts: Fact[]): boolean {
  const block = (name: string) =>
    [
      ...text.matchAll(
        new RegExp(`^<${name}(\\s[^>]*)?>([\\s\\S]*?)^<\\/${name}>`, 'gm'),
      ),
    ].map((match) => {
      const start = match.index + match[0].indexOf('>') + 1;
      return {
        attributes: match[1] ?? '',
        range: [start, start + match[2]!.length] as [number, number],
      };
    });
  const template = text.match(/^<template(\s[^>]*)?>/m);
  const templateEnd = text.lastIndexOf('\n</template>');
  let code = keepOnly(
    text,
    block('script').map((script) => script.range),
  );
  if (template?.index !== undefined && templateEnd > template.index) {
    const start = template.index + template[0].length;
    const jsx = templateAsJsx(text.slice(start, templateEnd), start, text);
    code = code
      .split('\n')
      .map((line, i) => line + (jsx.split('\n')[i] ?? ''))
      .join('\n');
  }
  for (const style of block('style'))
    if (!/lang=["'](?!s?css)/.test(style.attributes))
      auditCss(file, keepOnly(text, [style.range]), facts);
  return auditScript(file, code, facts);
}

export function auditFile(
  file: string,
  text: string,
): { facts: Fact[]; readable: boolean } {
  const facts: Fact[] = [];
  const extension = path.extname(file);
  if (STYLES.includes(extension)) {
    auditCss(file, text, facts);
    return { facts, readable: true };
  }
  if (extension === '.vue')
    return { facts, readable: auditVue(file, text, facts) };
  return { facts, readable: auditScript(file, text, facts) };
}

const MOTION_KINDS: FactKind[] = [
  'animated-properties',
  'infinite-loop',
  'layout-animation',
  'hover-scale',
  'scale-from-zero',
];

export function audit(root: string, targets: string[] = []): AuditReport {
  const files = listAuditFiles(root, targets);
  const facts: Fact[] = [];
  const filesWithMotion: string[] = [];
  const reducedFiles: string[] = [];
  const project: string[] = [];
  const unreadable: string[] = [];
  const relative = (file: string) =>
    path.relative(root, file) || path.basename(file);

  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const name = relative(file);
    const { facts: found, readable } = auditFile(name, text);
    if (!readable) unreadable.push(name);
    const reduced = REDUCED.some((pattern) => pattern.test(text));
    if (reduced) reducedFiles.push(name);
    if (PROJECT_REDUCED.some((pattern) => pattern.test(text)))
      project.push(name);
    // A color changing over time moves nothing: it needs no reduced-motion path.
    const moves = (fact: Fact) =>
      MOTION_KINDS.includes(fact.kind) &&
      !(
        fact.kind === 'animated-properties' &&
        fact.properties?.length &&
        fact.properties.every((property) =>
          /colou?rs?$|^fill$|^stroke$/i.test(property.name),
        )
      );
    if (found.some(moves)) {
      filesWithMotion.push(name);
      if (!reduced)
        found.push({
          file: name,
          line: 0,
          kind: 'no-reduced-motion',
          detail: 'no reduced-motion path in this file',
        });
    }
    facts.push(...found);
  }

  return {
    root,
    files: files.length,
    filesWithMotion,
    facts,
    reducedMotion: { files: reducedFiles, project },
    unreadable,
  };
}
