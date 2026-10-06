import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';

import { transform } from '../src/lib/transform';

const FIXTURES = path.join(import.meta.dirname, 'fixtures');
const read = (library: string, file: string) =>
  readFileSync(path.join(FIXTURES, library, file), 'utf8');
const fixtures = (library: string, component: string) =>
  readdirSync(path.join(FIXTURES, library)).filter((file) =>
    file.startsWith(`${component}.`),
  );

// The list's tw-animate duration only made sense with its keyframes.
const KEYFRAMES =
  /\b(animate-in|animate-out|zoom-in-95|fade-in-0|duration-100)\b/;

test('select: every base swaps its primitive and loses the CSS keyframes', () => {
  const swaps = {
    'radix-ui': 'from "@animate-ui/react/primitives/radix-ui"',
    'base-ui': 'from "@animate-ui/react/primitives/base-ui/select"',
    'react-aria': 'from "@animate-ui/react/primitives/react-aria"',
  };
  for (const [library, swap] of Object.entries(swaps)) {
    for (const file of fixtures(library, 'select')) {
      const { code } = transform(read(library, file));
      expect(code, file).toContain(swap);
      expect(code, file).not.toMatch(KEYFRAMES);
      // Trigger colour transitions are not Motion's: they stay.
      expect(code, file).toMatch(/transition-(colors|\[color)/);
    }
  }
});

test('combobox: the `@base-ui/react` import of every base moves to the Base UI barrel', () => {
  for (const library of ['radix-ui', 'base-ui']) {
    for (const file of fixtures(library, 'combobox')) {
      const { code, imports } = transform(read(library, file));
      expect(code, file).toContain(
        'import { Combobox as ComboboxPrimitive } from "@animate-ui/react/primitives/base-ui"',
      );
      expect(
        imports.map((change) => change.from),
        file,
      ).toEqual(['@base-ui/react']);
      expect(code, file).not.toMatch(KEYFRAMES);
    }
  }
});

test('react-aria combobox: the list, its items and the tags come from the mirror too', () => {
  for (const file of fixtures('react-aria', 'combobox')) {
    const { imports } = transform(read('react-aria', file));
    expect(imports.map((change) => change.name).sort(), file).toEqual([
      'ListBox',
      'ListBoxItem',
      'Popover',
      'Tag',
      'TagGroup',
      'TagList',
    ]);
  }
});
