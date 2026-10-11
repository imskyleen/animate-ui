import { expect, test, type Page } from '@playwright/test';

import { sample } from './motion-probe';

const SELECTOR = '[data-slot="copy-button"]';

const open = async (page: Page) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/tests/demos/animate-ui/copy-button', {
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

type IconFrame = {
  icon: string;
  opacity: number;
  scale: number;
  blur: number;
  /** Distance between the icon's center and the button's, in px. */
  offset: number;
};

/** Every icon in the button, on every animation frame for `ms`. */
const recordIcons = (page: Page, ms: number) =>
  page.evaluate(
    ([sel, duration]) =>
      new Promise<IconFrame[][]>((resolve) => {
        const frames: IconFrame[][] = [];
        const start = performance.now();
        const tick = () => {
          frames.push(
            [
              ...document.querySelectorAll<HTMLElement>(`${sel} [data-icon]`),
            ].map((el) => {
              const cs = getComputedStyle(el);
              const box = el.getBoundingClientRect();
              const host = el.closest(sel)!.getBoundingClientRect();
              const m = cs.transform.match(/matrix\(([^,]+)/);
              const b = cs.filter.match(/blur\(([\d.]+)px\)/);
              return {
                icon: el.dataset.icon!,
                opacity: Number(cs.opacity),
                scale: m ? Number(m[1]) : 1,
                blur: b ? Number(b[1]) : 0,
                offset: Math.hypot(
                  box.x + box.width / 2 - (host.x + host.width / 2),
                  box.y + box.height / 2 - (host.y + host.height / 2),
                ),
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

const button = (page: Page) => page.locator(SELECTOR);
const icons = (page: Page) => button(page).locator('[data-icon]');

test.describe('animate-ui copy button', () => {
  test('copies its content, swaps to a check, then back after the delay', async ({
    page,
  }) => {
    await open(page);
    await expect(icons(page)).toHaveCount(1);
    await expect(icons(page)).toHaveAttribute('data-icon', 'copy');
    await expect(button(page)).not.toHaveAttribute('data-copied');

    await button(page).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'Hello world!',
    );
    await expect(button(page)).toHaveAttribute('data-copied', '');
    await expect(icons(page)).toHaveCount(1);
    await expect(icons(page)).toHaveAttribute('data-icon', 'copied');

    // Back after 3s.
    await page.waitForTimeout(2500);
    await expect(icons(page)).toHaveAttribute('data-icon', 'copied');
    await expect(button(page)).not.toHaveAttribute('data-copied', {
      timeout: 2000,
    });
    await expect(icons(page)).toHaveCount(1);
    await expect(icons(page)).toHaveAttribute('data-icon', 'copy');
  });

  test('nothing animates on mount', async ({ page }) => {
    await open(page);
    const frames = await recordIcons(page, 150);
    for (const frame of frames)
      expect(frame).toMatchObject([
        { icon: 'copy', opacity: 1, scale: 1, blur: 0 },
      ]);
  });

  test('the icons swap through half their size and a light blur', async ({
    page,
  }) => {
    await open(page);
    const recording = recordIcons(page, 400);
    await button(page).click();
    // Pressed again at once: the button scales while the icons swap.
    await page.mouse.down();
    const frames = await recording;
    await page.mouse.up();

    const copied = frames.flatMap((f) => f.filter((i) => i.icon === 'copied'));
    const copy = frames.flatMap((f) => f.filter((i) => i.icon === 'copy'));
    // The check grows out of half its size and a 2px blur...
    expect(Math.min(...copied.map((i) => i.scale))).toBeLessThan(0.75);
    expect(Math.min(...copied.map((i) => i.scale))).toBeGreaterThanOrEqual(
      0.5 - 1e-3,
    );
    expect(Math.max(...copied.map((i) => i.blur))).toBeGreaterThan(0.5);
    expect(Math.max(...copied.map((i) => i.blur))).toBeLessThanOrEqual(2);
    // ...while the copy icon leaves the same way, in place (both on screen).
    expect(frames.some((f) => f.length === 2)).toBe(true);
    const leaving = copy.filter((i) => i.opacity < 1);
    expect(leaving.length).toBeGreaterThan(0);
    expect(Math.min(...leaving.map((i) => i.scale))).toBeLessThan(0.9);
    // Both stay centered in the button: the leaving one doesn't jump.
    expect(Math.max(...frames.flat().map((i) => i.offset))).toBeLessThan(1);
    // It settles within 0.15s (plus the clipboard round trip): sharp, whole.
    expect(frames.at(-1)).toMatchObject([
      { icon: 'copied', opacity: 1, scale: 1, blur: 0 },
    ]);
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

  test('copying again restarts the delay', async ({ page }) => {
    await open(page);
    await button(page).click();
    await expect(button(page)).toHaveAttribute('data-copied', '');
    await page.waitForTimeout(2000);
    await page.evaluate(() => navigator.clipboard.writeText('changed'));
    await button(page).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'Hello world!',
    );
    // 2s after the first click + 1.5s: the delay restarted at the second.
    await page.waitForTimeout(1500);
    await expect(button(page)).toHaveAttribute('data-copied', '');
    await expect(button(page)).not.toHaveAttribute('data-copied', {
      timeout: 2500,
    });
  });

  test('reduced motion: the icons crossfade, the button does not scale', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const recording = recordIcons(page, 400);
    await button(page).click();
    const frames = await recording;
    const all = frames.flat();
    expect(all.every((i) => i.scale === 1 && i.blur === 0)).toBe(true);
    // Still a fade, not a cut.
    expect(all.some((i) => i.opacity > 0 && i.opacity < 1)).toBe(true);
    expect(frames.at(-1)).toMatchObject([
      { icon: 'copied', opacity: 1, scale: 1, blur: 0 },
    ]);

    await button(page).hover();
    await page.mouse.down();
    await page.waitForTimeout(200);
    expect((await sample(page, SELECTOR)).scale).toBe(1);
    await page.mouse.up();
  });
});
