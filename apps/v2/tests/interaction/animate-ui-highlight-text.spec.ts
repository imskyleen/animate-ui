import { expect, test, type Page } from '@playwright/test';

const open = async (page: Page) => {
  await page.goto('/tests/demos/animate-ui/highlight-text', {
    waitUntil: 'networkidle',
  });
  await hydrated(page, '[data-slot="highlight-text"]');
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

/** Width of the highlight, in percent. */
const size = (page: Page) =>
  page
    .locator('[data-slot="highlight-text"]')
    .evaluate((el) => parseFloat(getComputedStyle(el).backgroundSize));

test.describe('animate-ui highlight text', () => {
  test('sweeps in slowly, speeds up, then settles', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Replay' }).click();
    // A 2s ease-in-out: barely started after 300ms.
    await page.waitForTimeout(300);
    const early = await size(page);
    expect(early).toBeLessThan(15);
    await expect.poll(() => size(page), { timeout: 4000 }).toBeGreaterThan(30);
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
