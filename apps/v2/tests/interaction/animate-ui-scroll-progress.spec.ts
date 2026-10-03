import { expect, test, type Page } from '@playwright/test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/scroll-progress', {
    waitUntil: 'networkidle',
  });

const progress = (page: Page) =>
  page.locator('[data-slot="scroll-progress"]').evaluate((el) => {
    const m = getComputedStyle(el).transform.match(/matrix\(([^,]+)/);
    return m ? Number(m[1]) : 1;
  });

const scrollTo = (page: Page, ratio: number) =>
  page.locator('[data-slot="scroll-progress-container"]').evaluate((el, r) => {
    el.scrollTop = (el.scrollHeight - el.clientHeight) * r;
  }, ratio);

test.describe('animate-ui scroll progress', () => {
  test('starts empty, grows from the left', async ({ page }) => {
    await open(page);
    expect(await progress(page)).toBe(0);
    await expect(page.locator('[data-slot="scroll-progress"]')).toHaveCSS(
      'transform-origin',
      /^0px /,
    );
  });

  test('follows the scroll position smoothly', async ({ page }) => {
    await open(page);
    await scrollTo(page, 0.5);
    await page.waitForTimeout(30);
    const mid = await progress(page);
    expect(mid).toBeLessThan(0.49);
    await expect
      .poll(async () => Math.abs((await progress(page)) - 0.5))
      .toBeLessThan(0.02);
    await scrollTo(page, 1);
    await expect.poll(() => progress(page)).toBeGreaterThan(0.99);
  });

  test('reduced motion: tracks the scroll without easing', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await scrollTo(page, 0.5);
    await page.waitForTimeout(80);
    expect(Math.abs((await progress(page)) - 0.5)).toBeLessThan(0.02);
  });
});
