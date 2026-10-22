import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeEach, expect, test } from 'vitest';

import { audit as runAudit, costOf } from '../src/lib/audit';
import { audit } from '../src/commands/audit';

let root: string;

const write = (file: string, text: string) => {
  const full = path.join(root, file);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, text);
};

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), 'animate-ui-audit-'));
  write(
    'src/card.tsx',
    `import { motion, useAnimate } from 'motion/react';

const variants = {
  hidden: { opacity: 0, height: 0 },
  shown: { opacity: 1, height: 'auto' },
};

export function Card() {
  const [scope, animate] = useAnimate();
  animate(scope.current, { backgroundColor: '#fff' }, { duration: 0.2 });
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, width: 200 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.8, ease: 'easeIn' }}
      layout
    >
      <motion.span variants={variants} />
      <motion.i animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: 'linear', duration: 1 }} />
      <button className="transition-all duration-700 ease-in hover:scale-105">Go</button>
      <span className="animate-spin" />
      <span className="transition-[height] ease-in-out" />
    </motion.div>
  );
}
`,
  );
  write(
    'src/styles.css',
    `.menu { transition: all 300ms ease-in; }
.bar { transition: transform 200ms ease-out, opacity 200ms; }
@keyframes grow { from { width: 0; } to { width: 100%; } }
.loader { animation: grow 1.2s ease-out infinite; }
.panel { will-change: transform; }
`,
  );
  write(
    'src/calm.tsx',
    `import { motion, useReducedMotion } from 'motion/react';
export const Calm = () => {
  const reduce = useReducedMotion();
  return <motion.div animate={{ x: reduce ? 0 : 10 }} className="motion-safe:animate-ping" />;
};
`,
  );
  write(
    'node_modules/lib/index.tsx',
    `export const X = () => <div className="transition-all" />;`,
  );
  write(
    'src/__generated__/big.tsx',
    `export const X = () => <div className="transition-all" />;`,
  );
});

const facts = (file: string, kind: string) =>
  runAudit(root).facts.filter(
    (fact) => fact.file === file && fact.kind === kind,
  );

test('properties are sorted by what they cost the browser', () => {
  expect(costOf('opacity')).toBe('compositor');
  expect(costOf('scaleX')).toBe('compositor');
  expect(costOf('filter')).toBe('compositor');
  expect(costOf('width')).toBe('layout');
  expect(costOf('margin-top')).toBe('layout');
  expect(costOf('background-color')).toBe('paint');
  expect(costOf('boxShadow')).toBe('paint');
  expect(costOf('--fill')).toBe('paint');
  expect(costOf('_color')).toBe('paint');
  expect(costOf('scale', true)).toBe('main-thread');
  expect(costOf('transform', true)).toBe('compositor');
});

test('Motion props: their properties with their cost, inline and through variants', () => {
  const moves = facts('src/card.tsx', 'animated-properties');
  const element = moves.find(
    (fact) => fact.detail === 'initial, animate, whileHover',
  )!;
  expect(element.properties).toEqual([
    { name: 'scale', cost: 'main-thread' },
    { name: 'opacity', cost: 'compositor' },
    { name: 'width', cost: 'layout' },
  ]);
  expect(moves.map((fact) => fact.detail)).toEqual(
    expect.arrayContaining(['variant hidden', 'variant shown', 'animate()']),
  );
  expect(
    moves.find((fact) => fact.detail === 'variant hidden')!.properties,
  ).toContainEqual({ name: 'height', cost: 'layout' });
  expect(moves.find((fact) => fact.detail === 'animate()')!.properties).toEqual(
    [{ name: 'backgroundColor', cost: 'paint' }],
  );
});

test('Motion patterns: hover scale, scale from 0, ease-in, long timing, loops, layout', () => {
  expect(facts('src/card.tsx', 'hover-scale').map((f) => f.detail)).toEqual([
    'whileHover scale: 1.05',
    'hover:scale-105',
  ]);
  expect(facts('src/card.tsx', 'scale-from-zero')).toHaveLength(1);
  expect(facts('src/card.tsx', 'ease-in').map((f) => f.detail)).toEqual([
    'ease "easeIn" (transition, on an element that enters)',
    'ease-in',
  ]);
  expect(facts('src/card.tsx', 'long-duration').map((f) => f.detail)).toEqual([
    '800ms (transition, on an element that enters)',
    'duration-700',
  ]);
  expect(facts('src/card.tsx', 'infinite-loop').map((f) => f.detail)).toEqual([
    'repeat: Infinity (transition)',
    'animate-spin, no motion-reduce: class beside it',
  ]);
  expect(facts('src/card.tsx', 'layout-animation')).toHaveLength(1);
  expect(facts('src/card.tsx', 'transition-all')).toHaveLength(1);
});

test('Tailwind: motion-safe loops and ease-in-out are not reported', () => {
  const details = runAudit(root).facts.map((fact) => fact.detail);
  expect(details).not.toContain('motion-safe:animate-ping');
  expect(details.filter((detail) => detail.includes('ease-in-out'))).toEqual(
    [],
  );
  expect(
    facts('src/card.tsx', 'animated-properties').find(
      (fact) => fact.detail === 'transition-[height]',
    )!.properties,
  ).toEqual([{ name: 'height', cost: 'layout' }]);
});

test('CSS: transitions, keyframes, loops and will-change', () => {
  expect(facts('src/styles.css', 'transition-all')).toHaveLength(1);
  expect(facts('src/styles.css', 'ease-in')).toHaveLength(1);
  const moves = facts('src/styles.css', 'animated-properties');
  expect(moves[0]!.properties).toEqual([
    { name: 'transform', cost: 'compositor' },
    { name: 'opacity', cost: 'compositor' },
  ]);
  expect(moves[1]).toMatchObject({
    line: 4,
    detail: 'animation grow',
    properties: [{ name: 'width', cost: 'layout' }],
  });
  expect(facts('src/styles.css', 'infinite-loop')).toHaveLength(1);
  expect(facts('src/styles.css', 'long-duration')).toHaveLength(0);
  expect(facts('src/styles.css', 'will-change')).toHaveLength(1);
});

test('reduced motion: files that move without a path are named', () => {
  const report = runAudit(root);
  expect(facts('src/card.tsx', 'no-reduced-motion')).toHaveLength(1);
  expect(facts('src/calm.tsx', 'no-reduced-motion')).toHaveLength(0);
  expect(report.reducedMotion.files).toEqual(['src/calm.tsx']);
  expect(report.reducedMotion.project).toEqual([]);
  write(
    'src/app.tsx',
    `export const App = ({ children }) => <MotionConfig reducedMotion="user">{children}</MotionConfig>;`,
  );
  expect(runAudit(root).reducedMotion.project).toEqual(['src/app.tsx']);
});

test('a positioned popup scaling without an origin, CSS fighting Motion, a hidden heading', () => {
  write(
    'src/menu.tsx',
    `import { motion } from 'motion/react';
export const Menu = () => (
  <>
    <motion.ul initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="absolute right-0" />
    <motion.ul initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="absolute origin-top-right" />
    <motion.ul initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="fixed" style={{ originX: 1 }} />
    <motion.button whileTap={{ scale: 0.97 }} className="transition hover:bg-neutral-100" />
    <motion.button whileTap={{ scale: 0.97 }} className="transition-colors" />
    <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
    <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
  </>
);
`,
  );
  expect(facts('src/menu.tsx', 'no-origin').map((f) => f.line)).toEqual([4]);
  expect(
    facts('src/menu.tsx', 'css-transition-conflict').map((f) => f.line),
  ).toEqual([7]);
  expect(
    facts('src/menu.tsx', 'hidden-on-first-paint').map((f) => f.line),
  ).toEqual([9]);
});

test('CSS: a hover that moves outside @media (hover: hover), and keyframes that enter', () => {
  write(
    'src/hover.css',
    `.a:hover { transform: translateY(-2px); }
@media (hover: hover) and (pointer: fine) {
  .b:hover { transform: translateY(-2px); }
}
.c:hover { color: red; }
@keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; } }
.d { animation: rise 300ms ease-in; }
`,
  );
  expect(facts('src/hover.css', 'hover-not-gated').map((f) => f.line)).toEqual([
    1,
  ]);
  expect(facts('src/hover.css', 'ease-in')[0]!.detail).toContain(
    'its keyframes enter',
  );
});

test('dependencies, build output and generated folders are left out', () => {
  const report = runAudit(root);
  expect(report.facts.map((fact) => fact.file)).not.toContainEqual(
    expect.stringMatching(/node_modules|__generated__/),
  );
  expect(report.files).toBe(3);
});

test('paths narrow the audit, and a missing one is named', () => {
  expect(runAudit(root, ['src/styles.css']).files).toBe(1);
  expect(() => runAudit(root, ['src/nope'])).toThrow(
    'No file or folder at src/nope.',
  );
});

test('the report prints facts per file, then totals, and as JSON', () => {
  const lines: string[] = [];
  expect(audit([], { cwd: root, log: (line) => lines.push(line) })).toBe(0);
  const text = lines.join('\n');
  expect(text).toContain('Motion audit: 3 of 3 files move');
  expect(text).toContain('facts, not verdicts');
  expect(text).toMatch(
    /src\/card\.tsx\n\s+4\s+moves\s+variant hidden: opacity \(compositor\) · height \(layout\)/,
  );
  expect(text).toContain('–  reduced motion');
  expect(text).toContain('reduced motion  1 of 3 files that move have a path');

  const json: string[] = [];
  audit([], { cwd: root, json: true, log: (line) => json.push(line) });
  const parsed = JSON.parse(json.join('\n'));
  expect(parsed.root).toBeUndefined();
  expect(parsed.filesWithMotion).toEqual([
    'src/calm.tsx',
    'src/card.tsx',
    'src/styles.css',
  ]);
});

test('a file that does not parse is named, not silently skipped', () => {
  write(
    'src/broken.tsx',
    'export const X = () => <div className="transition-all" \n',
  );
  const report = runAudit(root);
  expect(report.unreadable).toEqual(['src/broken.tsx']);
  const lines: string[] = [];
  audit([], { cwd: root, log: (line) => lines.push(line) });
  expect(lines.join('\n')).toContain(
    "Couldn't parse, so not read: src/broken.tsx",
  );
});

test('CSS hover: a scale counts as a hover scale; a reduced-motion override or a transform reset is not a hover that moves', () => {
  write(
    'src/tiles.css',
    `.tile:hover { transform: scale(1.05); }
@media (prefers-reduced-motion: reduce) {
  .tile:hover { transform: none; }
}
.chip:hover { transform: none; }
`,
  );
  expect(facts('src/tiles.css', 'hover-scale').map((f) => f.line)).toEqual([1]);
  expect(facts('src/tiles.css', 'hover-not-gated').map((f) => f.line)).toEqual([
    1,
  ]);
});

test('only an app-wide reduced-motion setting is listed as project-wide', () => {
  write(
    'src/widget.tsx',
    `export const W = () => <ReducedMotionConfig><motion.div animate={{ x: 1 }} /></ReducedMotionConfig>;`,
  );
  write(
    'src/local.css',
    `@media (prefers-reduced-motion: reduce) { .tile { transition: none; } }\n`,
  );
  expect(runAudit(root).reducedMotion.project).toEqual([]);
  write(
    'src/providers.tsx',
    `export const P = ({ children }) => <ReducedMotionConfig>{children}</ReducedMotionConfig>;`,
  );
  write(
    'src/global.css',
    `@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }\n`,
  );
  expect(runAudit(root).reducedMotion.project).toEqual([
    'src/global.css',
    'src/providers.tsx',
  ]);
});

test('reads a Vue component: its template, script and style', () => {
  write(
    'src/Panel.vue',
    `<script setup lang="ts">
import { motion } from 'motion-v'

const variants = {
  hidden: { opacity: 0, height: 0 },
  shown: { opacity: 1, height: 'auto' },
}
</script>

<template>
  <div>
    <motion.div
      :initial="{ scale: 0, opacity: 0 }"
      :animate="{ scale: 1, opacity: 1 }"
      :while-hover="{ scale: 1.05 }"
      :transition="{ duration: 0.8, ease: 'easeIn' }"
      class="absolute transition-all"
      @click="open = !open"
    >
      <motion.span :variants="variants" />
    </motion.div>
    <template v-if="open">
      <p class="transition-all">Hello</p>
    </template>
  </div>
</template>

<style scoped>
.panel { transition: all 1s ease-in; }
</style>
`,
  );
  const report = runAudit(root, ['src']);
  expect(report.unreadable).toEqual([]);
  const kinds = report.facts.map((fact) => `${fact.kind}:${fact.line}`);
  expect(kinds).toEqual(
    expect.arrayContaining([
      'animated-properties:12',
      'scale-from-zero:12',
      'hover-scale:12',
      'long-duration:12',
      'ease-in:12',
      'no-origin:12',
      'css-transition-conflict:12',
      'animated-properties:5',
      'no-reduced-motion:0',
    ]),
  );
  expect(report.facts.some((fact) => fact.line === 29)).toBe(true);
  expect(report.filesWithMotion).toContain('src/Panel.vue');
});

test('a Vue component with a reduced-motion path and whilePress is clean of those facts', () => {
  write(
    'src/Press.vue',
    `<script setup lang="ts">
import { motion } from 'motion-v'
import { useShouldReduceMotion } from '@animate-ui/vue/utils/motion'
const reduce = useShouldReduceMotion()
</script>

<template>
  <motion.button :while-press="{ scale: 0.97 }">Save</motion.button>
</template>
`,
  );
  const report = runAudit(root, ['src/Press.vue']);
  const kinds = report.facts.map((fact) => fact.kind);
  expect(kinds).toContain('animated-properties');
  expect(kinds).not.toContain('no-reduced-motion');
  expect(kinds).not.toContain('hover-scale');
});

test('a file that only transitions colors needs no reduced-motion path', () => {
  write(
    'src/Link.tsx',
    `export const Link = () => <a className="transition-colors hover:text-black">Docs</a>;\n`,
  );
  write(
    'src/Link.vue',
    `<template>\n  <a class="transition-colors hover:text-black">Docs</a>\n</template>\n`,
  );
  const report = runAudit(root, ['src/Link.tsx', 'src/Link.vue']);
  expect(report.facts.map((fact) => fact.kind)).not.toContain(
    'no-reduced-motion',
  );
  expect(report.filesWithMotion).toEqual([]);
});
