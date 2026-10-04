import { expect, test, type Page } from '@playwright/test';

import {
  SHEET_SPRING,
  expectSheetEntrance,
  expectSheetExit,
  expectSheetSettled,
  present,
  readState,
  recordTimeline,
} from './modal-timeline';
import { expectCssSpring } from './spring-curves';

// The drawer moves like Animate UI v1's Sheet: it slides and fades on the
// dialog's spring (stiffness 150, damping 25), run by CSS transitions as
// Motion's `linear()` curve for it, and its backdrop fades and un-blurs in
// 200ms (ease-out), both ways.

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

  test('slides and fades up from the bottom edge like v1, its backdrop in 200ms', async ({
    page,
  }) => {
    const timeline = await recordTimeline(page, {
      content: POPUP,
      overlay: OVERLAY,
    });
    await open(page);
    const frames = await timeline.stop();
    expectSheetEntrance(frames, 'bottom');

    // v1's overlay: blurred at first, fully in while the drawer still slides.
    const backdrop = present(frames, 'overlay');
    expect(backdrop[0]!.samples.overlay!.blur).toBeGreaterThan(2.5);
    const overlayIn = backdrop.find(
      (frame) => frame.samples.overlay!.opacity >= 0.99,
    )!;
    expect(Math.abs(overlayIn.samples.content!.y)).toBeGreaterThan(0.05);
    const rest = await readState(page, OVERLAY);
    expect(rest.opacity).toBe(1);
    expect(rest.blur).toBe(0);

    // The spring as CSS: the duration and `linear()` curve Motion computes
    // for the dialog's spring.
    expectCssSpring(await timing(page, POPUP), SHEET_SPRING);
  });

  test('closes the same way, the backdrop gone first, then unmounts', async ({
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
    expectCssSpring(exit, SHEET_SPRING);
    await expect(page.locator(POPUP)).toHaveCount(0, { timeout: 2500 });
    const frames = await timeline.stop();
    expectSheetExit(frames, 'bottom');
    const overlayOut = present(frames, 'overlay').find(
      (frame) => frame.samples.overlay!.opacity <= 0.01,
    )!;
    expect(overlayOut.samples.content!.opacity).toBeGreaterThan(0.1);
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
    // The backdrop follows the swipe progress without lag too.
    expect((await readState(page, OVERLAY)).opacity).toBeLessThan(1);

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
    expectSheetEntrance(await timeline.stop(), 'bottom');
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
    // …on the 200ms tween given instead of v1's spring.
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
});
