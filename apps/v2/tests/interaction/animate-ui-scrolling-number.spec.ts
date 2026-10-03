import { expect, test, type Page } from '@playwright/test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/scrolling-number', {
    waitUntil: 'networkidle',
  });

const strip = (page: Page) => page.locator('[data-slot="scrolling-number"]');
const transform = (page: Page) =>
  strip(page).evaluate((el) => getComputedStyle(el).transform);

/** The value under the highlight. */
const centered = (page: Page) =>
  page.evaluate(() => {
    const highlight = document
      .querySelector('[data-slot="scrolling-number-highlight"]')!
      .getBoundingClientRect();
    const y = highlight.top + highlight.height / 2;
    const items = document.querySelectorAll(
      '[data-slot="scrolling-number-item"]',
    );
    for (const item of items) {
      const r = item.getBoundingClientRect();
      if (r.top <= y && r.bottom >= y) return item.getAttribute('data-value');
    }
    return null;
  });

test.describe('animate-ui scrolling number', () => {
  test('the strip is hidden; screen readers get the number once', async ({
    page,
  }) => {
    await open(page);
    await expect(strip(page)).toHaveAttribute('aria-hidden', 'true');
    await expect(
      page.locator('[data-slot="scrolling-number-container"] .sr-only'),
    ).toHaveText('1,000');
  });

  test('spins to its target and settles there', async ({ page }) => {
    await open(page);
    const start = await transform(page);
    await page.waitForTimeout(600);
    expect(await transform(page)).not.toBe(start);
    // 13 items of 40px, 5 shown: the strip ends 320px down, 1000 centered.
    await expect
      .poll(() => transform(page), { timeout: 5000 })
      .toBe('matrix(1, 0, 0, 1, 0, 320)');
    expect(await centered(page)).toBe('1000');
    await page.waitForTimeout(300);
    expect(await transform(page)).toBe('matrix(1, 0, 0, 1, 0, 320)');
  });

  test('reduced motion: lands on the target at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    expect(await centered(page)).toBe('1000');
    const a = await transform(page);
    await page.waitForTimeout(500);
    expect(await transform(page)).toBe(a);
  });
});
