import { expect, test, type Page } from '@playwright/test';

import {
  DRAWER_CURVE,
  halfwayTimes,
  expectDrawerEntrance,
  expectDrawerExit,
  expectProgressiveOverlay,
  expectSheetSettled,
  present,
  readState,
  recordTimeline,
} from './modal-timeline';
import { expectCssCurve } from './spring-curves';

// The drawer moves like Vaul's: it slides opaque on Vaul's curve (0.5s of
// cubic-bezier(0.32, 0.72, 0, 1)), run by CSS transitions, and its backdrop
// comes in like the dialogs': its tint and backdrop blur grow from 0 on the
// same curve (never its opacity), and follow the swipe.

const POPUP = '[data-slot="drawer-popup"]';
const OVERLAY = '[data-slot="drawer-overlay"]';

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

/** The demo backdrop's classes: `bg-black/10`, `backdrop-blur-xs`. */
const REST = { bg: 0.1, blur: 4 };

/** Vertical/horizontal offset in px, and opacity. */
const state = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const cs = getComputedStyle(el);
      const m = new DOMMatrix(cs.transform);
      return { x: m.m41, y: m.m42, opacity: Number(cs.opacity) };
    });

test.describe('base-ui drawer demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/drawer', {
      waitUntil: 'networkidle',
    });
  });

  const open = async (page: Page) => {
    await page.getByRole('button', { name: 'Daily goals' }).click();
    await expectSheetSettled(page, POPUP, 'bottom');
  };

  test("slides up opaque from the bottom edge on Vaul's curve, its backdrop tinting and blurring the page from 0", async ({
    page,
  }) => {
    const timeline = await recordTimeline(page, {
      content: POPUP,
      overlay: OVERLAY,
    });
    await open(page);
    const frames = await timeline.stop();
    expectDrawerEntrance(frames, 'bottom');

    // Its backdrop, from nothing, along with the drawer: half way in at about
    // the same time.
    const backdrop = present(frames, 'overlay');
    expect(backdrop[0]!.samples.overlay!.bg).toBeLessThan(REST.bg * 0.1);
    expect(backdrop[0]!.samples.overlay!.backdrop).toBeLessThan(
      REST.blur * 0.1,
    );
    expectProgressiveOverlay(frames, REST);
    const halfway = halfwayTimes(frames, { axis: 'y', rest: REST.bg });
    expect(Math.abs(halfway.overlay - halfway.drawer)).toBeLessThan(60);
    const rest = await readState(page, OVERLAY);
    expect(rest.opacity).toBe(1);
    expect(rest.bg).toBeCloseTo(REST.bg, 3);
    expect(rest.backdrop).toBe(REST.blur);

    // Vaul's curve as CSS, on both.
    expectCssCurve(await timing(page, POPUP), DRAWER_CURVE);
    expectCssCurve(await timing(page, OVERLAY), DRAWER_CURVE);
  });

  test('closes the same way, opaque, the backdrop clearing with it, then unmounts', async ({
    page,
  }) => {
    await open(page);
    // The exit's timing, read as soon as Base UI marks the popup as ending.
    await page.locator(POPUP).evaluate((el) => {
      (window as unknown as { __exit: Promise<unknown> }).__exit = new Promise(
        (resolve) => {
          const observer = new MutationObserver(() => {
            if (!el.hasAttribute('data-ending-style')) return;
            observer.disconnect();
            const cs = getComputedStyle(el);
            resolve({
              duration: cs.transitionDuration.split(',')[0]!.trim(),
              easing: cs.transitionTimingFunction,
            });
          });
          observer.observe(el, { attributes: true });
        },
      );
    });
    const timeline = await recordTimeline(page, {
      content: POPUP,
      overlay: OVERLAY,
    });
    await page.keyboard.press('Escape');
    const exit = (await page.evaluate(
      () => (window as unknown as { __exit: Promise<unknown> }).__exit,
    )) as { duration: string; easing: string };
    expectCssCurve(exit, DRAWER_CURVE);
    await expect(page.locator(POPUP)).toHaveCount(0, { timeout: 2500 });
    const frames = await timeline.stop();
    expectDrawerExit(frames, 'bottom');
    // The backdrop clears along with the drawer, its tint and blur together:
    // half way out at about the same time.
    expectProgressiveOverlay(frames, REST);
    const halfway = halfwayTimes(frames, {
      axis: 'y',
      rest: REST.bg,
      leaving: true,
    });
    expect(Math.abs(halfway.overlay - halfway.drawer)).toBeLessThan(60);
  });

  test('a drag follows the finger at once; a slow release springs back', async ({
    page,
  }) => {
    await open(page);
    const box = (await page.locator(POPUP).boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + 12;
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
    // its blur, never its opacity.
    const swiped = await readState(page, OVERLAY);
    expect(swiped.opacity).toBe(1);
    expect(swiped.bg).toBeLessThan(REST.bg * 0.95);
    expect(swiped.bg).toBeGreaterThan(REST.bg * 0.3);
    expect(
      Math.abs(swiped.backdrop / REST.blur - swiped.bg / REST.bg),
    ).toBeLessThan(0.1);

    // Hold still, then let go: not a flick, so it springs back up.
    await page.waitForTimeout(150);
    await page.mouse.up();
    await page.waitForTimeout(50);
    const released = await state(page, POPUP);
    expect(released.y).toBeGreaterThan(5);
    expect(released.y).toBeLessThan(dragged.y);
    await expectSheetSettled(page, POPUP, 'bottom');
    await expect(page.locator(POPUP)).toHaveCount(1);
  });

  test('a flick dismisses it, continuing the swipe', async ({ page }) => {
    await open(page);
    const box = (await page.locator(POPUP).boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + 12;
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let i = 1; i <= 8; i++) {
      await page.mouse.move(x, y + i * 25);
      await page.waitForTimeout(16);
    }
    await page.mouse.up();
    await expect(page.locator(POPUP)).toHaveCount(0, { timeout: 2500 });
  });

  test('reduced motion: fades in place', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const timeline = await recordTimeline(page, { content: POPUP });
    await open(page);
    const first = present(await timeline.stop(), 'content')[0]!.samples
      .content!;
    expect(Math.abs(first.y)).toBeLessThan(0.002);
    expect(first.opacity).toBeLessThan(1);
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
