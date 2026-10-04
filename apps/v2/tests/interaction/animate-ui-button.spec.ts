import { expect, test, type Page } from '@playwright/test';

import { sample } from './motion-probe';

const open = async (page: Page) => {
  await page.goto('/tests/demos/animate-ui/button', {
    waitUntil: 'networkidle',
  });
  await hydrated(page, '[data-slot="button"]');
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

const SELECTOR = '[data-slot="button"]';

/** The element's scale on every animation frame for `ms`. */
const recordScales = (page: Page, selector: string, ms: number) =>
  page.evaluate(
    ([sel, duration]) =>
      new Promise<number[]>((resolve) => {
        const el = document.querySelector(sel)!;
        const values: number[] = [];
        const start = performance.now();
        const tick = () => {
          const m = getComputedStyle(el).transform.match(/matrix\(([^,]+)/);
          values.push(m ? Number(m[1]) : 1);
          if (performance.now() - start < duration) requestAnimationFrame(tick);
          else resolve(values);
        };
        requestAnimationFrame(tick);
      }),
    [selector, ms] as const,
  );

test.describe('animate-ui button', () => {
  test('is a native button', async ({ page }) => {
    await open(page);
    const button = page.getByRole('button', { name: 'Button', exact: true });
    await expect(button).toHaveAttribute('data-slot', 'button');
    await button.focus();
    await expect(button).toBeFocused();
  });

  test('stays put on hover, shrinks while pressed', async ({ page }) => {
    await open(page);
    const button = page.getByRole('button', { name: 'Button', exact: true });
    expect((await sample(page, SELECTOR)).scale).toBe(1);
    await button.hover();
    await page.waitForTimeout(300);
    expect((await sample(page, SELECTOR)).scale).toBe(1);
    await page.mouse.down();
    await expect
      .poll(async () => (await sample(page, SELECTOR)).scale)
      .toBeCloseTo(0.95, 3);
    await page.mouse.up();
    await expect
      .poll(async () => (await sample(page, SELECTOR)).scale)
      .toBeCloseTo(1, 3);
  });

  test('the press springs to its scale quickly', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Button', exact: true }).hover();
    const frames = recordScales(page, SELECTOR, 600);
    await page.mouse.down();
    const scales = await frames;
    // Motion's spring for scale (stiffness 550, damping 30): on its way, then
    // at 0.95. Its rest thresholds (restSpeed 10) snap it once within 0.005,
    // so a 0.05 press doesn't visibly overshoot.
    expect(scales.some((s) => s < 0.995 && s > 0.951)).toBe(true);
    expect(Math.min(...scales)).toBeGreaterThan(0.94);
    expect(scales.at(-1)).toBeCloseTo(0.95, 3);
    await page.mouse.up();
  });

  test('reduced motion: no scaling', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await page.getByRole('button', { name: 'Button', exact: true }).hover();
    await page.mouse.down();
    await page.waitForTimeout(300);
    expect((await sample(page, SELECTOR)).scale).toBe(1);
    await page.mouse.up();
  });
});
