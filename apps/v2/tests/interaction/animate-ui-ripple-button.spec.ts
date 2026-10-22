import { expect, test, type Page } from '../test';

import { sample } from './motion-probe';

import { FRAMEWORKS, ready } from './animate-ui-frameworks';

for (const framework of FRAMEWORKS) {
  const open = async (page: Page) => {
    await page.goto(framework.demo('ripple-button'), {
      waitUntil: 'networkidle',
    });
    await ready(page, '[data-slot="ripple-button"]');
  };

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

  test.describe(`${framework.name} ripple button`, () => {
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
      const left = await ripples(page)
        .first()
        .evaluate((el) => parseFloat((el as HTMLElement).style.left));
      expect(Math.abs(left - 10)).toBeLessThan(1);
      expect(await scaleOf(page)).toBe(10);
      await page.waitForTimeout(100);
      expect(await scaleOf(page)).toBe(10);
    });
  });

  test(`${framework.name} ripple button: the press runs in the browser, off the main thread (rule A9)`, async ({
    page,
  }) => {
    await open(page);
    await page.locator(SELECTOR).first().hover();
    await page.mouse.down();
    await expect
      .poll(() =>
        page.evaluate((sel) => {
          const el = document.querySelector(sel)!;
          return el
            .getAnimations()
            .some((animation) =>
              (animation.effect as KeyframeEffect)
                .getKeyframes()
                .some((frame) => 'transform' in frame),
            );
        }, SELECTOR),
      )
      .toBe(true);
    await page.mouse.up();
  });
}
