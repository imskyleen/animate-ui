import { describe, expect, test } from 'vitest';

import type { V1Module } from '../src/lib/migrate/project';
import { rewrite } from '../src/lib/migrate/rewrite';

const project = {
  resolve: (file: string, specifier: string) =>
    specifier.startsWith('./')
      ? `/app/components/animate-ui/icons/${specifier.slice(2)}`
      : specifier.replace(/^@\//, '/app/'),
  classify: (target: string): V1Module | undefined => {
    const primitive = target.match(
      /^\/app\/components\/animate-ui\/primitives\/([a-z]+)\/([a-z-]+)$/,
    );
    if (primitive)
      return { kind: 'primitive', library: primitive[1]!, name: primitive[2]! };
    if (target === '/app/components/animate-ui/icons/icon')
      return { kind: 'utility', id: 'icons/icon' };
    const utility = target.match(/^\/app\/((?:lib|hooks)\/[a-z-]+)$/);
    return utility ? { kind: 'utility', id: utility[1]! } : undefined;
  },
};

const run = (code: string, file = '/app/page.tsx', selected = () => true) =>
  rewrite(code, { project, file, selected });

describe('rewrite', () => {
  test('keeps the quotes and the semicolons of the file', () => {
    const { code } = run(
      'import { Checkbox } from "@/components/animate-ui/primitives/radix/checkbox"\n',
    );
    expect(code).toBe(
      'import { Root as Checkbox } from "@animate-ui/react/primitives/radix-ui/checkbox"\n',
    );
  });

  test('re-exports keep the exported names', () => {
    const { code } = run(
      "export { Accordion, type AccordionItemProps as ItemProps } from '@/components/animate-ui/primitives/radix/accordion';\n",
    );
    expect(code).toBe(
      `export {
  Root as Accordion,
  type AccordionItemProps as ItemProps,
} from '@animate-ui/react/primitives/radix-ui/accordion';\n`,
    );
  });

  test('a type re-export left on v1 keeps its type keyword', () => {
    const { code } = run(
      "export { Accordion, type AccordionProps } from '@/components/animate-ui/primitives/radix/accordion';\n",
    );
    expect(code).toContain(
      "export { type AccordionProps } from '@/components/animate-ui/primitives/radix/accordion';",
    );
  });

  test('a Base UI re-export needs a declaration: reported', () => {
    const source =
      "export { PopoverTrigger } from '@/components/animate-ui/primitives/base/popover';\n";
    const { code, manual } = run(source);
    expect(code).toBe(source);
    expect(manual[0]!.message).toContain(
      '`PopoverTrigger` is `Popover.Trigger` in v2',
    );
  });

  test('namespace imports and export * are reported, not rewritten', () => {
    const source = [
      "import * as Dialog from '@/components/animate-ui/primitives/radix/dialog';",
      "export * from '@/components/animate-ui/primitives/radix/tooltip';",
      '',
    ].join('\n');
    const { code, manual } = run(source);
    expect(code).toBe(source);
    expect(manual.map((step) => step.line)).toEqual([1, 2]);
  });

  test('type-only imports stay type-only', () => {
    const { code } = run(
      "import type { PopoverProps } from '@/components/animate-ui/primitives/base/popover';\n\nexport type P = PopoverProps;\n",
      '/app/types.ts',
    );
    expect(code).toBe(
      "import type { Popover as PopoverPrimitive } from '@animate-ui/react/primitives/base-ui/popover';\n\ntype PopoverProps = PopoverPrimitive.Root.Props;\n\nexport type P = PopoverProps;\n",
    );
  });

  test('a type imported without `type` is printed as one', () => {
    const { code } = run(
      "import { Tooltip, TooltipProps } from '@/components/animate-ui/primitives/radix/tooltip';\n",
    );
    expect(code).toBe(
      `import {
  Root as Tooltip,
  type TooltipProps,
} from '@animate-ui/react/primitives/radix-ui/tooltip';\n`,
    );
  });

  test('new bindings never shadow the file', () => {
    const { code } = run(
      [
        "import { Popover } from '@/components/animate-ui/primitives/base/popover';",
        'const PopoverPrimitive = 1;',
        '',
      ].join('\n'),
    );
    expect(code).toContain('Popover as AnimatedPopover');
    expect(code).toContain('const Popover = AnimatedPopover.Root;');
  });

  test('relative imports of the icon core', () => {
    const { code } = run(
      "import { AnimateIcon, type IconProps } from './icon';\n",
      '/app/components/animate-ui/icons/bell.tsx',
    );
    expect(code).toBe(
      "import { AnimateIcon, type IconProps } from '@animate-ui/react/icons';\n",
    );
  });

  test('hooks move to utils', () => {
    const { code } = run(
      "import { useControlledState } from '@/hooks/use-controlled-state';\nimport { getStrictContext } from '@/lib/get-strict-context';\n",
    );
    expect(code).toBe(
      "import { useControlledState } from '@animate-ui/react/utils/use-controlled-state';\nimport { getStrictContext } from '@animate-ui/react/utils/strict-context';\n",
    );
  });

  test("Base UI's keepRendered becomes keepMounted", () => {
    const { code, changes } = run(
      [
        "import { AccordionPanel } from '@/components/animate-ui/primitives/base/accordion';",
        'export const a = <AccordionPanel keepRendered>x</AccordionPanel>;',
        '',
      ].join('\n'),
    );
    expect(code).toContain('<AccordionPanel keepMounted>');
    expect(changes).toEqual([
      'line 2: <AccordionPanel> keepRendered → keepMounted',
    ]);
  });

  test('a Content inline in JSX gets an inline Portal', () => {
    const { code } = run(
      [
        "import { DropdownMenuContent } from '@/components/animate-ui/primitives/radix/dropdown-menu';",
        'export const a = <DropdownMenuContent container={el} />;',
        '',
      ].join('\n'),
    );
    expect(code).toContain(
      'export const a = <DropdownMenuPortal container={el}><DropdownMenuContent /></DropdownMenuPortal>;',
    );
    expect(code).toContain(
      '  Content as DropdownMenuContent,\n  Portal as DropdownMenuPortal,\n',
    );
  });

  test('a Portal wrapped around a Content leaves its template literals as they are', () => {
    const { code } = run(
      [
        "import { DropdownMenuContent } from '@/components/animate-ui/primitives/radix/dropdown-menu';",
        'export const a = (',
        '  <DropdownMenuContent',
        '    className={`a',
        'b`}',
        '  />',
        ');',
        '',
      ].join('\n'),
    );
    expect(code).toContain('className={`a\nb`}');
  });

  test('the declarations come before the code using them', () => {
    const { code } = run(
      [
        "import { PopoverTrigger } from '@/components/animate-ui/primitives/base/popover';",
        'export const Trigger = PopoverTrigger;',
        "import { cn } from '@/lib/utils';",
        '',
      ].join('\n'),
    );
    expect(code.indexOf('const PopoverTrigger')).toBeLessThan(
      code.indexOf('export const Trigger'),
    );
  });

  test('a CRLF file stays CRLF', () => {
    const { code } = run(
      "import { PopoverTrigger } from '@/components/animate-ui/primitives/base/popover';\r\nexport const a = <PopoverTrigger />;\r\n",
    );
    expect(code).toContain('const PopoverTrigger');
    expect(code.replace(/\r\n/g, '')).not.toContain('\n');
  });

  test('a test mock of a v1 module is reported', () => {
    const { manual } = run(
      "vi.mock('@/components/animate-ui/primitives/radix/tooltip', () => ({}));\n",
    );
    expect(manual.map((step) => step.message)).toEqual([
      'Mock of a v1 module: point it at @animate-ui/react/primitives/radix-ui/tooltip, which now replaces it.',
    ]);
  });

  test('an imported Portal is reused', () => {
    const { code } = run(
      [
        "import { DropdownMenuContent, DropdownMenuPortal as P } from '@/components/animate-ui/primitives/radix/dropdown-menu';",
        'export const a = <DropdownMenuContent />;',
        '',
      ].join('\n'),
    );
    expect(code).toContain('<P><DropdownMenuContent /></P>');
    expect(code).not.toContain('DropdownMenuPortal');
  });

  test("SheetContentProps keeps v1's side, which v1 components read", () => {
    const { code, changes } = run(
      [
        "import { SheetContent, type SheetContentProps } from '@/components/animate-ui/primitives/radix/sheet';",
        '',
        "export function Content({ side = 'right', ...props }: SheetContentProps) {",
        '  return <SheetContent side={side} {...props} />;',
        '}',
        '',
      ].join('\n'),
    );
    expect(code).toBe(
      [
        'import {',
        '  type DialogContentProps,',
        '  Content as SheetContent,',
        "} from '@animate-ui/react/primitives/radix-ui/dialog';",
        '',
        "type SheetContentProps = DialogContentProps & { side?: 'top' | 'right' | 'bottom' | 'left' };",
        '',
        "export function Content({ side = 'right', ...props }: SheetContentProps) {",
        '  return <SheetContent data-side={side} {...props} />;',
        '}',
        '',
      ].join('\n'),
    );
    expect(changes).toEqual(['line 4: <SheetContent> side → data-side']);
  });

  test('a v1 primitive with two v2 modules', () => {
    const { code } = run(
      "import { RadioGroup, Radio } from '@/components/animate-ui/primitives/base/radio';\n",
    );
    expect(code).toContain(
      "import { RadioGroup } from '@animate-ui/react/primitives/base-ui/radio-group';",
    );
    expect(code).toContain(
      "import { Radio as RadioPrimitive } from '@animate-ui/react/primitives/base-ui/radio';",
    );
    expect(code).toContain('const Radio = RadioPrimitive.Root;');
  });

  test("a user's own file at a v1 hook path is left alone", () => {
    const source =
      "import { useControlledState, useToggle } from '@/hooks/use-controlled-state';\n";
    const { code, manual } = run(source);
    expect(code).toBe(source);
    expect(manual).toEqual([]);
  });

  test("a v1 hook v2 doesn't ship stays, reported", () => {
    const source = "import { useAutoHeight } from '@/hooks/use-auto-height';\n";
    const { code, manual, found } = run(source);
    expect(code).toBe(source);
    expect(manual.map((step) => step.message)).toEqual([
      'hooks/use-auto-height has no v2 equivalent: it keeps importing from the v1 file, which stays yours.',
    ]);
    expect(found).toEqual(['hooks/use-auto-height']);
  });

  test('a v1 button that became a registry component stays, pointing at the registry', () => {
    const source =
      "import { LiquidButton } from '@/components/animate-ui/primitives/buttons/liquid';\n";
    const { code, manual, found } = run(source);
    expect(code).toBe(source);
    expect(manual.map((step) => step.message)).toEqual([
      'buttons/liquid is a registry component in v2, not part of @animate-ui/react: add it with `npx shadcn@latest add @animate-ui/buttons-liquid` and import it from `@/components/animate-ui/buttons/liquid`. The v1 file keeps working meanwhile.',
    ]);
    expect(found).toEqual(['buttons/liquid']);
  });

  test("SpringProvider's dragElastic is reported for removal", () => {
    const { manual } = run(
      [
        "import { SpringProvider } from '@/components/animate-ui/primitives/animate/spring';",
        'export const a = <SpringProvider dragElastic={0.4} />;',
        '',
      ].join('\n'),
    );
    expect(manual.map((step) => `${step.line} ${step.message}`)).toEqual([
      '2 <SpringProvider> `dragElastic`: v2 removed it, as it never had an effect: drop it.',
    ]);
  });

  test("Base UI 1's renames and defaults (v1 was built on its beta)", () => {
    const { code, changes, manual } = run(
      [
        "import { Accordion, AccordionPanel } from '@/components/animate-ui/primitives/base/accordion';",
        "import { TabsList, TabsTab } from '@/components/animate-ui/primitives/base/tabs';",
        "import { Tooltip, TooltipPositioner } from '@/components/animate-ui/primitives/base/tooltip';",
        'export const a = (',
        '  <Accordion loop={false}>',
        '    <AccordionPanel keepRendered />',
        '  </Accordion>',
        ');',
        'export const b = (',
        '  <TabsList>',
        '    <TabsTab value="a">A</TabsTab>',
        '  </TabsList>',
        ');',
        'export const c = (',
        '  <Tooltip delay={100} hoverable={false}>',
        '    <TooltipPositioner trackAnchor={false} />',
        '  </Tooltip>',
        ');',
        '',
      ].join('\n'),
    );
    expect(code).toContain('<Accordion multiple loopFocus={false}>');
    expect(code).toContain('<AccordionPanel keepMounted />');
    expect(code).toContain('<TabsList activateOnFocus>');
    expect(changes).toEqual([
      'line 5: <Accordion> loop → loopFocus',
      "line 5: <Accordion> multiple (v1's default)",
      'line 6: <AccordionPanel> keepRendered → keepMounted',
      "line 10: <TabsList> activateOnFocus (v1's default)",
    ]);
    expect(manual.map((step) => `${step.line} ${step.message}`)).toEqual([
      "2 Base UI 1 requires `value` on every tab (its beta fell back to the index) and renamed the selected tab's `data-selected` to `data-active`: give each tab a value and update your `data-[selected]` styles.",
      '15 <Tooltip> `delay`: Base UI 1 moved it to the trigger: move it to <TooltipTrigger> (or set it on <TooltipProvider>).',
      '15 <Tooltip> `hoverable`: Base UI 1 replaced it with `disableHoverablePopup`: `hoverable={false}` becomes `disableHoverablePopup`, otherwise drop it (the default).',
      '16 <TooltipPositioner> `trackAnchor`: Base UI 1 replaced it with `disableAnchorTracking`: `trackAnchor={false}` becomes `disableAnchorTracking`, otherwise drop it (the default).',
    ]);
  });

  test('Motion props: reported on library parts, kept on Animate UI primitives', () => {
    const { manual } = run(
      [
        "import { DropdownMenuItem } from '@/components/animate-ui/primitives/radix/dropdown-menu';",
        "import { Particles } from '@/components/animate-ui/primitives/effects/particles';",
        'export const a = <DropdownMenuItem transition={{ duration: 0.1 }} whileTap={{ scale: 0.9 }} />;',
        'export const b = <Particles animate transition={{ duration: 0.1 }} />;',
        '',
      ].join('\n'),
    );
    expect(manual.map((step) => step.message)).toEqual([
      "<DropdownMenuItem> `transition`: this part isn't animated in v2 (v1 rendered a motion element): drop it.",
      "<DropdownMenuItem> `whileTap` is a Motion prop: v2 parts aren't motion components (animated parts take `transition` and `exitTransition`). Drop it, or animate an element of your own inside the part.",
    ]);
  });

  test('unselected modules are left alone', () => {
    const source =
      "import { Tooltip } from '@/components/animate-ui/primitives/radix/tooltip';\n";
    expect(run(source, '/app/page.tsx', () => false).code).toBe(source);
  });

  test('a mixed import: the mappable parts move, the v1-only ones stay', () => {
    const { code, imports, manual } = run(
      [
        'import {',
        '  DropdownMenu,',
        '  DropdownMenuItem,',
        '  DropdownMenuHighlight,',
        '  useDropdownMenu,',
        "} from '@/components/animate-ui/primitives/radix/dropdown-menu';",
        '',
      ].join('\n'),
    );
    expect(code).toBe(
      [
        'import {',
        '  Root as DropdownMenu,',
        '  Item as DropdownMenuItem,',
        "} from '@animate-ui/react/primitives/radix-ui/dropdown-menu';",
        'import {',
        '  DropdownMenuHighlight,',
        '  useDropdownMenu,',
        "} from '@/components/animate-ui/primitives/radix/dropdown-menu';",
        '',
      ].join('\n'),
    );
    expect(imports[0]!.names).toEqual(['DropdownMenu', 'DropdownMenuItem']);
    expect(manual.map((step) => [step.line, step.migratedLine])).toEqual([
      [4, 6],
      [5, 7],
    ]);
    expect(manual[0]!.message).toBe(
      "`DropdownMenuHighlight` is a v1-only part with no equivalent in @animate-ui/react/primitives/radix-ui/dropdown-menu, left on v1: its v1 parent is now v2, so it throws at runtime. Remove it (v2 parts animate themselves; style their data-state attributes or control the state yourself), or replace the component with shadcn/ui's + `animate-ui animate`.",
    );
    expect(manual[1]!.message).toContain(
      '`useDropdownMenu` is a v1 context hook, left on v1: its v1 parent is now v2, so it throws at runtime.',
    );
  });

  test('a v1-only import alone warns that it throws once the parent moves', () => {
    const source =
      "import { useAccordionItem } from '@/components/animate-ui/primitives/radix/accordion';\n";
    const { code, manual } = run(source);
    expect(code).toBe(source);
    expect(manual[0]!.message).toContain(
      'It throws once its v1 parent is migrated',
    );
  });

  test('dynamic imports of v1 are reported', () => {
    const { manual } = run(
      "const m = import('@/components/animate-ui/primitives/radix/tooltip');\n",
    );
    expect(manual[0]!.message).toBe(
      'Dynamic import of a v1 module: rewrite it by hand.',
    );
  });
});
