import { expect, test, type Page } from '@playwright/test';

import { sample } from './motion-probe';

const open = async (page: Page) => {
  await page.goto('/tests/demos/animate-ui/ripple-button', {
    waitUntil: 'networkidle',
  });
  await hydrated(page, '[data-slot="ripple-button"]');
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

const SELECTOR = '[data-slot="ripple-button"]';
const button = (page: Page) => page.locator(SELECTOR);
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

  test('stays put on hover, shrinks while pressed', async ({ page }) => {
    await open(page);
    await button(page).hover();
    await page.waitForTimeout(300);
    expect((await sample(page, SELECTOR)).scale).toBe(1);
    await page.mouse.down();
    await expect
      .poll(async () => (await sample(page, SELECTOR)).scale)
      .toBeCloseTo(0.97, 3);
    await page.mouse.up();
    await expect
      .poll(async () => (await sample(page, SELECTOR)).scale)
      .toBeCloseTo(1, 3);
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
