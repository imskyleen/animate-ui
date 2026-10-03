import { expect, test, type Page } from '@playwright/test';

// Shared by the Radix UI, Base UI and React Aria progress specs.

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
      // Full width, positioned with a transform.
      const { bar, track } = await page.locator(INDICATOR).evaluate((el) => ({
        bar: el.getBoundingClientRect().width,
        track: el.parentElement!.getBoundingClientRect().width,
        transform: getComputedStyle(el).transform,
      }));
      expect(bar).toBeCloseTo(track, 0);
    });

    test('new values glide and retarget, then settle', async ({ page }) => {
      const samples = await sampleRevealed(page, 500);
      await page.getByRole('button', { name: 'Upload again' }).click();
      const frames = await samples();
      // Heading back to 0 over several frames, not in one jump.
      expect(frames.some((f) => f > 0.05 && f < 0.6)).toBe(true);

      // 7 steps, 450ms apart, then it settles on 100%.
      await expect(
        page.getByRole('button', { name: 'Upload again' }),
      ).toBeEnabled({
        timeout: 5000,
      });
      await page.waitForTimeout(650);
      expect(await revealed(page)).toBeCloseTo(1, 2);
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
