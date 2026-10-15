import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, test } from 'vitest';

import { migrate, type MigrateOptions } from '../src/commands/migrate';
import { PromptAbortedError } from '../src/lib/prompt';
import { copyFixture, snapshot, typecheck } from './migrate-fixtures/helpers';

let root: string;
const read = (file: string) => readFileSync(path.join(root, file), 'utf8');
const PAGE = 'src/app/page.tsx';
const V1 = 'src/components/animate-ui';

const production = new Map<string, string>();
const REGISTRY = path.resolve(
  import.meta.dirname,
  '../../../apps/v1/apps/www/public/r',
);
for (const name of readdirSync(REGISTRY)) {
  if (!name.endsWith('.json') || name.startsWith('demo-')) continue;
  const item = JSON.parse(readFileSync(path.join(REGISTRY, name), 'utf8'));
  for (const file of item.files ?? [])
    if (file.target) production.set(`src/${file.target}`, file.content);
}

beforeEach(() => {
  root = copyFixture();
});

test("the fixture's v1 files are the production registry's", () => {
  const own = [PAGE, 'src/lib/utils.ts'];
  const files = Object.keys(snapshot(root)).filter((file) =>
    file.startsWith('src/'),
  );
  for (const file of files) {
    if (own.includes(file)) continue;
    expect(read(file), file).toBe(production.get(file));
  }
  expect(files).toContain('src/hooks/use-data-state.tsx');
});

const run = async (
  components: string[],
  options: Partial<Omit<MigrateOptions, 'cwd' | 'log'>> = {},
) => {
  const lines: string[] = [];
  const code = await migrate(components, {
    cwd: root,
    dryRun: false,
    interactive: false,
    ...options,
    log: (line) => lines.push(line),
  });
  // eslint-disable-next-line no-control-regex
  return { code, output: lines.join('\n').replace(/\x1b\[\d+m/g, '') };
};

describe('migrate all', () => {
  test('rewrites v1 primitive imports to v2, keeping the v1 names', async () => {
    const { code } = await run(['all']);
    expect(code).toBe(0);
    const page = read(PAGE);

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
    expect(page).toContain(
      'type AccordionProps = React.ComponentProps<typeof AccordionRoot>;',
    );

    expect(page).toContain(
      "from '@animate-ui/react/primitives/base-ui/popover';",
    );
    expect(page).toContain('const Popover = PopoverPrimitive.Root;');
    expect(page).toContain('const PopoverPopup = PopoverPrimitive.Popup;');
    expect(page).toContain(
      'type PopoverPopupProps = PopoverPrimitive.Popup.Props;',
    );

    expect(page).toContain(`import {
  Root as Sheet,
  Content as SheetContent,
  Trigger as SheetTrigger,
} from '@animate-ui/react/primitives/radix-ui/dialog';`);

    expect(page).toContain(
      "import { useControlledState } from '@animate-ui/react/utils/use-controlled-state';",
    );

    expect(page).not.toContain('primitives/radix/tooltip');
    expect(page).not.toContain('primitives/base/popover');
    expect(page).toContain(
      "import { useAccordionItem } from '@/components/animate-ui/primitives/radix/accordion';",
    );
    expect(page).toContain(
      "} from '@/components/animate-ui/primitives/headless/disclosure';",
    );
    expect(page).toContain(
      "import { useDataState } from '@/hooks/use-data-state';",
    );
  });

  test('rewrites the props that changed mechanically', async () => {
    const { output } = await run(['all']);
    const page = read(PAGE);
    expect(page).toContain('<Content forceMount initial={{ opacity: 0 }}>');
    expect(page).toContain('<SheetContent data-side="right">Left alone');
    expect(page).toContain('<SheetContent data-side="left">From the left');
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

  test('reports what it cannot migrate, with file:line', async () => {
    const { output } = await run(['all']);
    const page = read(PAGE).split('\n');
    const lineOf = (text: string) =>
      page.findIndex((line) => line.includes(text)) + 1;

    expect(output).toContain(
      `${PAGE}:${lineOf('useAccordionItem } from')} \`useAccordionItem\` is a v1 context hook`,
    );
    expect(output).toContain(
      `${PAGE}:${lineOf('<Content forceMount')} <Content> \`initial\` is a Motion prop`,
    );
    expect(output).not.toContain(
      `${PAGE}:${lineOf('<Tooltip followCursor')} <Tooltip> \`followCursor\``,
    );
    expect(output).toMatch(
      /Headless UI isn't supported in v2: rebuild the disclosure on Base UI/,
    );
    expect(output).toContain(
      'v1 placed the sheet at its edge itself (position: fixed)',
    );
    expect(output).toContain(
      `${PAGE}:${lineOf("from '@/hooks/use-data-state'")} hooks/use-data-state has no v2 equivalent: it keeps importing from the v1 file, which stays yours.`,
    );
    expect(output).toContain(
      `${PAGE}:${lineOf('<Popover openOnHover')} <Popover> \`openOnHover\`: Base UI 1 moved it to the trigger: move it to <PopoverTrigger>.`,
    );
  });

  test('migrates v1 components and suggests shadcn/ui + animate', async () => {
    const { output } = await run(['all']);
    const accordion = read(`${V1}/components/radix/accordion.tsx`);
    expect(accordion).toContain(`import {
  Root as AccordionPrimitive,
  Item as AccordionItemPrimitive,`);
    expect(accordion).toContain(
      'type AccordionPrimitiveProps = React.ComponentProps<typeof AccordionPrimitive>;',
    );
    expect(accordion).not.toContain('primitives/radix/accordion');

    const popover = read(`${V1}/components/base/popover.tsx`);
    expect(popover).toContain(
      "import { Popover as AnimatedPopover } from '@animate-ui/react/primitives/base-ui/popover';",
    );
    expect(popover).toContain('const PopoverPrimitive = AnimatedPopover.Root;');

    expect(output).toContain(
      "You can also swap it for shadcn/ui's accordion (pnpm dlx shadcn@latest add accordion) and run animate-ui animate accordion.",
    );
  });

  test('keeps v1-only parts on the v1 file and says so', async () => {
    const { output } = await run(['all']);

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

    const menu = read(`${V1}/components/radix/dropdown-menu.tsx`);
    expect(menu).toContain(
      "  Portal as DropdownMenuPortal,\n} from '@animate-ui/react/primitives/radix-ui/dropdown-menu';",
    );
    expect(menu).toContain(`import {
  DropdownMenuHighlightItem as DropdownMenuHighlightItemPrimitive,
  DropdownMenuHighlight as DropdownMenuHighlightPrimitive,
  DropdownMenuShortcut as DropdownMenuShortcutPrimitive,
  type DropdownMenuShortcutProps as DropdownMenuShortcutPrimitiveProps,
} from '@/components/animate-ui/primitives/radix/dropdown-menu';`);
    const lineOf = (text: string) =>
      menu.split('\n').findIndex((line) => line.includes(text)) + 1;
    expect(output).toContain(
      `${V1}/components/radix/dropdown-menu.tsx:${lineOf('DropdownMenuHighlightItem as')} \`DropdownMenuHighlightItem\` is a v1-only part with no equivalent in @animate-ui/react/primitives/radix-ui/dropdown-menu, left on v1: its v1 parent is now v2, so it throws at runtime. Remove it (v2 parts animate themselves; style their data-state attributes or control the state yourself), or replace the component with shadcn/ui's + \`animate-ui animate\`.`,
    );
    expect(output).not.toContain('stays on v1 because of');
  });

  test('says which v1 files are still imported, and by what', async () => {
    const { output } = await run(['all']);
    expect(output).toContain(
      [
        'Still imported (v1 files @animate-ui/react replaces):',
        `    ${V1}/primitives/radix/accordion.tsx: still imported by ${PAGE}, kept.`,
        `    ${V1}/primitives/radix/dialog.tsx: still imported by ${V1}/components/radix/dialog.tsx, kept.`,
        `    ${V1}/primitives/radix/dropdown-menu.tsx: still imported by ${V1}/components/radix/dropdown-menu.tsx, kept.`,
        '    and the 3 v1 files they import, kept.',
      ].join('\n'),
    );
  });

  test("a v1 primitive v2 doesn't replace stays on the v1 primitives it's built on", async () => {
    const files = `${V1}/primitives/radix/files.tsx`;
    writeFileSync(path.join(root, files), production.get(files)!);
    const { output } = await run(['all']);
    const code = read(files);
    expect(code).toContain(
      "} from '@/components/animate-ui/primitives/radix/accordion';",
    );
    expect(code).toContain(
      "} from '@animate-ui/react/primitives/effects/highlight';",
    );
    expect(code).toContain(
      "import { getStrictContext } from '@animate-ui/react/utils/strict-context';",
    );
    expect(output).toContain(
      `    ${V1}/primitives/radix/accordion.tsx: still imported by ${PAGE}, ${files}, kept.`,
    );
  });

  test('rewrites the icon core, libs and hooks everywhere else', async () => {
    const before = snapshot(root);
    await run(['all']);
    expect(read(`${V1}/icons/bell.tsx`)).toContain(`import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';`);
    const disclosure = read(`${V1}/primitives/headless/disclosure.tsx`);
    expect(disclosure).toContain(
      "import { getStrictContext } from '@animate-ui/react/utils/strict-context';",
    );
    expect(disclosure).not.toContain("from '@/lib/get-strict-context'");
    const highlight = `${V1}/primitives/effects/highlight.tsx`;
    expect(read(highlight)).toBe(before[highlight]);
    const accordion = `${V1}/primitives/radix/accordion.tsx`;
    expect(read(accordion)).toBe(before[accordion]);
    expect(read(accordion)).toContain("from '@/lib/get-strict-context'");
  });

  test('lists the v1 files nothing imports anymore, deletes none', async () => {
    const { output } = await run(['all']);
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

  test('warns when @animate-ui/react is not installed', async () => {
    const { output } = await run(['all']);
    expect(output).toContain(
      "@animate-ui/react isn't installed yet: pnpm add @animate-ui/react motion @base-ui/react\n    @base-ui/react is Base UI 1, which v2's Base UI primitives use (v1's were built on its beta, @base-ui-components/react).",
    );
    const install = (...names: string[]) => {
      root = copyFixture();
      const pkg = JSON.parse(read('package.json'));
      for (const name of names) pkg.dependencies[name] = '^2.0.0';
      writeFileSync(path.join(root, 'package.json'), JSON.stringify(pkg));
    };
    install('@animate-ui/react');
    expect((await run(['all'])).output).toContain(
      "@base-ui/react isn't installed yet: pnpm add @base-ui/react\n",
    );
    install('@animate-ui/react', '@base-ui/react');
    expect((await run(['all'])).output).not.toContain("isn't installed yet");
    root = copyFixture();
    const tooltip = (await run(['tooltip'])).output;
    expect(tooltip).toContain(
      "@animate-ui/react isn't installed yet: pnpm add @animate-ui/react motion",
    );
    expect(tooltip).not.toContain('@base-ui/react');
  });
});

test('a second pass says the same about what is left', async () => {
  const first = (await run(['all'])).output;
  const second = (await run(['all'])).output;
  const message = (output: string) =>
    output.match(/`useAccordionItem` is a v1 context hook[^\n]*/)![0];
  expect(message(second)).toBe(message(first));
  expect((await run(['tooltip'])).output).toContain(
    'Nothing to migrate: no import of the v1 tooltip left.',
  );
});

test('is idempotent', async () => {
  await run(['all']);
  const after = snapshot(root);
  const { output } = await run(['all']);
  expect(snapshot(root)).toEqual(after);
  expect(output).toContain('0 files migrated');
});

test('--dry-run writes nothing', async () => {
  const before = snapshot(root);
  const { output } = await run(['all'], { dryRun: true, delete: true });
  expect(snapshot(root)).toEqual(before);
  expect(output).toContain('8 files would be migrated');
  expect(output).toContain(
    'Would remove (v1 files @animate-ui/react replaces):',
  );
  expect(output).toContain(`${PAGE}:25 \`useAccordionItem\``);
});

test('--delete removes the v1 files nothing imports anymore', async () => {
  const { output } = await run(['all'], { delete: true });
  expect(output).toContain('Removed (v1 files @animate-ui/react replaces):');
  for (const file of [
    `${V1}/icons/icon.tsx`,
    `${V1}/primitives/radix/tooltip.tsx`,
    `${V1}/primitives/base/popover.tsx`,
    'src/hooks/use-is-in-view.tsx',
  ])
    expect(existsSync(path.join(root, file)), file).toBe(false);
  for (const file of [
    `${V1}/primitives/radix/accordion.tsx`,
    `${V1}/primitives/radix/dialog.tsx`,
    `${V1}/primitives/radix/dropdown-menu.tsx`,
    `${V1}/primitives/headless/disclosure.tsx`,
    'src/lib/get-strict-context.tsx',
    'src/hooks/use-data-state.tsx',
  ])
    expect(existsSync(path.join(root, file)), file).toBe(true);
  expect((await run(['all'], { delete: true })).output).not.toContain(
    'Removed',
  );
});

test('--delete never removes a file that is no longer the v1 one', async () => {
  const hook = path.join(root, 'src/hooks/use-is-in-view.tsx');
  writeFileSync(hook, 'export const mine = 1;\n');
  const { output } = await run(['all'], { delete: true });
  expect(existsSync(hook)).toBe(true);
  expect(output).not.toContain('src/hooks/use-is-in-view.tsx');
});

test('migrate <name> only touches the imports of that primitive', async () => {
  const { code, output } = await run(['tooltip']);
  expect(code).toBe(0);
  const page = read(PAGE);
  expect(page).toContain(
    "from '@animate-ui/react/primitives/radix-ui/tooltip';",
  );
  expect(page).toContain(
    "} from '@/components/animate-ui/primitives/radix/accordion';",
  );
  expect(page).toContain(
    "import { useControlledState } from '@/hooks/use-controlled-state';",
  );
  expect(read(`${V1}/icons/bell.tsx`)).toContain(
    "from '@/components/animate-ui/icons/icon';",
  );
  expect(output).toContain(
    `No longer imported (v1 files @animate-ui/react replaces):\n    ${V1}/primitives/radix/tooltip.tsx\n`,
  );
});

test('migrate all --exclude leaves that primitive on v1', async () => {
  const { code, output } = await run(['all'], { exclude: ['tooltip'] });
  expect(code).toBe(0);
  const page = read(PAGE);
  expect(page).toContain(
    "from '@/components/animate-ui/primitives/radix/tooltip';",
  );
  expect(page).toContain(
    "from '@animate-ui/react/primitives/radix-ui/accordion';",
  );
  expect(output).not.toContain(`${V1}/primitives/radix/tooltip.tsx\n`);
});

test('--exclude stops on a name that is not a v1 primitive', async () => {
  const before = snapshot(root);
  const { code, output } = await run(['all'], { exclude: ['toolip'] });
  expect(code).toBe(1);
  expect(output).toContain(
    "toolip isn't an Animate UI v1 primitive: check --exclude.",
  );
  expect(snapshot(root)).toEqual(before);
});

test('component names ignore case', async () => {
  const { code } = await run(['Tooltip']);
  expect(code).toBe(0);
  expect(read(PAGE)).toContain(
    "from '@animate-ui/react/primitives/radix-ui/tooltip';",
  );
});

test('--exclude ignores case', async () => {
  await run(['all'], { exclude: ['Tooltip'] });
  expect(read(PAGE)).toContain(
    "} from '@/components/animate-ui/primitives/radix/tooltip';",
  );
});

test('migrate icons rewrites the icon core imports', async () => {
  await run(['icons']);
  expect(read(`${V1}/icons/bell.tsx`)).toContain(
    "from '@animate-ui/react/icons';",
  );
  expect(read(PAGE)).toContain('primitives/radix/tooltip');
});

test('an unknown name fails, a known one without imports warns', async () => {
  const unknown = await run(['nope']);
  expect(unknown.code).toBe(1);
  expect(unknown.output).toContain("nope isn't an Animate UI v1 primitive.");
  expect((await run(['slider'])).code).toBe(1);
  const missing = await run(['progress']);
  expect(missing.code).toBe(0);
  expect(missing.output).toContain('No import of the v1 progress found.');
});

test('the migrated code type-checks against v2, but for what was reported', async () => {
  const { output } = await run(['all']);
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
    if (page[Number(line) - 1]?.includes('Disclosure')) continue;
    expect(file).toBe(PAGE);
    expect(output, `${location} has an error nobody reported`).toContain(
      `${location} `,
    );
  }
  expect(diagnostics.filter((d) => !d.startsWith(PAGE))).toEqual([]);
}, 120_000);

describe('the unused v1 files, in a terminal', () => {
  const UNUSED = [
    `${V1}/icons/icon.tsx`,
    `${V1}/primitives/animate/slot.tsx`,
    `${V1}/primitives/base/popover.tsx`,
    `${V1}/primitives/radix/sheet.tsx`,
    `${V1}/primitives/radix/tooltip.tsx`,
    'src/hooks/use-is-in-view.tsx',
  ];
  const exists = (file: string) => existsSync(path.join(root, file));

  const answering = (...answers: number[]) => {
    const asked: { question: string; choices: string[] }[] = [];
    const ask = async (question: string, choices: string[]) => {
      asked.push({ question, choices });
      const answer = answers.shift();
      if (answer === undefined) throw new Error(`Unexpected: ${question}`);
      return answer;
    };
    return { asked, ask };
  };

  test('lists them, then asks about the first one', async () => {
    const { asked, ask } = answering(3);
    const { output } = await run(['all'], { interactive: true, ask });
    expect(output).toContain(
      `No longer imported (v1 files @animate-ui/react replaces):\n${UNUSED.map((file) => `    ${file}`).join('\n')}\n`,
    );
    expect(asked).toEqual([
      {
        question: `Nothing imports ${UNUSED[0]} anymore (1/6).`,
        choices: [
          `Delete ${UNUSED[0]}`,
          `Delete ${UNUSED[0]} and the 5 other unused v1 files`,
          `Keep ${UNUSED[0]}`,
          'Keep every v1 file',
        ],
      },
    ]);
    expect(output).not.toContain('--delete');
  });

  test('"Keep every v1 file" keeps them all, asked once', async () => {
    const { asked, ask } = answering(3);
    const { code, output } = await run(['all'], { interactive: true, ask });
    expect(code).toBe(0);
    expect(asked).toHaveLength(1);
    for (const file of UNUSED) expect(exists(file), file).toBe(true);
    expect(output).toContain('0 v1 files removed, 6 kept.');
  });

  test('"Delete … and the N others" deletes them all, asked once', async () => {
    const { asked, ask } = answering(1);
    const { output } = await run(['all'], { interactive: true, ask });
    expect(asked).toHaveLength(1);
    for (const file of UNUSED) expect(exists(file), file).toBe(false);
    expect(exists(`${V1}/primitives/radix/accordion.tsx`)).toBe(true);
    expect(output).toContain('6 v1 files removed, 0 kept.');
  });

  test('"Delete" and "Keep" settle one file and ask about the next', async () => {
    const { asked, ask } = answering(0, 2, 0, 2, 2, 0);
    const { output } = await run(['all'], { interactive: true, ask });
    expect(asked.map(({ question }) => question)).toEqual(
      UNUSED.map((file, i) => `Nothing imports ${file} anymore (${i + 1}/6).`),
    );
    expect(asked[4]!.choices[1]).toBe(
      `Delete ${UNUSED[4]} and the 1 other unused v1 file`,
    );
    expect(asked[5]!.choices).toEqual([
      `Delete ${UNUSED[5]}`,
      `Keep ${UNUSED[5]}`,
    ]);
    expect(UNUSED.map(exists)).toEqual([false, true, false, true, true, false]);
    expect(output).toContain('3 v1 files removed, 3 kept.');
  });

  test('a later "all" answer settles the rest', async () => {
    const { asked, ask } = answering(0, 2, 1);
    await run(['all'], { interactive: true, ask });
    expect(asked).toHaveLength(3);
    expect(asked[2]!.choices[1]).toBe(
      `Delete ${UNUSED[2]} and the 3 other unused v1 files`,
    );
    expect(UNUSED.map(exists)).toEqual([
      false,
      true,
      false,
      false,
      false,
      false,
    ]);
  });

  test('Ctrl-C stops: nothing more deleted, exit code 130', async () => {
    let calls = 0;
    const ask = async () => {
      if (calls++ === 0) return 0;
      throw new PromptAbortedError();
    };
    const { code, output } = await run(['all'], { interactive: true, ask });
    expect(code).toBe(130);
    expect(UNUSED.map(exists)).toEqual([false, true, true, true, true, true]);
    expect(output).toContain(`Aborted: removed ${UNUSED[0]}, the rest kept.`);
  });

  test('--keep keeps them all without asking', async () => {
    const { asked, ask } = answering();
    const { output } = await run(['all'], {
      interactive: true,
      keep: true,
      ask,
    });
    expect(asked).toEqual([]);
    for (const file of UNUSED) expect(exists(file), file).toBe(true);
    expect(output).toContain('No longer imported (v1 files');
    expect(output).not.toContain('--delete');
  });

  test('--delete deletes them all without asking', async () => {
    const { asked, ask } = answering();
    const { output } = await run(['all'], {
      interactive: true,
      delete: true,
      ask,
    });
    expect(asked).toEqual([]);
    for (const file of UNUSED) expect(exists(file), file).toBe(false);
    expect(output).toContain('Removed (v1 files @animate-ui/react replaces):');
  });

  test('not a terminal: keeps them all, hints at --delete', async () => {
    const { asked, ask } = answering();
    const { output } = await run(['all'], { interactive: false, ask });
    expect(asked).toEqual([]);
    for (const file of UNUSED) expect(exists(file), file).toBe(true);
    expect(output).toContain('Run again with --delete to remove them.');
  });

  test('--dry-run never asks', async () => {
    const { asked, ask } = answering();
    const before = snapshot(root);
    const { output } = await run(['all'], {
      interactive: true,
      dryRun: true,
      ask,
    });
    expect(asked).toEqual([]);
    expect(snapshot(root)).toEqual(before);
    expect(output).toContain(
      'No longer imported (v1 files @animate-ui/react replaces):',
    );
    expect(output).not.toContain('Would remove');
  });
});

describe('imports the import graph misses keep their v1 file', () => {
  const TOOLTIP = `${V1}/primitives/radix/tooltip.tsx`;
  const IMPORT =
    "import { TooltipContent } from '@/components/animate-ui/primitives/radix/tooltip';\n";
  const add = (file: string, code: string) => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), code);
  };

  test.each([
    ['a build folder', 'build/preview.tsx', IMPORT],
    ['an MDX page', 'docs/tooltip.mdx', `${IMPORT}\n# Tooltip\n`],
    [
      'a file it cannot parse',
      'src/decorated.ts',
      `${IMPORT}@decorator class A { @field b = 1 }\n`,
    ],
  ])('%s', async (_, file, code) => {
    add(file, code);
    const { output } = await run(['all'], { delete: true });
    expect(existsSync(path.join(root, TOOLTIP))).toBe(true);
    expect(output).toContain(`${TOOLTIP}: still imported by ${file}`);
  });

  test('a hidden folder is migrated too', async () => {
    add('.storybook/preview.tsx', IMPORT);
    await run(['all']);
    expect(read('.storybook/preview.tsx')).toContain(
      "from '@animate-ui/react/primitives/radix-ui/tooltip';",
    );
  });

  test('another app of the monorepo', async () => {
    const mono = mkdtempSync(path.join(tmpdir(), 'animate-ui-mono-'));
    writeFileSync(
      path.join(mono, 'pnpm-workspace.yaml'),
      "packages: ['apps/*']\n",
    );
    cpSync(root, path.join(mono, 'apps/web'), { recursive: true });
    root = path.join(mono, 'apps/web');
    mkdirSync(path.join(mono, 'apps/docs'));
    writeFileSync(
      path.join(mono, 'apps/docs/page.tsx'),
      "import { TooltipContent } from '../web/src/components/animate-ui/primitives/radix/tooltip';\n",
    );
    await run(['all'], { delete: true });
    expect(existsSync(path.join(root, TOOLTIP))).toBe(true);
  });

  test('an import through baseUrl is migrated', async () => {
    writeFileSync(
      path.join(root, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: { baseUrl: 'src', paths: { '@/*': ['./*'] } },
      }),
    );
    add(
      'src/app/base-url.tsx',
      "import { TooltipContent } from 'components/animate-ui/primitives/radix/tooltip';\n",
    );
    await run(['all'], { delete: true });
    expect(read('src/app/base-url.tsx')).toContain(
      "from '@animate-ui/react/primitives/radix-ui/tooltip';",
    );
  });
});

test("a hook of the user's own, named like v1's, is left alone", async () => {
  const hook = 'src/hooks/use-controlled-state.tsx';
  const own =
    'import * as React from "react";\nexport function useControlledState(initial: number) {\n  return React.useState(initial);\n}\n';
  writeFileSync(path.join(root, hook), own);
  const { output } = await run(['all'], { delete: true });
  expect(read(PAGE)).toContain(
    "import { useControlledState } from '@/hooks/use-controlled-state';",
  );
  expect(read(hook)).toBe(own);
  expect(output).not.toContain(hook);
});

test('a file it cannot write is named and skipped, the others still migrated', async () => {
  const before = read(PAGE);
  chmodSync(path.join(root, PAGE), 0o444);
  const { code, output } = await run(['all']);
  expect(code).toBe(1);
  expect(output).toContain(`${PAGE}: couldn't write it`);
  expect(output).not.toContain(`✔ ${PAGE}`);
  expect(read(PAGE)).toBe(before);
});
