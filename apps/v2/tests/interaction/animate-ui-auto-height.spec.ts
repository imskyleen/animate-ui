import { expect, test, type Page } from '@playwright/test';

import { gotoHydrated } from './disclosure-timeline';

const open = (page: Page) =>
  gotoHydrated(page, '/tests/demos/animate-ui/auto-height');

const toggle = (page: Page) =>
  page.getByRole('button', { name: /Show (more|less)/ });

/** The AutoHeight element sits right before the toggle button. */
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

/**
 * Clicks the toggle and records the AutoHeight's height on every frame for
 * `ms`, in the page (it holds up on a busy machine).
 */
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

test.describe('animate-ui auto height', () => {
  test('springs smoothly to the new content height', async ({ page }) => {
    await open(page);
    const start = await height(page);
    // The demo blurs the old content out first (v1's demo), then the height
    // springs to the new content.
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
    // Grown to the long content (after the old content has blurred out).
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
    // No frame in between: it jumps once the new content is in.
    expect(heights.some((h) => h > start + 2 && h < target - 2)).toBe(false);
  });
});
