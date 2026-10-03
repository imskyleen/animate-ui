import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';

import { transform } from '../src/lib/transform';

// Popover, hover card / preview card and tooltip, in every base and style:
// Motion owns their entrance and exit, so no CSS keyframe (nor its duration)
// is left, and the origin and side offsets stay.
const FIXTURES = path.join(import.meta.dirname, 'fixtures');
const COMPONENT = /^(popover|hover-card|tooltip)\./;
const MODULE: Record<string, (component: string) => string> = {
  'radix-ui': (component) =>
    `@animate-ui/react/primitives/radix-ui/${component}`,
  'base-ui': (component) =>
    `@animate-ui/react/primitives/base-ui/${component === 'hover-card' ? 'preview-card' : component}`,
  'react-aria': () => '@animate-ui/react/primitives/react-aria',
};

for (const library of Object.keys(MODULE)) {
  const dir = path.join(FIXTURES, library);
  for (const file of readdirSync(dir).filter((f) => COMPONENT.test(f))) {
    test(`${library}/${file}: Motion owns the animation`, () => {
      const component = file.split('.')[0]!;
      const result = transform(readFileSync(path.join(dir, file), 'utf8'));
      expect(result.code).toContain(`"${MODULE[library]!(component)}"`);
      expect(result.code).not.toMatch(
        /\b(animate-(in|out)|fade-(in|out)|zoom-(in|out)|slide-in-from)/,
      );
      expect(result.code).not.toMatch(/\bduration-100\b/);
      // Kept: the origin variables and the arrow's own transforms.
      expect(result.code).toMatch(
        /origin-\(--(radix-[a-z-]+-content-transform-origin|transform-origin|trigger-anchor-point)\)/,
      );
    });
  }
}
