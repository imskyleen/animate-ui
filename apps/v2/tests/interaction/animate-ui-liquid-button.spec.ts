import { expect, test, type Page } from '../test';

import { sample } from './motion-probe';

import { FRAMEWORKS, ready } from './animate-ui-frameworks';

for (const framework of FRAMEWORKS) {
  const open = async (page: Page) => {
    await page.goto(framework.demo('liquid-button'), {
      waitUntil: 'networkidle',
    });
    await ready(page, 'button');
  };

  const button = (page: Page) =>
    page.getByRole('button', { name: 'Liquid Button' });

  const fillWidth = (page: Page) =>
    button(page).evaluate((el) =>
      getComputedStyle(el)
        .getPropertyValue('--liquid-button-fill-width')
        .trim(),
    );

  const SELECTOR = 'button';

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
            if (performance.now() - start < duration)
              requestAnimationFrame(tick);
            else resolve(values);
          };
          requestAnimationFrame(tick);
        }),
      ms,
    );

  test.describe(`${framework.name} liquid button`, () => {
    test('fills with liquid on hover, drains on leave', async ({ page }) => {
      await open(page);
      expect(await fillWidth(page)).toBe('-1%');
      await button(page).hover();
      await expect.poll(() => fillWidth(page)).toBe('100%');
      await page.mouse.move(0, 0);
      await expect.poll(() => fillWidth(page)).toBe('-1%');
    });

    test('fills on hover without growing, then eases back', async ({
      page,
    }) => {
      await open(page);
      let frames = record(page, 600);
      await button(page).hover();
      let values = await frames;
      expect(values.at(-1)).toEqual({ fill: '100%', scale: 1 });
      expect(values.every((v) => v.scale === 1)).toBeTruthy();

      frames = record(page, 700);
      await page.mouse.move(0, 0);
      values = await frames;
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
        .toBeCloseTo(0.97, 3);
      await page.mouse.up();
      await expect
        .poll(async () => (await sample(page, SELECTOR)).scale)
        .toBeCloseTo(1, 3);
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

  test(`${framework.name} liquid button: the press runs in the browser, off the main thread (rule A9)`, async ({
    page,
  }) => {
    await open(page);
    await page.locator(SELECTOR).first().hover();
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

  test(`${framework.name} liquid button: press and release spring on the press spring, not the default tween`, async ({
    page,
  }) => {
    await open(page);
    const easings = () =>
      page.evaluate((sel) => {
        const el = document.querySelector(sel)!;
        return el
          .getAnimations()
          .filter((animation) =>
            (animation.effect as KeyframeEffect)
              .getKeyframes()
              .some((frame) => 'transform' in frame),
          )
          .map((animation) => {
            const effect = animation.effect as KeyframeEffect;
            return [
              effect.getTiming().easing,
              ...effect.getKeyframes().map((frame) => frame.easing),
            ].join(' ');
          });
      }, SELECTOR);
    await page.locator(SELECTOR).first().hover();
    await page.mouse.down();
    await expect.poll(easings).toEqual([expect.stringContaining('linear(')]);
    await page.waitForTimeout(500);
    await page.mouse.up();
    await expect.poll(easings).toEqual([expect.stringContaining('linear(')]);
  });
}
