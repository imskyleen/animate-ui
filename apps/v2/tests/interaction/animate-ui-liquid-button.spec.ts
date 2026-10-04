import { expect, test, type Page } from '@playwright/test';

import { sample } from './motion-probe';

const open = async (page: Page) => {
  await page.goto('/tests/demos/animate-ui/liquid-button', {
    waitUntil: 'networkidle',
  });
  await hydrated(page, 'button');
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

const button = (page: Page) =>
  page.getByRole('button', { name: 'Liquid Button' });

const fillWidth = (page: Page) =>
  button(page).evaluate((el) =>
    getComputedStyle(el).getPropertyValue('--liquid-button-fill-width').trim(),
  );

const SELECTOR = 'button';

/** The button's fill width and scale on every animation frame for `ms`. */
const record = (page: Page, ms: number) =>
  page.evaluate(
    (duration) =>
      new Promise<{ fill: string; scale: number }[]>((resolve) => {
        const el = document.querySelector('button')!;
        const values: { fill: string; scale: number }[] = [];
        const start = performance.now();
        const tick = () => {
          const cs = getComputedStyle(el);
          const m = cs.transform.match(/matrix\(([^,]+)/);
          values.push({
            fill: cs.getPropertyValue('--liquid-button-fill-width').trim(),
            scale: m ? Number(m[1]) : 1,
          });
          if (performance.now() - start < duration) requestAnimationFrame(tick);
          else resolve(values);
        };
        requestAnimationFrame(tick);
      }),
    ms,
  );

test.describe('animate-ui liquid button', () => {
  test('fills with liquid on hover, drains on leave', async ({ page }) => {
    await open(page);
    expect(await fillWidth(page)).toBe('-1%');
    await button(page).hover();
    await expect.poll(() => fillWidth(page)).toBe('100%');
    await page.mouse.move(0, 0);
    await expect.poll(() => fillWidth(page)).toBe('-1%');
  });

  test('grows on hover in a 0.3s tween, back down on a spring', async ({
    page,
  }) => {
    await open(page);
    let frames = record(page, 600);
    await button(page).hover();
    let values = await frames;
    // The fill variables jump; the scale eases to 1.05 without overshoot.
    expect(values.at(-1)).toEqual({ fill: '100%', scale: 1.05 });
    expect(Math.max(...values.map((v) => v.scale))).toBeLessThanOrEqual(1.05);
    expect(values.some((v) => v.scale > 1.005 && v.scale < 1.045)).toBeTruthy();

    frames = record(page, 700);
    await page.mouse.move(0, 0);
    values = await frames;
    // Leaving, the variables ease back over a few frames before the liquid
    // drains (CSS), and the scale returns to 1.
    expect(
      values.some((v) => v.fill !== '100%' && v.fill !== '-1%'),
    ).toBeTruthy();
    expect(values.at(-1)).toEqual({ fill: '-1%', scale: 1 });
  });

  test('shrinks while pressed', async ({ page }) => {
    await open(page);
    await button(page).hover();
    await page.mouse.down();
    await expect
      .poll(async () => (await sample(page, SELECTOR)).scale)
      .toBeCloseTo(0.95, 3);
    await page.mouse.up();
    await expect
      .poll(async () => (await sample(page, SELECTOR)).scale)
      .toBeCloseTo(1.05, 3);
  });

  test('reduced motion: fills, without scaling', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await button(page).hover();
    await page.mouse.down();
    await expect.poll(() => fillWidth(page)).toBe('100%');
    await page.waitForTimeout(300);
    expect((await sample(page, SELECTOR)).scale).toBe(1);
    await page.mouse.up();
  });
});
