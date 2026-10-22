import { expect, test, type Page } from '../test';

import { FRAMEWORKS, ready } from './animate-ui-frameworks';

for (const framework of FRAMEWORKS) {
  const open = async (page: Page) => {
    await page.goto(framework.demo('highlight-text'), {
      waitUntil: 'networkidle',
    });
    await ready(page, '[data-slot="highlight-text"]');
  };

  const size = (page: Page) =>
    page
      .locator('[data-slot="highlight-text"]')
      .evaluate((el) => parseFloat(getComputedStyle(el).backgroundSize));

  test.describe(`${framework.name} highlight text`, () => {
    test('sweeps in slowly, speeds up, then settles', async ({ page }) => {
      await open(page);
      await page.getByRole('button', { name: 'Replay' }).click();
      await page.waitForTimeout(300);
      const early = await size(page);
      expect(early).toBeLessThan(15);
      await expect
        .poll(() => size(page), { timeout: 4000 })
        .toBeGreaterThan(30);
      await expect.poll(() => size(page), { timeout: 4000 }).toBe(100);
    });

    test('replays when remounted', async ({ page }) => {
      await open(page);
      await expect.poll(() => size(page), { timeout: 4000 }).toBe(100);
      await page.getByRole('button', { name: 'Replay' }).click();
      await page.waitForTimeout(150);
      expect(await size(page)).toBeLessThan(100);
    });

    test('reduced motion: fully highlighted at once', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page);
      expect(await size(page)).toBe(100);
    });
  });
}
