import { expect, test, type Page } from '@playwright/test';

const TOAST = '[data-slot="toast"]';

const read = (page: Page, i: number) =>
  page
    .locator(TOAST)
    .nth(i)
    .evaluate((el) => {
      const m = new DOMMatrix(getComputedStyle(el).transform);
      return {
        y: m.m42 / (el as HTMLElement).offsetHeight,
        scale: Math.hypot(m.a, m.b),
        opacity: Number(getComputedStyle(el).opacity),
      };
    });

test.describe('base toast', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/smoke/demo-components-base-toast', {
      waitUntil: 'networkidle',
    });
  });

  test('enters from its edge and settles', async ({ page }) => {
    await page.getByRole('button', { name: 'Show toast' }).click();
    await page.locator(TOAST).first().waitFor();
    await page.waitForTimeout(40);
    const early = await read(page, 0);
    expect(early.y).toBeGreaterThan(0.1);
    expect(early.opacity).toBeLessThan(1);

    await page.waitForTimeout(700);
    const settled = await read(page, 0);
    expect(Math.abs(settled.y)).toBeLessThan(0.02);
    expect(settled.opacity).toBe(1);
  });

  test('stacks: toasts behind are scaled down, hover expands them', async ({
    page,
  }) => {
    const button = page.getByRole('button', { name: 'Show toast' });
    for (let i = 0; i < 3; i++) await button.click();
    await page.waitForTimeout(600);
    const scales = await Promise.all([0, 1, 2].map((i) => read(page, i)));
    const smallest = Math.min(...scales.map((s) => s.scale));
    expect(smallest).toBeLessThan(1);
    expect(smallest).toBeGreaterThanOrEqual(0.9);

    await page.locator(TOAST).first().hover();
    await page.waitForTimeout(600);
    const expanded = await Promise.all([0, 1, 2].map((i) => read(page, i)));
    for (const s of expanded) expect(s.scale).toBeCloseTo(1, 2);
  });

  test('reduced motion: fades in place', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: 'Show toast' }).click();
    await page.locator(TOAST).first().waitFor();
    await page.waitForTimeout(40);
    expect(Math.abs((await read(page, 0)).y)).toBeLessThan(0.02);
  });
});
