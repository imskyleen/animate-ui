import { expect, test, type Page } from '@playwright/test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/auto-height', {
    waitUntil: 'networkidle',
  });

/** The AutoHeight element sits right before the toggle button. */
const height = (page: Page) =>
  page
    .getByRole('button', { name: /Show (more|less)/ })
    .evaluate(
      (button) => button.previousElementSibling!.getBoundingClientRect().height,
    );

const contentHeight = (page: Page) =>
  page.getByRole('button', { name: /Show (more|less)/ }).evaluate((button) => {
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

test.describe('animate-ui auto height', () => {
  test('grows smoothly to the new content height', async ({ page }) => {
    await open(page);
    const start = await height(page);
    await page.getByRole('button', { name: 'Show more' }).click();
    await page.waitForTimeout(80);
    const mid = await height(page);
    const target = await contentHeight(page);
    expect(target).toBeGreaterThan(start + 20);
    expect(mid).toBeGreaterThan(start);
    expect(mid).toBeLessThan(target - 2);
    await expect
      .poll(async () => Math.abs((await height(page)) - target))
      .toBeLessThan(1.5);
  });

  test('shrinks back', async ({ page }) => {
    await open(page);
    const start = await height(page);
    await page.getByRole('button', { name: 'Show more' }).click();
    await page.getByRole('button', { name: 'Show less' }).click();
    await expect
      .poll(async () => Math.abs((await height(page)) - start))
      .toBeLessThan(1.5);
  });

  test('reduced motion: the height changes at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await page.getByRole('button', { name: 'Show more' }).click();
    await page.waitForTimeout(80);
    expect(
      Math.abs((await height(page)) - (await contentHeight(page))),
    ).toBeLessThan(1.5);
  });
});
