import { expect, test, type Page } from '../test';

import { sample } from './motion-probe';

const SELECTOR = '[data-slot="icon-button"]';

const open = async (page: Page) => {
  await page.goto('/tests/demos/animate-ui/icon-button', {
    waitUntil: 'networkidle',
  });
  await hydrated(page, SELECTOR);
};

async function hydrated(page: Page, selector: string) {
  await page.waitForFunction((sel) => {
    const el = document.querySelector(sel);
    return (
      !!el && Object.keys(el).some((key) => key.startsWith('__reactProps'))
    );
  }, selector);
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

const button = (page: Page) => page.locator(SELECTOR);
const particles = (page: Page) =>
  button(page).locator('[data-slot="icon-button-particles"] > div');

type Particle = { x: number; y: number; opacity: number };

const recordParticles = (page: Page, ms: number) =>
  page.evaluate(
    ([sel, duration]) =>
      new Promise<Particle[][]>((resolve) => {
        const frames: Particle[][] = [];
        const start = performance.now();
        const tick = () => {
          const host = document.querySelector(sel)!.getBoundingClientRect();
          frames.push(
            [
              ...document.querySelectorAll<HTMLElement>(
                `${sel} [data-slot="icon-button-particles"] > div`,
              ),
            ].map((el) => {
              const box = el.getBoundingClientRect();
              return {
                x: box.x + box.width / 2 - (host.x + host.width / 2),
                y: box.y + box.height / 2 - host.y,
                opacity: Number(getComputedStyle(el).opacity),
              };
            }),
          );
          if (performance.now() - start < duration) requestAnimationFrame(tick);
          else resolve(frames);
        };
        requestAnimationFrame(tick);
      }),
    [SELECTOR, ms] as const,
  );

test.describe('animate-ui icon button', () => {
  test('nothing bursts until clicked', async ({ page }) => {
    await open(page);
    await page.waitForTimeout(300);
    await expect(particles(page)).toHaveCount(0);
  });

  test('a click bursts 6 particles from the top edge, which fly out and fade', async ({
    page,
  }) => {
    await open(page);
    const recording = recordParticles(page, 1300);
    await button(page).click();
    const frames = await recording;
    const bursting = frames.filter((f) => f.length > 0);
    expect(bursting.length).toBeGreaterThan(0);
    expect(Math.max(...bursting.map((f) => f.length))).toBe(6);
    const reach = Math.max(...bursting.flat().map((p) => Math.hypot(p.x, p.y)));
    expect(reach).toBeGreaterThan(20);
    expect(reach).toBeLessThan(34);
    const ys = bursting.flat().map((p) => p.y);
    expect(Math.max(...ys)).toBeGreaterThan(15);
    expect(Math.min(...ys)).toBeLessThan(-15);
    expect(bursting.flat().some((p) => p.opacity > 0.5)).toBe(true);
    await expect
      .poll(() =>
        particles(page).evaluateAll((els) =>
          els.map((el) => Number(getComputedStyle(el).opacity)),
        ),
      )
      .toEqual([0, 0, 0, 0, 0, 0]);
  });

  test('a second click empties the heart without a burst, a third bursts again', async ({
    page,
  }) => {
    await open(page);
    await button(page).click();
    await expect(button(page)).toHaveAttribute('aria-pressed', 'true');
    await expect(button(page).locator('svg')).toHaveCSS('fill', /^lab\(55/);
    await expect
      .poll(() =>
        particles(page).evaluateAll((els) =>
          els.map((el) => Number(getComputedStyle(el).opacity)),
        ),
      )
      .toEqual([0, 0, 0, 0, 0, 0]);
    const quiet = recordParticles(page, 400);
    await button(page).click();
    expect((await quiet).flat().every((p) => p.opacity === 0)).toBe(true);
    await expect(button(page)).toHaveAttribute('aria-pressed', 'false');
    await expect(button(page).locator('svg')).toHaveCSS(
      'fill',
      'rgba(0, 0, 0, 0)',
    );
    const recording = recordParticles(page, 400);
    await button(page).click();
    const frames = await recording;
    expect(frames.flat().some((p) => p.opacity > 0.2)).toBe(true);
  });

  test('the burst does not replay the press: the button keeps its scale spring', async ({
    page,
  }) => {
    await open(page);
    await button(page).hover();
    await page.waitForTimeout(300);
    expect((await sample(page, SELECTOR)).scale).toBe(1);
    await page.mouse.down();
    await expect
      .poll(async () => (await sample(page, SELECTOR)).scale)
      .toBeCloseTo(0.97, 3);
    const scales = page.evaluate(
      ([sel]) =>
        new Promise<number[]>((resolve) => {
          const el = document.querySelector(sel)!;
          const values: number[] = [];
          const start = performance.now();
          const tick = () => {
            const m = getComputedStyle(el).transform.match(/matrix\(([^,]+)/);
            values.push(m ? Number(m[1]) : 1);
            if (performance.now() - start < 300) requestAnimationFrame(tick);
            else resolve(values);
          };
          requestAnimationFrame(tick);
        }),
      [SELECTOR] as const,
    );
    await page.mouse.up();
    const values = await scales;
    expect(values.some((v) => v > 0.971 && v < 0.999)).toBe(true);
    expect(Math.min(...values)).toBeGreaterThan(0.969);
    await expect
      .poll(async () => (await sample(page, SELECTOR)).scale)
      .toBeCloseTo(1, 3);
    await expect(particles(page)).toHaveCount(6);
  });

  test('reduced motion: no burst, no scale', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await button(page).hover();
    await page.mouse.down();
    await page.waitForTimeout(200);
    expect((await sample(page, SELECTOR)).scale).toBe(1);
    await page.mouse.up();
    await page.waitForTimeout(200);
    await expect(particles(page)).toHaveCount(0);
  });
});
