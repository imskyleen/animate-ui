import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, test } from 'vitest';

import { animate } from '../src/commands/animate';
import { centerWithMargins } from '../src/lib/classes';

const DIALOG_V3 = `"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

import { cn } from "@/lib/utils"

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

export { DialogContent }
`;

function project(options: {
  tailwind?: string;
  config?: string;
  configFile?: boolean;
}) {
  const root = mkdtempSync(path.join(tmpdir(), 'animate-ui-tw3-'));
  writeFileSync(
    path.join(root, 'components.json'),
    JSON.stringify({
      ...(options.config !== undefined
        ? { tailwind: { config: options.config } }
        : {}),
      aliases: { components: '@/components', ui: '@/components/ui' },
    }),
  );
  writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify({
      dependencies: { '@animate-ui/react': '^2.0.0' },
      devDependencies: options.tailwind
        ? { tailwindcss: options.tailwind }
        : {},
    }),
  );
  if (options.configFile)
    writeFileSync(path.join(root, 'tailwind.config.ts'), 'export default {}\n');
  mkdirSync(path.join(root, 'components', 'ui'), { recursive: true });
  writeFileSync(path.join(root, 'components', 'ui', 'dialog.tsx'), DIALOG_V3);
  return root;
}

const run = (root: string) => {
  const lines: string[] = [];
  animate(['dialog'], { cwd: root, dryRun: false, log: (l) => lines.push(l) });
  return {
    code: readFileSync(
      path.join(root, 'components', 'ui', 'dialog.tsx'),
      'utf8',
    ),
    log: lines.join('\n'),
  };
};

test('Tailwind 3: a modal centered with translate is centered with margins instead, so Motion owns its transform', () => {
  for (const options of [
    { tailwind: '^3.4.1' },
    { config: 'tailwind.config.ts' },
    { configFile: true },
  ]) {
    const { code, log } = run(project(options));
    expect(code).toContain(
      '"fixed z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg sm:rounded-lg inset-0 m-auto h-fit"',
    );
    expect(code).not.toMatch(
      /translate-[xy]-\[-50%\]|left-\[50%\]|top-\[50%\]/,
    );
    expect(log).toContain(
      'centered with margins: top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] → inset-0 m-auto h-fit',
    );
  }
});

test('Tailwind 4 keeps the translate centering: the translate property composes with Motion', () => {
  for (const options of [{ tailwind: '^4.1.0' }, { config: '' }]) {
    const { code, log } = run(project(options));
    expect(code).toContain('translate-x-[-50%] translate-y-[-50%]');
    expect(log).not.toContain('centered with margins');
  }
});

test('the centering is replaced only when all four classes are there', () => {
  expect(
    centerWithMargins('fixed top-1/2 left-1/2 -translate-x-1/2').replaced,
  ).toEqual([]);
  expect(
    centerWithMargins(
      'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full',
    ).value,
  ).toBe('fixed w-full inset-0 m-auto h-fit');
});

test('version unknown: the classes tell it (bare data-*: variants and (--var) values only exist in Tailwind 4)', () => {
  const v3 = run(project({}));
  expect(v3.code).toContain('inset-0 m-auto h-fit');
  const root = project({});
  writeFileSync(
    path.join(root, 'components', 'ui', 'dialog.tsx'),
    DIALOG_V3.replaceAll('data-[state=open]:', 'data-open:').replaceAll(
      'data-[state=closed]:',
      'data-closed:',
    ),
  );
  expect(run(root).code).toContain('translate-x-[-50%] translate-y-[-50%]');
});
