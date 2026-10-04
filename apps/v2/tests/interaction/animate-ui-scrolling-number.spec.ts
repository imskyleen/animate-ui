import { expect, test, type Page } from '@playwright/test';

const open = async (page: Page) => {
  await page.goto('/tests/demos/animate-ui/scrolling-number', {
    waitUntil: 'networkidle',
  });
  await hydrated(page, '[data-slot="scrolling-number-container"]');
};

/** Resolves once React has hydrated `selector`: its handlers and effects are live. */
async function hydrated(page: Page, selector: string) {
  await page.waitForFunction((sel) => {
    const el = document.querySelector(sel);
    return (
      !!el && Object.keys(el).some((key) => key.startsWith('__reactProps'))
    );
  }, selector);
  // Effects (Motion's gesture listeners, timers) run after the commit.
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

const strip = (page: Page) => page.locator('[data-slot="scrolling-number"]');
const transform = (page: Page) =>
  strip(page).evaluate((el) => getComputedStyle(el).transform);
/** translateY of the strip, in px. */
const offset = (page: Page) =>
  strip(page).evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).f);

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

  test('waits a second, spins to its target and settles there', async ({
    page,
  }) => {
    await open(page);
    await page.getByRole('button', { name: 'Replay' }).click();
    // The demo's 1s delay: the strip waits on 0 (two items above it).
    await page.waitForTimeout(500);
    expect(await offset(page)).toBe(-80);
    // Then a spring (stiffness 90, damping 30), no overshoot. 13 items of
    // 40px, 5 shown: the strip ends 320px down, 1000 centered.
    await expect.poll(() => offset(page), { timeout: 3000 }).toBeGreaterThan(0);
    await expect
      .poll(() => transform(page), { timeout: 8000 })
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
