import { expect, test, type Page } from '@playwright/test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/morphing-text', {
    waitUntil: 'networkidle',
  });

const root = (page: Page) => page.locator('[data-slot="morphing-text"]');
const srText = (page: Page) => root(page).locator('.sr-only');

const hideTab = (page: Page) =>
  page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });

test.describe('animate-ui morphing text', () => {
  test('screen readers read the current text whole', async ({ page }) => {
    await open(page);
    await expect(srText(page)).toHaveText('Morphing Text');
    await expect(root(page).locator('> [aria-hidden="true"]')).toHaveCount(1);
  });

  test('emoji stay whole', async ({ page }) => {
    await open(page);
    await expect(srText(page)).toHaveText('Animate your text 🚀', {
      timeout: 5000,
    });
    const pieces = await root(page)
      .locator('[aria-hidden="true"] > span')
      .allTextContents();
    expect(pieces).toContain('🚀');
  });

  test('holds each text, then morphs to the next', async ({ page }) => {
    await open(page);
    await page.waitForTimeout(1500);
    await expect(srText(page)).toHaveText('Morphing Text');
    await expect(srText(page)).toHaveText('Animate your text 🚀', {
      timeout: 3000,
    });
  });

  test('pauses while the tab is hidden', async ({ page }) => {
    await open(page);
    await hideTab(page);
    await page.waitForTimeout(3500);
    await expect(srText(page)).toHaveText('Morphing Text');
  });

  test('reduced motion: keeps cycling as a crossfade', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await expect(srText(page)).toHaveText('Animate your text 🚀', {
      timeout: 5000,
    });
    await page.waitForTimeout(800);
    const styles = await root(page)
      .locator('[aria-hidden="true"] > span')
      .evaluateAll((els) =>
        els.map((el) => {
          const cs = getComputedStyle(el);
          return { transform: cs.transform, filter: cs.filter };
        }),
      );
    for (const s of styles) {
      expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(s.transform);
      expect(['none', 'blur(0px)']).toContain(s.filter);
    }
  });
});
