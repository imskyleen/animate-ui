import { expect, test, type Page } from '@playwright/test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/highlight-text', {
    waitUntil: 'networkidle',
  });

const size = (page: Page) =>
  page
    .locator('[data-slot="highlight-text"]')
    .evaluate((el) => getComputedStyle(el).backgroundSize);

test.describe('animate-ui highlight text', () => {
  test('sweeps in, then settles', async ({ page }) => {
    await open(page);
    await page.waitForTimeout(150);
    expect(await size(page)).not.toBe('100% 100%');
    await expect.poll(() => size(page), { timeout: 4000 }).toBe('100% 100%');
  });

  test('replays when remounted', async ({ page }) => {
    await open(page);
    await expect.poll(() => size(page), { timeout: 4000 }).toBe('100% 100%');
    await page.getByRole('button', { name: 'Replay' }).click();
    await page.waitForTimeout(150);
    expect(await size(page)).not.toBe('100% 100%');
  });

  test('reduced motion: fully highlighted at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    expect(await size(page)).toBe('100% 100%');
  });
});
