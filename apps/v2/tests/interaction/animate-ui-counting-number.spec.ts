import { expect, test, type Page } from '@playwright/test';

const open = async (page: Page) => {
  await page.goto('/tests/demos/animate-ui/counting-number', {
    waitUntil: 'networkidle',
  });
  await hydrated(page, '[data-slot="counting-number"]');
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

const root = (page: Page) => page.locator('[data-slot="counting-number"]');
const ticking = (page: Page) => root(page).locator('[aria-hidden="true"]');
const srText = (page: Page) => root(page).locator('.sr-only');

test.describe('animate-ui counting number', () => {
  test('counts up to the target; screen readers get the target only', async ({
    page,
  }) => {
    await open(page);
    await expect(srText(page)).toHaveText('2025');
    await page.getByRole('button', { name: 'Replay' }).click();
    await page.waitForTimeout(300);
    const early = Number(await ticking(page).textContent());
    expect(early).toBeGreaterThan(0);
    expect(early).toBeLessThan(2025);
    await expect(ticking(page)).toHaveText('2025', { timeout: 10_000 });
    // The copy is visually hidden without relying on a CSS framework.
    const box = await srText(page).boundingBox();
    expect(box?.width).toBeLessThanOrEqual(1);
  });

  test('the spring slows down on the last units', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Replay' }).click();
    // Spring stiffness 90, damping 50 (overdamped): most of the range in the
    // first second, then a long tail (2025 lands after about 4.5s).
    await page.waitForTimeout(1000);
    expect(Number(await ticking(page).textContent())).toBeGreaterThan(500);
    await page.waitForTimeout(2000);
    expect(Number(await ticking(page).textContent())).toBeLessThan(2025);
    await expect(ticking(page)).toHaveText('2025', { timeout: 10_000 });
  });

  test('replays from the start when remounted', async ({ page }) => {
    await open(page);
    await expect(ticking(page)).toHaveText('2025', { timeout: 10_000 });
    await page.getByRole('button', { name: 'Replay' }).click();
    await page.waitForTimeout(200);
    expect(Number(await ticking(page).textContent())).toBeLessThan(2025);
    await expect(ticking(page)).toHaveText('2025', { timeout: 10_000 });
  });

  test('reduced motion: shows the target at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await expect(ticking(page)).toHaveText('2025', { timeout: 300 });
  });
});
