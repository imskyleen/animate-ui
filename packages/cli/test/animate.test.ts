import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeEach, expect, test } from 'vitest';

import { animate } from '../src/commands/animate';

const ACCORDION = readFileSync(
  path.join(import.meta.dirname, 'fixtures', 'radix-ui', 'accordion.nova.tsx'),
  'utf8',
);

let root: string;
const uiFile = () =>
  path.join(root, 'src', 'components', 'ui', 'accordion.tsx');

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), 'animate-ui-cli-'));
  writeFileSync(
    path.join(root, 'components.json'),
    JSON.stringify({
      aliases: { components: '@/components', ui: '@/components/ui' },
    }),
  );
  writeFileSync(
    path.join(root, 'tsconfig.json'),
    `{
      // Next.js with a src/ directory
      "compilerOptions": { "paths": { "@/*": ["./src/*"] }, },
    }`,
  );
  writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify({ dependencies: {} }),
  );
  mkdirSync(path.dirname(uiFile()), { recursive: true });
  writeFileSync(uiFile(), ACCORDION);
  writeFileSync(
    path.join(path.dirname(uiFile()), 'button.tsx'),
    'import { Slot } from "radix-ui"\nexport const Button = Slot\n',
  );
});

const run = (components: string[], dryRun = false) => {
  const lines: string[] = [];
  const code = animate(components, {
    cwd: root,
    dryRun,
    log: (l) => lines.push(l),
  });
  return { code, output: lines.join('\n') };
};

test('animate <component> rewrites the file and says what changed', () => {
  const { code, output } = run(['accordion']);
  expect(code).toBe(0);
  expect(readFileSync(uiFile(), 'utf8')).toContain(
    'from "@animate-ui/react/primitives/radix-ui"',
  );
  expect(output).toContain('src/components/ui/accordion.tsx');
  expect(output).toContain('pnpm add @animate-ui/react motion');
});

test('--dry-run writes nothing', () => {
  const { code, output } = run(['accordion'], true);
  expect(code).toBe(0);
  expect(readFileSync(uiFile(), 'utf8')).toBe(ACCORDION);
  expect(output).toContain('would be animated');
});

test('animate all only touches files with supported primitives', () => {
  const button = path.join(path.dirname(uiFile()), 'button.tsx');
  const before = readFileSync(button, 'utf8');
  const { output } = run(['all']);
  expect(readFileSync(button, 'utf8')).toBe(before);
  expect(output).toContain('1 file animated');
});

test('a component that is not installed fails with the shadcn command', () => {
  const { code, output } = run(['dialog']);
  expect(code).toBe(1);
  expect(output).toContain('pnpm dlx shadcn@latest add dialog');
});

test('outside a shadcn/ui project', () => {
  expect(() =>
    animate(['all'], { cwd: tmpdir(), dryRun: false, log: () => {} }),
  ).toThrow(/components\.json/);
});

test('animate all --exclude leaves those components as they are', () => {
  const tooltip = path.join(path.dirname(uiFile()), 'tooltip.tsx');
  const before = readFileSync(
    path.join(import.meta.dirname, 'fixtures', 'radix-ui', 'tooltip.nova.tsx'),
    'utf8',
  );
  writeFileSync(tooltip, before);
  const lines: string[] = [];
  const code = animate(['all'], {
    cwd: root,
    dryRun: false,
    exclude: ['tooltip', 'sidebar'],
    log: (l) => lines.push(l),
  });
  expect(code).toBe(0);
  expect(readFileSync(tooltip, 'utf8')).toBe(before);
  expect(readFileSync(uiFile(), 'utf8')).toContain(
    'from "@animate-ui/react/primitives/radix-ui"',
  );
  const output = lines.join('\n');
  expect(output).toContain('1 file animated');
  expect(output).toContain("sidebar isn't installed in src/components/ui");
});

test('--exclude takes several components, comma-separated or repeated', () => {
  const tooltip = path.join(path.dirname(uiFile()), 'tooltip.tsx');
  const before = readFileSync(
    path.join(import.meta.dirname, 'fixtures', 'radix-ui', 'tooltip.nova.tsx'),
    'utf8',
  );
  writeFileSync(tooltip, before);
  const cli = path.join(import.meta.dirname, '../src/index.ts');
  const result = spawnSync(
    process.execPath,
    [
      '--import',
      'tsx',
      cli,
      'animate',
      'all',
      '--cwd',
      root,
      '--exclude',
      'tooltip,button',
      '--exclude',
      'accordion',
    ],
    { cwd: path.join(import.meta.dirname, '..'), encoding: 'utf8' },
  );
  expect(result.status).toBe(0);
  expect(result.stdout).toContain('Nothing to animate');
  expect(readFileSync(tooltip, 'utf8')).toBe(before);
  expect(readFileSync(uiFile(), 'utf8')).toBe(ACCORDION);
});

test('follows the tsconfig extends to find the ui folder', () => {
  writeFileSync(
    path.join(root, 'tsconfig.json'),
    JSON.stringify({ extends: './config/tsconfig.base.json' }),
  );
  mkdirSync(path.join(root, 'config'));
  writeFileSync(
    path.join(root, 'config', 'tsconfig.base.json'),
    JSON.stringify({ compilerOptions: { paths: { '@/*': ['../src/*'] } } }),
  );
  expect(run(['accordion']).code).toBe(0);
  expect(readFileSync(uiFile(), 'utf8')).toContain('@animate-ui/react');
});

test('uses the longest matching paths pattern, as TypeScript does', () => {
  writeFileSync(
    path.join(root, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        paths: {
          '@/*': ['./other/*'],
          '@/components/*': ['./src/components/*'],
        },
      },
    }),
  );
  expect(run(['accordion']).code).toBe(0);
  expect(readFileSync(uiFile(), 'utf8')).toContain('@animate-ui/react');
});
