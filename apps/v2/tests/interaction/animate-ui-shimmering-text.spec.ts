import { expect, test, type Page } from '@playwright/test';

const open = async (page: Page) => {
  await page.goto('/tests/demos/animate-ui/shimmering-text', {
    waitUntil: 'networkidle',
  });
  await hydrated(page, '[data-slot="shimmering-text"]');
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

const root = (page: Page) => page.locator('[data-slot="shimmering-text"]');

/** Colors of every character, sampled a few times. */
async function colorsOverTime(page: Page) {
  const seen = new Set<string>();
  for (let i = 0; i < 6; i++) {
    const colors = await root(page)
      .locator('[aria-hidden] > span')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).color));
    colors.forEach((c) => seen.add(c));
    await page.waitForTimeout(150);
  }
  return seen;
}

const hideTab = (page: Page) =>
  page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });

test.describe('animate-ui shimmering text', () => {
  test('screen readers read the text once, not letter by letter', async ({
    page,
  }) => {
    await open(page);
    await expect(root(page).locator('.sr-only')).toHaveText('Shimmering Text');
    await expect(root(page).locator('[aria-hidden] > span')).toHaveCount(15);
  });

  test('the shimmer runs across the letters', async ({ page }) => {
    await open(page);
    expect((await colorsOverTime(page)).size).toBeGreaterThan(1);
  });

  test('the shimmer stops while the tab is hidden', async ({ page }) => {
    await open(page);
    await hideTab(page);
    await page.waitForTimeout(100);
    expect((await colorsOverTime(page)).size).toBe(1);
  });

  test('reduced motion: the text holds still', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    expect((await colorsOverTime(page)).size).toBe(1);
  });
});
