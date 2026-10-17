import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { expect, test } from 'vitest';

const CLI = path.join(import.meta.dirname, '../src/index.ts');
const DOCS = readFileSync(
  path.join(import.meta.dirname, '../../../apps/v2/content/docs/cli.mdx'),
  'utf8',
);

for (const command of ['animate', 'migrate', 'audit'])
  test(`${command} --help prints the usage the docs show`, () => {
    const usage = DOCS.match(
      new RegExp(
        `\`\`\`txt\\n(Usage: animate-ui ${command} [\\s\\S]*?)\\n\`\`\``,
      ),
    )![1];
    const result = spawnSync(
      process.execPath,
      ['--import', 'tsx', CLI, command, '--help'],
      { cwd: path.join(import.meta.dirname, '..'), encoding: 'utf8' },
    );
    expect(result.stdout.trimEnd()).toBe(usage);
  });

const runCli = (
  args: string[],
  options: { cwd?: string; input?: string } = {},
) =>
  spawnSync(process.execPath, ['--import', 'tsx', CLI, ...args], {
    cwd: options.cwd ?? path.join(import.meta.dirname, '..'),
    encoding: 'utf8',
  });

test('a components.json that is not JSON is named, instead of blaming the ui folder', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'animate-ui-bad-config-'));
  writeFileSync(path.join(dir, 'components.json'), '{bad');
  writeFileSync(path.join(dir, 'package.json'), '{}');
  for (const command of ['animate', 'migrate']) {
    const result = runCli([command, 'all', '--cwd', dir]);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('components.json in');
    expect(result.stderr).toContain("isn't valid JSON");
  }
});

test('audit names a project folder that does not exist', () => {
  const missing = path.join(tmpdir(), 'animate-ui-nope-folder');
  const result = runCli(['audit', '--cwd', missing]);
  expect(result.status).toBe(1);
  expect(result.stderr).toContain(`No folder at ${missing}.`);
});

test('piping the output into a command that stops early exits cleanly', () => {
  const result = spawnSync(
    'sh',
    [
      '-c',
      `"${process.execPath}" --import tsx "${CLI}" audit --cwd "${path.join(import.meta.dirname, 'migrate-fixtures/v1-project')}" | head -1`,
    ],
    { cwd: path.join(import.meta.dirname, '..'), encoding: 'utf8' },
  );
  expect(result.stderr).not.toContain('EPIPE');
});

test('a components.json saved with a byte order mark still loads', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'animate-ui-bom-config-'));
  writeFileSync(
    path.join(dir, 'components.json'),
    '﻿{"aliases":{"components":"@/components","ui":"@/components/ui"}}',
  );
  writeFileSync(path.join(dir, 'package.json'), '{}');
  const result = runCli(['animate', 'all', '--cwd', dir, '--dry-run']);
  expect(result.stderr).not.toContain("isn't valid JSON");
});
