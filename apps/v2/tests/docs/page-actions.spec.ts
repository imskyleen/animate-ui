import { expect, test } from '@playwright/test';

test('the page menu opens the page elsewhere', async ({ page }) => {
  await page.goto('/docs/primitives/radix-ui/accordion');
  await page.getByRole('button', { name: 'More page actions' }).click();
  const item = (name: string) => page.getByRole('menuitem', { name });
  await expect(item('Open in Claude')).toBeVisible();
  // The demo as a registry item, for v0.
  await expect(item('Open in v0')).toHaveAttribute(
    'href',
    /v0\.dev\/chat\/api\/open\?url=.*demo-radix-ui-accordion\.json/,
  );
  await expect(item('Edit on GitHub')).toHaveAttribute(
    'href',
    /\/apps\/v2\/content\/docs\/primitives\/radix-ui\/accordion\.mdx$/,
  );
});

test('pages without a demo have no Open in v0', async ({ page }) => {
  await page.goto('/docs/installation');
  await page.getByRole('button', { name: 'More page actions' }).click();
  await expect(
    page.getByRole('menuitem', { name: 'Edit on GitHub' }),
  ).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Open in v0' })).toHaveCount(
    0,
  );
});

test('demo registry items hold the demo and its local files', async ({
  request,
}) => {
  const item = await (await request.get('/r/demo-base-ui-dialog.json')).json();
  expect(item.dependencies).toEqual(
    expect.arrayContaining(['@animate-ui/react', 'motion', '@base-ui/react']),
  );
  const targets = item.files.map((file: { target: string }) => file.target);
  expect(targets).toContain('components/dialog-demo.tsx');
  expect(targets).toContain('components/ui/button.tsx');
});

test('the version menu links v2 and v1 (local servers in development)', async ({
  page,
}) => {
  await page.goto('/docs');
  await page.getByRole('button', { name: /v2\.0/ }).click();
  await expect(page.getByRole('menuitem', { name: /v2\.0/ })).toHaveAttribute(
    'href',
    'http://localhost:3300',
  );
  await expect(page.getByRole('menuitem', { name: 'v1' })).toHaveAttribute(
    'href',
    'http://localhost:3200',
  );
});
