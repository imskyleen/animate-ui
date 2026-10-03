import { expect, test, type Locator, type Page } from '@playwright/test';

// Shared by the Radix UI, Base UI and React Aria slider specs (ported from
// Animate UI v1's slider tests).

const ROOT = '[data-slot="slider"]';
const THUMB = '[data-slot="slider-thumb"]';
const TRACK = '[data-slot="slider-track"]';
const RANGE = '[data-slot="slider-range"]';

// The demo renders a single-value slider first, then a range slider.
const slider = (page: Page, index: number) => page.locator(ROOT).nth(index);

const centerX = (locator: Locator) =>
  locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.left + r.width / 2;
  });

const rangeRight = (locator: Locator) =>
  locator.evaluate((el) => el.getBoundingClientRect().right);

// Scale from the computed matrix (no rotation, so `a` is the x scale).
const thumbScale = (locator: Locator) =>
  locator.evaluate((el) => {
    const match = getComputedStyle(el).transform.match(/matrix\(([^,]+)/);
    return match ? Number(match[1]) : 1;
  });

/**
 * Records the visual center x of `selector` (nth match inside the nth slider)
 * on every animation frame for `ms`. Start it before the interaction.
 */
async function startSampling(
  page: Page,
  sliderIndex: number,
  selector: string,
  nth: number,
  ms: number,
) {
  await page.evaluate(
    ({ root, sliderIndex, selector, nth, ms }) => {
      const el = document
        .querySelectorAll(root)
        [sliderIndex]!.querySelectorAll(selector)[nth]!;
      const samples: number[] = [];
      const w = window as unknown as { __sliderSamples?: Promise<number[]> };
      w.__sliderSamples = new Promise((resolve) => {
        const start = performance.now();
        const tick = () => {
          const r = el.getBoundingClientRect();
          samples.push(r.left + r.width / 2);
          if (performance.now() - start < ms) requestAnimationFrame(tick);
          else resolve(samples);
        };
        requestAnimationFrame(tick);
      });
    },
    { root: ROOT, sliderIndex, selector, nth, ms },
  );
  return () =>
    page.evaluate(
      () =>
        (window as unknown as { __sliderSamples: Promise<number[]> })
          .__sliderSamples,
    );
}

async function trackPoint(page: Page, sliderIndex: number, ratio: number) {
  const box = (await slider(page, sliderIndex).locator(TRACK).boundingBox())!;
  return { x: box.x + box.width * ratio, y: box.y + box.height / 2 };
}

export function describeSliderDemo(library: string) {
  test.describe(`${library} slider demo`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/tests/demos/${library}/slider`, {
        waitUntil: 'networkidle',
      });
    });

    test('thumbs are the accessible sliders', async ({ page }) => {
      await expect(page.getByRole('slider')).toHaveCount(3);
    });

    test('a press on the track springs the thumb and range to the value', async ({
      page,
    }) => {
      const thumb = slider(page, 0).locator(THUMB).first();
      const range = slider(page, 0).locator(RANGE).first();
      const start = await centerX(thumb);
      const target = await trackPoint(page, 0, 0.95);

      const samples = await startSampling(page, 0, THUMB, 0, 400);
      await page.mouse.click(target.x, target.y);
      const frames = await samples();

      await page.waitForTimeout(650);
      const end = await centerX(thumb);
      expect(end).toBeGreaterThan(start + 30);

      // Glided: at least one frame sits strictly between start and end.
      expect(frames.some((x) => x > start + 2 && x < end - 2)).toBe(true);
      // Settled: the range ends under the thumb.
      expect(Math.abs((await rangeRight(range)) - end)).toBeLessThan(10);
      expect(await thumbScale(thumb)).toBeCloseTo(1, 2);
    });

    test('dragging follows the pointer with no lag', async ({ page }) => {
      const thumb = slider(page, 0).locator(THUMB).first();
      const box = (await thumb.boundingBox())!;
      const y = box.y + box.height / 2;
      await page.mouse.move(box.x + box.width / 2, y);
      await page.mouse.down();
      const target = await trackPoint(page, 0, 0.3);
      await page.mouse.move(target.x, y, { steps: 8 });
      // Read right away: no transition between the pointer and the thumb.
      expect(Math.abs((await centerX(thumb)) - target.x)).toBeLessThan(8);
      await page.mouse.up();
    });

    test('dragging right after a jump cancels the jump animation', async ({
      page,
    }) => {
      const thumb = slider(page, 0).locator(THUMB).first();
      const jump = await trackPoint(page, 0, 0.95);
      const drag = await trackPoint(page, 0, 0.8);
      await page.mouse.move(jump.x, jump.y);
      await page.mouse.down();
      await page.mouse.move(drag.x, drag.y, { steps: 4 });
      expect(Math.abs((await centerX(thumb)) - drag.x)).toBeLessThan(8);
      await page.mouse.up();
    });

    test('a pressed thumb scales up, then back on release', async ({
      page,
    }) => {
      const thumb = slider(page, 0).locator(THUMB).first();
      const box = (await thumb.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(650);
      expect(await thumbScale(thumb)).toBeCloseTo(1.15, 1);
      await page.mouse.up();
      await page.waitForTimeout(650);
      expect(await thumbScale(thumb)).toBeCloseTo(1, 2);
    });

    test('keyboard changes are instant', async ({ page }) => {
      const thumb = slider(page, 0).locator(THUMB).first();
      await page.getByRole('slider').first().focus();
      await page.keyboard.press('End');
      await page.waitForTimeout(30);
      const early = await centerX(thumb);
      await page.waitForTimeout(400);
      expect(Math.abs(early - (await centerX(thumb)))).toBeLessThan(0.5);
      expect(await thumbScale(thumb)).toBeCloseTo(1, 2);
    });

    test('range slider: only the closest thumb moves on a jump', async ({
      page,
    }) => {
      const thumbs = slider(page, 1).locator(THUMB);
      const firstBefore = await centerX(thumbs.nth(0));
      const secondBefore = await centerX(thumbs.nth(1));
      const target = await trackPoint(page, 1, 0.95);

      const samples = await startSampling(page, 1, THUMB, 1, 400);
      await page.mouse.click(target.x, target.y);
      const frames = await samples();
      await page.waitForTimeout(650);

      const secondAfter = await centerX(thumbs.nth(1));
      expect(secondAfter).toBeGreaterThan(secondBefore + 20);
      expect(
        frames.some((x) => x > secondBefore + 2 && x < secondAfter - 2),
      ).toBe(true);
      expect(
        Math.abs((await centerX(thumbs.nth(0))) - firstBefore),
      ).toBeLessThan(0.5);
    });

    test('reduced motion: jumps are instant and nothing scales', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      const thumb = slider(page, 0).locator(THUMB).first();
      const target = await trackPoint(page, 0, 0.95);

      await page.mouse.move(target.x, target.y);
      await page.mouse.down();
      await page.waitForTimeout(30);
      const early = await centerX(thumb);
      await page.waitForTimeout(400);
      expect(Math.abs(early - (await centerX(thumb)))).toBeLessThan(0.5);
      expect(await thumbScale(thumb)).toBeCloseTo(1, 2);
      await page.mouse.up();
    });
  });
}
