// The migration table against both ends: every v1 module the production
// registry installs (apps/v1, the files Animate UI v1 users have) is handled,
// every export of each is accounted for, and every v2 name it maps to exists
// (checked by TypeScript on the code `migrate` generates).
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { parse } from '@babel/parser';
import { describe, expect, test } from 'vitest';

import type { V1Module } from '../src/lib/migrate/project';
import { rewrite } from '../src/lib/migrate/rewrite';
import {
  HEADLESS_PRIMITIVES,
  PRIMITIVES,
  UNSUPPORTED_PRIMITIVES,
  UNSUPPORTED_UTILITIES,
  UTILITIES,
  type Migration,
} from '../src/lib/migrate/table';
import { typecheck } from './migrate-fixtures/helpers';

const APP = path.resolve(import.meta.dirname, '..', '..', '..', 'apps', 'v1');
const V1 = path.join(APP, 'registry');

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

const dirs = (dir: string) =>
  readdirSync(path.join(V1, dir), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

/** Every v1 primitive: `<library>/<name>`. */
const v1Primitives = dirs('primitives').flatMap((library) =>
  dirs(`primitives/${library}`).map((name) => `${library}/${name}`),
);

/** The v1 libs, hooks and icon core: `icons/icon`, `hooks/<name>`, `lib/<name>`. */
const v1Utilities = [
  'icons/icon',
  ...dirs('hooks').map((name) => `hooks/${name}`),
  ...dirs('lib').map((name) => `lib/${name}`),
];

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

describe('every v1 module is handled', () => {
  test.each(v1Primitives)('%s', (id) => {
    const [library, name] = id.split('/') as [string, string];
    if (library === 'headless') {
      expect(HEADLESS_PRIMITIVES).toContain(name);
      expect(PRIMITIVES[id]).toBeUndefined();
      return;
    }
    if (UNSUPPORTED_PRIMITIVES.includes(id)) {
      expect(PRIMITIVES[id]).toBeUndefined();
      return;
    }
    expect(PRIMITIVES[id], `${id} has no entry`).toBeDefined();
    expectCovers(PRIMITIVES[id]!, path.join(V1, 'primitives', id, 'index.tsx'));
  });

  test.each(v1Utilities)('%s', (id) => {
    if (UNSUPPORTED_UTILITIES.includes(id)) {
      expect(UTILITIES[id]).toBeUndefined();
      return;
    }
    expect(UTILITIES[id], `${id} has no entry`).toBeDefined();
    expectCovers(UTILITIES[id]!, path.join(V1, id, 'index.tsx'));
  });

  test('the table has no v1 module production lacks', () => {
    for (const id of [
      ...Object.keys(PRIMITIVES),
      ...UNSUPPORTED_PRIMITIVES,
      ...HEADLESS_PRIMITIVES.map((name) => `headless/${name}`),
    ])
      expect(v1Primitives).toContain(id);
    for (const id of [...Object.keys(UTILITIES), ...UNSUPPORTED_UTILITIES])
      expect(v1Utilities).toContain(id);
  });

  test('the registry installs nothing else', () => {
    const registry = path.join(APP, 'public', 'r');
    const modules = new Set([
      ...v1Primitives.map((id) => `components/animate-ui/primitives/${id}`),
      'components/animate-ui/icons/icon',
      ...v1Utilities.filter((id) => !id.startsWith('icons/')),
    ]);
    for (const name of readdirSync(registry)) {
      if (!name.endsWith('.json') || name.startsWith('demo-')) continue;
      const item = JSON.parse(readFileSync(path.join(registry, name), 'utf8'));
      for (const { target } of item.files ?? []) {
        if (!target) continue;
        const module = target.replace(/\.tsx?$/, '');
        // Components and icons are the user's: they import the modules.
        if (/^components\/animate-ui\/(components|icons)\//.test(module))
          continue;
        expect(modules, `${name}: ${target}`).toContain(module);
      }
    }
  });

  test('the parts the rules name are v1 exports', () => {
    for (const [id, migration] of Object.entries(PRIMITIVES)) {
      const { values, types } = v1Exports(
        path.join(V1, 'primitives', id, 'index.tsx'),
      );
      const parts = [
        ...Object.keys(migration.props ?? {}),
        ...Object.keys(migration.defaults ?? {}),
        ...Object.keys(migration.wrap ?? {}),
      ];
      for (const part of parts) expect(values, `${id} ${part}`).toContain(part);
      for (const name of Object.keys(migration.notes ?? {}))
        expect([...values, ...types], `${id} ${name}`).toContain(name);
      for (const { in: wrapper } of Object.values(migration.wrap ?? {}))
        expect(Object.values(migration.values)).toContain(wrapper);
    }
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
