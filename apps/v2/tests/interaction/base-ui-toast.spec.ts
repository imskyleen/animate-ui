import { expect, test, type Page } from '@playwright/test';

import { SHEET_SPRING, present, recordTimeline } from './modal-timeline';
import { expectCssSpring } from './spring-curves';

// Animate UI v1 had no toast: it moves like v1's Sheet (from its edge by its
// own size, fading, on the dialog's spring, stiffness 150 and damping 25,
// which the CSS transitions run as Motion's `linear()` curve for it), and its
// content fades behind the front toast in 200ms, ease-out.

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

const timing = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        duration: cs.transitionDuration.split(',')[0]!.trim(),
        easing: cs.transitionTimingFunction,
      };
    });

const settled = (page: Page, i = 0, selector = TOAST) =>
  expect
    .poll(
      async () => {
        const state = await read(page, i, selector);
        return state.opacity === 1 && Math.abs(state.y) < 0.002;
      },
      { timeout: 2500 },
    )
    .toBe(true);

test.describe('base-ui toast demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/toast', { waitUntil: 'networkidle' });
  });

  test("enters from its edge like v1's sheet: sliding and fading on its spring", async ({
    page,
  }) => {
    const timeline = await recordTimeline(page, { toast: TOAST });
    await page.getByRole('button', { name: 'Show Toast' }).click();
    await settled(page);
    const shown = present(await timeline.stop(), 'toast');
    const first = shown[0]!.samples.toast!;
    expect(first.y).toBeGreaterThan(0.6);
    expect(first.opacity).toBeLessThan(0.3);
    const midway = shown.find((frame) => frame.samples.toast!.y < 0.5)!;
    expect(midway.samples.toast!.opacity).toBeGreaterThan(0.2);
    expect(midway.samples.toast!.opacity).toBeLessThan(0.95);
    // The spring as CSS: the duration and `linear()` curve Motion computes
    // for the dialog's spring.
    expectCssSpring(await timing(page, TOAST), SHEET_SPRING);
  });

  test('stacks: toasts behind are scaled down, hover expands them', async ({
    page,
  }) => {
    // All the toasts' scales in one read (they close themselves after 5s).
    const scales = () =>
      page.evaluate(() =>
        [...document.querySelectorAll('[data-slot="toast"]')].map((el) => {
          const m = new DOMMatrix(getComputedStyle(el).transform);
          return Math.hypot(m.a, m.b);
        }),
      );
    const button = page.getByRole('button', { name: 'Show Toast' });
    for (let i = 0; i < 3; i++) await button.click();
    // The newest toast comes first in the DOM, at the front of the stack.
    await settled(page, 0);
    await expect
      .poll(async () => {
        const list = await scales();
        return list.length === 3 && Math.min(...list) < 0.95;
      })
      .toBe(true);
    const collapsed = await scales();
    expect(Math.min(...collapsed)).toBeGreaterThanOrEqual(0.9);

    // Hovering the stack expands it (the toasts overlap, so no actionability).
    await page.locator(TOAST).first().hover({ force: true });
    await expect
      .poll(
        async () => {
          const list = await scales();
          return (
            list.length === 3 && list.every((s) => Math.abs(s - 1) < 0.005)
          );
        },
        { timeout: 5000 },
      )
      .toBe(true);
    // The content behind fades back in with the overlay's 200ms ease-out.
    const content = await timing(page, '[data-slot="toast-content"]');
    expect(content.duration).toBe('0.2s');
    expect(content.easing).toBe('cubic-bezier(0.23, 1, 0.32, 1)');
  });

  test('leaves through its edge on the same spring', async ({ page }) => {
    await page.getByRole('button', { name: 'Show Toast' }).click();
    const toast = page.locator(TOAST).first();
    await settled(page);
    // The exit's timing, read as soon as Base UI marks the toast as ending.
    await toast.evaluate((el) => {
      (window as unknown as { __exit: Promise<unknown> }).__exit = new Promise(
        (resolve) => {
          const observer = new MutationObserver(() => {
            if (!el.hasAttribute('data-ending-style')) return;
            observer.disconnect();
            const cs = getComputedStyle(el);
            resolve({
              duration: cs.transitionDuration.split(',')[0]!.trim(),
              easing: cs.transitionTimingFunction,
            });
          });
          observer.observe(el, { attributes: true });
        },
      );
    });
    const timeline = await recordTimeline(page, { toast: TOAST });
    // Base UI hides the close button from the accessibility tree until the
    // stack is expanded or focused.
    await toast.locator('[data-slot="toast-close"]').click();
    const exit = (await page.evaluate(
      () => (window as unknown as { __exit: Promise<unknown> }).__exit,
    )) as { duration: string; easing: string };
    expectCssSpring(exit, SHEET_SPRING);
    await expect(page.locator(TOAST)).toHaveCount(0, { timeout: 2500 });
    // Down through its edge, fading out.
    const last = present(await timeline.stop(), 'toast').at(-1)!.samples.toast!;
    expect(last.y).toBeGreaterThan(0.6);
    expect(last.opacity).toBeLessThan(0.3);
  });

  test('a swipe follows the finger, then dismisses', async ({ page }) => {
    await page.getByRole('button', { name: 'Show Toast' }).click();
    const toast = page.locator(TOAST).first();
    await settled(page);
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
    await expect(page.locator(TOAST)).toHaveCount(0, { timeout: 2500 });
  });

  test('reduced motion: fades in place', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload({ waitUntil: 'networkidle' });
    const timeline = await recordTimeline(page, { toast: TOAST });
    await page.getByRole('button', { name: 'Show Toast' }).click();
    await settled(page);
    const first = present(await timeline.stop(), 'toast')[0]!.samples.toast!;
    expect(Math.abs(first.y)).toBeLessThan(0.02);
    expect(first.opacity).toBeLessThan(1);
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
    await expect(toast).toHaveCount(0, { timeout: 2500 });
  });

  test('a toast swiped up enters from the top edge', async ({ page }) => {
    const selector = '[data-testid="top-toast"]';
    const timeline = await recordTimeline(page, { toast: selector });
    await page.getByRole('button', { name: 'Add top' }).click();
    await settled(page, 0, selector);
    const first = present(await timeline.stop(), 'toast')[0]!.samples.toast!;
    expect(first.y).toBeLessThan(-0.6);
  });

  test('timeouts still close toasts, the user style still applies', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    const toast = page.locator('[data-testid="bottom-toast"]');
    await expect(toast).toHaveCSS('outline-style', 'dashed');
    // 1s timeout, then the exit.
    await expect(toast).toHaveCount(0, { timeout: 3000 });
  });
});
