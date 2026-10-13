import { expect, test, type Page } from '@playwright/test';

const open = async (page: Page) => {
  await page.goto('/tests/demos/animate-ui/gradient-text', {
    waitUntil: 'networkidle',
  });
  await hydrated(page, '[data-slot="gradient-text"]');
};

async function hydrated(page: Page, selector: string) {
  await page.waitForFunction((sel) => {
    const el = document.querySelector(sel);
    return (
      !!el && Object.keys(el).some((key) => key.startsWith('__reactProps'))
    );
  }, selector);
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

const position = (page: Page) =>
  page
    .locator('[data-slot="gradient-text"] span')
    .first()
    .evaluate((el) => getComputedStyle(el).backgroundPosition);

const hideTab = (page: Page) =>
  page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });

test.describe('animate-ui gradient text', () => {
  test('the text is rendered once for screen readers', async ({ page }) => {
    await open(page);
    await expect(page.locator('[data-slot="gradient-text"]')).toHaveText(
      'Gradient Text',
    );
  });

  test('the sweep moves while visible', async ({ page }) => {
    await open(page);
    const a = await position(page);
    await page.waitForTimeout(600);
    expect(await position(page)).not.toBe(a);
  });

  test('the sweep pauses while the tab is hidden', async ({ page }) => {
    await open(page);
    await hideTab(page);
    await page.waitForTimeout(100);
    const a = await position(page);
    await page.waitForTimeout(600);
    expect(await position(page)).toBe(a);
  });

  test('reduced motion: the sweep stays still', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const a = await position(page);
    await page.waitForTimeout(600);
    expect(await position(page)).toBe(a);
  });
});
