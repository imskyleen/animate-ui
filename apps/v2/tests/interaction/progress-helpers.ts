import { expect, test, type Page } from '@playwright/test';

// Shared by the Radix UI, Base UI and React Aria progress specs. They move
// like Animate UI v1's progress: the indicator springs to a new value
// (stiffness 100, damping 30, no overshoot), its `x` for Radix UI (shadcn's
// translate) and its `width` for Base UI and React Aria.

export const INDICATOR = '[data-slot="progress-indicator"]';

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

export function describeProgressDemo(library: string) {
  // How the library sizes the indicator: v1 animated Radix's `x` and Base
  // UI's `width`; React Aria's bar is width-sized too.
  const byWidth = library !== 'radix-ui';

  test.describe(`${library} progress demo`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/tests/demos/${library}/progress`, {
        waitUntil: 'networkidle',
      });
    });

    test('page load: the indicator starts at its value, no animation', async ({
      page,
    }) => {
      expect(await revealed(page)).toBeCloseTo(0.64, 2);
      const { bar, track } = await page.locator(INDICATOR).evaluate((el) => ({
        bar: el.getBoundingClientRect().width,
        track: el.parentElement!.getBoundingClientRect().width,
      }));
      // Radix UI: full width, translated. Base UI / React Aria: its width.
      if (byWidth) expect(bar / track).toBeCloseTo(0.64, 2);
      else expect(bar).toBeCloseTo(track, 0);
    });

    test('a new value springs there without overshooting', async ({ page }) => {
      const samples = await sampleRevealed(page, 420);
      await page.getByRole('button', { name: 'Upload again' }).click();
      const frames = await samples();
      // Heading back to 0 over several frames (64% -> 0%, then 12% after
      // 450ms), never past it, never back up before the next step.
      const moving = frames.filter((f) => f > 0.01 && f < 0.63);
      expect(moving.length).toBeGreaterThan(5);
      expect(Math.min(...frames)).toBeGreaterThan(-0.005);
      for (let i = 1; i < frames.length; i++)
        expect(frames[i]!).toBeLessThanOrEqual(frames[i - 1]! + 0.002);
      // An overdamped spring: still well on its way after 150ms.
      expect(frames.some((f) => f > 0.15 && f < 0.5)).toBe(true);
    });

    test('values retarget mid-way, then settle on 100%', async ({ page }) => {
      await page.getByRole('button', { name: 'Upload again' }).click();
      // 7 steps, 450ms apart, then it settles on 100%.
      await expect(
        page.getByRole('button', { name: 'Upload again' }),
      ).toBeEnabled({
        timeout: 6000,
      });
      await expect
        .poll(() => revealed(page), { timeout: 3000 })
        .toBeGreaterThan(0.995);
    });

    test('reduced motion: values apply at once', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Upload again' }).click();
      await page.waitForTimeout(80);
      // Already at 0 or at the first step, never in between.
      const value = await revealed(page);
      expect(value < 0.01 || Math.abs(value - 0.12) < 0.01).toBe(true);
    });
  });
}
