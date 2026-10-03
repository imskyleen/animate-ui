// The migration table against both ends: every export of every v1 Radix and
// Base UI primitive is accounted for, and every v2 name it maps to exists
// (checked by TypeScript on the code `migrate` generates).
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { parse } from '@babel/parser';
import { describe, expect, test } from 'vitest';

import type { V1Module } from '../src/lib/migrate/project';
import { rewrite } from '../src/lib/migrate/rewrite';
import {
  PRIMITIVES,
  UNSUPPORTED_PRIMITIVES,
  UTILITIES,
  type Migration,
} from '../src/lib/migrate/table';
import { typecheck } from './migrate-fixtures/helpers';

const V1 = path.resolve(
  import.meta.dirname,
  '..',
  '..',
  '..',
  'apps',
  'v1',
  'registry',
);

/** The value and type exports of a v1 registry file. */
function v1Exports(file: string) {
  const ast = parse(readFileSync(file, 'utf8'), {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });
  const values: string[] = [];
  const types: string[] = [];
  for (const node of ast.program.body) {
    if (node.type !== 'ExportNamedDeclaration') continue;
    const declaration = node.declaration;
    if (
      declaration &&
      'id' in declaration &&
      declaration.id?.type === 'Identifier'
    )
      (declaration.type.startsWith('TS') ? types : values).push(
        declaration.id.name,
      );
    for (const specifier of node.specifiers) {
      if (specifier.type !== 'ExportSpecifier') continue;
      const name =
        specifier.exported.type === 'Identifier'
          ? specifier.exported.name
          : specifier.exported.value;
      (node.exportKind === 'type' || specifier.exportKind === 'type'
        ? types
        : values
      ).push(name);
    }
  }
  return { values, types };
}

const v1Primitives = ['radix', 'base'].flatMap((library) =>
  readdirSync(path.join(V1, 'primitives', library)).map(
    (name) => `${library}/${name}`,
  ),
);

const UTILITY_FILES: Record<string, string> = {
  'icons/icon': 'icons/icon/index.tsx',
  'lib/motion': 'lib/motion/index.tsx',
  'lib/get-strict-context': 'lib/get-strict-context/index.tsx',
  'hooks/use-controlled-state': 'hooks/use-controlled-state/index.tsx',
  'hooks/use-is-in-view': 'hooks/use-is-in-view/index.tsx',
  'hooks/use-page-visible': 'hooks/use-page-visible/index.tsx',
};

function expectCovers(migration: Migration, file: string) {
  const { values, types } = v1Exports(file);
  const listed = [
    ...Object.keys(migration.values),
    ...Object.keys(migration.types),
    ...migration.unmapped,
  ];
  // Nothing dropped, nothing invented, nothing listed twice.
  expect([...listed].sort()).toEqual([...values, ...types].sort());
  for (const name of Object.keys(migration.values))
    expect(values, `${name} is a value in v1`).toContain(name);
  for (const name of Object.keys(migration.types))
    expect(types, `${name} is a type in v1`).toContain(name);
}

describe('every v1 export is mapped or reported', () => {
  test.each(v1Primitives)('%s', (id) => {
    if (UNSUPPORTED_PRIMITIVES.includes(id)) {
      expect(PRIMITIVES[id]).toBeUndefined();
      return;
    }
    expect(PRIMITIVES[id], `${id} has no entry`).toBeDefined();
    expectCovers(PRIMITIVES[id]!, path.join(V1, 'primitives', id, 'index.tsx'));
  });

  test.each(Object.keys(UTILITY_FILES))('%s', (id) => {
    expectCovers(UTILITIES[id]!, path.join(V1, UTILITY_FILES[id]!));
  });

  test('animate/slot', () => {
    expectCovers(
      PRIMITIVES['animate/slot']!,
      path.join(V1, 'primitives', 'animate', 'slot', 'index.tsx'),
    );
  });

  test('the table has no v1 primitive the registry lacks', () => {
    for (const id of Object.keys(PRIMITIVES))
      expect([...v1Primitives, 'animate/slot']).toContain(id);
  });
});

/** Where the synthetic files import v1 from. */
function v1Path(id: string, utility: boolean) {
  if (!utility) return `@/components/animate-ui/primitives/${id}`;
  if (id === 'icons/icon') return '@/components/animate-ui/icons/icon';
  return `@/${id}`;
}

const project = {
  resolve: (_file: string, specifier: string) => specifier,
  classify: (target: string): V1Module | undefined => {
    const primitive = target.match(
      /^@\/components\/animate-ui\/primitives\/([a-z]+)\/([a-z-]+)$/,
    );
    if (primitive)
      return { kind: 'primitive', library: primitive[1]!, name: primitive[2]! };
    if (target === '@/components/animate-ui/icons/icon')
      return { kind: 'utility', id: 'icons/icon' };
    const utility = target.match(/^@\/((?:lib|hooks)\/[a-z-]+)$/);
    return utility ? { kind: 'utility', id: utility[1]! } : undefined;
  },
};

test('every v2 name the table maps to exists, with a part where v1 had one', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'animate-ui-migrate-table-'));
  const files: string[] = [];
  const entries = [
    ...Object.entries(PRIMITIVES).map(([id, m]) => ({ id, m, utility: false })),
    ...Object.entries(UTILITIES).map(([id, m]) => ({ id, m, utility: true })),
  ];

  for (const { id, m, utility } of entries) {
    const from = v1Path(id, utility);
    const values = Object.keys(m.values);
    const types = Object.keys(m.types);
    // What a user file looks like: the v1 names, the parts used as
    // components. (A type that doesn't exist fails at its import.)
    const source = [
      "import type { JSXElementConstructor } from 'react';",
      values.length > 0
        ? `import { ${values.join(', ')} } from '${from}';`
        : '',
      types.length > 0
        ? `import type { ${types.join(', ')} } from '${from}';`
        : '',
      ...values
        .filter((name) => /^[A-Z]/.test(name))
        .map(
          (name) =>
            `export const check${name}: JSXElementConstructor<never> = ${name};`,
        ),
      ...values
        .filter((name) => /^[a-z]/.test(name))
        .map((name) => `export const check_${name} = ${name};`),
      '',
    ].join('\n');
    const file = path.join(dir, `${id.replace('/', '__')}.tsx`);
    const result = rewrite(source, {
      project,
      file,
      selected: () => true,
    });
    expect(result.code, id).not.toContain(from);
    writeFileSync(file, result.code);
    files.push(file);
  }

  const diagnostics = typecheck(files).map(
    (d) => `${path.basename(d.file)}:${d.line} TS${d.code} ${d.message}`,
  );
  expect(diagnostics).toEqual([]);
}, 180_000);
