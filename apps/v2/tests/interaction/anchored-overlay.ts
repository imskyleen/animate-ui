import { expect, test, type Page } from '@playwright/test';
import { probeFirstFrame, sample } from './motion-probe';

// The grading grid of an anchored overlay (popover, hover card, tooltip):
// shared by every library's demo spec.

export type OverlayCase = {
  /** Demo route, e.g. `/tests/demos/radix-ui/popover`. */
  path: string;
  /** The popup itself (the element shadcn/ui styles). */
  selector: string;
  open: (page: Page) => Promise<void>;
  close: (page: Page) => Promise<void>;
  /** Hover overlays wait for the library's close delay before they exit. */
  closeDelay?: number;
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

/** Budgets (ms): entrances settle by 600, exits by 400. */
export const ENTER_BUDGET = 650;
export const EXIT_BUDGET = 450;

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

/**
 * Starts watching the popup's exit, frame by frame: call it right before
 * closing, then await the result. `fadeMs` runs from the first frame below
 * full opacity to the frame it's gone (unmounted or hidden).
 */
export function recordExit(page: Page, selector: string, timeout = 3000) {
  return page.evaluate(
    ({ selector, timeout }) =>
      new Promise<{ sawFade: boolean; fadeMs: number; timedOut: boolean }>(
        (resolve) => {
          const t0 = performance.now();
          let fadeStart: number | undefined;
          let sawFade = false;
          const tick = () => {
            const el = document.querySelector<HTMLElement>(selector);
            const gone =
              !el ||
              getComputedStyle(el).visibility === 'hidden' ||
              el.closest('[hidden]') !== null;
            const t = performance.now();
            if (gone) {
              resolve({
                sawFade,
                fadeMs: fadeStart === undefined ? 0 : t - fadeStart,
                timedOut: false,
              });
              return;
            }
            const opacity = Number(getComputedStyle(el).opacity);
            if (opacity < 0.99 && fadeStart === undefined) fadeStart = t;
            if (opacity > 0.02 && opacity < 0.98) sawFade = true;
            if (t - t0 > timeout) {
              resolve({ sawFade, fadeMs: -1, timedOut: true });
              return;
            }
            requestAnimationFrame(tick);
          };
          tick();
        },
      ),
    { selector, timeout },
  );
}

export function describeAnchoredOverlay(name: string, c: OverlayCase) {
  test.describe(name, () => {
    test.describe.configure({ timeout: 180_000 });
    test.beforeEach(async ({ page }) => {
      await gotoReady(page, c.path);
    });

    test('enters from scale.enter with a fade, from the trigger', async ({
      page,
    }) => {
      const probe = await probeFirstFrame(page, c.selector);
      await c.open(page);
      const first = await probe.firstFrame();
      expect(first.scale).toBeGreaterThanOrEqual(0.94);
      expect(first.scale).toBeLessThan(1);
      expect(first.opacity).toBeLessThan(1);
      expect(await originIsAnchored(page, c.selector)).toBe(true);
    });

    test('settles within the budget', async ({ page }) => {
      await c.open(page);
      await page.locator(c.selector).first().waitFor();
      await page.waitForTimeout(ENTER_BUDGET);
      const settled = await sample(page, c.selector);
      expect(settled.opacity).toBe(1);
      expect(settled.scale).toBeCloseTo(1, 3);
    });

    test('exits faster than it enters, then unmounts', async ({ page }) => {
      await c.open(page);
      await page.locator(c.selector).first().waitFor();
      await page.waitForTimeout(ENTER_BUDGET);
      const exit = recordExit(page, c.selector, (c.closeDelay ?? 0) + 2000);
      await c.close(page);
      const result = await exit;
      expect(result.timedOut).toBe(false);
      expect(result.sawFade).toBe(true);
      expect(result.fadeMs).toBeLessThanOrEqual(EXIT_BUDGET);
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

/** A toolbar of tooltips (Bold, Italic, Underline): warm tooltips skip the entrance. */
export function describeWarmTooltips(
  name: string,
  path: string,
  selector: string,
) {
  test.describe(name, () => {
    test.describe.configure({ timeout: 180_000 });
    test.beforeEach(async ({ page }) => {
      await gotoReady(page, path);
    });

    test('the next tooltip along the toolbar appears at once', async ({
      page,
    }) => {
      await page.getByRole('button', { name: 'Bold' }).hover();
      await expect(page.locator(selector)).toBeVisible();
      await page.waitForTimeout(ENTER_BUDGET);
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
      expect(first.opacity).toBe(1);
      expect(first.scale).toBeCloseTo(1, 3);
    });

    test('reopening right after closing appears at once', async ({ page }) => {
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
      expect(first.opacity).toBe(1);
      expect(first.scale).toBeCloseTo(1, 3);
    });

    test('a cold tooltip plays its entrance again', async ({ page }) => {
      const bold = page.getByRole('button', { name: 'Bold' });
      await bold.hover();
      await expect(page.locator(selector)).toBeVisible();
      await page.mouse.move(5, 5, { steps: 4 });
      await expect(page.locator(selector)).toHaveCount(0);
      await page.waitForTimeout(1200);
      const probe = await probeFirstFrameOf(page, selector, 'Underline');
      await page.getByRole('button', { name: 'Underline' }).hover();
      const first = await probe.firstFrame();
      expect(first.opacity).toBeLessThan(1);
      expect(first.scale).toBeLessThan(1);
    });
  });
}
