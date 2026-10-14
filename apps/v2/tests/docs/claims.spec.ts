import { readFileSync } from 'node:fs';
import path from 'node:path';

import { expect, test } from '@playwright/test';

const page = (name: string) =>
  readFileSync(path.join(process.cwd(), 'content', 'docs', name), 'utf8');

test('no page claims fixed 600ms entrances and 400ms exits', () => {
  for (const name of ['index.mdx', 'accessibility.mdx', 'changelog.mdx'])
    expect(page(name), name).not.toMatch(/600ms/);
});
