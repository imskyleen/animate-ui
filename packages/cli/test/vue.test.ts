import {
  cpSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, test } from 'vitest';

import { animate } from '../src/commands/animate';
import {
  transformVue,
  VUE_MODULE,
  VUE_PACKAGES,
  VUE_PRIMITIVES,
} from '../src/lib/vue';

const FIXTURES = path.join(import.meta.dirname, 'fixtures-vue');

const files = (name: string) =>
  readdirSync(path.join(FIXTURES, name)).map((file) => ({
    file,
    code: readFileSync(path.join(FIXTURES, name, file), 'utf8'),
  }));

const changedLines = (before: string, after: string) => {
  const a = before.split('\n');
  const b = after.split('\n');
  expect(b).toHaveLength(a.length);
  return a.flatMap((line, i): [string, string][] =>
    line === b[i] ? [] : [[line, b[i]!]],
  );
};

describe('transformVue, on shadcn-vue’s own files', () => {
  // The code block is rewritten in place, not just swapped: code-block.test.ts.
  for (const name of Object.keys(VUE_PRIMITIVES).filter((name) => name !== 'code-block'))
    test(`${name}: every reka-ui import swapped, nothing else but animation classes`, () => {
      for (const { file, code } of files(name)) {
        const result = transformVue(code, name)!;
        expect(result.code).not.toMatch(/from\s+["']reka-ui["']/);
        for (const [before, after] of changedLines(code, result.code)) {
          const swap = VUE_PACKAGES[name];
          if (/from\s+["']reka-ui["']/.test(before))
            expect(after, file).toBe(
              before.replace(/(["'])reka-ui\1/, `$1${VUE_MODULE}$1`),
            );
          else if (swap && before.includes(`"${swap.from}"`))
            expect(after, file).toBe(
              before.replace(`"${swap.from}"`, `"${swap.to}"`),
            );
          else
            for (const token of before.split(/[\s'"`]+/))
              if (!after.includes(token))
                expect(result.removedClasses, file).toContain(token);
        }
      }
    });

  test('the CSS animations each component drops, like the React CLI', () => {
    const removed = (name: string) =>
      files(name).flatMap(
        ({ code }) => transformVue(code, name)!.removedClasses,
      );
    expect(removed('accordion').sort()).toEqual([
      'data-[state=closed]:animate-accordion-up',
      'data-[state=open]:animate-accordion-down',
    ]);
    expect(removed('switch').sort()).toEqual([
      'transition-all',
      'transition-transform',
    ]);
    expect(removed('progress')).toEqual(['transition-all']);
    for (const name of [
      'checkbox',
      'collapsible',
      'input-otp',
      'pagination',
      'radio-group',
      'slider',
      'toggle',
      'toggle-group',
    ])
      expect(removed(name), name).toEqual([]);
  });

  test('dialogs and sheets lose their CSS enter and exit, like the React CLI', () => {
    const removed = (name: string) => [
      ...new Set(
        files(name).flatMap(
          ({ code }) => transformVue(code, name)!.removedClasses,
        ),
      ),
    ];
    for (const name of ['dialog', 'alert-dialog', 'sheet']) {
      expect(removed(name), name).toContain('data-[state=open]:animate-in');
      expect(removed(name), name).toContain('data-[state=closed]:animate-out');
    }
    expect(removed('dialog')).toContain('duration-200');
    expect(removed('sheet')).toEqual(
      expect.arrayContaining(['transition', 'ease-in-out']),
    );
  });

  test('the drawer loses its CSS slide, fade and transform transition, like the React CLI', () => {
    const removed = [
      ...new Set(
        files('drawer').flatMap(
          ({ code }) => transformVue(code, 'drawer')!.removedClasses,
        ),
      ),
    ];
    expect(removed).toEqual(
      expect.arrayContaining([
        'data-[state=open]:animate-in',
        'data-[state=closed]:animate-out',
        'data-[state=open]:fade-in-0',
        'transition-transform',
        'duration-500',
        'ease-[cubic-bezier(0.32,0.72,0,1)]',
        'data-swiping:duration-0',
        'transform-[translate3d(var(--drawer-swipe-movement-x,0px),var(--drawer-swipe-movement-y,0px),0)]',
        'data-[swipe-direction=down]:data-[state=open]:slide-in-from-bottom',
      ]),
    );
    expect(removed).not.toContain('will-change-transform');
    expect(removed).not.toContain('data-swiping:select-none');
  });

  test('input-otp: vue-input-otp imports point at Animate UI’s animated OTPInput', () => {
    const swapped = files('input-otp').map(({ code }) =>
      transformVue(code, 'input-otp')!,
    );
    const code = swapped.map((result) => result.code).join('\n');
    expect(code).not.toMatch(/from\s+["']vue-input-otp["']/);
    expect(code).toContain(
      'import { OTPInput } from "@animate-ui/vue/primitives/input-otp"',
    );
    expect(code).toContain(
      'import { useVueOTPContext } from "@animate-ui/vue/primitives/input-otp"',
    );
    expect(swapped.reduce((n, r) => n + r.packageImports, 0)).toBe(3);
  });

  test('the sheet passes its side to the content, which slides from it', () => {
    const [content] = files('sheet').filter(
      ({ file }) => file === 'SheetContent.vue',
    );
    const result = transformVue(content!.code, 'sheet')!;
    expect(result.sheetSide).toBe(true);
    expect(result.code).toMatch(/<DialogContent :data-side="side"\s/);
    expect(transformVue(result.code, 'sheet')!.sheetSide).toBe(false);
    for (const { code } of files('dialog'))
      expect(transformVue(code, 'dialog')!.code).not.toContain('data-side');
  });

  test('a class list keeps its spacing once a class is removed', () => {
    const { code } = transformVue(
      'class="data-[state=closed]:animate-accordion-up overflow-hidden"\nclass="a animate-in b"\n',
      'accordion',
    )!;
    expect(code).toBe('class="overflow-hidden"\nclass="a b"\n');
  });

  test('under Tailwind 3 the radio dot is centered with margins, like the React CLI', () => {
    const [item] = files('radio-group').filter(
      ({ file }) => file === 'RadioGroupItem.vue',
    );
    const result = transformVue(item!.code, 'radio-group', { tailwind: 3 })!;
    expect(result.centering.sort()).toEqual([
      '-translate-x-1/2',
      '-translate-y-1/2',
      'left-1/2',
      'top-1/2',
    ]);
    expect(result.code).toContain(
      'fill-primary absolute size-2 inset-0 m-auto h-fit',
    );
    expect(transformVue(item!.code, 'radio-group')!.centering).toEqual([]);
  });

  test('a component Animate UI doesn’t animate is left alone', () => {
    expect(transformVue('import { X } from "reka-ui"', 'calendar')).toBeNull();
  });
});

describe('animate, in a shadcn-vue project', () => {
  let root: string;
  const ui = (...parts: string[]) =>
    path.join(root, 'src', 'components', 'ui', ...parts);

  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), 'animate-ui-cli-vue-'));
    writeFileSync(
      path.join(root, 'components.json'),
      JSON.stringify({
        $schema: 'https://shadcn-vue.com/schema.json',
        aliases: { components: '@/components', ui: '@/components/ui' },
      }),
    );
    writeFileSync(
      path.join(root, 'tsconfig.app.json'),
      '{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }',
    );
    writeFileSync(
      path.join(root, 'package.json'),
      JSON.stringify({ dependencies: { vue: '^3.5.0' } }),
    );
    writeFileSync(
      path.join(root, 'pnpm-lock.yaml'),
      "lockfileVersion: '9.0'\n",
    );
    mkdirSync(ui(), { recursive: true });
    for (const name of ['accordion', 'switch'])
      cpSync(path.join(FIXTURES, name), ui(name), { recursive: true });
    mkdirSync(ui('calendar'));
    writeFileSync(
      ui('calendar', 'Calendar.vue'),
      'import { X } from "reka-ui"',
    );
  });

  const run = (components: string[], dryRun = false) => {
    const lines: string[] = [];
    const code = animate(components, {
      cwd: root,
      dryRun,
      log: (line) => lines.push(line),
    });
    return { code, output: lines.join('\n') };
  };

  test('animates a component folder and says what changed', () => {
    const { code, output } = run(['accordion']);
    expect(code).toBe(0);
    expect(readFileSync(ui('accordion', 'AccordionContent.vue'), 'utf8')).toBe(
      transformVue(
        readFileSync(
          path.join(FIXTURES, 'accordion', 'AccordionContent.vue'),
          'utf8',
        ),
        'accordion',
      )!.code,
    );
    expect(output).toContain(
      'src/components/ui/accordion/AccordionContent.vue',
    );
    expect(output).toContain(
      'removed CSS animations: data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
    );
    expect(output).toContain('pnpm add @animate-ui/vue motion-v');
    expect(readFileSync(ui('switch', 'Switch.vue'), 'utf8')).toContain(
      'from "reka-ui"',
    );
  });

  test('animates the code block in place and says what it rewrote', () => {
    cpSync(path.join(FIXTURES, 'code-block'), ui('code-block'), {
      recursive: true,
    });
    const { code, output } = run(['code-block']);
    expect(code).toBe(0);
    expect(output).toContain('CodeBlockContent: pre → CodeBlockContentPrimitive');
    expect(output).toContain('CodeBlockCopyButton: built on CopyButton');
    expect(readFileSync(ui('code-block', 'CodeBlockContent.vue'), 'utf8')).toContain(
      '<CodeBlockContentPrimitive',
    );
    expect(run(['code-block']).output).toContain('Nothing to animate');
  });

  test('all: every supported folder, the others listed', () => {
    const { output } = run(['all']);
    expect(readFileSync(ui('switch', 'Switch.vue'), 'utf8')).not.toContain(
      'from "reka-ui"',
    );
    expect(readFileSync(ui('calendar', 'Calendar.vue'), 'utf8')).toContain(
      'from "reka-ui"',
    );
    expect(output).toContain('Not animated yet, left as is: calendar');
  });

  test('a component that isn’t installed points to shadcn-vue', () => {
    const { code, output } = run(['checkbox']);
    expect(code).toBe(1);
    expect(output).toContain('pnpm dlx shadcn-vue@latest add checkbox');
  });

  test('dry run writes nothing, running again changes nothing', () => {
    run(['accordion'], true);
    expect(readFileSync(ui('accordion', 'Accordion.vue'), 'utf8')).toContain(
      'from "reka-ui"',
    );
    run(['accordion']);
    expect(run(['accordion']).output).toContain('Nothing to animate');
  });
});
