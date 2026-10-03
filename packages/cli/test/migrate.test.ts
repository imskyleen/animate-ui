// `animate-ui migrate` on a v1 project: copies of the v1 registry files as
// shadcn installs them (test/migrate-fixtures/v1-project, `.txt` so tsc and
// eslint skip them), the v1 components built on them, and an app using both.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, test } from 'vitest';

import { migrate } from '../src/commands/migrate';
import { copyFixture, snapshot, typecheck } from './migrate-fixtures/helpers';

let root: string;
const read = (file: string) => readFileSync(path.join(root, file), 'utf8');
const PAGE = 'src/app/page.tsx';
const V1 = 'src/components/animate-ui';

beforeEach(() => {
  root = copyFixture();
});

const run = (
  components: string[],
  options: { dryRun?: boolean; delete?: boolean } = {},
) => {
  const lines: string[] = [];
  const code = migrate(components, {
    cwd: root,
    dryRun: options.dryRun ?? false,
    delete: options.delete,
    log: (line) => lines.push(line),
  });
  // eslint-disable-next-line no-control-regex
  return { code, output: lines.join('\n').replace(/\x1b\[\d+m/g, '') };
};

describe('migrate all', () => {
  test('rewrites v1 primitive imports to v2, keeping the v1 names', () => {
    const { code } = run(['all']);
    expect(code).toBe(0);
    const page = read(PAGE);

    // Radix: named imports under the v1 names.
    expect(page).toContain(`import {
  Root as Tooltip,
  Provider as TooltipProvider,
  Trigger as TooltipTrigger,
  Content as TooltipContent,
} from '@animate-ui/react/primitives/radix-ui/tooltip';`);
    expect(page).toContain(`import {
  Root as AccordionRoot,
  Item,
  Header as AccordionHeader,
  Trigger,
  Content,
} from '@animate-ui/react/primitives/radix-ui/accordion';`);
    // A v1 type v2 doesn't name: the props of the part.
    expect(page).toContain(
      'type AccordionProps = React.ComponentProps<typeof AccordionRoot>;',
    );

    // Base UI: the namespace, and the v1 names as local aliases.
    expect(page).toContain(
      "from '@animate-ui/react/primitives/base-ui/popover';",
    );
    expect(page).toContain('const Popover = PopoverPrimitive.Root;');
    expect(page).toContain('const PopoverPopup = PopoverPrimitive.Popup;');
    expect(page).toContain(
      'type PopoverPopupProps = PopoverPrimitive.Popup.Props;',
    );

    // Sheet is a Dialog in v2.
    expect(page).toContain(`import {
  Root as Sheet,
  Content as SheetContent,
  Trigger as SheetTrigger,
} from '@animate-ui/react/primitives/radix-ui/dialog';`);

    // lib/motion: `tempo` lives in the tokens.
    expect(page).toContain(
      "import { motionTokens, transition } from '@animate-ui/react/utils/motion';",
    );
    expect(page).toContain('const tempo = motionTokens.tempo;');

    // No v1 import left but the ones v2 can't replace.
    expect(page).not.toContain('primitives/radix/tooltip');
    expect(page).not.toContain('primitives/base/popover');
    expect(page).toContain(
      "import { useAccordionItem } from '@/components/animate-ui/primitives/radix/accordion';",
    );
    expect(page).toContain(
      "} from '@/components/animate-ui/primitives/headless/disclosure';",
    );
  });

  test('rewrites the props that changed mechanically', () => {
    const { output } = run(['all']);
    const page = read(PAGE);
    // keepRendered → forceMount
    expect(page).toContain('<Content forceMount initial={{ opacity: 0 }}>');
    // side → data-side, and v1's default spelled out
    expect(page).toContain('<SheetContent data-side="right">Left alone');
    expect(page).toContain('<SheetContent data-side="left">From the left');
    // v1's DropdownMenuContent rendered its own Portal
    expect(page)
      .toContain(`        <DropdownMenuPortal container={container.current}>
          <DropdownMenuContent sideOffset={4}>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>`);
    expect(page).toContain('Portal as DropdownMenuPortal,');
    expect(output).toContain('<Content> keepRendered → forceMount');
    expect(output).toContain('<SheetContent> side → data-side');
    expect(output).toContain(
      '<DropdownMenuContent> wrapped in <DropdownMenuPortal>',
    );
  });

  test('reports what it cannot migrate, with file:line', () => {
    const { output } = run(['all']);
    const page = read(PAGE).split('\n');
    const lineOf = (text: string) =>
      page.findIndex((line) => line.includes(text)) + 1;

    expect(output).toContain(
      `${PAGE}:${lineOf('useAccordionItem } from')} \`useAccordionItem\` is a v1 context hook`,
    );
    expect(output).toContain(
      `${PAGE}:${lineOf('<Content forceMount')} <Content> \`initial\` is a Motion prop`,
    );
    expect(output).toContain(
      `${PAGE}:${lineOf('<Tooltip followCursor')} <Tooltip> \`followCursor\``,
    );
    expect(output).toMatch(
      /Headless UI isn't supported in v2: rebuild the disclosure on Base UI/,
    );
    expect(output).toContain(
      'v1 placed the sheet at its edge itself (position: fixed)',
    );
  });

  test('migrates v1 components and suggests shadcn/ui + animate', () => {
    const { output } = run(['all']);
    const accordion = read(`${V1}/components/radix/accordion.tsx`);
    expect(accordion).toContain(`import {
  Root as AccordionPrimitive,
  Item as AccordionItemPrimitive,`);
    expect(accordion).toContain(
      'type AccordionPrimitiveProps = React.ComponentProps<typeof AccordionPrimitive>;',
    );
    expect(accordion).not.toContain('primitives/radix/accordion');

    const popover = read(`${V1}/components/base/popover.tsx`);
    // `PopoverPrimitive` is taken by the v1 name: the namespace gets another.
    expect(popover).toContain(
      "import { Popover as AnimatedPopover } from '@animate-ui/react/primitives/base-ui/popover';",
    );
    expect(popover).toContain('const PopoverPrimitive = AnimatedPopover.Root;');

    expect(output).toContain(
      "You can also swap it for shadcn/ui's accordion (pnpm dlx shadcn@latest add accordion) and run animate-ui animate accordion.",
    );
  });

  test('keeps v1-only parts on the v1 file and says so', () => {
    const before = read(`${V1}/components/radix/dropdown-menu.tsx`);
    const { output } = run(['all']);

    // Plain elements (DialogHeader is a <div>) stay importable from v1…
    const dialog = read(`${V1}/components/radix/dialog.tsx`);
    expect(dialog).toContain(`import {
  DialogFooter as DialogFooterPrimitive,
  DialogHeader as DialogHeaderPrimitive,
  type DialogFooterProps as DialogFooterPrimitiveProps,
  type DialogHeaderProps as DialogHeaderPrimitiveProps,
} from '@/components/animate-ui/primitives/radix/dialog';`);
    expect(output).toContain(
      '`DialogHeader` has no v2 equivalent (a plain <div> in v1)',
    );

    // …parts that read v1 contexts keep their whole import on v1.
    expect(read(`${V1}/components/radix/dropdown-menu.tsx`)).toBe(before);
    expect(output).toContain(
      'This import stays on v1 because of `DropdownMenuHighlightItem`, `DropdownMenuHighlight`.',
    );
  });

  test('rewrites the icon core, libs and hooks everywhere else', () => {
    run(['all']);
    expect(read(`${V1}/icons/bell.tsx`)).toContain(`import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';`);
    // A v1 primitive v2 doesn't have stays the user's, on v2 utilities.
    const disclosure = read(`${V1}/primitives/headless/disclosure.tsx`);
    expect(disclosure).not.toContain("from '@/lib/motion'");
    // Animate UI's own primitives ship in v2 too: their v1 copies are
    // replaced like the library wrappers, so they are left alone.
    expect(read(`${V1}/primitives/effects/highlight.tsx`)).toContain(
      "from '@/lib/motion'",
    );
    // v1 files v2 replaces are left alone.
    expect(read(`${V1}/primitives/radix/accordion.tsx`)).toContain(
      "from '@/lib/motion'",
    );
  });

  test('lists the v1 files nothing imports anymore, deletes none', () => {
    const { output } = run(['all']);
    const unused = [
      `${V1}/icons/icon.tsx`,
      `${V1}/primitives/animate/slot.tsx`,
      `${V1}/primitives/base/popover.tsx`,
      `${V1}/primitives/radix/sheet.tsx`,
      `${V1}/primitives/radix/tooltip.tsx`,
      'src/hooks/use-is-in-view.tsx',
    ];
    expect(output).toContain(
      `No longer imported (v1 files @animate-ui/react replaces):\n${unused.map((file) => `    ${file}`).join('\n')}\nRun again with --delete to remove them.`,
    );
    for (const file of unused)
      expect(existsSync(path.join(root, file))).toBe(true);
  });

  test('warns when @animate-ui/react is not installed', () => {
    expect(run(['all']).output).toContain(
      "@animate-ui/react isn't installed yet: pnpm add @animate-ui/react motion",
    );
    root = copyFixture();
    const pkg = JSON.parse(read('package.json'));
    pkg.dependencies['@animate-ui/react'] = '^2.0.0';
    writeFileSync(path.join(root, 'package.json'), JSON.stringify(pkg));
    expect(run(['all']).output).not.toContain("isn't installed yet");
  });
});

test('is idempotent', () => {
  run(['all']);
  const after = snapshot(root);
  const { output } = run(['all']);
  expect(snapshot(root)).toEqual(after);
  expect(output).toContain('0 files migrated');
});

test('--dry-run writes nothing', () => {
  const before = snapshot(root);
  const { output } = run(['all'], { dryRun: true, delete: true });
  expect(snapshot(root)).toEqual(before);
  expect(output).toContain('7 files would be migrated');
  expect(output).toContain(
    'Would remove (v1 files @animate-ui/react replaces):',
  );
  // Dry-run lines are the current file's.
  expect(output).toContain(`${PAGE}:25 \`useAccordionItem\``);
});

test('--delete removes the v1 files nothing imports anymore', () => {
  const { output } = run(['all'], { delete: true });
  expect(output).toContain('Removed (v1 files @animate-ui/react replaces):');
  for (const file of [
    `${V1}/icons/icon.tsx`,
    `${V1}/primitives/radix/tooltip.tsx`,
    `${V1}/primitives/base/popover.tsx`,
    'src/hooks/use-is-in-view.tsx',
  ])
    expect(existsSync(path.join(root, file)), file).toBe(false);
  // Still imported: by v1-only parts, the headless primitive, the hook…
  for (const file of [
    `${V1}/primitives/radix/accordion.tsx`,
    `${V1}/primitives/radix/dialog.tsx`,
    `${V1}/primitives/radix/dropdown-menu.tsx`,
    `${V1}/primitives/headless/disclosure.tsx`,
    'src/lib/motion.tsx',
    'src/lib/get-strict-context.tsx',
  ])
    expect(existsSync(path.join(root, file)), file).toBe(true);
  // And a second run has nothing left to remove.
  expect(run(['all'], { delete: true }).output).not.toContain('Removed');
});

test('--delete never removes a file that is no longer the v1 one', () => {
  const hook = path.join(root, 'src/hooks/use-is-in-view.tsx');
  writeFileSync(hook, 'export const mine = 1;\n');
  const { output } = run(['all'], { delete: true });
  expect(existsSync(hook)).toBe(true);
  expect(output).not.toContain('src/hooks/use-is-in-view.tsx');
});

test('migrate <name> only touches the imports of that primitive', () => {
  const { code, output } = run(['tooltip']);
  expect(code).toBe(0);
  const page = read(PAGE);
  expect(page).toContain(
    "from '@animate-ui/react/primitives/radix-ui/tooltip';",
  );
  expect(page).toContain(
    "} from '@/components/animate-ui/primitives/radix/accordion';",
  );
  expect(page).toContain("import { transition, tempo } from '@/lib/motion';");
  expect(read(`${V1}/icons/bell.tsx`)).toContain(
    "from '@/components/animate-ui/icons/icon';",
  );
  expect(output).toContain(
    `No longer imported (v1 files @animate-ui/react replaces):\n    ${V1}/primitives/radix/tooltip.tsx\n`,
  );
});

test('migrate icons rewrites the icon core imports', () => {
  run(['icons']);
  expect(read(`${V1}/icons/bell.tsx`)).toContain(
    "from '@animate-ui/react/icons';",
  );
  expect(read(PAGE)).toContain('primitives/radix/tooltip');
});

test('an unknown name fails, a known one without imports warns', () => {
  const unknown = run(['nope']);
  expect(unknown.code).toBe(1);
  expect(unknown.output).toContain("nope isn't an Animate UI v1 primitive.");
  const missing = run(['slider']);
  expect(missing.code).toBe(0);
  expect(missing.output).toContain('No import of the v1 slider found.');
});

test('a tempo set in v1 lib/motion is carried to the provider', () => {
  const file = path.join(root, 'src/lib/motion.tsx');
  writeFileSync(
    file,
    readFileSync(file, 'utf8').replace(
      'const tempo = 1;',
      'const tempo = 0.8;',
    ),
  );
  expect(run(['all']).output).toContain(
    'src/lib/motion.tsx sets tempo = 0.8: wrap your app in <AnimateUIProvider tempo={0.8}>',
  );
});

test('the migrated code type-checks against v2, but for what was reported', () => {
  const { output } = run(['all']);
  const files = [
    PAGE,
    `${V1}/components/radix/accordion.tsx`,
    `${V1}/components/radix/dialog.tsx`,
    `${V1}/components/radix/tooltip.tsx`,
    `${V1}/components/base/popover.tsx`,
    `${V1}/icons/bell.tsx`,
    `${V1}/primitives/effects/highlight.tsx`,
  ];
  const diagnostics = typecheck(
    files.map((file) => path.join(root, file)),
    { '@/*': [path.join(root, 'src', '*')] },
  )
    // Packages the fixture doesn't install.
    .filter(
      (d) =>
        !/Cannot find module '(lucide-react|clsx|tailwind-merge)'/.test(
          d.message,
        ),
    )
    .map((d) => `${path.relative(root, d.file)}:${d.line}`);

  const page = read(PAGE).split('\n');
  for (const location of diagnostics) {
    const [file, line] = location.split(':') as [string, string];
    // Headless UI isn't installed either: its parts were reported at the import.
    if (page[Number(line) - 1]?.includes('Disclosure')) continue;
    expect(file).toBe(PAGE);
    expect(output, `${location} has an error nobody reported`).toContain(
      `${location} `,
    );
  }
  // The v1 components were fully checked: no error at all there.
  expect(diagnostics.filter((d) => !d.startsWith(PAGE))).toEqual([]);
}, 120_000);
