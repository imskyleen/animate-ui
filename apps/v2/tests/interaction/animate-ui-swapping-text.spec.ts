import { expect, test, type Page } from '../test';

import { FRAMEWORKS, ready } from './animate-ui-frameworks';

for (const framework of FRAMEWORKS) {
  async function open(page: Page, query = '') {
    await page.goto(`/tests/fixtures/swapping-text${query}`, {
      waitUntil: 'networkidle',
    });
    await page.waitForFunction(() => {
      const el = document.querySelector('main button');
      return (
        !!el && Object.keys(el).some((key) => key.startsWith('__reactProps'))
      );
    });
  }

  const root = (page: Page) => page.getByTestId('toggle');

  function sampleSwap(page: Page, duration: number) {
    return page.evaluate(
      (duration) =>
        new Promise<
          { t: number; ins: { y: number; opacity: number }[]; outs: number[] }[]
        >((resolve) => {
          const frames: {
            t: number;
            ins: { y: number; opacity: number }[];
            outs: number[];
          }[] = [];
          const t0 = performance.now();
          const tick = () => {
            const read = (el: Element) => {
              const style = getComputedStyle(el);
              return {
                y: new DOMMatrix(style.transform).m42,
                opacity: Number(style.opacity),
              };
            };
            frames.push({
              t: performance.now() - t0,
              ins: [
                ...document.querySelectorAll(
                  '[data-testid="toggle"] [data-slot="swapping-text-in"]',
                ),
              ].map(read),
              outs: [
                ...document.querySelectorAll(
                  '[data-testid="toggle"] [data-slot="swapping-text-out"]',
                ),
              ].map((el) => read(el).y),
            });
            if (performance.now() - t0 < duration) requestAnimationFrame(tick);
            else resolve(frames);
          };
          requestAnimationFrame(tick);
        }),
      duration,
    );
  }

  test.describe(`${framework.name} swapping text`, () => {
    test('screen readers read the current text once', async ({ page }) => {
      await open(page);
      await expect(root(page).locator('.sr-only')).toHaveText('Private');
      await page.locator('main button').click();
      await expect(root(page).locator('.sr-only')).toHaveText('Public');
      await expect(root(page).locator('> [aria-hidden="true"]')).toHaveCount(1);
    });

    test('only the letters that change swap: P stays, the other six swap', async ({
      page,
    }) => {
      await open(page);
      const recording = page.evaluate(
        () =>
          new Promise<number[]>((resolve) => {
            const counts: number[] = [];
            const t0 = performance.now();
            const tick = () => {
              counts.push(
                document.querySelectorAll(
                  '[data-testid="toggle"] [data-slot="swapping-text-slot"]',
                ).length,
              );
              if (performance.now() - t0 < 300) requestAnimationFrame(tick);
              else resolve(counts);
            };
            requestAnimationFrame(tick);
          }),
      );
      await page.locator('main button').click();
      expect(Math.max(...(await recording))).toBe(6);
      await expect(root(page).locator('> [aria-hidden="true"]')).toHaveText(
        /^P/,
      );
    });

    test('new letters rise from below, old ones leave upwards, left to right', async ({
      page,
    }) => {
      await open(page);
      const recording = sampleSwap(page, 500);
      await page.locator('main button').click();
      const frames = await recording;
      const ordered = frames.filter((f) => f.ins.length === 5);
      expect(ordered.length).toBeGreaterThan(2);
      expect(
        ordered.some((f) => f.ins[0]!.opacity > f.ins[4]!.opacity + 0.1),
      ).toBe(true);
      for (const f of ordered)
        for (const letter of f.ins)
          expect(letter.y).toBeGreaterThanOrEqual(-0.01);
      const moving = frames.find((f) => f.ins.some((i) => i.y > 0.5));
      expect(moving).toBeDefined();
      const leaving = frames.find((f) => f.outs.some((y) => y < -0.5));
      expect(leaving).toBeDefined();
      expect(Math.max(...leaving!.outs)).toBeLessThanOrEqual(0.01);
    });

    test('direction="down": new letters fall from above, old ones leave downwards', async ({
      page,
    }) => {
      await open(page, '?direction=down');
      const recording = sampleSwap(page, 400);
      await page.locator('main button').click();
      const frames = await recording;
      expect(frames.some((f) => f.ins.some((i) => i.y < -0.5))).toBe(true);
      expect(frames.some((f) => f.outs.some((y) => y > 0.5))).toBe(true);
    });

    test('it settles on the new word, sharp and at its natural width', async ({
      page,
    }) => {
      await open(page);
      await page.locator('main button').click();
      await page.waitForTimeout(900);
      const settled = await root(page).evaluate((el) => {
        const ins = [...el.querySelectorAll('[data-slot="swapping-text-in"]')];
        return {
          text: el.querySelector('[aria-hidden="true"]')!.textContent,
          filters: ins.map((i) => getComputedStyle(i).filter),
          opacities: ins.map((i) => Number(getComputedStyle(i).opacity)),
          width: el.getBoundingClientRect().width,
        };
      });
      expect(settled.text).toContain('Public');
      for (const filter of settled.filters)
        expect(filter).toMatch(/blur\(0px\)|none/);
      for (const opacity of settled.opacities) expect(opacity).toBe(1);
      const natural = await page.evaluate(() => {
        const el = document.querySelector('[data-testid="toggle"]')!;
        const probe = document.createElement('span');
        probe.textContent = 'Public';
        probe.style.font = getComputedStyle(el).font;
        probe.style.whiteSpace = 'pre';
        probe.style.position = 'absolute';
        probe.style.display = 'inline-block';
        document.body.append(probe);
        const width = probe.getBoundingClientRect().width;
        probe.remove();
        return width;
      });
      expect(Math.abs(settled.width - natural)).toBeLessThan(2);
    });

    test('given an array, it swaps from one text to the next on its own, and loops', async ({
      page,
    }) => {
      await open(page);
      const cycle = page.getByTestId('cycle').locator('.sr-only');
      await expect(cycle).toHaveText('One');
      await expect(cycle).toHaveText('Two', { timeout: 2000 });
      await expect(cycle).toHaveText('Six', { timeout: 2000 });
      await expect(cycle).toHaveText('One', { timeout: 2000 });
    });

    test('given an array, it waits while off screen', async ({ page }) => {
      await page.setViewportSize({ width: 800, height: 200 });
      await open(page);
      await page.evaluate(() => {
        const spacer = document.createElement('div');
        spacer.style.height = '3000px';
        document.querySelector('main')!.prepend(spacer);
      });
      const cycle = page.getByTestId('cycle').locator('.sr-only');
      const before = await cycle.textContent();
      await page.waitForTimeout(1500);
      expect(await cycle.textContent()).toBe(before);
    });

    test('reduced motion: the text changes at once', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page);
      const recording = sampleSwap(page, 400);
      await page.locator('main button').click();
      const frames = await recording;
      expect(
        frames.every((f) => f.outs.length === 0 && f.ins.length === 0),
      ).toBe(true);
      await expect(root(page).locator('> [aria-hidden="true"]')).toHaveText(
        'Public',
      );
    });
  });
}
