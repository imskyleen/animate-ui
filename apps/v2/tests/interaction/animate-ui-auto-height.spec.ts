import { expect, test, type Page } from '../test';

import { gotoHydrated } from './disclosure-timeline';

import { FRAMEWORKS, ready } from './animate-ui-frameworks';

for (const framework of FRAMEWORKS) {
  const open = (page: Page) =>
    gotoHydrated(page, framework.demo('auto-height'));

  const toggle = (page: Page) =>
    page.getByRole('button', { name: /Show (more|less)/ });

  const height = (page: Page) =>
    toggle(page).evaluate(
      (button) => button.previousElementSibling!.getBoundingClientRect().height,
    );

  const contentHeight = (page: Page) =>
    toggle(page).evaluate((button) => {
      const box = button.previousElementSibling as HTMLElement;
      const inner = box.firstElementChild!.getBoundingClientRect().height;
      const cs = getComputedStyle(box);
      return (
        inner +
        parseFloat(cs.paddingTop) +
        parseFloat(cs.paddingBottom) +
        parseFloat(cs.borderTopWidth) +
        parseFloat(cs.borderBottomWidth)
      );
    });

  async function recordToggle(page: Page, ms = 1500) {
    return toggle(page).evaluate(async (button, ms) => {
      const box = button.previousElementSibling as HTMLElement;
      const heights: number[] = [];
      (button as HTMLButtonElement).click();
      const start = performance.now();
      while (performance.now() - start < ms) {
        await new Promise((r) => requestAnimationFrame(r));
        heights.push(box.getBoundingClientRect().height);
      }
      return heights;
    }, ms);
  }

  test.describe(`${framework.name} auto height`, () => {
    test('springs smoothly to the new content height', async ({ page }) => {
      await open(page);
      const start = await height(page);
      const heights = await recordToggle(page);
      const target = await contentHeight(page);
      expect(target).toBeGreaterThan(start + 20);
      expect(heights.some((h) => h > start + 2 && h < target - 2)).toBe(true);
      expect(Math.abs(heights.at(-1)! - target)).toBeLessThan(1.5);
    });

    test('shrinks back', async ({ page }) => {
      await open(page);
      const start = await height(page);
      await toggle(page).click();
      await expect.poll(() => height(page)).toBeGreaterThan(start + 20);
      await expect
        .poll(async () =>
          Math.abs((await height(page)) - (await contentHeight(page))),
        )
        .toBeLessThan(1.5);
      await toggle(page).click();
      await expect
        .poll(async () => Math.abs((await height(page)) - start))
        .toBeLessThan(1.5);
    });

    test('reduced motion: the height changes at once', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page);
      const start = await height(page);
      const heights = await recordToggle(page);
      const target = await contentHeight(page);
      expect(Math.abs(heights.at(-1)! - target)).toBeLessThan(1.5);
      expect(heights.some((h) => h > start + 2 && h < target - 2)).toBe(false);
    });
  });
}
