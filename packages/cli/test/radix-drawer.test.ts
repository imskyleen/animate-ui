import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';

import { transform } from '../src/lib/transform';

// shadcn/ui's Radix Drawer imports Vaul, which Animate UI replaces with the
// same API: `"vaul"` maps to the radix-ui drawer module.
const DRAWER = '@animate-ui/react/primitives/radix-ui/drawer';
const FIXTURES = path.join(import.meta.dirname, 'fixtures', 'radix-ui');

test('radix drawer, every style: vaul swapped, overlay fade gone', () => {
  const files = readdirSync(FIXTURES).filter((f) => f.startsWith('drawer.'));
  expect(files).toHaveLength(8);
  for (const file of files) {
    const input = readFileSync(path.join(FIXTURES, file), 'utf8');
    const result = transform(input);
    expect(result.code).toContain(
      `import { Drawer as DrawerPrimitive } from "${DRAWER}"`,
    );
    expect(result.code).not.toContain('"vaul"');
    expect(result.imports).toEqual([
      { from: 'vaul', to: DRAWER, name: 'drawer' },
    ]);
    expect(result.code).not.toMatch(/\b(animate-(in|out)|fade-(in|out))/);
    // Layout keyed on Vaul's data attributes stays.
    expect(result.code).toContain(
      'data-[vaul-drawer-direction=bottom]:bottom-0',
    );
    expect(result.unsupported).toEqual([]);
  }
});

test('the vaul import keeps its quotes, semicolons and other specifiers', () => {
  const input = `import { Drawer, Drawer as D } from 'vaul';
export const O = () => <D.Overlay className="fixed inset-0 data-open:animate-in data-open:fade-in-0" />;
`;
  const result = transform(input);
  expect(result.code).toBe(`import { Drawer, Drawer as D } from '${DRAWER}';
export const O = () => <D.Overlay className="fixed inset-0" />;
`);
  expect(transform(result.code).code).toBe(result.code);
});

test('a type-only vaul import is left alone', () => {
  const input = `import type { DialogProps } from "vaul"\n`;
  expect(transform(input).code).toBe(input);
});
