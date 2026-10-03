import { expect, test, type Page } from '@playwright/test';

import { gotoHydrated } from './disclosure-timeline';

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

const opacity = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => Number(getComputedStyle(el).opacity));

type MotionFrame = {
  t: number;
  share: number;
  opacity: number;
  overlay: number;
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
        }[] = [];
        let start = 0;
        const tick = () => {
          const el = document.querySelector<HTMLElement>(selector);
          if (el) {
            const now = performance.now();
            if (!start) start = now;
            const m = new DOMMatrix(getComputedStyle(el).transform);
            const ov = document.querySelector(overlay);
            frames.push({
              t: now - start,
              share:
                axis === 'y' ? m.m42 / el.offsetHeight : m.m41 / el.offsetWidth,
              opacity: Number(getComputedStyle(el).opacity),
              overlay: ov ? Number(getComputedStyle(ov).opacity) : 1,
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

test.describe('radix-ui drawer demo', () => {
  test.beforeEach(async ({ page }) => {
    await gotoHydrated(page, '/tests/demos/radix-ui/drawer');
  });

  const open = async (page: Page, settle = true) => {
    await page.getByRole('button', { name: 'Move goal' }).click();
    await page.locator(CONTENT).waitFor();
    if (settle) await page.waitForTimeout(700);
  };

  test('slides up from the bottom edge with Vaul attributes, then settles', async ({
    page,
  }) => {
    const motion = await recordMotion(page, CONTENT, OVERLAY);
    await open(page, false);
    const frames = await motion.frames();
    // Starts off screen, moves fast first (strong ease-out), no fade.
    expect(frames[0]!.share).toBeGreaterThan(0.8);
    expect(at(frames, 60).share).toBeGreaterThan(0.05);
    expect(at(frames, 60).share).toBeLessThan(frames[0]!.share);
    expect(at(frames, 60).opacity).toBe(1);
    expect(at(frames, 60).overlay).toBeLessThan(1);
    // Settled within the 600ms budget.
    expect(Math.abs(at(frames, 650).share)).toBeLessThan(0.01);
    expect(at(frames, 650).overlay).toBe(1);

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

    await page.waitForTimeout(600);
    expect(Math.abs((await state(page, CONTENT)).y)).toBeLessThan(1);
    expect(await opacity(page, OVERLAY)).toBe(1);
  });

  test('closes faster than it opens, sliding back down, then unmounts', async ({
    page,
  }) => {
    await open(page);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(80);
    expect((await state(page, CONTENT)).shareY).toBeGreaterThan(0.05);
    await expect(page.locator(CONTENT)).toHaveAttribute('data-state', 'closed');
    await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 450 });
    await expect(page.locator(OVERLAY)).toHaveCount(0);
  });

  test('a drag follows the finger 1:1, the overlay with it; a slow release springs back', async ({
    page,
  }) => {
    await open(page);
    const { height } = await state(page, CONTENT);
    const distance = Math.round(height * 0.2);
    await drag(page, CONTENT, { dy: distance, release: false });
    // No lag: the drawer sits where the finger is.
    const dragged = await state(page, CONTENT);
    expect(Math.abs(dragged.y - distance)).toBeLessThan(2);
    const overlay = await opacity(page, OVERLAY);
    expect(overlay).toBeLessThan(1);
    expect(Math.abs(overlay - (1 - distance / height))).toBeLessThan(0.05);
    await expect(page.locator(CONTENT)).toHaveClass(/vaul-dragging/);

    // Hold still, then let go: not a flick, under the threshold.
    await page.waitForTimeout(150);
    await page.mouse.up();
    await page.waitForTimeout(50);
    const released = await state(page, CONTENT);
    expect(released.y).toBeGreaterThan(5);
    expect(released.y).toBeLessThan(dragged.y);
    await page.waitForTimeout(700);
    expect(Math.abs((await state(page, CONTENT)).y)).toBeLessThan(1);
    expect(await opacity(page, OVERLAY)).toBe(1);
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
    await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 500 });
  });

  test('a short flick dismisses it', async ({ page }) => {
    await open(page);
    const { height } = await state(page, CONTENT);
    const distance = Math.round(height * 0.2);
    await drag(page, CONTENT, { dy: distance, steps: 3, every: 8 });
    await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 500 });
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
    await page.waitForTimeout(700);
    expect(Math.abs((await state(page, CONTENT)).y)).toBeLessThan(1);
  });

  test('a drag does not click the button it started on', async ({ page }) => {
    await open(page);
    const save = page.getByRole('button', { name: 'Save goal' });
    await drag(page, CONTENT, {
      at: {
        y:
          (await save.boundingBox())!.y -
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
    const trigger = page.getByRole('button', { name: 'Move goal' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 600 });
    await expect(trigger).toBeFocused();
  });

  test('reopening during the exit comes back fully', async ({ page }) => {
    await open(page);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    await page
      .getByRole('button', { name: 'Move goal' })
      .click({ force: true });
    await page.waitForTimeout(700);
    expect(Math.abs((await state(page, CONTENT)).y)).toBeLessThan(1);
    expect(await opacity(page, OVERLAY)).toBe(1);
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
    await page.waitForTimeout(650);
    expect((await state(page, CONTENT)).opacity).toBe(1);

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
      timeout: 400,
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
    // 100ms instead of 400ms.
    await page.getByText('Close default').click();
    await expect(page.locator(content)).toHaveCount(0, { timeout: 300 });

    // 200ms instead of 600ms.
    const motion = await recordMotion(page, content, OVERLAY, 'x', 400);
    await page.getByRole('button', { name: 'Open default' }).click();
    const frames = await motion.frames();
    expect(frames[0]!.share).toBeGreaterThan(0.8);
    expect(at(frames, 40).share).toBeGreaterThan(0.05);
    expect(Math.abs(at(frames, 260).share)).toBeLessThan(0.005);
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
      timeout: 500,
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
    await page.waitForTimeout(700);
    const content = '[data-testid="bottom-content"]';
    const { height } = await state(page, content);
    await drag(page, content, { dy: height * 0.25, hold: 150, release: false });
    const reported = Number(await page.getByTestId('last-drag').textContent());
    expect(reported).toBeGreaterThan(0.2);
    expect(reported).toBeLessThan(0.3);
    await page.mouse.up();
    await expect(page.getByTestId(`bottom-content`)).toHaveCount(0, {
      timeout: 500,
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
    await page.waitForTimeout(700);
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
    await expect(page.locator(content)).toHaveCount(0, { timeout: 500 });
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
      );
      await page.getByText(`Open ${direction}`).click();
      const frames = await motion.frames();
      expect(frames[0]!.share * sign).toBeGreaterThan(0.8);
      expect(at(frames, 60).share * sign).toBeGreaterThan(0.05);
      expect(Math.abs(at(frames, 650).share)).toBeLessThan(0.01);
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
      await page.waitForTimeout(700);

      await drag(page, content, {
        at: grab,
        ...(axis === 'x'
          ? { dx: box.width * 0.5 * sign }
          : { dy: box.height * 0.5 * sign }),
        hold: 150,
      });
      await expect(page.locator(content)).toHaveCount(0, { timeout: 500 });
    });
  }

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
    // The overlay fades in from the last snap point only.
    expect(await opacity(page, '[data-testid="snap-overlay"]')).toBe(0);

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
    expect(await opacity(page, '[data-testid="snap-overlay"]')).toBe(1);

    // From the last one, it closes, then resets to the first.
    await page.getByTestId('snap-handle').click();
    await expect(page.locator(content)).toHaveCount(0, { timeout: 800 });
    await expect(page.getByTestId('snap-state')).toHaveText('0.4', {
      timeout: 1000,
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
    // From 600px towards full height, the overlay follows.
    await drag(page, content, { dy: -60, release: false });
    const overlay = await opacity(page, '[data-testid="snap-overlay"]');
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
    await expect(page.locator(content)).toHaveCount(0, { timeout: 800 });
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
    await expect(page.locator(content)).toHaveCount(0, { timeout: 500 });
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
      timeout: 800,
    });
    await page.waitForTimeout(100);
    const restored = await state(page, parent);
    expect(restored.scale).toBeCloseTo(1, 3);
    expect(Math.abs(restored.y)).toBeLessThan(1);
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
    await page.waitForTimeout(500);
    await expect(content).toHaveCount(1);
    expect(await kept()).toEqual({ visibility: 'hidden', inert: true });
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
