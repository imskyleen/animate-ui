import { expect, test, type Page } from '../test';

import { FRAMEWORKS, ready } from './animate-ui-frameworks';

for (const framework of FRAMEWORKS) {
  const open = (page: Page) =>
    page.goto(framework.demo('scroll-progress'), {
      waitUntil: 'networkidle',
    });

  const bar = (page: Page) => page.locator('[data-slot="scroll-progress"]');

  const progress = (page: Page) =>
    bar(page).evaluate(
      (el) =>
        el.getBoundingClientRect().width /
        el.parentElement!.getBoundingClientRect().width,
    );

  const scrollTo = (page: Page, ratio: number) =>
    page
      .locator('[data-slot="scroll-progress-container"]')
      .evaluate((el, r) => {
        el.scrollTop = (el.scrollHeight - el.clientHeight) * r;
      }, ratio);

  test.describe(`${framework.name} scroll progress`, () => {
    test('starts empty and grows in width, without a transform', async ({
      page,
    }) => {
      await open(page);
      await expect(bar(page)).toHaveAttribute('data-mode', 'width');
      expect(await progress(page)).toBe(0);
      await scrollTo(page, 0.5);
      await expect.poll(() => progress(page)).toBeGreaterThan(0.2);
      await expect(bar(page)).toHaveCSS('transform', 'none');
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

    test('reduced motion: tracks the scroll without easing', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page);
      await scrollTo(page, 0.5);
      await page.waitForTimeout(80);
      expect(Math.abs((await progress(page)) - 0.5)).toBeLessThan(0.02);
    });
  });
}
