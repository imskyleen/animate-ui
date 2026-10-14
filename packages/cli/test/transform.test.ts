import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

import { stripClasses } from '../src/lib/classes';
import { transform } from '../src/lib/transform';

const FIXTURES = path.join(import.meta.dirname, 'fixtures');
const ACCORDION = '@animate-ui/react/primitives/radix-ui/accordion';
const RADIX = '@animate-ui/react/primitives/radix-ui';

describe('shadcn/ui fixtures', () => {
  for (const library of readdirSync(FIXTURES)) {
    for (const file of readdirSync(path.join(FIXTURES, library))) {
      test(`${library}/${file}`, async () => {
        const input = readFileSync(path.join(FIXTURES, library, file), 'utf8');
        const result = transform(input);

        expect(result.imports.length).toBeGreaterThan(0);
        for (const change of result.imports)
          expect(result.code).toContain(change.to);
        const again = transform(result.code);
        expect(again.code).toBe(result.code);
        await expect(result.code).toMatchFileSnapshot(
          path.join('__snapshots__', library, `${file}.out`),
        );
      });
    }
  }
});

test('radix accordion: CSS keyframes are gone', () => {
  for (const file of readdirSync(path.join(FIXTURES, 'radix-ui'))) {
    if (!file.startsWith('accordion.')) continue;
    const result = transform(
      readFileSync(path.join(FIXTURES, 'radix-ui', file), 'utf8'),
    );
    expect(result.code).toContain(`from "${RADIX}"`);
    expect(result.code).not.toMatch(/animate-accordion-(up|down)/);
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

test('moves a whole radix-ui import to the barrel, unanimated names included', () => {
  const input = `import { Accordion, Slot, Avatar as AvatarPrimitive } from "radix-ui"\n`;
  const result = transform(input);
  expect(result.code).toBe(
    `import { Accordion, Slot, Avatar as AvatarPrimitive } from "@animate-ui/react/primitives/radix-ui"\n`,
  );
  expect(result.imports).toEqual([
    {
      from: 'radix-ui',
      to: '@animate-ui/react/primitives/radix-ui',
      name: 'Accordion',
    },
  ]);
  expect(result.unsupported).toEqual(['radix-ui Avatar']);
});

test('leaves files without a supported primitive alone, classes included', () => {
  const input = `import { Avatar } from "radix-ui"
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

test('drops class-merger arguments left empty', () => {
  const input = `import { Accordion } from "radix-ui"
export const A = () => <div className={cn("data-open:animate-in", className)} />
export const B = () => <div className={cn(
  "px-2",
  "data-open:fade-in-0 data-closed:fade-out-0",
  "zoom-in-95"
)} />
export const C = () => <div className={cva("animate-in", { variants: {} })} />
`;
  const { code } = transform(input);
  expect(code).toContain('className={cn(className)}');
  expect(code).toContain('className={cn(\n  "px-2"\n)}');
  expect(code).toContain('cva("", { variants: {} })');
  expect(transform(code).code).toBe(code);
});

describe("radix's self-named root", () => {
  test('a per-package import of the root keeps pointing at the root', () => {
    const { code } = transform(
      `import { Dialog, DialogContent } from "@radix-ui/react-dialog";\nimport { Tabs as T } from "@radix-ui/react-tabs";\n`,
    );
    expect(code).toBe(
      `import { Root as Dialog, DialogContent } from "@animate-ui/react/primitives/radix-ui/dialog";\nimport { Root as T } from "@animate-ui/react/primitives/radix-ui/tabs";\n`,
    );
  });

  test("vaul's Drawer stays its namespace", () => {
    const { code } = transform(`import { Drawer } from "vaul";\n`);
    expect(code).toBe(
      `import { Drawer } from "@animate-ui/react/primitives/radix-ui/drawer";\n`,
    );
  });
});
