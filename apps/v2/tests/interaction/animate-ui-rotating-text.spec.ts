import { expect, test, type Page } from '@playwright/test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/rotating-text', {
    waitUntil: 'networkidle',
  });

const word = (page: Page) => page.locator('[data-slot="rotating-text"]');

const hideTab = (page: Page) =>
  page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });

test.describe('animate-ui rotating text', () => {
  test('screen readers read every word once', async ({ page }) => {
    await open(page);
    await expect(
      page.locator('[data-slot="rotating-text-container"] .sr-only'),
    ).toHaveText('Rotating, Text, Demo');
    await expect(word(page)).toHaveAttribute('aria-hidden', 'true');
  });

  test('holds the first word, then rotates to the next', async ({ page }) => {
    await open(page);
    await page.waitForTimeout(500);
    await expect(word(page)).toHaveText('Rotating');
    await expect(word(page)).toHaveText('Text', { timeout: 3000 });
  });

  test('pauses while the tab is hidden', async ({ page }) => {
    await open(page);
    await hideTab(page);
    await page.waitForTimeout(3000);
    await expect(word(page)).toHaveText('Rotating');
  });

  test('reduced motion: the words crossfade in place', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await expect(word(page)).toHaveText('Text', { timeout: 3000 });
    const transforms = await word(page).evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).transform),
    );
    for (const t of transforms)
      expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(t);
  });
});
