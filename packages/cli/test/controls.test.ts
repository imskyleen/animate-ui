import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';

import { transform } from '../src/lib/transform';

const FIXTURES = path.join(import.meta.dirname, 'fixtures');
const STYLES = ['luma', 'lyra', 'maia', 'mira', 'nova', 'rhea', 'sera', 'vega'];

for (const library of ['radix-ui', 'base-ui', 'react-aria']) {
  test(`${library} switch: the thumb's and the track's CSS transitions are removed`, () => {
    for (const style of STYLES) {
      const input = readFileSync(
        path.join(FIXTURES, library, `switch.${style}.tsx`),
        'utf8',
      );
      const result = transform(input);
      expect([...result.removedClasses].sort()).toEqual([
        'transition-all',
        'transition-transform',
      ]);
      expect(result.code).not.toMatch(/\btransition-(all|transform)\b/);
    }
  });
}

for (const library of ['radix-ui', 'base-ui', 'react-aria']) {
  for (const name of ['checkbox', 'radio-group', 'toggle', 'toggle-group']) {
    test(`${library} ${name}: only the imports change`, () => {
      for (const style of STYLES) {
        const input = readFileSync(
          path.join(FIXTURES, library, `${name}.${style}.tsx`),
          'utf8',
        );
        const result = transform(input);
        expect(result.imports.length).toBeGreaterThan(0);
        expect(result.removedClasses).toEqual([]);
        expect(result.unsupported).toEqual([]);
      }
    });
  }
}
