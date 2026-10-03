import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

import { stripClasses } from '../src/lib/classes';
import { transform } from '../src/lib/transform';

const FIXTURES = path.join(import.meta.dirname, 'fixtures');
const ACCORDION = '@animate-ui/react/primitives/radix-ui/accordion';

describe('shadcn/ui radix accordion, every style', () => {
  const dir = path.join(FIXTURES, 'radix-ui');
  for (const file of readdirSync(dir).filter((f) =>
    f.startsWith('accordion.'),
  )) {
    test(file, async () => {
      const input = readFileSync(path.join(dir, file), 'utf8');
      const result = transform(input);

      expect(result.code).toContain(
        `import { Accordion as AccordionPrimitive } from "${ACCORDION}"`,
      );
      expect(result.code).not.toMatch(/from "radix-ui"/);
      expect(result.code).not.toMatch(/animate-accordion-(up|down)/);
      expect(result.removedClasses.length).toBeGreaterThan(0);
      expect(result.unsupported).toEqual([]);
      await expect(result.code).toMatchFileSnapshot(
        path.join('__snapshots__', 'radix-ui', `${file}.out`),
      );
    });
  }
});

test('running it twice changes nothing more', () => {
  const input = readFileSync(
    path.join(FIXTURES, 'radix-ui', 'accordion.new-york-v4.tsx'),
    'utf8',
  );
  const once = transform(input).code;
  const twice = transform(once);
  expect(twice.code).toBe(once);
  expect(twice.imports).toEqual([]);
  expect(twice.removedClasses).toEqual([]);
});

test('the @radix-ui/react-* import style', () => {
  const input = `import * as AccordionPrimitive from '@radix-ui/react-accordion';
export const C = () => <AccordionPrimitive.Content className="overflow-hidden data-[state=open]:animate-accordion-down" />;
`;
  const result = transform(input);
  expect(result.code).toContain(
    `import * as AccordionPrimitive from '${ACCORDION}';`,
  );
  expect(result.code).toContain('className="overflow-hidden"');
});

test('splits a radix-ui import with primitives it does not animate', () => {
  const input = `import { Accordion, Slot, Dialog as DialogPrimitive } from "radix-ui"\n`;
  const result = transform(input);
  expect(result.code).toBe(
    `import { Slot, Dialog as DialogPrimitive } from "radix-ui"\nimport { Accordion } from "${ACCORDION}"\n`,
  );
  // Slot has nothing to animate; Dialog just isn't supported yet.
  expect(result.unsupported).toEqual(['radix-ui Dialog']);
});

test('leaves files without a supported primitive alone, classes included', () => {
  const input = `import { Dialog } from "radix-ui"
export const C = () => <div className="data-[state=open]:animate-in fade-in-0" />
`;
  const result = transform(input);
  expect(result.code).toBe(input);
});

test('only touches class strings', () => {
  const input = `import { Accordion } from "radix-ui"
const label = "fade-in-0 is a name"
export const C = () => <div title="animate-in" className={cn("animate-in px-2", cva("zoom-in-95"))} />
`;
  const result = transform(input);
  expect(result.code).toContain('const label = "fade-in-0 is a name"');
  expect(result.code).toContain('title="animate-in"');
  expect(result.code).toContain('className={cn("px-2", cva(""))}');
});

describe('stripClasses', () => {
  test.each([
    ['data-[side=bottom]:slide-in-from-top-2 px-2', 'px-2'],
    [
      'data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 rounded-md',
      'rounded-md',
    ],
    ['!animate-in text-sm', 'text-sm'],
    [
      'transition-transform duration-200 animate-spin',
      'transition-transform duration-200 animate-spin',
    ],
    ['  leading space kept-trailing  ', '  leading space kept-trailing  '],
  ])('%s', (input, expected) => {
    expect(stripClasses(input).value).toBe(expected);
  });

  test('extra patterns per primitive', () => {
    expect(
      stripClasses('h-(--accordion-panel-height) data-ending-style:h-0 pb-4', [
        /^h-\(--accordion-panel-height\)$/,
        /^data-(starting|ending)-style:h-0$/,
      ]).value,
    ).toBe('pb-4');
  });
});
