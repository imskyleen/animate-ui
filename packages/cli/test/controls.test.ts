import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';

import { transform } from '../src/lib/transform';

const FIXTURES = path.join(import.meta.dirname, 'fixtures');
const STYLES = ['luma', 'lyra', 'maia', 'mira', 'nova', 'rhea', 'sera', 'vega'];

// Switch thumbs: Motion glides them now, so their `transition-transform`
// goes, while the track's colour transition (`transition-all`) stays.
for (const library of ['radix-ui', 'base-ui', 'react-aria']) {
  test(`${library} switch: the thumb's and the track's CSS transitions are removed`, () => {
    for (const style of STYLES) {
      const input = readFileSync(
        path.join(FIXTURES, library, `switch.${style}.tsx`),
        'utf8',
      );
      const result = transform(input);
      // The thumb glides on a spring and the track's colour changes at once,
      // as in v1.
      expect([...result.removedClasses].sort()).toEqual([
        'transition-all',
        'transition-transform',
      ]);
      expect(result.code).not.toMatch(/\btransition-(all|transform)\b/);
    }
  });
}

// Checkbox, Radio Group, Toggle and Toggle Group have no CSS animation to
// remove: only their imports change.
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
