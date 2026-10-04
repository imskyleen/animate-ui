import { expect, test, type Page } from '@playwright/test';
import { probeFirstFrame } from './motion-probe';

// The grading grid of an anchored overlay (popover, hover card, tooltip):
// shared by every library's demo spec.

/**
 * Where each kind of anchored popup grows from: tooltips from 0.7, popovers
 * (hover cards, preview cards) from 0.8, menus from 0.9.
 */
export const HIDDEN_SCALE = { tooltip: 0.7, popover: 0.8, menu: 0.9 } as const;

export type OverlayCase = {
  /** Demo route, e.g. `/tests/demos/radix-ui/popover`. */
  path: string;
  /** The popup itself (the element shadcn/ui styles). */
  selector: string;
  open: (page: Page) => Promise<void>;
  close: (page: Page) => Promise<void>;
  /** Hover overlays wait for the library's close delay before they exit. */
  closeDelay?: number;
  /** Tooltips grow from 0.7, the others from 0.8. */
  kind?: 'popover' | 'tooltip';
};

/**
 * Opens a route once it's hydrated. Generous timeout: the dev server compiles
 * routes on first visit, and other suites share it.
 */
export async function gotoReady(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'networkidle', timeout: 150_000 });
  // React Aria learns the input modality from pointer moves; a mouse that
  // jumps straight onto a trigger would hover it before it knows.
  await page.mouse.move(1, 1);
  await page.mouse.move(2, 2);
}

/**
 * The popover and tooltip spring (stiffness 300, damping 25): it overshoots by
 * ~4% of its travel around 260ms and settles by ~500ms, both ways. Budgets
 * leave room for a loaded machine.
 */
export const SETTLE_BUDGET = 900;
export const UNMOUNT_BUDGET = 1000;

/** True when the transform origin is off-centre (anchored to the trigger). */
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

/**
 * Starts recording the popup frame by frame (its computed opacity and scale)
 * for `duration` ms: call it right before the interaction, then await it.
 */
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

/**
 * Starts watching the popup's exit, frame by frame: call it right before
 * closing, then await the result. `goneAt` is when it unmounted (or hid).
 */
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

/**
 * How an overlay enters: the tooltip and popover spring (from 0.7 or 0.8,
 * with an overshoot), the menus' timing (from 0.9 in 200ms, ease-out), or a
 * fade alone (lists laid over their trigger).
 */
export type EntranceKind = 'tooltip' | 'popover' | 'menu' | 'fade';

/**
 * Loads `path` and checks that the popup open from the start (`defaultOpen`)
 * plays v1's entrance on page load. It's recorded frame by frame from its
 * first frame in the DOM (an init script, before anything hydrates).
 * `reduced`: under reduced motion, it only fades.
 */
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
  // Settled: Motion writes `transform: none` once the scale is back to 1.
  if (kind !== 'fade')
    await expect(popup).toHaveCSS('transform', 'none', { timeout: 5000 });
  const frames = await page.evaluate(
    () => (window as unknown as { __onLoad: [number, number][] }).__onLoad,
  );
  const scales = frames.map(([, scale]) => scale);
  const [firstOpacity, firstScale] = frames[0]!;

  // It appears transparent, then fades in: not at full opacity at once.
  expect(firstOpacity).toBeLessThan(0.5);
  expect(frames.some(([o]) => o > 0.02 && o < 0.98)).toBe(true);
  if (reduced || kind === 'fade') {
    // No scale while it can be seen (a popup rendered on the server starts
    // from its hidden scale, transparent, until it hydrates).
    expect(frames.filter(([o]) => o > 0.02).every(([, s]) => s === 1)).toBe(
      true,
    );
  } else if (kind === 'tooltip' || kind === 'popover') {
    // From its hidden scale, past full size (the spring's overshoot), back
    // to 1.
    const from = HIDDEN_SCALE[kind];
    expect(firstScale).toBeGreaterThanOrEqual(from - 0.01);
    expect(firstScale).toBeLessThan(from + 0.1);
    expect(Math.max(...scales)).toBeGreaterThan(1 + (1 - from) * 0.02);
    expect(Math.max(...scales)).toBeLessThan(1.05);
  } else {
    // From 0.9, without overshoot (an ease-out tween).
    expect(firstScale).toBeGreaterThanOrEqual(HIDDEN_SCALE.menu - 0.01);
    expect(firstScale).toBeLessThan(0.97);
    expect(Math.max(...scales)).toBeLessThanOrEqual(1.001);
  }
}

/**
 * The grading grid of a popover, hover card or tooltip. It grows (a tooltip
 * from 0.7, the others from 0.8) and fades in from its trigger on a spring
 * that overshoots a little, and shrinks back the same way.
 */
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
      // The spring's overshoot (~4% of the way), not an ease that stops at 1.
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
      // The same spring, down to its hidden scale.
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

/**
 * Like `probeFirstFrame`, for the first element matching `selector` whose
 * text includes `text` (several popups of the same kind can be mounted).
 */
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

/**
 * A toolbar of tooltips (Bold, Italic, Underline). As in Animate UI v1, every
 * tooltip plays its entrance: moving along the toolbar, the next one grows in
 * while the previous one shrinks away.
 */
export function describeToolbarTooltips(
  name: string,
  path: string,
  selector: string,
) {
  test.describe(name, () => {
    test.describe.configure({ timeout: 180_000 });
    test.beforeEach(async ({ page }) => {
      await gotoReady(page, path);
    });

    test('the next tooltip along the toolbar plays its entrance', async ({
      page,
    }) => {
      await page.getByRole('button', { name: 'Bold' }).hover();
      await expect(page.locator(selector)).toBeVisible();
      await page.waitForTimeout(SETTLE_BUDGET);
      const probe = await probeFirstFrameOf(page, selector, 'Italic');
      // A real sweep: Radix ignores a single jump while the pointer is in
      // transit towards the previous tooltip.
      const box = (await page
        .getByRole('button', { name: 'Italic' })
        .boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
        steps: 8,
      });
      const first = await probe.firstFrame();
      expect(first.opacity).toBeLessThan(1);
      expect(first.scale).toBeLessThan(0.8);
    });

    test('reopening right after closing plays the entrance again', async ({
      page,
    }) => {
      const bold = page.getByRole('button', { name: 'Bold' });
      const box = (await bold.boundingBox())!;
      await bold.hover();
      await expect(page.locator(selector)).toBeVisible();
      await page.mouse.move(5, 5, { steps: 2 });
      await expect(page.locator(selector)).toHaveCount(0);
      const probe = await probeFirstFrameOf(page, selector, 'Bold');
      // Straight back (no actionability checks in between).
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
        steps: 2,
      });
      const first = await probe.firstFrame();
      expect(first.opacity).toBeLessThan(1);
      expect(first.scale).toBeLessThan(0.8);
    });
  });
}
