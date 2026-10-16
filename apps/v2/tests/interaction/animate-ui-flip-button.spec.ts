import { expect, test, type Page } from '../test';

import { sample } from './motion-probe';

const open = async (page: Page) => {
  await page.goto('/tests/demos/animate-ui/flip-button', {
    waitUntil: 'networkidle',
  });
  await hydrated(page, '[data-slot="flip-button"]');
};

async function hydrated(page: Page, selector: string) {
  await page.waitForFunction((sel) => {
    const el = document.querySelector(sel);
    return (
      !!el && Object.keys(el).some((key) => key.startsWith('__reactProps'))
    );
  }, selector);
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

const BUTTON = '[data-slot="flip-button"]';
const FRONT = '[data-slot="flip-button-front"]';
const BACK = '[data-slot="flip-button-back"]';

const transformOf = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => getComputedStyle(el).transform);

const recordRotateX = (page: Page, selector: string, ms: number) =>
  page.evaluate(
    ([sel, duration]) =>
      new Promise<number[]>((resolve) => {
        const el = document.querySelector(sel)!;
        const values: number[] = [];
        const start = performance.now();
        const tick = () => {
          const m = getComputedStyle(el).transform.match(/matrix3d\(([^)]+)\)/);
          const v = m ? m[1]!.split(',').map(Number) : null;
          values.push(v ? (Math.atan2(v[6]!, v[5]!) * 180) / Math.PI : 0);
          if (performance.now() - start < duration) requestAnimationFrame(tick);
          else resolve(values);
        };
        requestAnimationFrame(tick);
      }),
    [selector, ms] as const,
  );

test.describe('animate-ui flip button', () => {
  test('shows the front face at rest', async ({ page }) => {
    await open(page);
    await expect(page.locator(BUTTON)).toHaveRole('button');
    expect((await sample(page, FRONT)).opacity).toBe(1);
    expect((await sample(page, BACK)).opacity).toBe(0);
  });

  test('flips to the back face on hover, and back on leave', async ({
    page,
  }) => {
    await open(page);
    await page.locator(BUTTON).hover();
    await page.waitForTimeout(60);
    expect(await transformOf(page, BACK)).toMatch(/^matrix3d/);
    await expect.poll(async () => (await sample(page, BACK)).opacity).toBe(1);
    await expect.poll(async () => (await sample(page, FRONT)).opacity).toBe(0);
    await page.mouse.move(0, 0);
    await expect.poll(async () => (await sample(page, FRONT)).opacity).toBe(1);
    await expect.poll(async () => (await sample(page, BACK)).opacity).toBe(0);
  });

  test('the faces flip on a bouncy spring', async ({ page }) => {
    await open(page);
    const frames = recordRotateX(page, FRONT, 900);
    await page.locator(BUTTON).hover();
    const angles = await frames;
    expect(Math.max(...angles)).toBeGreaterThan(95);
    expect(angles.at(-1)).toBeCloseTo(90, 0);
  });

  test('shrinks while pressed', async ({ page }) => {
    await open(page);
    await page.locator(BUTTON).hover();
    await page.mouse.down();
    await expect
      .poll(async () => (await sample(page, BUTTON)).scale)
      .toBeCloseTo(0.97, 3);
    await page.mouse.up();
    await expect
      .poll(async () => (await sample(page, BUTTON)).scale)
      .toBeCloseTo(1, 3);
  });

  test('reduced motion: the faces crossfade without rotating', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await page.locator(BUTTON).hover();
    for (let i = 0; i < 4; i++) {
      for (const face of [FRONT, BACK])
        expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(
          await transformOf(page, face),
        );
      await page.waitForTimeout(80);
    }
    await expect.poll(async () => (await sample(page, BACK)).opacity).toBe(1);
  });
});

test('flip button: the press runs in the browser, off the main thread (rule A9)', async ({
  page,
}) => {
  await open(page);
  await page.locator(BUTTON).first().hover();
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
      }, BUTTON),
    )
    .toBe(true);
  await page.mouse.up();
});
