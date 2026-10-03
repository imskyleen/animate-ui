import { expect, test, type Page } from '@playwright/test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/click', { waitUntil: 'networkidle' });

const area = (page: Page) =>
  page.getByText('Click anywhere in this area').locator('..');

/** The fixed layer Click portals into document.body. */
const layer = (page: Page) =>
  page.locator(
    'body > div[style*="position: fixed"][style*="pointer-events: none"]',
  );

test.describe('animate-ui click', () => {
  test('a click inside the scope plays the effect at the pointer', async ({
    page,
  }) => {
    await open(page);
    const box = (await area(page).boundingBox())!;
    const x = box.x + 60;
    const y = box.y + 40;
    await page.mouse.click(x, y);
    const effect = layer(page).locator('svg').first();
    await expect(effect).toBeVisible();
    const rect = (await effect.boundingBox())!;
    // Centered on the pointer.
    expect(Math.abs(rect.x + rect.width / 2 - x)).toBeLessThan(2);
    expect(Math.abs(rect.y + rect.height / 2 - y)).toBeLessThan(2);
    // Removed once it has played.
    await expect(layer(page).locator('svg')).toHaveCount(0, { timeout: 2000 });
  });

  test('clicks outside the scope are ignored', async ({ page }) => {
    await open(page);
    const box = (await area(page).boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y - 30);
    await page.waitForTimeout(50);
    await expect(layer(page).locator('svg, div')).toHaveCount(0);
  });

  test('every variant plays', async ({ page }) => {
    await open(page);
    const box = (await area(page).boundingBox())!;
    for (const variant of ['ripple', 'crosshair', 'burst', 'particles']) {
      await page.getByRole('radio', { name: variant }).click();
      await page.mouse.click(box.x + box.width / 2, box.y + 30);
      await expect(layer(page).locator(':scope > *').first()).toBeVisible();
    }
  });

  test('the effect layer never blocks clicks', async ({ page }) => {
    await open(page);
    await expect(layer(page)).toHaveCSS('pointer-events', 'none');
  });

  test('reduced motion: no effect at all', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const box = (await area(page).boundingBox())!;
    await page.mouse.click(box.x + 60, box.y + 40);
    await page.waitForTimeout(50);
    await expect(layer(page).locator(':scope > *')).toHaveCount(0);
  });
});
