import { expect, test } from '../test';

const KEY = 'animate-ui:changelog-seen';

test.use({ viewport: { width: 1280, height: 900 } });

const changelogLink = (page: import('../test').Page) =>
  page.locator('aside a[href="/docs/changelog"]').first();

test('the changelog link says new until the visitor opens it', async ({
  page,
}) => {
  await page.goto('/docs', { waitUntil: 'networkidle' });
  const badge = changelogLink(page).locator('[data-slot="badge"]');
  await expect(badge).toHaveText('new');
  await expect(badge).toBeVisible();
  await page.waitForFunction(() =>
    Object.keys(
      document.querySelector('aside a[href="/docs/changelog"]') ?? {},
    ).some((k) => k.startsWith('__reactProps')),
  );
  await changelogLink(page).click();
  await page.waitForURL('**/docs/changelog');
  await expect(badge).toBeHidden();
  await page.goto('/docs/cli', { waitUntil: 'networkidle' });
  await expect(changelogLink(page).locator('[data-slot="badge"]')).toBeHidden();
});

test('a new version brings the badge back', async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, '0.0.1'), KEY);
  await page.goto('/docs/cli', { waitUntil: 'networkidle' });
  await expect(
    changelogLink(page).locator('[data-slot="badge"]'),
  ).toBeVisible();
});

test('the badge is hidden before the page hydrates', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: true });
  const page = await context.newPage();
  await page.goto('/docs/changelog', { waitUntil: 'networkidle' });
  const version = await page.evaluate((key) => localStorage.getItem(key), KEY);
  expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  // The inline script hides it while the HTML is parsed, before React runs.
  await page.route('**/*.js', (route) => route.abort());
  await page.goto('/docs/cli');
  await expect(changelogLink(page).locator('[data-slot="badge"]')).toBeHidden();
  await context.close();
});

test('versions sit on a dated timeline, the markdown export keeps the dates', async ({
  page,
  request,
}) => {
  await page.goto('/docs/changelog', { waitUntil: 'networkidle' });
  const items = page.locator('[data-slot="changelog-item"]');
  expect(await items.count()).toBeGreaterThan(2);
  await expect(items.first().locator('time')).toHaveAttribute(
    'datetime',
    /^\d{4}-\d{2}-\d{2}$/,
  );
  await expect(
    page.locator('[data-slot="changelog-item"][data-major]'),
  ).toHaveCount(1);
  const markdown = await (await request.get('/docs/changelog.md')).text();
  expect(markdown).not.toMatch(/<\/?Changelog/);
  expect(markdown).toMatch(/^## 2\.0\.0.*\n\n_2026-10-18_$/m);
});
