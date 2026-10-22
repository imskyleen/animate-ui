import { expect, test, type Page } from '../test';

import { sample } from './motion-probe';

import { FRAMEWORKS, ready } from './animate-ui-frameworks';

for (const framework of FRAMEWORKS) {
  const open = async (page: Page) => {
    await page.goto(framework.demo('button'), {
      waitUntil: 'networkidle',
    });
    await ready(page, '[data-slot="button"]');
  };

  const SELECTOR = '[data-slot="button"]';

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
            if (performance.now() - start < duration)
              requestAnimationFrame(tick);
            else resolve(values);
          };
          requestAnimationFrame(tick);
        }),
      [selector, ms] as const,
    );

  test.describe(`${framework.name} button`, () => {
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
        .toBeCloseTo(0.97, 3);
      await page.mouse.up();
      await expect
        .poll(async () => (await sample(page, SELECTOR)).scale)
        .toBeCloseTo(1, 3);
    });

    test('the press runs in the browser, off the main thread (a transform animation, rule A9)', async ({
      page,
    }) => {
      await open(page);
      await page.getByRole('button', { name: 'Button', exact: true }).hover();
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
          }, SELECTOR),
        )
        .toBe(true);
      await page.mouse.up();
    });

    test(
      'the press springs to its scale quickly',
      { tag: '@timing' },
      async ({ page }) => {
        await open(page);
        await page.getByRole('button', { name: 'Button', exact: true }).hover();
        const frames = recordScales(page, SELECTOR, 600);
        await page.mouse.down();
        const scales = await frames;
        expect(scales.some((s) => s < 0.995 && s > 0.971)).toBe(true);
        expect(Math.min(...scales)).toBeGreaterThan(0.94);
        expect(scales.at(-1)).toBeCloseTo(0.97, 3);
        await page.mouse.up();
      },
    );

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
}
