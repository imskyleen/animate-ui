import { expect, test, type Locator, type Page } from '@playwright/test';

// Shared by the Radix UI, Base UI and React Aria slider specs. Animate UI v1
// had no slider: they move like v1's switch thumb (a pressed thumb stretches
// along the track, a press on the track glides it), on a calmer spring
// (400/32: ~1.5% past the value, where v1's 300/25 went ~4%).

const ROOT = '[data-slot="slider"]';
const THUMB = '[data-slot="slider-thumb"]';
const TRACK = '[data-slot="slider-track"]';
const RANGE = '[data-slot="slider-range"]';

// shadcn's demo is one single-value slider. A range slider (shadcn's
// slider-range example, on the demo's Slider) renders in the fixture.
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

const sizeOf = (locator: Locator) =>
  locator.evaluate((el) => ({
    width: (el as HTMLElement).offsetWidth,
    height: (el as HTMLElement).offsetHeight,
    exactWidth: el.getBoundingClientRect().width,
  }));

/** v1's styled switch stretched its 16px thumb to 19px while pressed. */
const STRETCH = 19 / 16;

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

/**
 * Records the first slider's thumb center x and range end on every animation
 * frame for `ms`, read together. Start it before the interaction.
 */
async function startGlideSampling(page: Page, ms: number) {
  await page.evaluate(
    ({ root, thumb, range, ms }) => {
      const slider = document.querySelector(root)!;
      const thumbEl = slider.querySelector(thumb)!;
      const rangeEl = slider.querySelector(range)!;
      const samples: { thumb: number; range: number }[] = [];
      const w = window as unknown as {
        __glideSamples?: Promise<typeof samples>;
      };
      w.__glideSamples = new Promise((resolve) => {
        const start = performance.now();
        const tick = () => {
          const t = thumbEl.getBoundingClientRect();
          samples.push({
            thumb: t.left + t.width / 2,
            range: rangeEl.getBoundingClientRect().right,
          });
          if (performance.now() - start < ms) requestAnimationFrame(tick);
          else resolve(samples);
        };
        requestAnimationFrame(tick);
      });
    },
    { root: ROOT, thumb: THUMB, range: RANGE, ms },
  );
  return () =>
    page.evaluate(
      () =>
        (
          window as unknown as {
            __glideSamples: Promise<{ thumb: number; range: number }[]>;
          }
        ).__glideSamples,
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

    test('the thumb is the accessible slider', async ({ page }) => {
      await expect(page.getByRole('slider')).toHaveCount(1);
      await expect(slider(page, 0).getByRole('slider')).toHaveCount(1);
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

    test('quick taps on the track glide, one after the other', async ({
      page,
    }) => {
      // A tap released at once (a trackpad's tap to click, a touch): the
      // value changes while it's still pressed, or the thumb would jump.
      const thumb = slider(page, 0).locator(THUMB).first();
      for (const ratio of [0.95, 0.3, 0.7]) {
        const start = await centerX(thumb);
        const target = await trackPoint(page, 0, ratio);
        const samples = await startSampling(page, 0, THUMB, 0, 400);
        await page.mouse.move(target.x, target.y);
        await page.mouse.down();
        await page.mouse.up();
        const frames = await samples();
        await page.waitForTimeout(300);
        const end = await centerX(thumb);
        expect(Math.abs(end - start)).toBeGreaterThan(30);
        const [low, high] = [Math.min(start, end), Math.max(start, end)];
        expect(
          frames.some((x) => x > low + 2 && x < high - 2),
          `the tap to ${ratio} glides`,
        ).toBe(true);
      }
    });

    test('a press on the track goes only a little past the value', async ({
      page,
    }) => {
      // 400/32: ~1.5% of the way past it, where v1's switch spring (300/25)
      // went ~4%.
      const thumb = slider(page, 0).locator(THUMB).first();
      const start = await centerX(thumb);
      const target = await trackPoint(page, 0, 0.05);
      const samples = await startGlideSampling(page, 700);
      await page.mouse.click(target.x, target.y);
      const frames = await samples();
      const end = await centerX(thumb);
      const jump = start - end;
      expect(jump).toBeGreaterThan(150);
      const past = Math.max(...frames.map((f) => end - f.thumb)) / jump;
      expect(past).toBeGreaterThan(0.005);
      expect(past).toBeLessThan(0.025);
    });

    test('the range follows the thumb to its rest, frame by frame', async ({
      page,
    }) => {
      // Both on one spring: the same share of the way at every frame. The
      // range's scale doesn't stop short where the spring turns back.
      const thumb = slider(page, 0).locator(THUMB).first();
      const range = slider(page, 0).locator(RANGE).first();
      const [thumbStart, rangeStart] = [
        await centerX(thumb),
        await rangeRight(range),
      ];
      const target = await trackPoint(page, 0, 0.05);
      const samples = await startGlideSampling(page, 700);
      await page.mouse.click(target.x, target.y);
      const frames = await samples();
      const [thumbEnd, rangeEnd] = [
        await centerX(thumb),
        await rangeRight(range),
      ];
      const jump = thumbStart - thumbEnd;
      expect(jump).toBeGreaterThan(150);
      // It glided: a frame on the way.
      expect(
        frames.some(
          (f) => f.thumb < thumbStart - 20 && f.thumb > thumbEnd + 20,
        ),
      ).toBe(true);
      const apart = frames.map((f) =>
        Math.abs(
          ((f.thumb - thumbEnd) / (thumbStart - thumbEnd) -
            (f.range - rangeEnd) / (rangeStart - rangeEnd)) *
            jump,
        ),
      );
      expect(Math.max(...apart)).toBeLessThan(1.5);
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

    test('a pressed thumb stretches along the track, then back on release', async ({
      page,
    }) => {
      const thumb = slider(page, 0).locator(THUMB).first();
      const rest = await sizeOf(thumb);
      const center = await centerX(thumb);
      const box = (await thumb.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(650);
      const held = await sizeOf(thumb);
      // Its real width (no scale), as v1's switch thumb; its height kept.
      expect(held.exactWidth).toBeCloseTo(rest.width * STRETCH, 0);
      expect(held.height).toBe(rest.height);
      expect(await thumbScale(thumb)).toBe(1);
      // Still on its value: it grows on both sides.
      expect(Math.abs((await centerX(thumb)) - center)).toBeLessThan(1.5);
      await page.mouse.up();
      await page.waitForTimeout(650);
      expect(await sizeOf(thumb)).toEqual(rest);
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

    test('reduced motion: jumps are instant and nothing stretches', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      const thumb = slider(page, 0).locator(THUMB).first();
      const rest = await sizeOf(thumb);
      const target = await trackPoint(page, 0, 0.95);

      await page.mouse.move(target.x, target.y);
      await page.mouse.down();
      await page.waitForTimeout(30);
      const early = await centerX(thumb);
      await page.waitForTimeout(400);
      expect(Math.abs(early - (await centerX(thumb)))).toBeLessThan(0.5);
      expect(await thumbScale(thumb)).toBeCloseTo(1, 2);
      expect(await sizeOf(thumb)).toEqual(rest);
      await page.mouse.up();
    });
  });

  test.describe(`${library} slider demo, range`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/tests/fixtures/${library}-slider`, {
        waitUntil: 'networkidle',
      });
    });

    test('each thumb is an accessible slider', async ({ page }) => {
      await expect(slider(page, 0).getByRole('slider')).toHaveCount(2);
    });

    test('only the closest thumb moves on a jump', async ({ page }) => {
      const thumbs = slider(page, 0).locator(THUMB);
      const firstBefore = await centerX(thumbs.nth(0));
      const secondBefore = await centerX(thumbs.nth(1));
      const target = await trackPoint(page, 0, 0.95);

      const samples = await startSampling(page, 0, THUMB, 1, 400);
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
  });
}
