import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, test } from 'vitest';

import { transform } from '../src/lib/transform';
import { typecheck } from './migrate-fixtures/helpers';

test('every animated shadcn component type-checks like the original', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'animate-ui-typecheck-'));
  const files: string[] = [];
  for (const library of ['radix-ui', 'base-ui', 'react-aria', 'embla']) {
    const fixtures = path.join(import.meta.dirname, 'fixtures', library);
    for (const name of readdirSync(fixtures)) {
      const code = readFileSync(path.join(fixtures, name), 'utf8');
      const original = path.join(dir, `${library}--${name}`);
      const animated = original.replace(/\.tsx$/, '.animated.tsx');
      writeFileSync(original, code);
      writeFileSync(animated, transform(code, animated).code);
      files.push(original, animated);
    }
  }
  // shadcn/ui's code block, rewritten in place.
  const blocks = path.join(import.meta.dirname, 'fixtures-code-block');
  for (const name of readdirSync(blocks)) {
    const code = readFileSync(path.join(blocks, name), 'utf8');
    const original = path.join(dir, `code-block--${name}`);
    const animated = original.replace(/\.tsx$/, '.animated.tsx');
    writeFileSync(original, code);
    writeFileSync(animated, transform(code, animated).code);
    files.push(original, animated);
  }
  const diagnostics = typecheck(files);
  const key = (d: { file: string; message: string }) =>
    `${path.basename(d.file).replace('.animated', '')} ${d.message.split('\n')[0]}`;
  const before = new Set(
    diagnostics.filter((d) => !d.file.includes('.animated')).map(key),
  );
  expect(
    diagnostics
      .filter((d) => d.file.includes('.animated') && !before.has(key(d)))
      .map((d) => `${path.basename(d.file)}:${d.line} ${d.message}`),
  ).toEqual([]);
}, 600_000);
