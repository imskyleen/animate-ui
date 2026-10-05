import { expect, test, type Page } from '@playwright/test';

const height = (page: Page, label: string) =>
  page
    .locator('[role="region"]', { hasText: `${label} content` })
    .evaluate((el) => el.getBoundingClientRect().height);

test('AnimateUIProvider tempo slows animations down; default without it', async ({
  page,
}) => {
  await page.goto('/tests/fixtures/provider-tempo', {
    waitUntil: 'networkidle',
  });
  await page.getByRole('button', { name: 'Default' }).click();
  await page.getByRole('button', { name: 'Slow' }).click();
  // The default disclosure takes 400ms, tempo 2 makes it 800ms: when
  // the default one is fully open, the slow one is still opening.
  await expect.poll(() => height(page, 'Default')).toBe(200);
  expect(await height(page, 'Slow')).toBeLessThan(200);
  await expect.poll(() => height(page, 'Slow')).toBe(200);
});
