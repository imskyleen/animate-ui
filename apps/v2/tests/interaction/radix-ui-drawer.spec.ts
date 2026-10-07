import { expect, test, type Page } from '@playwright/test';

import { gotoHydrated } from './disclosure-timeline';
import {
  expectClearBeforeUnmount,
  expectDialogLikeOverlay,
  expectDrawerEntrance,
  expectDrawerExit,
  expectProgressiveOverlay,
  expectShadowLifts,
  expectThrown,
  halfwayTimes,
  present,
  readState,
  recordTimeline,
} from './modal-timeline';

// The drawer slides opaque, a sheet sliding in and out: in, between snap
// points and back after a drag in 0.4s with a hint of bounce
// (cubic-bezier(0.34, 1.2, 0.64, 1), a hair past its rest), out quickly,
// speeding off its edge (0.16s on an ease-in, without crawling), thrown by a drag at the finger's speed (linear); its shadow, if it has
// one, lifts off the page with it. Its overlay comes in and clears like a
// dialog's, its tint and backdrop blur growing from 0 (never its opacity) in
// 400ms on a soft ease-out, and follows the drag like Vaul's.

const CONTENT = '[data-slot="drawer-content"]';
const OVERLAY = '[data-slot="drawer-overlay"]';

/** Translation in px and as a share of the element's size, scale, opacity. */
const state = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const cs = getComputedStyle(el);
      const m = new DOMMatrix(cs.transform);
      const box = el as HTMLElement;
      return {
        x: m.m41,
        y: m.m42,
        shareX: m.m41 / box.offsetWidth,
        shareY: m.m42 / box.offsetHeight,
        scale: m.a,
        height: box.offsetHeight,
        opacity: Number(cs.opacity),
      };
    });

/** The demo overlay's classes: `bg-black/10`, `backdrop-blur-xs`. */
const REST = { bg: 0.1, blur: 4 };

/** An overlay's opacity, the alpha of its tint and its backdrop blur (px). */
const veil = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const cs = getComputedStyle(el);
      const alpha =
        /\/\s*([\d.]+(?:e[+-]?\d+)?)\s*\)$/.exec(cs.backgroundColor) ??
        /^rgba\(.*,\s*([\d.]+)\)$/.exec(cs.backgroundColor);
      const blur = /blur\(([\d.e-]+)px\)/.exec(cs.backdropFilter);
      return {
        opacity: Number(cs.opacity),
        bg: alpha
          ? Number(alpha[1])
          : cs.backgroundColor === 'transparent'
            ? 0
            : 1,
        blur: blur ? Number(blur[1]) : 0,
      };
    });

type MotionFrame = {
  t: number;
  share: number;
  opacity: number;
  /** The overlay's opacity, the alpha of its tint and its backdrop blur. */
  overlay: number;
  bg: number;
  blur: number;
};

/**
 * Records, on every frame for `durationMs` from the moment `selector`
 * appears, its translation as a share of its size along `axis`, its opacity
 * and the overlay's. Sampled in the page: holds up on a busy machine. Start
 * it, trigger the change, then await the result.
 */
async function recordMotion(
  page: Page,
  selector: string,
  overlay: string,
  axis: 'x' | 'y' = 'y',
  durationMs = 750,
) {
  await page.evaluate(
    ({ selector, overlay, axis, durationMs }) => {
      const w = window as unknown as { __motion?: Promise<unknown> };
      w.__motion = new Promise((resolve) => {
        const frames: {
          t: number;
          share: number;
          opacity: number;
          overlay: number;
          bg: number;
          blur: number;
        }[] = [];
        let start = 0;
        const tick = () => {
          const el = document.querySelector<HTMLElement>(selector);
          // Gone (closed): what was recorded is all there is.
          if (!el && start) return resolve(frames);
          if (el) {
            const now = performance.now();
            if (!start) start = now;
            const m = new DOMMatrix(getComputedStyle(el).transform);
            const ov = document.querySelector(overlay);
            const veil = ov && getComputedStyle(ov);
            const alpha =
              veil &&
              (/\/\s*([\d.]+(?:e[+-]?\d+)?)\s*\)$/.exec(veil.backgroundColor) ??
                /^rgba\(.*,\s*([\d.]+)\)$/.exec(veil.backgroundColor));
            const blur =
              veil && /blur\(([\d.e-]+)px\)/.exec(veil.backdropFilter);
            frames.push({
              t: now - start,
              share:
                axis === 'y' ? m.m42 / el.offsetHeight : m.m41 / el.offsetWidth,
              opacity: Number(getComputedStyle(el).opacity),
              overlay: veil ? Number(veil.opacity) : 1,
              bg: alpha ? Number(alpha[1]) : 0,
              blur: blur ? Number(blur[1]) : 0,
            });
            if (now - start > durationMs) return resolve(frames);
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { selector, overlay, axis, durationMs },
  );
  return {
    frames: async () =>
      (await page.evaluate(
        () => (window as unknown as { __motion: Promise<unknown> }).__motion,
      )) as MotionFrame[],
  };
}

/** The last frame at or before `t` ms. */
const at = (frames: MotionFrame[], t: number) =>
  frames.filter((frame) => frame.t <= t).at(-1)!;

/** Waits until the drawer rests at its open position (`offset` px), opaque. */
const settled = (
  page: Page,
  selector: string,
  axis: 'x' | 'y' = 'y',
  offset = 0,
) =>
  expect
    .poll(
      async () => {
        const current = await state(page, selector);
        return current.opacity === 1 && Math.abs(current[axis] - offset) < 1;
      },
      { timeout: 2500 },
    )
    .toBe(true);

type DragOptions = {
  /** Where to grab, from the element's top-left corner. */
  at?: { x?: number; y?: number };
  dx?: number;
  dy?: number;
  steps?: number;
  /** ms between moves. */
  every?: number;
  /** ms to hold still before letting go (0: a flick). */
  hold?: number;
  release?: boolean;
};

/** Presses on `selector`, moves by (dx, dy) in steps, optionally lets go. */
async function drag(page: Page, selector: string, options: DragOptions) {
  const {
    at,
    dx = 0,
    dy = 0,
    steps = 10,
    every = 32,
    hold = 0,
    release = true,
  } = options;
  const box = (await page.locator(selector).first().boundingBox())!;
  const x = box.x + (at?.x ?? box.width / 2);
  const y = box.y + (at?.y ?? 12);
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(x + (dx * i) / steps, y + (dy * i) / steps);
    await page.waitForTimeout(every);
  }
  if (hold) await page.waitForTimeout(hold);
  if (release) await page.mouse.up();
}

/**
 * Flicks `selector` by `dy` px in `steps` moves `every` ms apart, then lets
 * go `every` ms after the last: the moves land on separate frames and carry
 * those times (the drawer reads a release's speed from event times), so a
 * busy machine can't stretch the flick into a slow drag.
 */
async function flick(
  page: Page,
  selector: string,
  { dy, steps = 3, every = 8 }: { dy: number; steps?: number; every?: number },
) {
  const box = (await page.locator(selector).first().boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + 12;
  const cdp = await page.context().newCDPSession(page);
  const start = Date.now() / 1000;
  const mouse = (type: string, top: number, ms: number, buttons: number) =>
    cdp.send('Input.dispatchMouseEvent', {
      type: type as 'mouseMoved',
      x,
      y: top,
      button: 'left',
      buttons,
      clickCount: 1,
      timestamp: start + ms / 1000,
    });
  const frame = () =>
    page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(resolve)),
    );
  await mouse('mouseMoved', y, 0, 0);
  await mouse('mousePressed', y, 1, 1);
  for (let i = 1; i <= steps; i++) {
    await frame();
    await mouse('mouseMoved', y + (dy * i) / steps, 1 + i * every, 1);
  }
  await mouse('mouseReleased', y + dy, 1 + (steps + 1) * every, 0);
  await cdp.detach();
}

test.describe('radix-ui drawer demo', () => {
  test.beforeEach(async ({ page }) => {
    await gotoHydrated(page, '/tests/demos/radix-ui/drawer');
  });

  const open = async (page: Page, settle = true) => {
    await page.getByRole('button', { name: 'Open Drawer' }).click();
    await page.locator(CONTENT).waitFor();
    if (!settle) return;
    await settled(page, CONTENT);
    // Past its bounce and its overlay's fade, which end at 400ms.
    await page.waitForTimeout(400);
  };

  test("slides up opaque from the bottom edge with a hint of bounce, its overlay tinting and blurring the page from 0 like a dialog's, with Vaul attributes", async ({
    page,
  }) => {
    const timeline = await recordTimeline(page, {
      content: CONTENT,
      overlay: OVERLAY,
    });
    await open(page);
    const frames = await timeline.stop();
    // Starts off screen and slides in opaque, a sheet rather than a fade, a
    // hair past its rest, then back.
    expectDrawerEntrance(frames, 'bottom');
    // The overlay comes in like a dialog's, never through its opacity: its
    // tint and backdrop blur grow from 0 together, about half way in when
    // the drawer is.
    expect(present(frames, 'overlay')[0]!.samples.overlay!.bg).toBeLessThan(
      REST.bg * 0.1,
    );
    expectProgressiveOverlay(frames, REST);
    expectDialogLikeOverlay(frames, { rest: REST.bg });
    const halfway = halfwayTimes(frames, { axis: 'y', rest: REST.bg });
    expect(Math.abs(halfway.overlay - halfway.drawer)).toBeLessThan(60);

    const content = page.locator(CONTENT);
    await expect(content).toHaveAttribute(
      'data-vaul-drawer-direction',
      'bottom',
    );
    await expect(content).toHaveAttribute('data-vaul-drawer', '');
    await expect(content).toHaveAttribute('data-state', 'open');
    await expect(page.locator(OVERLAY)).toHaveAttribute(
      'data-vaul-overlay',
      '',
    );

    const rest = await veil(page, OVERLAY);
    expect(rest.opacity).toBe(1);
    expect(rest.bg).toBeCloseTo(REST.bg, 3);
    expect(rest.blur).toBe(REST.blur);
    expect(
      await page.locator(OVERLAY).evaluate((el) => getComputedStyle(el).filter),
    ).toBe('none');
  });

  test("closes quicker than it came, speeding off its edge without crawling, opaque, the overlay clearing ahead of it like a dialog's, then unmounts", async ({
    page,
  }) => {
    await open(page);
    const timeline = await recordTimeline(page, {
      content: CONTENT,
      overlay: OVERLAY,
    });
    await page.keyboard.press('Escape');
    await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 2500 });
    await expect(page.locator(OVERLAY)).toHaveCount(0);
    const frames = await timeline.stop();
    expectDrawerExit(frames, 'bottom');
    // The overlay clears like a dialog's, its tint and blur together, ahead
    // of the drawer speeding away, and clear before it unmounts.
    expectProgressiveOverlay(frames, REST);
    expectDialogLikeOverlay(frames, {
      rest: REST.bg,
      leaving: true,
      axis: 'y',
    });
    expectClearBeforeUnmount(frames, REST);
  });

  test('a drag follows the finger 1:1, the overlay with it; a slow release springs back', async ({
    page,
  }) => {
    await open(page);
    const { height } = await state(page, CONTENT);
    const distance = Math.round(height * 0.2);
    await drag(page, CONTENT, { dy: distance, release: false });
    // No lag: the drawer sits where the finger is, and doesn't fade.
    const dragged = await state(page, CONTENT);
    expect(Math.abs(dragged.y - distance)).toBeLessThan(2);
    expect(dragged.opacity).toBe(1);
    // The overlay follows: its tint and its blur, never its opacity.
    const overlay = await veil(page, OVERLAY);
    expect(overlay.opacity).toBe(1);
    expect(
      Math.abs(overlay.bg / REST.bg - (1 - distance / height)),
    ).toBeLessThan(0.05);
    expect(
      Math.abs(overlay.blur / REST.blur - (1 - distance / height)),
    ).toBeLessThan(0.05);
    await expect(page.locator(CONTENT)).toHaveClass(/vaul-dragging/);

    // Hold still, then let go: not a flick, under the threshold.
    await page.waitForTimeout(150);
    await page.mouse.up();
    await page.waitForTimeout(50);
    const released = await state(page, CONTENT);
    expect(released.y).toBeGreaterThan(5);
    expect(released.y).toBeLessThan(dragged.y);
    await settled(page, CONTENT);
    await expect
      .poll(async () => (await veil(page, OVERLAY)).bg)
      .toBeCloseTo(REST.bg, 3);
    await expect(page.locator(CONTENT)).toHaveCount(1);
  });

  test('released past the close threshold, it closes from there', async ({
    page,
  }) => {
    await open(page);
    const { height } = await state(page, CONTENT);
    await drag(page, CONTENT, { dy: height * 0.4, hold: 150, release: false });
    const before = (await state(page, CONTENT)).y;
    await page.mouse.up();
    await page.waitForTimeout(60);
    // Continues downwards from the release point.
    expect((await state(page, CONTENT)).y).toBeGreaterThan(before);
    await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 2500 });
  });

  test("a short flick throws it out at the finger's speed: linear, never stalling or crawling", async ({
    page,
  }) => {
    await open(page);
    const { height } = await state(page, CONTENT);
    const distance = Math.round(height * 0.2);
    // Recording from before the flick: nothing may slow it down.
    const timeline = await recordTimeline(page, { content: CONTENT });
    // ~1.2px/ms, three times the flick threshold: thrown over ~290ms.
    await flick(page, CONTENT, { dy: distance, every: 24 });
    await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 2500 });
    expectThrown(await timeline.stop(), 'bottom', distance / height);
  });

  test('pulled upwards it rubber-bands, then springs back', async ({
    page,
  }) => {
    await open(page);
    await drag(page, CONTENT, { dy: -150, release: false });
    const pulled = await state(page, CONTENT);
    expect(pulled.y).toBeLessThan(-5);
    expect(pulled.y).toBeGreaterThan(-60);
    await page.waitForTimeout(150);
    await page.mouse.up();
    await settled(page, CONTENT);
  });

  test('a drag does not click the button it started on', async ({ page }) => {
    await open(page);
    // A Close: clicked, it would close the drawer.
    const cancel = page.getByRole('button', { name: 'Cancel' });
    await drag(page, CONTENT, {
      at: {
        y:
          (await cancel.boundingBox())!.y -
          (await page.locator(CONTENT).boundingBox())!.y +
          10,
      },
      dy: 30,
      hold: 150,
    });
    await page.waitForTimeout(700);
    await expect(page.locator(CONTENT)).toHaveCount(1);
  });

  test('keyboard: opens with Enter, closes with Escape, focus goes back', async ({
    page,
  }) => {
    const trigger = page.getByRole('button', { name: 'Open Drawer' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 2500 });
    await expect(trigger).toBeFocused();
  });

  test('reopening during the exit comes back fully', async ({ page }) => {
    await open(page);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    await page
      .getByRole('button', { name: 'Open Drawer' })
      .click({ force: true });
    await settled(page, CONTENT);
    await expect
      .poll(async () => (await veil(page, OVERLAY)).bg)
      .toBeCloseTo(REST.bg, 3);
    await expect(page.locator(CONTENT)).toHaveCount(1);
  });

  test('reduced motion: fades in place, a drag still follows the finger', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, false);
    await page.waitForTimeout(60);
    const early = await state(page, CONTENT);
    expect(Math.abs(early.y)).toBeLessThan(1);
    expect(early.opacity).toBeLessThan(1);
    await settled(page, CONTENT);

    const { height } = await state(page, CONTENT);
    const distance = Math.round(height * 0.2);
    await drag(page, CONTENT, { dy: distance, release: false });
    expect(Math.abs((await state(page, CONTENT)).y - distance)).toBeLessThan(2);
    await page.waitForTimeout(150);
    await page.mouse.up();
    // Settles back without moving.
    await page.waitForTimeout(50);
    expect(Math.abs((await state(page, CONTENT)).y)).toBeLessThan(1);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(80);
    const leaving = await state(page, CONTENT);
    expect(Math.abs(leaving.y)).toBeLessThan(1);
    expect(leaving.opacity).toBeLessThan(1);
  });
});

test.describe('radix-ui drawer API', () => {
  test.beforeEach(async ({ page }) => {
    await gotoHydrated(page, '/tests/fixtures/radix-ui-drawer');
  });

  /** The `defaultOpen` drawer covers the page at first: close it. */
  const closeDefault = async (page: Page) => {
    await page.getByText('Close default').click();
    await expect(page.getByTestId('default-content')).toHaveCount(0, {
      timeout: 1000,
    });
  };

  test('defaultOpen skips the entrance; custom transitions', async ({
    page,
  }) => {
    const content = '[data-testid="default-content"]';
    await expect(page.locator(content)).toHaveAttribute(
      'data-vaul-drawer-direction',
      'right',
    );
    expect(Math.abs((await state(page, content)).x)).toBeLessThan(1);
    // A 100ms exit instead of v1's spring.
    await page.getByText('Close default').click();
    await expect(page.locator(content)).toHaveCount(0, { timeout: 400 });

    // A 200ms entrance.
    const motion = await recordMotion(page, content, OVERLAY, 'x', 400);
    await page.getByRole('button', { name: 'Open default' }).click();
    const frames = await motion.frames();
    expect(frames[0]!.share).toBeGreaterThan(0.8);
    expect(at(frames, 40).share).toBeGreaterThan(0.05);
    expect(Math.abs(at(frames, 320).share)).toBeLessThan(0.005);
  });

  test('controlled open, onOpenChange, onClose and onAnimationEnd', async ({
    page,
  }) => {
    await closeDefault(page);
    await page.getByRole('button', { name: 'Open from outside' }).click();
    await expect(page.getByTestId('bottom-content')).toBeVisible();
    await expect(page.getByTestId('controlled-state')).toHaveText('open');
    await expect(page.getByTestId('log')).toHaveText('end:true', {
      timeout: 1000,
    });

    await page.getByText('Close bottom').click();
    await expect(page.getByTestId('controlled-state')).toHaveText('closed');
    await expect(page.getByTestId('bottom-content')).toHaveCount(0, {
      timeout: 2500,
    });
    await expect(page.getByTestId('log')).toHaveText(
      'end:true,close,change:false,end:false',
    );

    await page.getByRole('button', { name: 'Controlled trigger' }).click();
    await expect(page.getByTestId('controlled-state')).toHaveText('open');
  });

  test('a drag dismissal reports onDrag, onRelease and onClose', async ({
    page,
  }) => {
    await closeDefault(page);
    await page.getByRole('button', { name: 'Controlled trigger' }).click();
    const content = '[data-testid="bottom-content"]';
    await settled(page, content);
    // Its opening has ended (it passes its rest once, on its way to its hint
    // of bounce: a drag then would cut it short).
    await expect(page.getByTestId('log')).toHaveText('change:true,end:true');
    const { height } = await state(page, content);
    await drag(page, content, { dy: height * 0.25, hold: 150, release: false });
    const reported = Number(await page.getByTestId('last-drag').textContent());
    expect(reported).toBeGreaterThan(0.2);
    expect(reported).toBeLessThan(0.3);
    await page.mouse.up();
    await expect(page.getByTestId(`bottom-content`)).toHaveCount(0, {
      timeout: 2500,
    });
    await expect(page.getByTestId('log')).toHaveText(
      'change:true,end:true,close,change:false,release:false,end:false',
    );
  });

  test('shouldScaleBackground scales [data-vaul-drawer-wrapper] with the drawer', async ({
    page,
  }) => {
    await closeDefault(page);
    const wrapper = page.locator('[data-vaul-drawer-wrapper]');
    const scale = () =>
      wrapper.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
    await page.getByRole('button', { name: 'Controlled trigger' }).click();
    await settled(page, '[data-testid="bottom-content"]');
    expect(await scale()).toBeLessThan(0.99);
    expect(await page.evaluate(() => document.body.style.background)).toContain(
      'black',
    );
    // It follows the drag.
    const content = '[data-testid="bottom-content"]';
    const open = await scale();
    await drag(page, content, { dy: 60, release: false });
    expect(await scale()).toBeGreaterThan(open);
    await page.mouse.up();
    await page.keyboard.press('Escape');
    await expect(page.locator(content)).toHaveCount(0, { timeout: 2500 });
    expect(await scale()).toBe(1);
    expect(await page.evaluate(() => document.body.style.background)).toBe('');
  });

  const travel = {
    top: { axis: 'y', sign: -1 },
    right: { axis: 'x', sign: 1 },
    left: { axis: 'x', sign: -1 },
  } as const;

  for (const [direction, { axis, sign }] of Object.entries(travel)) {
    test(`direction ${direction}: slides from its edge, a drag towards it dismisses`, async ({
      page,
    }) => {
      await closeDefault(page);
      const content = `[data-testid="${direction}-content"]`;
      const motion = await recordMotion(
        page,
        content,
        '[data-vaul-overlay]',
        axis,
        900,
      );
      await page.getByText(`Open ${direction}`).click();
      const frames = await motion.frames();
      expect(frames[0]!.share * sign).toBeGreaterThan(0.8);
      for (const frame of frames) expect(frame.opacity).toBe(1);
      expect(at(frames, 60).share * sign).toBeGreaterThan(0.05);
      expect(Math.abs(at(frames, 880).share)).toBeLessThan(0.01);
      await expect(page.locator(content)).toHaveAttribute(
        'data-vaul-drawer-direction',
        direction,
      );

      // Follows the finger along its own axis.
      const box = (await page.locator(content).boundingBox())!;
      const grab =
        direction === 'top'
          ? { y: box.height - 12 }
          : direction === 'right'
            ? { x: 12, y: box.height / 2 }
            : { x: box.width - 12, y: box.height / 2 };
      const delta = 60 * sign;
      await drag(page, content, {
        at: grab,
        ...(axis === 'x' ? { dx: delta } : { dy: delta }),
        release: false,
      });
      const dragged = await state(page, content);
      expect(
        Math.abs((axis === 'x' ? dragged.x : dragged.y) - delta),
      ).toBeLessThan(2);
      await page.mouse.up();
      await settled(page, content, axis);

      await drag(page, content, {
        at: grab,
        ...(axis === 'x'
          ? { dx: box.width * 0.5 * sign }
          : { dy: box.height * 0.5 * sign }),
        hold: 150,
      });
      await expect(page.locator(content)).toHaveCount(0, { timeout: 2500 });
    });
  }

  test('its shadow lifts off the page with it: none off screen, lowered by a drag, gone as it leaves', async ({
    page,
  }) => {
    await closeDefault(page);
    // The fixture's right drawer has `shadow-xl`: 10% black at most.
    const content = '[data-testid="right-content"]';
    const opening = await recordTimeline(page, { content });
    await page.getByText('Open right').click();
    await settled(page, content, 'x');
    await page.waitForTimeout(400);
    expectShadowLifts(await opening.stop(), 0.1);
    expect((await readState(page, content)).shadow).toBeCloseTo(0.1, 3);

    // Half way out under the finger, half its shadow.
    const box = (await page.locator(content).boundingBox())!;
    await drag(page, content, {
      at: { x: 12, y: box.height / 2 },
      dx: box.width * 0.5,
      release: false,
    });
    const dragged = await readState(page, content);
    expect(dragged.shadow).toBeGreaterThan(0.03);
    expect(dragged.shadow).toBeLessThan(0.07);
    // Short of the threshold again, it springs back, lifted all the way.
    await page.mouse.move(box.x + 12, box.y + box.height / 2, { steps: 5 });
    await page.waitForTimeout(150);
    await page.mouse.up();
    await settled(page, content, 'x');
    await expect
      .poll(async () => (await readState(page, content)).shadow)
      .toBeCloseTo(0.1, 3);

    const closing = await recordTimeline(page, { content });
    await page.keyboard.press('Escape');
    await expect(page.locator(content)).toHaveCount(0, { timeout: 2500 });
    expectShadowLifts(await closing.stop(), 0.1, { leaving: true });
  });

  test('snap points: opens at the first, drags between them, the Handle cycles', async ({
    page,
  }) => {
    await closeDefault(page);
    const content = '[data-testid="snap-content"]';
    const viewport = page.viewportSize()!;
    await page.getByRole('button', { name: 'Open snap points' }).click();
    await page.waitForTimeout(700);
    await expect(page.locator(content)).toHaveAttribute(
      'data-vaul-snap-points',
      'true',
    );
    // 40% of the screen: translated by the other 60%.
    expect(
      Math.abs((await state(page, content)).y - viewport.height * 0.6),
    ).toBeLessThan(2);
    // The overlay comes in from the last snap point only (`bg-black/40`).
    expect((await veil(page, '[data-testid="snap-overlay"]')).bg).toBe(0);

    // Dragged up near the 600px point, released slowly: it snaps there.
    const target = viewport.height - 600;
    await drag(page, content, {
      dy: -(viewport.height * 0.6 - target - 20),
      hold: 150,
    });
    await expect(page.getByTestId('snap-state')).toHaveText('600px');
    await page.waitForTimeout(700);
    expect(Math.abs((await state(page, content)).y - target)).toBeLessThan(2);

    // A tap on the Handle goes to the next one: full height, full overlay.
    await page.getByTestId('snap-handle').click();
    await expect(page.getByTestId('snap-state')).toHaveText('1');
    await page.waitForTimeout(800);
    expect(Math.abs((await state(page, content)).y)).toBeLessThan(2);
    expect((await veil(page, '[data-testid="snap-overlay"]')).bg).toBeCloseTo(
      0.4,
      3,
    );

    // From the last one, it closes, then resets to the first.
    await page.getByTestId('snap-handle').click();
    await expect(page.locator(content)).toHaveCount(0, { timeout: 2500 });
    await expect(page.getByTestId('snap-state')).toHaveText('0.4', {
      timeout: 2000,
    });
  });

  test('snap points: dragging between points fades the overlay; a flick down closes', async ({
    page,
  }) => {
    await closeDefault(page);
    const content = '[data-testid="snap-content"]';
    await page.getByRole('button', { name: 'Open snap points' }).click();
    await page.waitForTimeout(700);
    await page.getByTestId('snap-handle').click();
    await expect(page.getByTestId('snap-state')).toHaveText('600px');
    await page.waitForTimeout(800);
    // From 600px towards full height, the overlay follows: its tint.
    await drag(page, content, { dy: -60, release: false });
    const overlay = (await veil(page, '[data-testid="snap-overlay"]')).bg / 0.4;
    expect(overlay).toBeGreaterThan(0.2);
    expect(overlay).toBeLessThan(0.8);
    await page.waitForTimeout(150);
    await page.mouse.up();
    await page.waitForTimeout(700);
    await expect(page.getByTestId('snap-state')).toHaveText('600px');

    // A flick down goes one point down; from the first one, it closes.
    await drag(page, content, { dy: 80, steps: 3, every: 8 });
    await expect(page.getByTestId('snap-state')).toHaveText('0.4');
    await page.waitForTimeout(700);
    await drag(page, content, { dy: 80, steps: 3, every: 8 });
    await expect(page.locator(content)).toHaveCount(0, { timeout: 2500 });
  });

  test('handleOnly: only the Handle drags it', async ({ page }) => {
    await closeDefault(page);
    const content = '[data-testid="handle-content"]';
    await page.getByRole('button', { name: 'Open handle only' }).click();
    await page.waitForTimeout(700);
    await expect(page.getByTestId('handle')).toHaveAttribute(
      'data-vaul-handle',
      '',
    );

    await drag(page, '[data-testid="handle-body"]', { dy: 80, release: false });
    expect(Math.abs((await state(page, content)).y)).toBeLessThan(1);
    await page.mouse.up();

    await drag(page, '[data-testid="handle"]', {
      at: { y: 2 },
      dy: 80,
      release: false,
    });
    expect(Math.abs((await state(page, content)).y - 80)).toBeLessThan(2);
    await page.mouse.up();
  });

  test('scrollable content scrolls instead of dragging, until it is at the top', async ({
    page,
  }) => {
    await closeDefault(page);
    const content = '[data-testid="scroll-content"]';
    const list = page.getByTestId('scroll-list');
    await page.getByRole('button', { name: 'Open scrollable' }).click();
    await page.waitForTimeout(700);

    await list.evaluate((el) => {
      el.scrollTop = 200;
    });
    await page.waitForTimeout(150);
    await drag(page, '[data-testid="scroll-list"]', {
      at: { y: 100 },
      dy: 80,
      release: false,
    });
    expect(Math.abs((await state(page, content)).y)).toBeLessThan(1);
    await page.mouse.up();

    // Scrolled back to the top: now the drawer moves.
    await list.evaluate((el) => {
      el.scrollTop = 0;
    });
    await page.waitForTimeout(150);
    await drag(page, '[data-testid="scroll-list"]', {
      at: { y: 100 },
      dy: 80,
      release: false,
    });
    expect(Math.abs((await state(page, content)).y - 80)).toBeLessThan(2);
    await page.mouse.up();

    // And upwards, the list scrolls (the drawer doesn't move).
    await page.waitForTimeout(700);
    await drag(page, '[data-testid="scroll-list"]', {
      at: { y: 100 },
      dy: -80,
      release: false,
    });
    expect(Math.abs((await state(page, content)).y)).toBeLessThan(1);
    await page.mouse.up();
  });

  test('dismissible={false}: Escape, outside clicks and drags keep it open', async ({
    page,
  }) => {
    await closeDefault(page);
    const content = '[data-testid="locked-content"]';
    await page.getByRole('button', { name: 'Open locked' }).click();
    await page.waitForTimeout(700);
    await page.keyboard.press('Escape');
    await page.mouse.click(5, 5);
    await page.waitForTimeout(300);
    await expect(page.locator(content)).toHaveCount(1);

    await drag(page, content, { dy: 150, release: false });
    // It resists.
    const pulled = (await state(page, content)).y;
    expect(pulled).toBeGreaterThan(5);
    expect(pulled).toBeLessThan(60);
    await page.mouse.up();
    await page.waitForTimeout(700);
    expect(Math.abs((await state(page, content)).y)).toBeLessThan(1);

    await page.getByText('Unlock').click();
    await expect(page.locator(content)).toHaveCount(0, { timeout: 2500 });
  });

  test('nested: the parent steps back while the nested drawer is open', async ({
    page,
  }) => {
    await closeDefault(page);
    const parent = '[data-testid="parent-content"]';
    await page.getByRole('button', { name: 'Open parent' }).click();
    await page.waitForTimeout(700);
    await page.getByText('Open nested').click();
    await page.waitForTimeout(700);
    const back = await state(page, parent);
    expect(back.scale).toBeLessThan(1);
    expect(back.y).toBeLessThan(-10);

    await page.getByText('Close nested').click();
    await expect(page.getByTestId('nested-content')).toHaveCount(0, {
      timeout: 2500,
    });
    await expect
      .poll(async () => {
        const restored = await state(page, parent);
        return Math.abs(restored.scale - 1) < 0.001 && Math.abs(restored.y) < 1;
      })
      .toBe(true);
  });

  test('forceMount keeps closed content mounted, hidden and inert', async ({
    page,
  }) => {
    await gotoHydrated(page, '/tests/fixtures/radix-ui-drawer-force-mount');
    const content = page.getByTestId('kept-content');
    const kept = () =>
      content.evaluate((el) => ({
        visibility: getComputedStyle(el).visibility,
        inert: (el as HTMLElement).inert,
      }));
    await expect(content).toHaveCount(1);
    expect(await kept()).toEqual({ visibility: 'hidden', inert: true });

    await page.getByText('Open kept').click();
    await expect(content).toBeVisible();
    await page.waitForTimeout(700);
    expect((await kept()).inert).toBe(false);

    await page.getByText('Close kept').click();
    await expect
      .poll(kept, { timeout: 2500 })
      .toEqual({ visibility: 'hidden', inert: true });
    await expect(content).toHaveCount(1);
  });

  test('an overlay over an image fades its opacity instead', async ({
    page,
  }) => {
    await closeDefault(page);
    const overlay = '[data-testid="gradient-overlay"]';
    const motion = await recordMotion(
      page,
      '[data-testid="gradient-content"]',
      overlay,
      'y',
      700,
    );
    await page.getByRole('button', { name: 'Open gradient' }).click();
    const frames = await motion.frames();
    // No color to deepen: from transparent, through the values in between.
    expect(frames[0]!.overlay).toBeLessThan(0.3);
    expect(
      frames.some((frame) => frame.overlay > 0.2 && frame.overlay < 0.8),
    ).toBe(true);
    await expect
      .poll(() =>
        page
          .locator(overlay)
          .evaluate((el) => Number(getComputedStyle(el).opacity)),
      )
      .toBe(1);
  });

  test('modal={false}: no overlay, the page stays usable', async ({ page }) => {
    await closeDefault(page);
    await page.getByRole('button', { name: 'Open non-modal' }).click();
    await page.waitForTimeout(700);
    await expect(page.getByTestId('non-modal-overlay')).toHaveCount(0);
    await page.getByText('Open from outside').click();
    await expect(page.getByTestId('controlled-state')).toHaveText('open');
    await expect(page.getByTestId('non-modal-content')).toHaveCount(1);
  });
});
