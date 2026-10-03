import { expect, test, type Page } from '@playwright/test';

const TOAST = '[data-slot="toast"]';

/** Vertical offset (in toast heights), scale and opacity of toast `i`. */
const read = (page: Page, i: number, selector = TOAST) =>
  page
    .locator(selector)
    .nth(i)
    .evaluate((el) => {
      const m = new DOMMatrix(getComputedStyle(el).transform);
      return {
        x: m.m41,
        y: m.m42 / (el as HTMLElement).offsetHeight,
        scale: Math.hypot(m.a, m.b),
        opacity: Number(getComputedStyle(el).opacity),
      };
    });

test.describe('base-ui toast demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/toast', { waitUntil: 'networkidle' });
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
    await page.waitForTimeout(700);
    const scales = await Promise.all([0, 1, 2].map((i) => read(page, i)));
    const smallest = Math.min(...scales.map((s) => s.scale));
    expect(smallest).toBeLessThan(1);
    expect(smallest).toBeGreaterThanOrEqual(0.9);

    // Hovering the stack expands it (the toasts overlap, so no actionability).
    await page.locator(TOAST).first().hover({ force: true });
    await page.waitForTimeout(700);
    const expanded = await Promise.all([0, 1, 2].map((i) => read(page, i)));
    for (const s of expanded) expect(s.scale).toBeCloseTo(1, 2);
  });

  test('exits faster than it enters, through its edge', async ({ page }) => {
    await page.getByRole('button', { name: 'Show toast' }).click();
    const toast = page.locator(TOAST).first();
    await toast.waitFor();
    await page.waitForTimeout(700);
    const enter = await toast.evaluate(
      (el) => getComputedStyle(el).transitionDuration,
    );
    // Base UI hides the close button from the accessibility tree until the
    // stack is expanded or focused.
    await toast.locator('[data-slot="toast-close"]').click();
    await page.waitForTimeout(60);
    const exit = await toast.evaluate((el) => ({
      duration: getComputedStyle(el).transitionDuration,
      y: new DOMMatrix(getComputedStyle(el).transform).m42,
    }));
    expect(enter.split(',')[0]!.trim()).toBe('0.6s');
    expect(exit.duration.split(',')[0]!.trim()).toBe('0.4s');
    expect(exit.y).toBeGreaterThan(0);
    await expect(page.locator(TOAST)).toHaveCount(0, { timeout: 600 });
  });

  test('a swipe follows the finger, then dismisses', async ({ page }) => {
    await page.getByRole('button', { name: 'Show toast' }).click();
    const toast = page.locator(TOAST).first();
    await toast.waitFor();
    await page.waitForTimeout(700);
    const box = (await toast.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    // Small moves, one frame apart: a single jump doesn't register as a swipe.
    for (let i = 1; i <= 10; i++) {
      await page.mouse.move(x + i * 6, y);
      await page.waitForTimeout(16);
    }
    const dragged = await read(page, 0);
    expect(dragged.x).toBeGreaterThan(40);
    for (let i = 11; i <= 20; i++) {
      await page.mouse.move(x + i * 6, y);
      await page.waitForTimeout(16);
    }
    await page.mouse.up();
    await expect(page.locator(TOAST)).toHaveCount(0, { timeout: 1000 });
  });

  test('reduced motion: fades in place', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Show toast' }).click();
    await page.locator(TOAST).first().waitFor();
    await page.waitForTimeout(40);
    const early = await read(page, 0);
    expect(Math.abs(early.y)).toBeLessThan(0.02);
    expect(early.opacity).toBeLessThan(1);
  });
});

test.describe('base-ui toast API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/base-ui-toast', {
      waitUntil: 'networkidle',
    });
  });

  test('useToastManager adds and closes toasts', async ({ page }) => {
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    const toast = page.locator('[data-testid="bottom-toast"]');
    await expect(toast).toHaveCount(1);
    await expect(toast).toContainText('Bottom toast');
    await toast.getByText('Dismiss').click();
    await expect(toast).toHaveCount(0, { timeout: 600 });
  });

  test('a toast swiped up enters from the top edge', async ({ page }) => {
    await page.getByRole('button', { name: 'Add top' }).click();
    const selector = '[data-testid="top-toast"]';
    await page.locator(selector).first().waitFor();
    await page.waitForTimeout(40);
    expect((await read(page, 0, selector)).y).toBeLessThan(-0.1);
    await page.waitForTimeout(700);
    expect(Math.abs((await read(page, 0, selector)).y)).toBeLessThan(0.02);
  });

  test('timeouts still close toasts, the user style still applies', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    const toast = page.locator('[data-testid="bottom-toast"]');
    await expect(toast).toHaveCSS('outline-style', 'dashed');
    // 1s timeout, then the exit.
    await expect(toast).toHaveCount(0, { timeout: 2500 });
  });
});
