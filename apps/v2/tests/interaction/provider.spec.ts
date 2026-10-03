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
  // The default disclosure takes 600ms, tempo 2 makes it 1200ms.
  await page.waitForTimeout(800);
  expect(await height(page, 'Default')).toBe(200);
  expect(await height(page, 'Slow')).toBeLessThan(200);
  await page.waitForTimeout(600);
  expect(await height(page, 'Slow')).toBe(200);
});
