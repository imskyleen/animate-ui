import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';

import { transform } from '../src/lib/transform';

const FIXTURES = path.join(import.meta.dirname, 'fixtures');

const fixtures = (library: string, component: string) =>
  readdirSync(path.join(FIXTURES, library))
    .filter((file) => file.startsWith(`${component}.`))
    .map((file) => readFileSync(path.join(FIXTURES, library, file), 'utf8'));

test('base toast: shadcn CSS stack is gone, its layout stays', () => {
  for (const input of fixtures('base-ui', 'toast')) {
    const { code } = transform(input);
    expect(code).toContain('from "@animate-ui/react/primitives/base-ui/toast"');
    expect(code).not.toMatch(/\[(transform|transition):/);
    expect(code).not.toMatch(/\[--(offset-y|scale|shrink|peek):/);
    expect(code).not.toContain('duration-250');
    // Kept: the stack's sizing, the gap filler and the limited state.
    expect(code).toContain('h-(--height)');
    expect(code).toContain('data-expanded:h-(--toast-height)');
    expect(code).toContain('[--gap:0.75rem]');
    expect(code).toContain('data-limited:opacity-0');
    expect(code).toContain('data-behind:opacity-0');
  }
});

test('progress: only the indicator transition goes', () => {
  for (const library of ['radix-ui', 'base-ui', 'react-aria']) {
    for (const input of fixtures(library, 'progress')) {
      const { removedClasses } = transform(input);
      expect(removedClasses).toEqual(['transition-all']);
    }
  }
});

test('tabs and slider: only the import changes', () => {
  for (const library of ['radix-ui', 'base-ui', 'react-aria']) {
    for (const component of ['tabs', 'slider']) {
      for (const input of fixtures(library, component)) {
        const result = transform(input);
        expect(result.imports.length).toBeGreaterThan(0);
        expect(result.removedClasses).toEqual([]);
      }
    }
  }
});

test('react aria: importing an animated part moves the whole import', () => {
  const input = `import { Tab, TabList, TabPanel, Tabs } from "react-aria-components"\n`;
  expect(transform(input).code).toBe(
    `import { Tab, TabList, TabPanel, Tabs } from "@animate-ui/react/primitives/react-aria"\n`,
  );
});
