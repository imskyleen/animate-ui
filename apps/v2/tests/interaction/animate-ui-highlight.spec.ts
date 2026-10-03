import { expect, test, type Page } from '@playwright/test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/highlight', { waitUntil: 'networkidle' });

const HIGHLIGHT = '[data-slot="motion-highlight"]';

/** The highlight of an item (the previous one fades out meanwhile). */
const highlightX = (page: Page, value = 'overview') =>
  page
    .locator(`${HIGHLIGHT}[data-value="${value}"]`)
    .evaluate((el) => el.getBoundingClientRect().x);

test.describe('animate-ui highlight', () => {
  test('starts on the default value', async ({ page }) => {
    await open(page);
    await expect(page.locator(HIGHLIGHT)).toHaveCount(1);
    await expect(
      page.getByRole('button', { name: 'Overview' }),
    ).toHaveAttribute('data-active', 'true');
  });

  test('clicking an item glides the highlight to it', async ({ page }) => {
    await open(page);
    const target = page.getByRole('button', { name: 'Settings' });
    const start = await highlightX(page);
    const end = (await target.boundingBox())!.x;
    await target.click();
    await page.waitForTimeout(60);
    const mid = await highlightX(page, 'settings');
    expect(mid).toBeGreaterThan(start + 1);
    expect(mid).toBeLessThan(end - 1);
    await expect
      .poll(async () => Math.abs((await highlightX(page, 'settings')) - end))
      .toBeLessThan(1.5);
    await expect(target).toHaveAttribute('data-active', 'true');
    // The previous highlight is gone once it has faded out.
    await expect(page.locator(HIGHLIGHT)).toHaveCount(1);
  });

  test('reduced motion: the highlight jumps', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const target = page.getByRole('button', { name: 'Settings' });
    const end = (await target.boundingBox())!.x;
    await target.click();
    await page.waitForTimeout(60);
    expect(Math.abs((await highlightX(page, 'settings')) - end)).toBeLessThan(
      1.5,
    );
  });
});
