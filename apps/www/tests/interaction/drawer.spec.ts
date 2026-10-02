import { expect, test, type Page } from '@playwright/test';

const POPUP = '[data-slot="drawer-popup"]';

// Vertical offset as a share of the popup's height, and opacity.
const state = (page: Page) =>
  page.locator(POPUP).evaluate((el) => {
    const m = new DOMMatrix(getComputedStyle(el).transform);
    return {
      offset: m.m42 / (el as HTMLElement).offsetHeight,
      opacity: Number(getComputedStyle(el).opacity),
    };
  });

test.describe('base drawer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/smoke/demo-components-base-drawer', {
      waitUntil: 'networkidle',
    });
  });

  test('slides up from the bottom edge and settles', async ({ page }) => {
    await page.getByRole('button', { name: 'Open Drawer' }).click();
    await page.locator(POPUP).waitFor();
    await page.waitForTimeout(60);
    const early = await state(page);
    expect(early.offset).toBeGreaterThan(0.05);

    await page.waitForTimeout(600);
    expect(Math.abs((await state(page)).offset)).toBeLessThan(0.01);
  });

  test('closes faster than it opens', async ({ page }) => {
    await page.getByRole('button', { name: 'Open Drawer' }).click();
    await page.waitForTimeout(700);
    await page.keyboard.press('Escape');
    await expect(page.locator(POPUP)).toHaveCount(0, { timeout: 450 });
  });

  test('a quick swipe down dismisses it', async ({ page }) => {
    await page.getByRole('button', { name: 'Open Drawer' }).click();
    await page.waitForTimeout(700);
    const box = (await page.locator(POPUP).boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + 12;
    await page.mouse.move(x, y);
    await page.mouse.down();
    // A real flick: small moves one frame apart.
    for (let i = 1; i <= 8; i++) {
      await page.mouse.move(x, y + i * 25);
      await page.waitForTimeout(16);
    }
    await page.mouse.up();
    await expect(page.locator(POPUP)).toHaveCount(0, { timeout: 800 });
  });

  test('reduced motion: fades in place', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: 'Open Drawer' }).click();
    await page.locator(POPUP).waitFor();
    await page.waitForTimeout(60);
    const early = await state(page);
    expect(Math.abs(early.offset)).toBeLessThan(0.01);
  });
});
