import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

const PRIMITIVES = join(__dirname, '../../../../packages/cli/src/primitives');

/** `alert-dialog` → `Alert Dialog`. */
const title = (name: string) =>
  name.replace(
    /(^|-)([a-z])/g,
    (_, dash, c) => (dash ? ' ' : '') + c.toUpperCase(),
  );

test('the sidebar lists the CLI right above Skills', async ({ page }) => {
  await page.goto('/docs/cli', { waitUntil: 'networkidle' });
  const links = await page
    .locator('aside a[href^="/docs"]')
    .evaluateAll((anchors) => anchors.map((a) => a.getAttribute('href')));
  expect(links[links.indexOf('/docs/skills') - 1]).toBe('/docs/cli');
});

test('the CLI page documents both commands and every option', async ({
  page,
}) => {
  await page.goto('/docs/cli', { waitUntil: 'networkidle' });
  for (const heading of ['animate', 'migrate', 'Options'])
    await expect(
      page.getByRole('heading', { level: 2, name: new RegExp(`^${heading}`) }),
    ).toBeVisible();
  const help = readFileSync(join(PRIMITIVES, '../index.ts'), 'utf8').match(
    /^\s+(--?[a-z-]+)/gm,
  )!;
  const options = page
    .locator('table')
    .filter({ hasText: 'Description' })
    .last();
  for (const option of help) await expect(options).toContainText(option.trim());
});

test('the supported primitives table lists every primitive the CLI animates', async ({
  page,
}) => {
  await page.goto('/docs/cli', { waitUntil: 'networkidle' });
  const rows = page.locator(
    '#supported-primitives ~ div table tr, #supported-primitives ~ table tr',
  );
  // The primitives' cell of a library's row.
  const row = (library: string) =>
    rows.filter({ hasText: library }).first().locator('td').nth(1);
  for (const [folder, library] of [
    ['radix-ui', 'Radix UI'],
    ['base-ui', 'Base UI'],
  ]) {
    const cell = row(library);
    for (const file of readdirSync(join(PRIMITIVES, folder)))
      await expect(cell).toContainText(title(file.replace(/\.ts$/, '')));
  }
  const aria = row('React Aria');
  for (const file of readdirSync(join(PRIMITIVES, 'react-aria'))) {
    const exports = readFileSync(join(PRIMITIVES, 'react-aria', file), 'utf8')
      .match(/exports: \[([^\]]*)\]/)![1]!
      .match(/'([^']+)'/g)!
      .map((name) => name.slice(1, -1));
    // Named by its file (Disclosure, ListBox) or its main export
    // (ToggleButtonGroup).
    const names = [
      title(file.replace(/\.ts$/, '')).replace(/ /g, ''),
      exports[0]!,
    ];
    await expect(aria).toContainText(new RegExp(`\\b(${names.join('|')})\\b`));
  }
  // Animate UI's own drop-ins (Input OTP, Questionnaire), under Others.
  const others = row('Others');
  for (const file of readdirSync(join(PRIMITIVES, 'animate-ui')))
    await expect(others).toContainText(
      new RegExp(`\\b${title(file.replace(/\.ts$/, ''))}\\b`, 'i'),
    );
});
