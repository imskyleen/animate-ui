import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { expect, test } from '../test';

const NUMBER = /-?(?:\d*\.\d+|\d+)/g;

test('paths an icon morphs between are written alike, so Motion can interpolate them', () => {
  const mismatched: string[] = [];
  for (const library of ['icons', 'hugeicons']) {
    const root = path.join(process.cwd(), 'registry', library);
    for (const name of readdirSync(root)) {
      let code: string;
      try {
        code = readFileSync(path.join(root, name, 'index.tsx'), 'utf8');
      } catch {
        continue;
      }
      const constants = new Map(
        [...code.matchAll(/const (\w+)\s*=\s*\n?\s*'([^']+)'/g)].map(
          (m) => [m[1]!, m[2]!] as const,
        ),
      );
      const shapes = new Map<string, string>();
      for (const [, value] of code.matchAll(
        /\bd:\s*(\[[^\]]*\]|'[^']*'|\w+)/g,
      )) {
        const paths = [
          ...value!.matchAll(/'([^']*)'|\b([A-Z_][A-Z0-9_]+)\b/g),
        ].map((m) => m[1] ?? constants.get(m[2]!) ?? '');
        for (const d of paths) {
          const commands = d.replace(NUMBER, '').replace(/[\s,]/g, '');
          const shape = d.replace(NUMBER, '#');
          const known = shapes.get(commands);
          if (known === undefined) shapes.set(commands, shape);
          else if (known !== shape)
            mismatched.push(`${library}/${name}: ${known} ≠ ${shape}`);
        }
      }
    }
  }
  expect([...new Set(mismatched)]).toEqual([]);
});
