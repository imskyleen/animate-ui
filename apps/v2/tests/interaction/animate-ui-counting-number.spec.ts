import { expect, test, type Page } from '@playwright/test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/counting-number', {
    waitUntil: 'networkidle',
  });

const root = (page: Page) => page.locator('[data-slot="counting-number"]');
const ticking = (page: Page) => root(page).locator('[aria-hidden="true"]');
const srText = (page: Page) => root(page).locator('.sr-only');

test.describe('animate-ui counting number', () => {
  test('counts up to the target; screen readers get the target only', async ({
    page,
  }) => {
    await open(page);
    await expect(srText(page)).toHaveText('2025');
    await page.waitForTimeout(300);
    const early = Number(await ticking(page).textContent());
    expect(early).toBeGreaterThan(0);
    expect(early).toBeLessThan(2025);
    await expect(ticking(page)).toHaveText('2025', { timeout: 5000 });
    // The copy is visually hidden without relying on a CSS framework.
    const box = await srText(page).boundingBox();
    expect(box?.width).toBeLessThanOrEqual(1);
  });

  test('replays from the start when remounted', async ({ page }) => {
    await open(page);
    await expect(ticking(page)).toHaveText('2025', { timeout: 5000 });
    await page.getByRole('button', { name: 'Replay' }).click();
    await page.waitForTimeout(200);
    expect(Number(await ticking(page).textContent())).toBeLessThan(2025);
    await expect(ticking(page)).toHaveText('2025', { timeout: 5000 });
  });

  test('reduced motion: shows the target at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await expect(ticking(page)).toHaveText('2025', { timeout: 300 });
  });
});
