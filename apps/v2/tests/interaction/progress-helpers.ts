import { expect, test, type Page } from '@playwright/test';

import { expectSpringPace, type Sample } from './spring-curves';

// Shared by the Radix UI, Base UI and React Aria progress specs. The
// indicator springs to a new value like Motion UI's progress bar (stiffness
// 300, damping 35, no overshoot), its `x` for Radix UI (shadcn's translate)
// and its `width` for Base UI and React Aria, and lands without a jump.

export const INDICATOR = '[data-slot="progress-indicator"]';

/** The indicator's spring. */
const SPRING = { stiffness: 300, damping: 35 };

/** shadcn's demo: 13% on mount, then 66% 500ms later. */
const FROM = 0.13;
const TO = 0.66;

/** The fixtures' indicator whose value steps up every 450ms. */
const UPLOAD = '[data-testid="upload-indicator"]';

/** How much of its track the indicator shows (0 to 1). */
export const revealed = (page: Page, indicator = INDICATOR) =>
  page
    .locator(indicator)
    .first()
    .evaluate((el) => {
      const track = el.parentElement!.getBoundingClientRect();
      const bar = el.getBoundingClientRect();
      return (bar.right - track.left) / track.width;
    });

/** Records the revealed fraction on every frame for `ms`. */
export async function sampleRevealed(page: Page, ms: number) {
  await page.evaluate(
    ({ indicator, ms }) => {
      const w = window as unknown as { __samples?: Promise<number[]> };
      const el = document.querySelector(indicator)!;
      w.__samples = new Promise((resolve) => {
        const samples: number[] = [];
        const start = performance.now();
        const tick = () => {
          const track = el.parentElement!.getBoundingClientRect();
          samples.push(
            (el.getBoundingClientRect().right - track.left) / track.width,
          );
          if (performance.now() - start < ms) requestAnimationFrame(tick);
          else resolve(samples);
        };
        requestAnimationFrame(tick);
      });
    },
    { indicator: INDICATOR, ms },
  );
  return () =>
    page.evaluate(
      () => (window as unknown as { __samples: Promise<number[]> }).__samples,
    );
}

/**
 * Opens shadcn's demo, recording how much of its track the indicator shows
 * (`[t, fraction]`) on every frame from the first one (an init script: a slow
 * hydration only delays the change), until it has settled on 66%.
 */
async function loadDemo(page: Page, library: string) {
  await page.addInitScript((indicator) => {
    const w = window as unknown as { __revealed: [number, number][] };
    w.__revealed = [];
    const tick = () => {
      const el = document.querySelector(indicator);
      if (el) {
        const track = el.parentElement!.getBoundingClientRect();
        w.__revealed.push([
          performance.now(),
          (el.getBoundingClientRect().right - track.left) / track.width,
        ]);
      }
      if (w.__revealed.length < 20_000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, INDICATOR);
  await page.goto(`/tests/demos/${library}/progress`, {
    waitUntil: 'networkidle',
  });
  await expect
    .poll(() => revealed(page), { timeout: 30_000 })
    .toBeGreaterThan(TO - 0.001);
  await page.waitForTimeout(100);
  return (await page.evaluate(
    () => (window as unknown as { __revealed: Sample[] }).__revealed,
  )) as Sample[];
}

/** The frames from the last one at 13%, when the demo sets 66%. */
function fromChange(frames: Sample[]) {
  const moved = frames.findIndex(([, v]) => Math.abs(v - FROM) > 0.005);
  expect(moved).toBeGreaterThan(0);
  return frames.slice(moved - 1);
}

export function describeProgressDemo(library: string) {
  // How the library sizes the indicator: v1 animated Radix's `x` and Base
  // UI's `width`; React Aria's bar is width-sized too.
  const byWidth = library !== 'radix-ui';

  test.describe(`${library} progress demo`, () => {
    test('page load: the indicator starts at its value, no animation', async ({
      page,
    }) => {
      const frames = await loadDemo(page, library);
      // At 13% from the first frame (the server's), until the demo sets 66%.
      expect(frames[0]![1]).toBeCloseTo(FROM, 2);
      fromChange(frames);
      const { bar, track } = await page.locator(INDICATOR).evaluate((el) => ({
        bar: el.getBoundingClientRect().width,
        track: el.parentElement!.getBoundingClientRect().width,
      }));
      // Radix UI: full width, translated. Base UI / React Aria: its width.
      if (byWidth) expect(bar / track).toBeCloseTo(TO, 2);
      else expect(bar).toBeCloseTo(track, 0);
    });

    test('a new value springs there without overshooting', async ({ page }) => {
      const after = fromChange(await loadDemo(page, library));
      // Heading to 66% over several frames, never past it, never back down.
      const start = after[0]![0];
      const first = after
        .filter(([t]) => t - start <= 420)
        .map(([, value]) => value);
      expect(
        first.filter((v) => v > FROM + 0.01 && v < TO - 0.01).length,
      ).toBeGreaterThan(5);
      expect(Math.max(...after.map(([, v]) => v))).toBeLessThan(TO + 0.005);
      for (let i = 1; i < after.length; i++)
        expect(after[i]![1]).toBeGreaterThanOrEqual(after[i - 1]![1] - 0.002);
      // Seen on its way, from 10% to 90% of the way in the time the spring
      // takes (~200ms; 590ms on v1's).
      expect(first.some((v) => v > 0.3 && v < 0.55)).toBe(true);
      expectSpringPace(after, SPRING, {
        from: FROM,
        to: TO,
        a: FROM + (TO - FROM) * 0.1,
        b: FROM + (TO - FROM) * 0.9,
      });
    });

    test('it lands without a jump', async ({ page }) => {
      // Its last step is no bigger than the ones before it. Motion's default
      // rest (half a unit, here half a percent) cut a long crawl short: the
      // bar crept 0.02% of its track per frame, then jumped the last
      // 0.3-0.5% at once.
      const after = fromChange(await loadDemo(page, library));
      const steps = after
        .slice(1)
        .map(([, value], i) => value - after[i]![1])
        // Still frames (the layout rounds to 1/64px) don't count.
        .filter((step) => Math.abs(step) > 1e-6);
      const trace = steps.map((step) => (step * 100).toFixed(3)).join(' ');
      expect(steps.length).toBeGreaterThan(5);
      // Twice the step before (a frame dropped), and a 1/64px rounding.
      expect(Math.abs(steps.at(-1)!), trace).toBeLessThanOrEqual(
        Math.abs(steps.at(-2)!) * 2 + 0.0003,
      );
    });

    test('reduced motion: values apply at once', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const frames = await loadDemo(page, library);
      // At 13%, then at 66%, never in between.
      const between = frames.filter(
        ([, v]) => Math.abs(v - FROM) >= 0.01 && Math.abs(v - TO) >= 0.01,
      );
      expect(between).toEqual([]);
      expect(Math.abs(frames.at(-1)![1] - TO)).toBeLessThan(0.01);
    });
  });

  // shadcn's demo sets one value: the fixture steps through several, faster
  // than the spring settles.
  test.describe(`${library} progress, values in quick succession`, () => {
    test('values retarget mid-way, then settle on 100%', async ({ page }) => {
      await page.goto(`/tests/fixtures/${library}-progress`, {
        waitUntil: 'networkidle',
      });
      const button = page.getByRole('button', { name: 'Upload again' });
      await button.click();
      // 7 steps, 450ms apart, then it settles on 100%.
      await expect(button).toBeEnabled({ timeout: 6000 });
      await expect
        .poll(() => revealed(page, UPLOAD), { timeout: 3000 })
        .toBeGreaterThan(0.995);
    });
  });
}
