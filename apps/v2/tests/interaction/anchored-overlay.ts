import { expect, test, type Page } from '../test';
import { probeFirstFrame } from './motion-probe';

export const HIDDEN_SCALE = { tooltip: 0.7, popover: 0.8, menu: 0.9 } as const;

export type OverlayCase = {
  path: string;
  selector: string;
  open: (page: Page) => Promise<void>;
  close: (page: Page) => Promise<void>;
  closeDelay?: number;
  kind?: 'popover' | 'tooltip';
};

export async function gotoReady(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'networkidle', timeout: 150_000 });
  await page.mouse.move(1, 1);
  await page.mouse.move(2, 2);
}

export const SETTLE_BUDGET = 900;
export const UNMOUNT_BUDGET = 1000;

export async function originIsAnchored(page: Page, selector: string) {
  return page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const [x = 0, y = 0] = getComputedStyle(el)
        .transformOrigin.split(' ')
        .map((v) => Number.parseFloat(v));
      const { offsetWidth: w, offsetHeight: h } = el as HTMLElement;
      return Math.abs(x - w / 2) > 1 || Math.abs(y - h / 2) > 1;
    });
}

export type Frame = {
  t: number;
  present: boolean;
  opacity: number;
  scale: number;
};

export function recordFrames(page: Page, selector: string, duration: number) {
  return page.evaluate(
    ({ selector, duration }) =>
      new Promise<Frame[]>((resolve) => {
        const frames: Frame[] = [];
        const t0 = performance.now();
        const tick = () => {
          const t = performance.now() - t0;
          const el = document.querySelector<HTMLElement>(selector);
          const hidden =
            !el ||
            getComputedStyle(el).visibility === 'hidden' ||
            el.closest('[hidden]') !== null;
          if (hidden) frames.push({ t, present: false, opacity: 0, scale: 0 });
          else {
            const cs = getComputedStyle(el);
            const match = cs.transform.match(/matrix\(([^,]+)/);
            frames.push({
              t,
              present: true,
              opacity: Number(cs.opacity),
              scale: match ? Number(match[1]) : 1,
            });
          }
          if (t < duration) requestAnimationFrame(tick);
          else resolve(frames);
        };
        tick();
      }),
    { selector, duration },
  );
}

const shown = (frames: Frame[]) => frames.filter((f) => f.present);

export function recordExit(page: Page, selector: string, timeout = 3000) {
  return page.evaluate(
    ({ selector, timeout }) =>
      new Promise<{
        sawFade: boolean;
        minScale: number;
        goneAt: number;
        timedOut: boolean;
      }>((resolve) => {
        const t0 = performance.now();
        let sawFade = false;
        let minScale = 1;
        const tick = () => {
          const el = document.querySelector<HTMLElement>(selector);
          const gone =
            !el ||
            getComputedStyle(el).visibility === 'hidden' ||
            el.closest('[hidden]') !== null;
          const t = performance.now() - t0;
          if (gone) {
            resolve({ sawFade, minScale, goneAt: t, timedOut: false });
            return;
          }
          const cs = getComputedStyle(el);
          const opacity = Number(cs.opacity);
          const match = cs.transform.match(/matrix\(([^,]+)/);
          const scale = match ? Number(match[1]) : 1;
          if (opacity > 0.02 && opacity < 0.98) sawFade = true;
          minScale = Math.min(minScale, scale);
          if (t > timeout) {
            resolve({ sawFade, minScale, goneAt: -1, timedOut: true });
            return;
          }
          requestAnimationFrame(tick);
        };
        tick();
      }),
    { selector, timeout },
  );
}

export type EntranceKind = 'tooltip' | 'popover' | 'menu' | 'fade';

export async function expectEntranceOnLoad(
  page: Page,
  path: string,
  selector: string,
  kind: EntranceKind,
  { reduced = false }: { reduced?: boolean } = {},
) {
  if (reduced) await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript((selector) => {
    const w = window as unknown as { __onLoad: [number, number][] };
    w.__onLoad = [];
    const tick = () => {
      const el = document.querySelector<HTMLElement>(selector);
      if (el) {
        const cs = getComputedStyle(el);
        const match = cs.transform.match(/matrix\(([^,]+)/);
        w.__onLoad.push([Number(cs.opacity), match ? Number(match[1]) : 1]);
      }
      if (w.__onLoad.length < 600) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, selector);
  await gotoReady(page, path);
  const popup = page.locator(selector).first();
  await expect(popup).toHaveCSS('opacity', '1', { timeout: 5000 });
  if (kind !== 'fade')
    await expect(popup).toHaveCSS('transform', 'none', { timeout: 5000 });
  const frames = await page.evaluate(
    () => (window as unknown as { __onLoad: [number, number][] }).__onLoad,
  );
  const scales = frames.map(([, scale]) => scale);
  const [firstOpacity, firstScale] = frames[0]!;

  expect(firstOpacity).toBeLessThan(0.5);
  expect(frames.some(([o]) => o > 0.02 && o < 0.98)).toBe(true);
  if (reduced || kind === 'fade') {
    expect(frames.filter(([o]) => o > 0.02).every(([, s]) => s === 1)).toBe(
      true,
    );
  } else if (kind === 'tooltip' || kind === 'popover') {
    const from = HIDDEN_SCALE[kind];
    expect(firstScale).toBeGreaterThanOrEqual(from - 0.01);
    expect(firstScale).toBeLessThan(from + 0.1);
    expect(Math.max(...scales)).toBeGreaterThan(1 + (1 - from) * 0.02);
    expect(Math.max(...scales)).toBeLessThan(1.05);
  } else {
    expect(firstScale).toBeGreaterThanOrEqual(HIDDEN_SCALE.menu - 0.01);
    expect(firstScale).toBeLessThan(0.97);
    expect(Math.max(...scales)).toBeLessThanOrEqual(1.001);
  }
}

export function describeAnchoredOverlay(name: string, c: OverlayCase) {
  const from = HIDDEN_SCALE[c.kind ?? 'popover'];
  test.describe(name, () => {
    test.describe.configure({ timeout: 180_000 });
    test.beforeEach(async ({ page }) => {
      await gotoReady(page, c.path);
    });

    test(`grows from ${from} with a fade, from the trigger`, async ({
      page,
    }) => {
      const probe = await probeFirstFrame(page, c.selector);
      await c.open(page);
      const first = await probe.firstFrame();
      expect(first.scale).toBeGreaterThanOrEqual(from - 0.01);
      expect(first.scale).toBeLessThan(from + 0.15);
      expect(first.opacity).toBeLessThan(1);
      expect(await originIsAnchored(page, c.selector)).toBe(true);
    });

    test('springs a little past full size, then settles', async ({ page }) => {
      await c.open(page);
      await page.locator(c.selector).first().waitFor();
      const frames = shown(await recordFrames(page, c.selector, SETTLE_BUDGET));
      const peak = Math.max(...frames.map((f) => f.scale));
      expect(peak).toBeGreaterThan(1 + (1 - from) * 0.02);
      expect(peak).toBeLessThan(1.05);
      const last = frames.at(-1)!;
      expect(last.opacity).toBe(1);
      expect(last.scale).toBeCloseTo(1, 2);
    });

    test(`shrinks back to ${from} with a fade, then unmounts`, async ({
      page,
    }) => {
      await c.open(page);
      await page.locator(c.selector).first().waitFor();
      await page.waitForTimeout(SETTLE_BUDGET);
      const exit = recordExit(page, c.selector, (c.closeDelay ?? 0) + 3000);
      await c.close(page);
      const result = await exit;
      expect(result.timedOut).toBe(false);
      expect(result.sawFade).toBe(true);
      expect(result.minScale).toBeLessThan(from + 0.05);
      expect(result.goneAt).toBeLessThanOrEqual(
        (c.closeDelay ?? 0) + UNMOUNT_BUDGET,
      );
      await expect(page.locator(c.selector)).toHaveCount(0);
    });

    test('reduced motion: fades in place, no scale', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const probe = await probeFirstFrame(page, c.selector);
      await c.open(page);
      const first = await probe.firstFrame();
      expect(first.scale).toBeCloseTo(1, 3);
      expect(first.opacity).toBeLessThan(1);
    });
  });
}

export async function probeFirstFrameOf(
  page: Page,
  selector: string,
  text: string,
) {
  await page.evaluate(
    ({ selector, text }) => {
      const w = window as unknown as { __firstFrameOf?: Promise<unknown> };
      w.__firstFrameOf = new Promise((resolve) => {
        const find = () =>
          [...document.querySelectorAll(selector)].find((el) =>
            el.textContent?.includes(text),
          );
        const observer = new MutationObserver(() => {
          const el = find();
          if (!el) return;
          observer.disconnect();
          requestAnimationFrame(() => {
            const cs = getComputedStyle(el);
            const match = cs.transform.match(/matrix\(([^,]+)/);
            resolve({
              opacity: Number(cs.opacity),
              scale: match ? Number(match[1]) : 1,
            });
          });
        });
        observer.observe(document.body, { childList: true, subtree: true });
      });
    },
    { selector, text },
  );
  return {
    firstFrame: () =>
      page.evaluate(
        () =>
          (window as unknown as { __firstFrameOf: Promise<unknown> })
            .__firstFrameOf,
      ) as Promise<{ opacity: number; scale: number }>,
  };
}

export function describeToolbarTooltips(
  name: string,
  path: string,
  selector: string,
) {
  const shows = (page: Page, text: string) =>
    page.evaluate(
      ({ selector, text }) =>
        [...document.querySelectorAll(selector)].some(
          (el) =>
            el.textContent?.includes(text) &&
            getComputedStyle(el).visibility !== 'hidden' &&
            Number(getComputedStyle(el).opacity) > 0.05,
        ),
      { selector, text },
    );

  test.describe(name, () => {
    test.describe.configure({ timeout: 180_000 });
    test.beforeEach(async ({ page }) => {
      await gotoReady(page, path);
    });

    test('the next tooltip along the toolbar shows at once, the previous one goes at once', async ({
      page,
    }) => {
      await page.getByRole('button', { name: 'Bold' }).hover();
      await expect(page.locator(selector)).toBeVisible();
      await page.waitForTimeout(SETTLE_BUDGET);
      const probe = await probeFirstFrameOf(page, selector, 'Italic');
      const box = (await page
        .getByRole('button', { name: 'Italic' })
        .boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
        steps: 8,
      });
      const first = await probe.firstFrame();
      expect(first.opacity).toBe(1);
      expect(first.scale).toBeCloseTo(1, 3);
      await expect
        .poll(() => shows(page, 'Bold'), { intervals: [16], timeout: 150 })
        .toBe(false);
    });

    test('once they have all gone, the next one plays its entrance again', async ({
      page,
    }) => {
      const bold = page.getByRole('button', { name: 'Bold' });
      const box = (await bold.boundingBox())!;
      await bold.hover();
      await expect(page.locator(selector)).toBeVisible();
      await page.mouse.move(5, 5, { steps: 2 });
      await expect(page.locator(selector)).toHaveCount(0);
      await page.waitForTimeout(100);
      const probe = await probeFirstFrameOf(page, selector, 'Bold');
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
        steps: 2,
      });
      const first = await probe.firstFrame();
      expect(first.opacity).toBeLessThan(1);
      expect(first.scale).toBeLessThan(0.8);
    });
  });
}
