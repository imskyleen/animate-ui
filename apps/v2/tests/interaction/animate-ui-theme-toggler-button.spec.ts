import { expect, test, type Page } from '@playwright/test';

import { sample } from './motion-probe';

const SELECTOR = '[data-slot="theme-toggler-button"]';

type IconFrame = {
  icon: string;
  opacity: number;
  scale: number;
  rotate: number;
  blur: number;
};

const open = async (page: Page, query = '') => {
  await page.addInitScript(() => {
    const w = window as unknown as {
      __transitions: number;
      __icons: IconFrame[][];
    };
    w.__transitions = 0;
    w.__icons = [];
    const original = document.startViewTransition?.bind(document);
    if (original)
      document.startViewTransition = ((cb: () => void) => {
        w.__transitions++;
        return original(cb);
      }) as typeof document.startViewTransition;
    const tick = () => {
      w.__icons.push(
        [
          ...document.querySelectorAll<HTMLElement>(
            '[data-slot="theme-toggler-button"] [data-icon]',
          ),
        ].map((el) => {
          const cs = getComputedStyle(el);
          const m = cs.transform.match(/matrix\(([^,]+),\s*([^,]+)/);
          const a = m ? Number(m[1]) : 1;
          const b = m ? Number(m[2]) : 0;
          const f = cs.filter.match(/blur\(([\d.]+)px\)/);
          return {
            icon: el.dataset.icon!,
            opacity: Number(cs.opacity),
            scale: Math.round(Math.hypot(a, b) * 1e4) / 1e4,
            rotate:
              Math.round(((Math.atan2(b, a) * 180) / Math.PI) * 100) / 100,
            blur: f ? Number(f[1]) : 0,
          };
        }),
      );
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.goto(`/tests/demos/animate-ui/theme-toggler-button${query}`, {
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
const transitions = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { __transitions: number }).__transitions,
  );
const takeIcons = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __icons: IconFrame[][] };
    const frames = w.__icons;
    w.__icons = [];
    return frames;
  });
const isDark = (page: Page) =>
  page.evaluate(() => document.documentElement.classList.contains('dark'));
const shown = (page: Page) => button(page).getAttribute('data-theme');

test.describe('animate-ui theme toggler button', () => {
  test('toggles light and dark at once, without a wipe', async ({ page }) => {
    await open(page);
    await expect(button(page)).toHaveAttribute('data-theme', 'light');
    await button(page).click();
    await expect(button(page)).toHaveAttribute('data-theme', 'dark');
    expect(await isDark(page)).toBe(true);
    await button(page).click();
    await expect(button(page)).toHaveAttribute('data-theme', 'light');
    expect(await isDark(page)).toBe(false);
    expect(await transitions(page)).toBe(0);
  });

  test('with system in its modes, cycles light, dark and system', async ({
    page,
  }) => {
    await open(page, '?system=true');
    await expect(button(page)).toHaveAttribute('data-theme', 'system');
    await button(page).click();
    await expect(button(page)).toHaveAttribute('data-theme', 'light');
    expect(await isDark(page)).toBe(false);
    await button(page).click();
    await expect(button(page)).toHaveAttribute('data-theme', 'dark');
    await expect.poll(() => isDark(page)).toBe(true);
    await button(page).click();
    await expect(button(page)).toHaveAttribute('data-theme', 'system');
    await expect.poll(() => isDark(page)).toBe(false);
  });

  test('the icon shows at rest on load, even when the theme resolves after hydrating', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await open(page);
    await expect(button(page)).toHaveAttribute('data-theme', 'dark');
    await page.waitForTimeout(300);
    const frames = (await takeIcons(page)).filter((f) => f.length);
    expect(frames.length).toBeGreaterThan(0);
    for (const frame of frames)
      for (const icon of frame)
        expect(icon).toMatchObject({
          opacity: 1,
          scale: 1,
          rotate: 0,
          blur: 0,
        });
    expect(frames.at(-1)).toEqual([
      { icon: 'dark', opacity: 1, scale: 1, rotate: 0, blur: 0 },
    ]);
  });

  test('a click swaps the icons through half their size and a light blur, turning them', async ({
    page,
  }) => {
    await open(page);
    await takeIcons(page);
    await button(page).click();
    await page.waitForTimeout(600);
    const frames = await takeIcons(page);
    const dark = frames.flat().filter((i) => i.icon === 'dark');
    const light = frames.flat().filter((i) => i.icon === 'light');
    expect(Math.min(...dark.map((i) => i.scale))).toBeLessThan(0.75);
    expect(Math.min(...dark.map((i) => i.scale))).toBeGreaterThanOrEqual(
      0.5 - 1e-3,
    );
    expect(Math.max(...dark.map((i) => i.blur))).toBeGreaterThan(0.5);
    expect(Math.max(...dark.map((i) => i.blur))).toBeLessThanOrEqual(2);
    expect(light.some((i) => i.opacity < 1 && i.scale < 0.9)).toBe(true);
    expect(Math.min(...dark.map((i) => i.rotate))).toBeLessThan(-45);
    expect(Math.min(...dark.map((i) => i.rotate))).toBeGreaterThanOrEqual(-90);
    expect(dark.every((i) => i.rotate <= 0.01)).toBe(true);
    const leaving = light.filter((i) => i.opacity < 1);
    expect(Math.max(...leaving.map((i) => i.rotate))).toBeGreaterThan(20);
    expect(leaving.every((i) => i.rotate >= -0.01)).toBe(true);
    const turning = frames.filter((f) =>
      f.some((i) => i.icon === 'dark' && i.rotate < -0.5),
    ).length;
    expect(turning).toBeGreaterThan(8);
    expect(frames.at(-1)).toEqual([
      { icon: 'dark', opacity: 1, scale: 1, rotate: 0, blur: 0 },
    ]);
    expect(await shown(page)).toBe('dark');
  });

  test('stays put on hover, shrinks while pressed', async ({ page }) => {
    await open(page);
    await button(page).hover();
    await page.waitForTimeout(300);
    expect((await sample(page, SELECTOR)).scale).toBe(1);
    await page.mouse.down();
    await expect
      .poll(async () => (await sample(page, SELECTOR)).scale)
      .toBeCloseTo(0.97, 3);
    await page.mouse.up();
    await expect
      .poll(async () => (await sample(page, SELECTOR)).scale)
      .toBeCloseTo(1, 3);
  });

  test('reduced motion: the icons crossfade without turning, no scale', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await takeIcons(page);
    await button(page).hover();
    await page.mouse.down();
    await page.waitForTimeout(200);
    expect((await sample(page, SELECTOR)).scale).toBe(1);
    await page.mouse.up();
    await expect.poll(() => isDark(page)).toBe(true);
    await page.waitForTimeout(400);
    expect(await transitions(page)).toBe(0);
    const all = (await takeIcons(page)).flat();
    expect(
      all.every((i) => i.scale === 1 && i.rotate === 0 && i.blur === 0),
    ).toBe(true);
    expect(all.some((i) => i.opacity > 0 && i.opacity < 1)).toBe(true);
  });
});
