import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { expect, test } from 'vitest';

const CLI = path.join(import.meta.dirname, '../src/index.ts');
const DOCS = readFileSync(
  path.join(import.meta.dirname, '../../../apps/v2/content/docs/cli.mdx'),
  'utf8',
);

for (const command of ['animate', 'migrate'])
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
