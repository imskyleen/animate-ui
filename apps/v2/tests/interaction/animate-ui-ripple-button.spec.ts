import { expect, test, type Page } from '@playwright/test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/ripple-button', {
    waitUntil: 'networkidle',
  });

const button = (page: Page) => page.locator('[data-slot="ripple-button"]');
const ripples = (page: Page) => button(page).locator('> span');

const scaleOf = (page: Page) =>
  ripples(page)
    .first()
    .evaluate((el) => {
      const match = getComputedStyle(el).transform.match(/matrix\(([^,]+)/);
      return match ? Number(match[1]) : 1;
    });

test.describe('animate-ui ripple button', () => {
  test('a click sends a ripple from the pointer, then clears it', async ({
    page,
  }) => {
    await open(page);
    await expect(ripples(page)).toHaveCount(0);
    const box = (await button(page).boundingBox())!;
    await page.mouse.click(box.x + 20, box.y + box.height / 2);
    await expect(ripples(page)).toHaveCount(1);
    await page.waitForTimeout(100);
    expect(await scaleOf(page)).toBeGreaterThan(1);
    await expect(ripples(page)).toHaveCount(0, { timeout: 2000 });
  });

  test('rapid clicks each get their own ripple', async ({ page }) => {
    await open(page);
    await button(page).click();
    await button(page).click();
    await expect(ripples(page)).toHaveCount(2);
    await expect(ripples(page)).toHaveCount(0, { timeout: 2000 });
  });

  test('reduced motion: the ripple fades in place without growing', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const box = (await button(page).boundingBox())!;
    await page.mouse.click(box.x + 20, box.y + box.height / 2);
    await expect(ripples(page)).toHaveCount(1);
    // Centered on the pointer (20px from the left edge, 10px radius; mouse
    // events land on whole pixels): the button doesn't scale here.
    const left = await ripples(page)
      .first()
      .evaluate((el) => parseFloat((el as HTMLElement).style.left));
    expect(Math.abs(left - 10)).toBeLessThan(1);
    expect(await scaleOf(page)).toBe(10);
    await page.waitForTimeout(100);
    expect(await scaleOf(page)).toBe(10);
  });
});
