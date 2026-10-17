import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { transform } from '../../../packages/cli/src/lib/transform.ts';

export type CssRemoval = { part: string; removed: string[]; added: string[] };

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(ROOT, '../../../packages/cli/test/fixtures');
export const OUTPUT = path.join(ROOT, '../lib/css-removals.json');
const STYLE = 'vega';
const LIBRARIES = ['radix-ui', 'base-ui', 'react-aria'];

const pascal = (slot: string) =>
  slot.replace(/(^|-)(\w)/g, (_, __, char: string) => char.toUpperCase());
const tokens = (line: string) =>
  [...line.matchAll(/(["'`])((?:(?!\1).)*)\1/g)].flatMap(([, , text]) =>
    text!.split(/\s+/).filter(Boolean),
  );

function pairs(before: string[], after: string[]) {
  const lcs = before.map(() => new Array<number>(after.length + 1).fill(0));
  lcs.push(new Array<number>(after.length + 1).fill(0));
  for (let i = before.length - 1; i >= 0; i--)
    for (let j = after.length - 1; j >= 0; j--)
      lcs[i]![j] =
        before[i] === after[j]
          ? lcs[i + 1]![j + 1]! + 1
          : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
  const changed: [number, string][] = [];
  let i = 0;
  let j = 0;
  let removed: number[] = [];
  let added: string[] = [];
  const flush = () => {
    removed.forEach((line, k) => changed.push([line, added[k] ?? '']));
    removed = [];
    added = [];
  };
  while (i < before.length || j < after.length) {
    if (i < before.length && j < after.length && before[i] === after[j]) {
      flush();
      i++;
      j++;
    } else if (
      j < after.length &&
      (i === before.length || lcs[i]![j + 1]! >= lcs[i + 1]![j]!)
    )
      added.push(after[j++]!);
    else removed.push(i++);
  }
  flush();
  return new Map(changed);
}

function removals(code: string, file: string) {
  const before = code.split('\n');
  const changed = pairs(
    before,
    transform(code, file, { tailwind: 4 }).code.split('\n'),
  );
  const parts: CssRemoval[] = [];
  let part = '';
  for (let i = 0; i < before.length; i++) {
    const declared = before[i]!.match(
      /^(?:export\s+)?(?:function|const)\s+(\w+)/,
    );
    if (declared) part = declared[1]!;
    const slot = before[i]!.match(/data-slot="([\w-]+)"/);
    if (slot) part = pascal(slot[1]!);
    const next = changed.get(i);
    if (
      next === undefined ||
      /^\s*(import\b|export \{|\} from|from\s)/.test(before[i]!) ||
      /from\s+['"]/.test(before[i]!)
    )
      continue;
    const oldTokens = new Set(tokens(before[i]!));
    const newTokens = new Set(tokens(next));
    const removed = [...oldTokens].filter((token) => !newTokens.has(token));
    const added = [...newTokens].filter((token) => !oldTokens.has(token));
    if (!removed.length && !added.length) continue;
    const last = parts.at(-1);
    if (last?.part === part) {
      last.removed.push(...removed);
      last.added.push(...added);
    } else parts.push({ part, removed, added });
  }
  return parts;
}

export function buildCssRemovals() {
  const result: Record<string, Record<string, CssRemoval[]>> = {};
  for (const library of LIBRARIES) {
    result[library] = {};
    for (const file of readdirSync(path.join(FIXTURES, library)).sort()) {
      const match = file.match(new RegExp(`^(.+)\\.${STYLE}\\.tsx$`));
      if (!match) continue;
      const code = readFileSync(path.join(FIXTURES, library, file), 'utf8');
      result[library][match[1]!] = removals(code, `${match[1]}.tsx`);
    }
  }
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const json = `${JSON.stringify(buildCssRemovals(), null, 2)}\n`;
  if (process.argv.includes('--check')) {
    if (
      JSON.stringify(JSON.parse(readFileSync(OUTPUT, 'utf8'))) !==
      JSON.stringify(JSON.parse(json))
    ) {
      console.error(`${OUTPUT} is stale: run scripts/build-css-removals.mts`);
      process.exit(1);
    }
  } else writeFileSync(OUTPUT, json);
}
