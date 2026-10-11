import { expect, test, type Page } from '@playwright/test';

import { sample } from './motion-probe';

const SELECTOR = '[data-slot="theme-toggler-button"]';

type Wipe = { duration: number; easing: string; from: string };
type IconFrame = { icon: string; opacity: number; scale: number; blur: number };

/**
 * Counts the view transitions the button starts, records its wipes, and
 * records the button's icons on every frame from the start of the page.
 */
const open = async (page: Page, query = '') => {
  await page.addInitScript(() => {
    const w = window as unknown as {
      __transitions: number;
      __wipes: Wipe[];
      __icons: IconFrame[][];
    };
    w.__transitions = 0;
    w.__wipes = [];
    w.__icons = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (keyframes, options) {
      if (
        typeof options === 'object' &&
        options.pseudoElement === '::view-transition-new(root)'
      ) {
        const frames = keyframes as { clipPath: string[] };
        w.__wipes.push({
          duration: Number(options.duration),
          easing: String(options.easing),
          from: frames.clipPath[0]!,
        });
      }
      return animate.call(this, keyframes, options);
    };
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
          const m = cs.transform.match(/matrix\(([^,]+)/);
          const b = cs.filter.match(/blur\(([\d.]+)px\)/);
          return {
            icon: el.dataset.icon!,
            opacity: Number(cs.opacity),
            scale: m ? Number(m[1]) : 1,
            blur: b ? Number(b[1]) : 0,
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

/** Resolves once React has hydrated `selector`: its handlers and effects are live. */
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
const wipes = (page: Page) =>
  page.evaluate(() => (window as unknown as { __wipes: Wipe[] }).__wipes);
/** The icon frames recorded since the page started, then clears them. */
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
  test('toggles light and dark, wiping the new theme in', async ({ page }) => {
    await open(page);
    // System, light here: the button shows the theme on screen.
    await expect(button(page)).toHaveAttribute('data-theme', 'light');
    await button(page).click();
    await expect(button(page)).toHaveAttribute('data-theme', 'dark');
    await expect.poll(() => isDark(page)).toBe(true);
    await expect.poll(async () => (await wipes(page)).length).toBe(1);
    expect((await wipes(page))[0]).toEqual({
      duration: 700,
      easing: 'ease-in-out',
      from: 'inset(0 100% 0 0)',
    });
    // Let the wipe end before toggling back.
    await page.waitForTimeout(900);
    await button(page).click();
    await expect(button(page)).toHaveAttribute('data-theme', 'light');
    await expect.poll(() => isDark(page)).toBe(false);
    expect(await transitions(page)).toBe(2);
  });

  test('wipes in the direction it is given', async ({ page }) => {
    await open(page, '?direction=rtl');
    await button(page).click();
    await expect.poll(async () => (await wipes(page)).length).toBe(1);
    expect((await wipes(page))[0]!.from).toBe('inset(0 0 0 100%)');
  });

  test('with system in its modes, cycles light, dark and system', async ({
    page,
  }) => {
    await open(page, '?system=true');
    await expect(button(page)).toHaveAttribute('data-theme', 'system');
    await button(page).click();
    await expect(button(page)).toHaveAttribute('data-theme', 'light');
    // System was light already: nothing changes on screen.
    expect(await isDark(page)).toBe(false);
    await page.waitForTimeout(900);
    await button(page).click();
    await expect(button(page)).toHaveAttribute('data-theme', 'dark');
    await expect.poll(() => isDark(page)).toBe(true);
    await page.waitForTimeout(900);
    await button(page).click();
    await expect(button(page)).toHaveAttribute('data-theme', 'system');
    await expect.poll(() => isDark(page)).toBe(false);
  });

  test('the icon shows at rest on load, even when the theme resolves after hydrating', async ({
    page,
  }) => {
    // Dark system theme: the server rendered the light icon.
    await page.emulateMedia({ colorScheme: 'dark' });
    await open(page);
    await expect(button(page)).toHaveAttribute('data-theme', 'dark');
    await page.waitForTimeout(300);
    const frames = (await takeIcons(page)).filter((f) => f.length);
    expect(frames.length).toBeGreaterThan(0);
    for (const frame of frames)
      for (const icon of frame)
        expect(icon).toMatchObject({ opacity: 1, scale: 1, blur: 0 });
    expect(frames.at(-1)).toEqual([
      { icon: 'dark', opacity: 1, scale: 1, blur: 0 },
    ]);
  });

  test('a click swaps the icons through half their size and a light blur', async ({
    page,
  }) => {
    await open(page);
    await takeIcons(page);
    await button(page).click();
    await page.waitForTimeout(500);
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
    expect(frames.at(-1)).toEqual([
      { icon: 'dark', opacity: 1, scale: 1, blur: 0 },
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

  test('reduced motion: switches at once, the icons crossfade, no scale', async ({
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
    expect(all.every((i) => i.scale === 1 && i.blur === 0)).toBe(true);
    expect(all.some((i) => i.opacity > 0 && i.opacity < 1)).toBe(true);
  });
});
