import { expect, test, type Page } from '../test';

import { FRAMEWORKS, ready } from './animate-ui-frameworks';

for (const framework of FRAMEWORKS) {
  const open = (page: Page) =>
    page.goto(framework.demo('particles'), { waitUntil: 'networkidle' });

  const particles = (page: Page) =>
    page.locator('.size-1.rounded-full.bg-red-500');

  const centers = (page: Page) =>
    particles(page).evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return [r.x + r.width / 2, r.y + r.height / 2] as const;
      }),
    );

  async function landed(page: Page) {
    let last = '';
    await expect
      .poll(
        async () => {
          const now = JSON.stringify(
            (await centers(page)).map(([x, y]) => [
              Math.round(x),
              Math.round(y),
            ]),
          );
          const still = now === last && (await particles(page).count()) === 6;
          last = now;
          return still;
        },
        { intervals: [150] },
      )
      .toBe(true);
    return centers(page);
  }

  test.describe(`${framework.name} particles`, () => {
    test('nothing bursts until triggered', async ({ page }) => {
      await open(page);
      await expect(particles(page)).toHaveCount(0);
    });

    test('a like bursts the particles, which fade out', async ({ page }) => {
      await open(page);
      await page.getByRole('button', { name: 'Like' }).click();
      await expect(particles(page)).toHaveCount(6);
      await expect
        .poll(() =>
          particles(page).evaluateAll((els) =>
            els.map((el) => Number(getComputedStyle(el).opacity)),
          ),
        )
        .toEqual([0, 0, 0, 0, 0, 0]);
      await expect(page.getByRole('button', { name: 'Liked' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    test('a full circle spreads every particle apart: none lands on another', async ({
      page,
    }) => {
      await open(page);
      await page.getByRole('button', { name: 'Like' }).click();
      const points = await landed(page);
      let closest = Infinity;
      for (let i = 0; i < points.length; i++)
        for (let j = i + 1; j < points.length; j++)
          closest = Math.min(
            closest,
            Math.hypot(
              points[i]![0] - points[j]![0],
              points[i]![1] - points[j]![1],
            ),
          );
      expect(closest).toBeGreaterThan(4);
    });

    test('every particle leaves the center while it shows, the one straight left too', async ({
      page,
    }) => {
      await page.goto(`${framework.demo('particles')}?holdDelay=0`, {
        waitUntil: 'networkidle',
      });
      await page.evaluate(() => {
        const peaks: { x: number; y: number; opacity: number }[] = [];
        (window as unknown as { peaks: typeof peaks }).peaks = peaks;
        const start = performance.now();
        const tick = () => {
          document
            .querySelectorAll('.size-1.rounded-full.bg-red-500')
            .forEach((element, index) => {
              const opacity = Number(getComputedStyle(element).opacity);
              if (peaks[index] && peaks[index]!.opacity >= opacity) return;
              const box = element.getBoundingClientRect();
              peaks[index] = {
                x: box.x + box.width / 2,
                y: box.y + box.height / 2,
                opacity,
              };
            });
          if (performance.now() - start < 1500) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      await page.getByRole('button', { name: 'Like' }).click();
      const points = await landed(page);
      const cx = points.reduce((sum, [x]) => sum + x, 0) / points.length;
      const cy = points.reduce((sum, [, y]) => sum + y, 0) / points.length;
      const peaks = await page.evaluate(
        () =>
          (window as unknown as { peaks: { x: number; y: number }[] }).peaks,
      );
      expect(peaks).toHaveLength(6);
      const distances = peaks.map(({ x, y }) => Math.hypot(x - cx, y - cy));
      expect(Math.min(...distances)).toBeGreaterThan(10);
    });

    test('a like resizes the button smoothly, swaps the word and pops the heart', async ({
      page,
    }) => {
      await open(page);
      const button = page.getByRole('button', { name: 'Like' });
      await button.evaluate((el) => {
        const w = window as unknown as {
          __frames: { width: number; heart: number; words: number }[];
          __button: Element;
        };
        w.__frames = [];
        w.__button = el;
        const t0 = performance.now();
        const tick = () => {
          const svg = el.querySelector('svg')!.parentElement!;
          const m = getComputedStyle(svg).transform.match(/matrix\(([^,]+)/);
          w.__frames.push({
            width: el.getBoundingClientRect().width,
            heart: m ? Number(m[1]) : 1,
            words: el.querySelectorAll('[aria-hidden] > span > span').length,
          });
          if (performance.now() - t0 < 1500) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      const before = await button.evaluate(
        (el) => el.getBoundingClientRect().width,
      );
      await button.click();
      await page.waitForTimeout(700);
      const frames = await page.evaluate(
        () =>
          (
            window as unknown as {
              __frames: { width: number; heart: number; words: number }[];
            }
          ).__frames,
      );
      const after = frames.at(-1)!.width;
      expect(after).toBeGreaterThan(before + 3);
      const between = frames.filter(
        (f) => f.width > before + 0.5 && f.width < after - 0.5,
      );
      expect(between.length).toBeGreaterThan(4);
      expect(frames.some((f) => f.words === 2)).toBe(true);
      expect(frames.at(-1)!.words).toBe(1);
      expect(Math.max(...frames.map((f) => f.heart))).toBeGreaterThan(1.15);
      expect(frames.at(-1)!.heart).toBeCloseTo(1, 3);
      expect(
        await page.evaluate(
          () =>
            (window as unknown as { __button: Element }).__button.isConnected,
        ),
      ).toBe(true);
    });

    test('reduced motion: no burst', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page);
      await page.getByRole('button', { name: 'Like' }).click();
      await page.waitForTimeout(100);
      await expect(particles(page)).toHaveCount(0);
    });
  });
}
