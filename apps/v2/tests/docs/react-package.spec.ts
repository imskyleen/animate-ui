import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

const PKG = JSON.parse(
  readFileSync(
    join(__dirname, '../../../../packages/react/package.json'),
    'utf8',
  ),
) as { peerDependencies: Record<string, string> };

test('the sidebar lists @animate-ui/react right above the CLI', async ({
  page,
}) => {
  await page.goto('/docs/react', { waitUntil: 'networkidle' });
  const links = await page
    .locator('aside a[href^="/docs"]')
    .evaluateAll((anchors) => anchors.map((a) => a.getAttribute('href')));
  expect(links[links.indexOf('/docs/cli') - 1]).toBe('/docs/react');
});

test('the package page lists every peer dependency and entry point', async ({
  page,
}) => {
  await page.goto('/docs/react', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '@animate-ui/react',
  );
  const peers = page
    .locator('#installation ~ div table, #installation ~ table')
    .first();
  for (const peer of Object.keys(PKG.peerDependencies))
    await expect(peers).toContainText(peer);
  const entries = page
    .locator('#entry-points ~ div table, #entry-points ~ table')
    .first();
  for (const entry of [
    'primitives/radix-ui',
    'primitives/base-ui',
    'primitives/react-aria',
    'icons',
    'provider',
    'utils/motion',
  ])
    await expect(entries).toContainText(`@animate-ui/react/${entry}`);
});

test("the package page's links lead to existing pages", async ({
  page,
  request,
}) => {
  await page.goto('/docs/react', { waitUntil: 'networkidle' });
  const hrefs = await page
    .locator('article a[href^="/docs"]')
    .evaluateAll((anchors) => anchors.map((a) => a.getAttribute('href')!));
  expect(hrefs.length).toBeGreaterThan(5);
  for (const href of new Set(hrefs))
    expect((await request.get(href)).status(), href).toBe(200);
});
