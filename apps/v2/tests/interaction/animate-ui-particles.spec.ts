import { expect, test, type Page } from '../test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/particles', { waitUntil: 'networkidle' });

const particles = (page: Page) =>
  page.locator('.size-1.rounded-full.bg-red-500');

test.describe('animate-ui particles', () => {
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
    await expect(particles(page)).toHaveCount(6);
    await page.waitForTimeout(200);
    const closest = await particles(page).evaluateAll((els) => {
      const points = els.map((el) => {
        const r = el.getBoundingClientRect();
        return [r.x + r.width / 2, r.y + r.height / 2] as const;
      });
      let min = Infinity;
      for (let i = 0; i < points.length; i++)
        for (let j = i + 1; j < points.length; j++)
          min = Math.min(
            min,
            Math.hypot(
              points[i]![0] - points[j]![0],
              points[i]![1] - points[j]![1],
            ),
          );
      return min;
    });
    expect(closest).toBeGreaterThan(4);
  });

  test('every particle leaves the center, the one straight left too', async ({
    page,
  }) => {
    await open(page);
    const button = page.getByRole('button', { name: 'Like' });
    const box = (await button.boundingBox())!;
    const center = [box.x + box.width / 2, box.y + box.height / 2] as const;
    await button.click();
    await page.waitForTimeout(450);
    const distances = await particles(page).evaluateAll(
      (els, [cx, cy]) =>
        els.map((el) => {
          const r = el.getBoundingClientRect();
          return Math.hypot(r.x + r.width / 2 - cx, r.y + r.height / 2 - cy);
        }),
      center,
    );
    expect(Math.min(...distances)).toBeGreaterThan(12);
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
        () => (window as unknown as { __button: Element }).__button.isConnected,
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
