// rewrite() on single files: the import shapes users write around v1.
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
        "import { ContextMenuContent } from '@/components/animate-ui/primitives/radix/context-menu';",
        'export const a = <ContextMenuContent container={el} />;',
        '',
      ].join('\n'),
    );
    expect(code).toContain(
      'export const a = <ContextMenuPortal container={el}><ContextMenuContent /></ContextMenuPortal>;',
    );
    expect(code).toContain(
      '  Content as ContextMenuContent,\n  Portal as ContextMenuPortal,\n',
    );
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

  test('a generic v1 type stays generic', () => {
    const { code } = run(
      "import type { SelectProps } from '@/components/animate-ui/primitives/base/select';\n",
      '/app/select.ts',
    );
    expect(code).toContain(
      'type SelectProps<Value = unknown, Multiple extends boolean | undefined = false> = SelectPrimitive.Root.Props<Value, Multiple>;',
    );
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

  test("a user's own lib/motion is left alone", () => {
    const source = "import { fadeIn, transition } from '@/lib/motion';\n";
    const { code, manual } = run(source);
    expect(code).toBe(source);
    expect(manual).toEqual([]);
  });

  test('unselected modules are left alone', () => {
    const source =
      "import { Tooltip } from '@/components/animate-ui/primitives/radix/tooltip';\n";
    expect(run(source, '/app/page.tsx', () => false).code).toBe(source);
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
