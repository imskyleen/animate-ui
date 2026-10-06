import { expect, test, type Page } from '@playwright/test';

import {
  DISMISS_CURVE,
  DRAWER_CURVE,
  OVERLAY_CURVE,
  OVERLAY_EXIT_CURVE,
  halfwayTimes,
  expectClearBeforeUnmount,
  expectDialogLikeOverlay,
  expectDrawerEntrance,
  expectDrawerExit,
  expectProgressiveOverlay,
  expectShadowLifts,
  expectSheetSettled,
  expectThrown,
  present,
  readState,
  recordTimeline,
  seenBlur,
} from './modal-timeline';
import { expectCssCurve } from './spring-curves';

// The drawer slides opaque, run by CSS transitions: in 0.4s with a hint of
// bounce (cubic-bezier(0.34, 1.2, 0.64, 1), a hair past its rest), out like
// a dismissed dialog (0.2s, a steady push, without crawling), thrown by a
// swipe at the finger's speed (linear); its shadow lifts off the page with
// it. Its backdrop comes in and clears like a dialog's overlay: its tint and
// backdrop blur (as seen) grow from 0 (never its opacity) in 400ms on CSS's
// `ease` (250ms clearing), follow the swipe, and are clear before the
// drawer unmounts.

const POPUP = '[data-slot="drawer-popup"]';
const OVERLAY = '[data-slot="drawer-overlay"]';
const HANDLE = '[data-slot="drawer-swipe-handle"]';

/**
 * Reads, as soon as Base UI marks `selector` as ending, the first duration
 * and the timing function of its CSS transitions: call before closing, await
 * the result after.
 */
async function endingTiming(page: Page, selector: string) {
  const key = `__ending${selector.replace(/\W/g, '')}`;
  await page.locator(selector).evaluate((el, key) => {
    (window as unknown as Record<string, Promise<unknown>>)[key] = new Promise(
      (resolve) => {
        const observer = new MutationObserver(() => {
          if (!el.hasAttribute('data-ending-style')) return;
          observer.disconnect();
          const cs = getComputedStyle(el);
          resolve({
            duration: cs.transitionDuration.split(',')[0]!.trim(),
            easing: cs.transitionTimingFunction,
            swipe: el.hasAttribute('data-swipe-dismiss'),
          });
        });
        observer.observe(el, { attributes: true });
      },
    );
  }, key);
  return async () =>
    (await page.evaluate(
      (key) => (window as unknown as Record<string, Promise<unknown>>)[key],
      key,
    )) as { duration: string; easing: string; swipe: boolean };
}

/** The first duration and the timing function of its CSS transitions. */
const timing = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        duration: cs.transitionDuration.split(',')[0]!.trim(),
        easing: cs.transitionTimingFunction,
      };
    });

/**
 * The demo backdrop's classes (shadcn/ui's rhea style, like its docs):
 * `bg-black/30`, `backdrop-blur-sm`.
 */
const REST = { bg: 0.3, blur: 8 };
/** The demo popup's `shadow-xl`: the strongest alpha of its colors. */
const SHADOW = 0.1;

/** Horizontal/vertical offset in px, and opacity. */
const state = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const cs = getComputedStyle(el);
      const m = new DOMMatrix(cs.transform);
      return { x: m.m41, y: m.m42, opacity: Number(cs.opacity) };
    });

// The demo's drawer floats at the right by default (its `direction`), inset
// from the edges; `direction` also brings it from the bottom.
const SIDES = [
  { side: 'right', query: '', axis: 'x', swipe: 'right' },
  { side: 'bottom', query: '?direction=bottom', axis: 'y', swipe: 'down' },
] as const;

for (const { side, query, axis, swipe } of SIDES) {
  test.describe(`base-ui drawer demo, from the ${side}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/tests/demos/base-ui/drawer${query}`, {
        waitUntil: 'networkidle',
      });
    });

    const open = async (page: Page) => {
      await page.getByRole('button', { name: 'Open Drawer' }).click();
      await expectSheetSettled(page, POPUP, side);
      // Past its bounce and its backdrop's fade, which end at 400ms.
      await page.waitForTimeout(400);
    };

    test(`slides in opaque from the ${side} edge with a hint of bounce, its backdrop tinting and blurring the page from 0 like a dialog's`, async ({
      page,
    }) => {
      const timeline = await recordTimeline(page, {
        content: POPUP,
        overlay: OVERLAY,
      });
      await open(page);
      const frames = await timeline.stop();
      await expect(page.locator(POPUP)).toHaveAttribute(
        'data-swipe-direction',
        swipe,
      );
      expectDrawerEntrance(frames, side);
      // Its shadow lifts off the page with it, from none.
      expectShadowLifts(frames, SHADOW);

      // Its backdrop, from nothing, gently, just behind the drawer, which
      // answers at once: half way in a little after it.
      const backdrop = present(frames, 'overlay');
      expect(backdrop[0]!.samples.overlay!.bg).toBeLessThan(REST.bg * 0.1);
      expect(backdrop[0]!.samples.overlay!.backdrop).toBeLessThan(
        REST.blur * 0.1,
      );
      expectProgressiveOverlay(frames, REST);
      expectDialogLikeOverlay(frames, { rest: REST.bg });
      const halfway = halfwayTimes(frames, { axis, rest: REST.bg });
      expect(halfway.overlay - halfway.drawer).toBeGreaterThan(-20);
      expect(halfway.overlay - halfway.drawer).toBeLessThan(140);
      const rest = await readState(page, OVERLAY);
      expect(rest.opacity).toBe(1);
      expect(rest.bg).toBeCloseTo(REST.bg, 3);
      expect(rest.backdrop).toBe(REST.blur);

      // As CSS: the drawer's curve, and a dialog overlay's.
      expectCssCurve(await timing(page, POPUP), DRAWER_CURVE);
      expectCssCurve(await timing(page, OVERLAY), OVERLAY_CURVE);
    });

    test("closes quicker than it came, speeding off its edge without crawling, opaque, its backdrop clearing ahead of it like a dialog's, then unmounts", async ({
      page,
    }) => {
      await open(page);
      const popupExit = await endingTiming(page, POPUP);
      const backdropExit = await endingTiming(page, OVERLAY);
      const timeline = await recordTimeline(page, {
        content: POPUP,
        overlay: OVERLAY,
      });
      await page.keyboard.press('Escape');
      // As CSS: a dismissed dialog's curve, and a dialog overlay's.
      expectCssCurve(await popupExit(), DISMISS_CURVE);
      expectCssCurve(await backdropExit(), OVERLAY_EXIT_CURVE);
      await expect(page.locator(POPUP)).toHaveCount(0, { timeout: 2500 });
      const frames = await timeline.stop();
      expectDrawerExit(frames, side);
      // The backdrop clears like a dialog's, its tint and blur together,
      // ahead of the drawer speeding away, and the drawer waits for it: it's
      // clear before the drawer unmounts (Base UI cut it short at 6%, the
      // page snapping back sharp).
      expectProgressiveOverlay(frames, REST);
      expectDialogLikeOverlay(frames, { rest: REST.bg, leaving: true, axis });
      expectClearBeforeUnmount(frames, REST);
      // Its shadow goes down with it, to none.
      expectShadowLifts(frames, SHADOW, { leaving: true });
    });

    test('reduced motion: fades in place', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const timeline = await recordTimeline(page, { content: POPUP });
      await open(page);
      const first = present(await timeline.stop(), 'content')[0]!.samples
        .content!;
      expect(Math.abs(first[axis])).toBeLessThan(0.002);
      expect(first.opacity).toBeLessThan(1);
    });
  });
}

// On a phone, shadcn/ui's demo brings the drawer from the bottom with a swipe
// handle: the mouse swipes it from there (Base UI leaves a mouse drag that
// starts on Drawer.Content to text selection; on desktop there's no handle).
test.describe('base-ui drawer demo, on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/drawer', {
      waitUntil: 'networkidle',
    });
    await page.getByRole('button', { name: 'Open Drawer' }).click();
    await expectSheetSettled(page, POPUP, 'bottom');
    await expect(page.locator(POPUP)).toHaveAttribute(
      'data-swipe-direction',
      'down',
    );
  });

  test('a drag follows the finger at once; a slow release springs back', async ({
    page,
  }) => {
    const box = (await page.locator(HANDLE).boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) {
      await page.mouse.move(x, y + i * 8);
      await page.waitForTimeout(32);
    }
    // No lag: the popup sits where the finger is, on the same frame.
    const dragged = await state(page, POPUP);
    expect(dragged.y).toBeGreaterThan(60);
    expect(dragged.y).toBeLessThan(100);
    expect(dragged.opacity).toBe(1);
    // The backdrop follows the swipe progress without lag too: its tint and
    // its blur as seen, never its opacity.
    const swiped = await readState(page, OVERLAY);
    expect(swiped.opacity).toBe(1);
    expect(swiped.bg).toBeLessThan(REST.bg * 0.95);
    expect(swiped.bg).toBeGreaterThan(REST.bg * 0.3);
    expect(
      Math.abs(
        seenBlur(swiped.backdrop) / seenBlur(REST.blur) - swiped.bg / REST.bg,
      ),
    ).toBeLessThan(0.08);

    // Hold still, then let go: not a flick, so it springs back up, through
    // the positions in between (recorded in the page: a busy machine can't
    // miss them).
    await page.waitForTimeout(150);
    const timeline = await recordTimeline(page, { content: POPUP });
    await page.mouse.up();
    await expectSheetSettled(page, POPUP, 'bottom');
    const { height } = (await page.locator(POPUP).boundingBox())!;
    const back = present(await timeline.stop(), 'content').map(
      (frame) => frame.samples.content!.y * height,
    );
    expect(back.some((y) => y > 5 && y < dragged.y - 5)).toBe(true);
    await expect(page.locator(POPUP)).toHaveCount(1);
  });

  test("a flick throws it out at the finger's speed: linear, never stalling or crawling", async ({
    page,
  }) => {
    // 40% of its height, short of the half that dismisses a slow swipe: its
    // speed dismisses it.
    const { height } = (await page.locator(POPUP).boundingBox())!;
    const distance = Math.round(height * 0.4);
    const box = (await page.locator(HANDLE).boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    // Recording from before the swipe: nothing may slow the flick down.
    const exit = await endingTiming(page, POPUP);
    const timeline = await recordTimeline(page, { content: POPUP });
    await page.mouse.move(x, y);
    await page.mouse.down();
    // Base UI times the swipe from its first move: a nudge starts it, then
    // the flick, its moves back to back (a busy machine can't slow it down
    // into a drag).
    await page.mouse.move(x, y + 2);
    await page.mouse.move(x, y + 2 + distance / 2);
    await page.mouse.move(x, y + 2 + distance);
    await page.mouse.up();
    // Linear, over the time the rest of the way takes at the finger's speed
    // (Base UI's swipe strength, a share of 360ms).
    const timing = await exit();
    expect(timing.swipe).toBe(true);
    expect(timing.easing.split(', ')[0]).toBe('linear');
    expect(parseFloat(timing.duration)).toBeGreaterThan(0);
    expect(parseFloat(timing.duration)).toBeLessThanOrEqual(0.36);
    await expect(page.locator(POPUP)).toHaveCount(0, { timeout: 2500 });
    expectThrown(await timeline.stop(), 'bottom', (distance + 2) / height);
  });
});

test.describe('base-ui drawer demo: confirming', () => {
  test('a picked time is confirmed: the drawer slides out, then a toast', async ({
    page,
  }) => {
    await page.goto('/tests/demos/base-ui/drawer', {
      waitUntil: 'networkidle',
    });
    await page.getByRole('button', { name: 'Open Drawer' }).click();
    await expectSheetSettled(page, POPUP, 'right');
    await page.getByText('6:00 PM – 6:15 PM').click();
    await expect(page.getByRole('radio', { name: /6:00 PM/ })).toBeChecked();
    // Closed from its state (controlled), it still leaves the way it came.
    const timeline = await recordTimeline(page, { content: POPUP });
    await page.getByRole('button', { name: 'Confirm Delivery Time' }).click();
    await expect(page.locator(POPUP)).toHaveCount(0, { timeout: 2500 });
    expectDrawerExit(await timeline.stop(), 'right');
    await expect(page.getByText('Delivery time confirmed')).toBeVisible();
  });
});

test.describe('base-ui drawer API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/base-ui-drawer', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled open and onOpenChange; animates unstyled', async ({
    page,
  }) => {
    const popup = '[data-testid="bottom-popup"]';
    const timeline = await recordTimeline(page, { content: popup });
    await page.getByRole('button', { name: 'Open from outside' }).click();
    await expectSheetSettled(page, popup, 'bottom');
    expectDrawerEntrance(await timeline.stop(), 'bottom');
    await expect(page.getByTestId('controlled-state')).toHaveText('open');

    await page.getByRole('button', { name: 'Close bottom' }).click();
    await expect(page.getByTestId('controlled-state')).toHaveText('closed');
    await expect(page.getByTestId('controlled-changes')).toHaveText(
      'false:close-press',
    );
    await expect(page.locator(popup)).toHaveCount(0, { timeout: 2500 });
  });

  test('swipeDirection right, with custom transitions', async ({ page }) => {
    const popup = '[data-testid="right-popup"]';
    const timeline = await recordTimeline(page, { content: popup });
    await page.getByRole('button', { name: 'Open right drawer' }).click();
    await expectSheetSettled(page, popup, 'right');
    // From its right edge…
    const first = present(await timeline.stop(), 'content')[0]!.samples
      .content!;
    expect(first.x).toBeGreaterThan(0.6);
    // …on the 200ms tween given instead of Vaul's curve.
    const timing = await page
      .locator(popup)
      .evaluate((el) => [
        getComputedStyle(el).transitionDuration.split(',')[0]!.trim(),
        getComputedStyle(el).transitionTimingFunction.split(', c')[0]!,
      ]);
    expect(timing).toEqual(['0.2s', 'cubic-bezier(0.4, 0, 0.2, 1)']);

    // A 100ms exit.
    await page.keyboard.press('Escape');
    await expect(page.locator(popup)).toHaveCount(0, { timeout: 1000 });
  });

  test('a backdrop over an image fades its opacity instead', async ({
    page,
  }) => {
    const backdrop = '[data-testid="gradient-backdrop"]';
    const timeline = await recordTimeline(page, { overlay: backdrop });
    await page.getByRole('button', { name: 'Open gradient drawer' }).click();
    await expectSheetSettled(page, '[data-testid="gradient-popup"]', 'bottom');
    const frames = present(await timeline.stop(), 'overlay');
    // No color to deepen: from transparent, through the values in between.
    expect(frames[0]!.samples.overlay!.opacity).toBeLessThan(0.3);
    expect(
      frames.some(
        (frame) =>
          frame.samples.overlay!.opacity > 0.2 &&
          frame.samples.overlay!.opacity < 0.8,
      ),
    ).toBe(true);
    await expect
      .poll(async () => (await readState(page, backdrop)).opacity)
      .toBe(1);
    await expect(page.locator(backdrop)).not.toHaveAttribute(
      'data-animate-ui-backdrop',
    );
  });
});
