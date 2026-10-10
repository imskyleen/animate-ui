import { expect, test, type Page } from '@playwright/test';

// A menubar's popover, handed from one menu to the next (shared by the Radix
// UI and Base UI menubar specs): moving from an open menu to another, the
// popover doesn't close and reopen, it moves to the next menu and resizes,
// while the content changes like Motion's mega menu. The content stays where
// it is on screen while the popover slides over it: going from File to Edit,
// File's items leave to the left and fade out, Edit's come in from the right
// and fade in behind them (the other way around going back). One popover on
// screen, every frame. Going back and forth faster than they settle, each
// menu's content shows once, leaving from where it is, and a menu coming back
// takes its content back from there.

const CONTENT = '[data-slot="menubar-content"]';
const SUB_CONTENT = '[data-slot$="sub-content"]';
const COPY = '[data-animate-ui-handoff]';

type Box = { left: number; top: number; width: number; height: number };

type ShownPopover = Box & {
  /** Its own first item's text (not the copy's). */
  label: string;
  opacity: number;
  scale: number;
  /** The latest menu's content leaving inside it. */
  copy: {
    opacity: number;
    /** Its first item, on screen. */
    left: number;
    text: string;
    ariaHidden: boolean;
    inert: boolean;
    ids: number;
  } | null;
  /** Its own first item, on screen. */
  first: { opacity: number; left: number } | null;
  /**
   * Each menu's content inside it, its own first, then each one leaving: its
   * text, how much it shows (its first item's opacity, on its layer's) and
   * where its first item is.
   */
  contents: { text: string; shown: number; left: number }[];
  /** Copies inside copies. */
  nested: number;
};

export type PopoverFrame = {
  t: number;
  /** The document timeline's time: what animations are sampled at. */
  clock: number;
  /** Popovers on screen: visible, not transparent, placed. */
  shown: ShownPopover[];
  /** Submenus on screen. */
  subs: number;
};

/**
 * Records, frame by frame, what will be painted, for `duration` ms: call it
 * right before the interaction, then await it. Sampled by a resize observer
 * on a probe resized in the previous round of the same rendering step: after
 * every requestAnimationFrame callback, layout, and every other resize
 * observer (the handoff swaps popovers in one).
 */
export function recordPopovers(page: Page, duration: number) {
  return page.evaluate(
    ({ content, subContent, copySelector, duration }) =>
      new Promise<PopoverFrame[]>((resolve) => {
        const frames: PopoverFrame[] = [];
        const t0 = performance.now();
        const shownNow = (el: HTMLElement) => {
          const style = getComputedStyle(el);
          const box = el.getBoundingClientRect();
          return (
            style.visibility === 'visible' &&
            Number(style.opacity) > 0.02 &&
            box.bottom > 0 &&
            box.width > 0
          );
        };
        const sample = () => {
          const shown = [...document.querySelectorAll<HTMLElement>(content)]
            .filter(shownNow)
            .map((el) => {
              const style = getComputedStyle(el);
              const box = el.getBoundingClientRect();
              const own = [...el.children].filter(
                (child) => !child.matches(copySelector),
              ) as HTMLElement[];
              const layers = [
                ...el.querySelectorAll<HTMLElement>(`:scope > ${copySelector}`),
              ];
              const copy = layers.at(-1);
              const copyFirst = copy?.firstElementChild;
              const matrix = style.transform.match(/matrix\(([^,]+)/);
              return {
                left: box.left,
                top: box.top,
                width: box.width,
                height: box.height,
                label: (own[0]?.textContent ?? '').trim(),
                opacity: Number(style.opacity),
                scale: matrix ? Number(matrix[1]) : 1,
                copy:
                  copy && copyFirst
                    ? {
                        opacity: Number(getComputedStyle(copy).opacity),
                        left: copyFirst.getBoundingClientRect().left,
                        text: copy.textContent ?? '',
                        ariaHidden: copy.getAttribute('aria-hidden') === 'true',
                        inert: copy.hasAttribute('inert'),
                        ids: copy.querySelectorAll('[id]').length,
                      }
                    : null,
                first: own[0]
                  ? {
                      opacity: Number(getComputedStyle(own[0]).opacity),
                      left: own[0].getBoundingClientRect().left,
                    }
                  : null,
                contents: [
                  ...(own[0] ? [[own[0], 1] as const] : []),
                  ...layers.map(
                    (layer) =>
                      [
                        layer.firstElementChild,
                        Number(getComputedStyle(layer).opacity),
                      ] as const,
                  ),
                ]
                  .filter(([item]) => item)
                  .map(([item, opacity]) => ({
                    text: (item!.textContent ?? '').trim(),
                    shown: opacity * Number(getComputedStyle(item!).opacity),
                    left: item!.getBoundingClientRect().left,
                  })),
                nested: el.querySelectorAll(`${copySelector} ${copySelector}`)
                  .length,
              };
            });
          const subs = [
            ...document.querySelectorAll<HTMLElement>(subContent),
          ].filter(shownNow).length;
          frames.push({
            t: Math.round(performance.now() - t0),
            clock: Number(document.timeline.currentTime),
            shown,
            subs,
          });
        };
        const probe = document.createElement('div');
        probe.style.cssText =
          'position:fixed;left:0;top:0;width:1px;height:1px;pointer-events:none';
        const deep = document.createElement('div');
        deep.style.cssText = 'width:1px;height:1px';
        probe.appendChild(deep);
        document.body.appendChild(probe);
        let frame = 0;
        let round = 0;
        const first = new ResizeObserver(() => {
          deep.style.width = `${(round += 1) % 2 ? 2 : 1}px`;
        });
        const second = new ResizeObserver(sample);
        first.observe(probe);
        second.observe(deep);
        const tick = () => {
          if (performance.now() - t0 > duration) {
            first.disconnect();
            second.disconnect();
            probe.remove();
            resolve(frames.slice(1));
            return;
          }
          // A new size every frame: the observers report once per frame.
          probe.style.width = `${(frame += 1) % 2 ? 2 : 1}px`;
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    {
      content: CONTENT,
      subContent: SUB_CONTENT,
      copySelector: COPY,
      duration,
    },
  );
}

const trigger = (page: Page, name: string) =>
  page.getByRole('menuitem', { name, exact: true });

/** Hovers a trigger (its center), at once. */
async function hover(page: Page, name: string) {
  const box = (await trigger(page, name).boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
}

/** A menu's popover, and its first item, at rest. */
async function boxOf(page: Page, label: string) {
  return page.locator(CONTENT, { hasText: label }).evaluate((el) => {
    const { left, top, width, height, bottom } = el.getBoundingClientRect();
    const first = el.firstElementChild!.getBoundingClientRect();
    return { left, top, width, height, bottom, firstLeft: first.left };
  });
}

/** The first frame showing the popover whose first item reads `label`. */
function firstShowing(frames: PopoverFrame[], label: string) {
  return frames.find((frame) =>
    frame.shown.some((popover) => popover.label.startsWith(label)),
  );
}

/**
 * Where the text of a row starts in each frame as the browser paints it (its
 * compositor's frames, a screencast), while `act` runs and `duration` ms
 * after: the leftmost dark pixel inside `band`, null once it's faded or
 * clipped away. Values computed on the main thread can't show a compositor
 * animation running out of step with one on the main thread.
 */
export async function paintedLeft(
  page: Page,
  band: { left: number; right: number; top: number; bottom: number },
  act: () => Promise<void>,
  duration: number,
) {
  const cdp = await page.context().newCDPSession(page);
  const frames: string[] = [];
  cdp.on('Page.screencastFrame', (frame) => {
    frames.push(frame.data);
    cdp
      .send('Page.screencastFrameAck', { sessionId: frame.sessionId })
      .catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
  await page.waitForTimeout(300);
  const start = Math.max(0, frames.length - 1);
  await act();
  await page.waitForTimeout(duration);
  await cdp.send('Page.stopScreencast');
  return page.evaluate(
    async ({ frames, band }) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true })!;
      const lefts: (number | null)[] = [];
      for (const data of frames) {
        const image = new Image();
        image.src = `data:image/png;base64,${data}`;
        await image.decode();
        // Screencast frames are in CSS pixels, the viewport's size.
        const scale = image.naturalWidth / window.innerWidth;
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        context.drawImage(image, 0, 0);
        const x0 = Math.round(band.left * scale);
        const y0 = Math.round(band.top * scale);
        const width = Math.round((band.right - band.left) * scale);
        const height = Math.round((band.bottom - band.top) * scale);
        const { data: pixels } = context.getImageData(x0, y0, width, height);
        let left: number | null = null;
        for (let x = 0; x < width && left === null; x++)
          for (let y = 0; y < height; y++) {
            const i = (y * width + x) * 4;
            if ((pixels[i]! + pixels[i + 1]! + pixels[i + 2]!) / 3 < 150) {
              left = band.left + x / scale;
              break;
            }
          }
        lefts.push(left);
      }
      return lefts;
    },
    { frames: frames.slice(start), band },
  );
}

/** One popover on screen, every frame, never dimmed. */
function expectOnePopover(frames: PopoverFrame[], top?: number) {
  expect(frames.length).toBeGreaterThan(5);
  for (const frame of frames) {
    expect(
      frame.shown.length,
      `${frame.t}ms: ${frame.shown.map((p) => p.label).join(' + ') || 'none'}`,
    ).toBe(1);
    expect(frame.shown[0]!.opacity, `${frame.t}ms`).toBeGreaterThan(0.9);
    if (top !== undefined)
      expect(Math.abs(frame.shown[0]!.top - top), `${frame.t}ms`).toBeLessThan(
        1.5,
      );
  }
}

/** The values of `pick` frame by frame, for the popover showing `label`. */
function series(
  frames: PopoverFrame[],
  label: string,
  pick: (popover: ShownPopover) => number | undefined,
) {
  return frames
    .map((frame) => frame.shown[0])
    .filter((popover) => popover?.label.startsWith(label))
    .map((popover) => pick(popover!))
    .filter((value): value is number => value !== undefined);
}

/**
 * The popover on screen frame by frame (the last sample of each), on the
 * timeline: its left edge and its own first item's text.
 */
function onTimeline(frames: PopoverFrame[]) {
  const byClock = new Map<
    number,
    { clock: number; left: number; label: string }
  >();
  for (const frame of frames) {
    const popover = frame.shown[0];
    if (popover)
      byClock.set(frame.clock, {
        clock: frame.clock,
        left: popover.left,
        label: popover.label,
      });
  }
  return [...byClock.values()];
}

/** The popover shows at least once with its left edge past `left`. */
function underWay(page: Page, left: number) {
  return page.waitForFunction(
    ({ content, left }) =>
      [...document.querySelectorAll(content)].some(
        (el) =>
          getComputedStyle(el).visibility === 'visible' &&
          el.getBoundingClientRect().left > left,
      ),
    { content: CONTENT, left },
    { polling: 'raf' },
  );
}

/** Only ever goes one way (`way` 1: up, -1: down), within half a pixel. */
function expectOneWay(values: number[], way: 1 | -1) {
  expect(values.length).toBeGreaterThan(3);
  for (let i = 1; i < values.length; i++)
    expect((values[i]! - values[i - 1]!) * way).toBeGreaterThanOrEqual(-0.5);
}

/** The popover showing `label` first shows at `from`'s box, at its size. */
function expectFrom(frames: PopoverFrame[], label: string, from: Box) {
  const first = firstShowing(frames, label)!.shown[0]!;
  expect(Math.abs(first.left - from.left)).toBeLessThan(1.5);
  expect(Math.abs(first.top - from.top)).toBeLessThan(1.5);
  expect(Math.abs(first.width - from.width)).toBeLessThan(1.5);
  expect(Math.abs(first.height - from.height)).toBeLessThan(1.5);
}

/** Moves the bar: to the bottom of the page, or against its right edge. */
function placeBar(page: Page, where: 'bottom' | 'right') {
  return page.locator('[data-slot="menubar"]').evaluate((el, where) => {
    Object.assign(
      el.style,
      where === 'bottom'
        ? { position: 'fixed', bottom: '8px', left: '300px' }
        : { position: 'fixed', top: '100px', right: '0px', width: 'auto' },
    );
  }, where);
}

export function describeMenubarHandoff(title: string, path: string) {
  test.describe(title, () => {
    test.describe.configure({ timeout: 180_000 });
    test.beforeEach(async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
    });

    const open = async (page: Page, name = 'File') => {
      await trigger(page, name).click();
      await page.waitForTimeout(500);
    };

    test('moving to another menu moves the popover there', async ({ page }) => {
      await open(page);
      const file = await boxOf(page, 'New Tab');
      const recording = recordPopovers(page, 700);
      await hover(page, 'Edit');
      const frames = await recording;
      const edit = await boxOf(page, 'Undo');

      // One surface all along: the next menu shows in the frame the previous
      // one goes, where it was, at its size, unscaled.
      expectOnePopover(frames, file.top);
      const first = firstShowing(frames, 'Undo')!.shown[0]!;
      expect(Math.abs(first.left - file.left)).toBeLessThan(1.5);
      expect(Math.abs(first.width - file.width)).toBeLessThan(1.5);
      expect(Math.abs(first.height - file.height)).toBeLessThan(1.5);
      expect(first.scale).toBe(1);
      // It moves on to its own place and size, without going back.
      expect(edit.left - file.left).toBeGreaterThan(10);
      expectOneWay(
        series(frames, 'Undo', (popover) => popover.left),
        1,
      );
      const last = frames.at(-1)!.shown[0]!;
      expect(Math.abs(last.left - edit.left)).toBeLessThan(0.5);
      expect(Math.abs(last.height - edit.height)).toBeLessThan(0.5);
    });

    test('it starts gently and eases into its place, never past it', async ({
      page,
    }) => {
      await open(page);
      const file = await boxOf(page, 'New Tab');
      const recording = recordPopovers(page, 900);
      await hover(page, 'Profiles');
      const frames = await recording;
      const profiles = await boxOf(page, 'Andy');
      expect(profiles.left - file.left).toBeGreaterThan(60);
      const shown = onTimeline(frames);
      // On a spring from rest: its first frames speed up (a tween, only
      // slowing down, would start at its fastest).
      const moving = shown.findIndex(
        (frame, i) => i > 0 && frame.left > shown[i - 1]!.left + 1,
      );
      expect(moving).toBeGreaterThan(0);
      const speed = (i: number) =>
        (shown[i]!.left - shown[i - 1]!.left) /
        (shown[i]!.clock - shown[i - 1]!.clock);
      expect(
        speed(moving),
        shown
          .map((f) => `${Math.round(f.clock)}:${f.left.toFixed(1)}`)
          .join(' '),
      ).toBeLessThan(speed(moving + 1) * 0.95);
      // Never faster than a critically damped spring's peak from rest, ~0.95%
      // of the way per ms (a tween starting at its fastest goes 1.25% or more).
      const fastest = Math.max(...shown.slice(1).map((_, i) => speed(i + 1)));
      expect(fastest).toBeLessThan((profiles.left - file.left) * 0.0105);
      // No bounce: it never goes past its place.
      const lefts = shown.map((frame) => frame.left);
      expect(Math.max(...lefts)).toBeLessThanOrEqual(profiles.left + 0.5);
      expect(Math.abs(lefts.at(-1)! - profiles.left)).toBeLessThan(0.5);
    });

    test('swept on before it lands, it keeps its speed from menu to menu', async ({
      page,
    }) => {
      await open(page);
      const file = await boxOf(page, 'New Tab');
      const recording = recordPopovers(page, 900);
      await hover(page, 'Edit');
      await underWay(page, file.left + 8);
      await hover(page, 'View');
      const frames = await recording;
      const view = await boxOf(page, 'Bookmarks');
      const shown = onTimeline(frames);
      const next = shown.findIndex(
        (frame) =>
          !frame.label.startsWith('New Tab') && !frame.label.startsWith('Undo'),
      );
      expect(next).toBeGreaterThan(2);
      const speed = (i: number) =>
        (shown[i]!.left - shown[i - 1]!.left) /
        (shown[i]!.clock - shown[i - 1]!.clock);
      const before = speed(next - 1);
      expect(before).toBeGreaterThan(0.1);
      // Neither stopping (a move started from rest, or waiting while the
      // next menu mounts) nor lurching (a tween starting at its fastest).
      expect(speed(next) / before).toBeGreaterThan(0.6);
      expect(speed(next) / before).toBeLessThan(2.5);
      expect(speed(next + 1) / before).toBeGreaterThan(0.6);
      // Nor going past View's place.
      const lefts = shown.map((frame) => frame.left);
      expect(Math.max(...lefts)).toBeLessThanOrEqual(view.left + 0.5);
    });

    test('sent back before it lands, it turns back at once, without carrying on', async ({
      page,
    }) => {
      await open(page);
      const file = await boxOf(page, 'New Tab');
      const recording = recordPopovers(page, 1000);
      // Well past Edit (36px from File), on its way to Profiles.
      await hover(page, 'Profiles');
      await underWay(page, file.left + 70);
      await hover(page, 'Edit');
      const frames = await recording;
      const edit = await boxOf(page, 'Undo');
      const shown = onTimeline(frames);
      const back = shown.findIndex((frame) => frame.label.startsWith('Undo'));
      expect(back).toBeGreaterThan(2);
      // No bounce: it doesn't go on right (where it was going) first, and
      // it eases into Edit's place without going past it.
      const at = shown[back - 1]!.left;
      const lefts = shown.slice(back).map((frame) => frame.left);
      expect(Math.max(...lefts)).toBeLessThanOrEqual(at + 0.5);
      expect(Math.min(...lefts)).toBeGreaterThanOrEqual(edit.left - 0.5);
      expect(Math.abs(lefts.at(-1)! - edit.left)).toBeLessThan(0.5);
    });

    test("the content stays on screen: File's leaves to the left, Edit's comes from the right", async ({
      page,
    }) => {
      await open(page);
      const file = await boxOf(page, 'New Tab');
      let recording = recordPopovers(page, 600);
      await hover(page, 'Edit');
      // The previous items are only seen: no menu item twice.
      await page.waitForTimeout(40);
      await expect(
        page.getByRole('menuitem', { name: /New Window/ }),
      ).toHaveCount(0);
      let frames = await recording;
      const edit = await boxOf(page, 'Undo');

      // File's items, copied inside the moving popover, start where they
      // were on screen and only ever go left, as they fade out.
      let swap = frames.filter((frame) => frame.shown[0]?.copy);
      expect(swap.length).toBeGreaterThan(3);
      let start = swap[0]!.shown[0]!;
      expect(start.copy!.text).toContain('New Window');
      expect(start.copy!.ariaHidden).toBe(true);
      expect(start.copy!.inert).toBe(true);
      expect(start.copy!.ids).toBe(0);
      expect(start.copy!.opacity).toBeGreaterThan(0.75);
      expect(Math.abs(start.copy!.left - file.firstLeft)).toBeLessThan(1.5);
      expectOneWay(
        series(swap, 'Undo', (popover) => popover.copy?.left),
        -1,
      );
      let end = swap.at(-1)!.shown[0]!;
      expect(end.copy!.opacity).toBeLessThan(0.1);
      expect(end.copy!.left - file.firstLeft).toBeLessThan(-4);
      expect(end.copy!.left - file.firstLeft).toBeGreaterThanOrEqual(-6.5);
      // Edit's items come in from the right of where they rest, on screen,
      // and only ever go left, behind File's: those have mostly cleared
      // before they show.
      expect(start.first!.opacity).toBeLessThan(0.1);
      expect(start.first!.left - edit.firstLeft).toBeGreaterThan(4);
      expect(start.first!.left - edit.firstLeft).toBeLessThanOrEqual(6.5);
      expectOneWay(
        series(frames, 'Undo', (popover) => popover.first?.left),
        -1,
      );
      const middle = swap.find((frame) => frame.t - swap[0]!.t >= 90)!;
      expect(middle.shown[0]!.copy!.opacity).toBeLessThan(0.5);
      expect(middle.shown[0]!.first!.opacity).toBeLessThan(0.3);
      // Then they rest where they belong.
      const rest = frames.at(-1)!.shown[0]!;
      expect(rest.copy).toBeNull();
      expect(rest.first!.opacity).toBe(1);
      expect(Math.abs(rest.first!.left - edit.firstLeft)).toBeLessThan(0.2);
      await expect(page.locator(COPY)).toHaveCount(0, { timeout: 600 });

      // Going back to File: the other way around.
      await page.waitForTimeout(300);
      recording = recordPopovers(page, 400);
      await hover(page, 'File');
      frames = await recording;
      swap = frames.filter((frame) => frame.shown[0]?.copy);
      start = swap[0]!.shown[0]!;
      expect(start.copy!.text).toContain('Undo');
      expect(Math.abs(start.copy!.left - edit.firstLeft)).toBeLessThan(1.5);
      expectOneWay(
        series(swap, 'New Tab', (popover) => popover.copy?.left),
        1,
      );
      expect(start.first!.left - file.firstLeft).toBeLessThan(-4);
      expectOneWay(
        series(frames, 'New Tab', (popover) => popover.first?.left),
        1,
      );
      end = swap.at(-1)!.shown[0]!;
      expect(end.copy!.left - edit.firstLeft).toBeGreaterThan(4);
    });

    test('as painted, the content holds still as the popover starts moving', async ({
      page,
    }) => {
      await open(page);
      const row = await page
        .getByRole('menuitem', { name: /New Tab/ })
        .boundingBox();
      const popover = await boxOf(page, 'New Tab');
      const lefts = await paintedLeft(
        page,
        {
          left: popover.left - 12,
          right: row!.x + 60,
          top: row!.y + 3,
          bottom: row!.y + row!.height - 3,
        },
        () => hover(page, 'Edit'),
        300,
      );
      // File's items slide 6px left over 220ms (~1.3px a frame at most),
      // until the popover's edge clips them: never a jump. A move of the
      // copy out of step with the popover's would jump them aside at once.
      const seen = lefts.filter((left): left is number => left !== null);
      expect(seen.length).toBeGreaterThan(2);
      for (let i = 1; i < seen.length; i++)
        expect(
          seen[i]! - seen[i - 1]!,
          `frame ${i}: ${seen.join(', ')}`,
        ).toBeGreaterThan(-3);
    });

    test('the arrow keys hand the popover over too', async ({ page }) => {
      await open(page);
      const file = await boxOf(page, 'New Tab');
      const recording = recordPopovers(page, 1500);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(400);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(400);
      // Base UI closes the menu before it opens the previous one.
      await page.keyboard.press('ArrowLeft');
      const frames = await recording;
      expectOnePopover(frames, file.top);
      const edit = firstShowing(frames, 'Undo')!.shown[0]!;
      expect(Math.abs(edit.left - file.left)).toBeLessThan(1.5);
      // Coming back to Edit, from View's popover.
      const back = frames.find(
        (frame) => frame.t > 800 && frame.shown[0]!.label.startsWith('Undo'),
      )!.shown[0]!;
      expect(back.copy?.text ?? '').toContain('Bookmarks');
    });

    test('sweeping fast across the bar never blinks', async ({ page }) => {
      await open(page);
      const { top } = await boxOf(page, 'New Tab');
      // Back to a menu still leaving, more than once.
      const sweep = async () => {
        for (const name of ['Edit', 'View', 'Profiles', 'View', 'Edit']) {
          await hover(page, name);
          await page.waitForTimeout(50);
        }
      };
      let recording = recordPopovers(page, 900);
      await sweep();
      expectOnePopover(await recording, top);

      // On a slow machine too.
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await hover(page, 'File');
      await page.waitForTimeout(800);
      recording = recordPopovers(page, 1500);
      await sweep();
      expectOnePopover(await recording, top);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    });

    test("going back and forth, each menu's content shows once, never inside another's", async ({
      page,
    }) => {
      await open(page);
      const recording = recordPopovers(page, 1600);
      // Faster than the content settles: back to menus still leaving.
      for (let pass = 0; pass < 2; pass++)
        for (const name of [
          'Edit',
          'View',
          'Profiles',
          'View',
          'Edit',
          'File',
        ]) {
          await hover(page, name);
          await page.waitForTimeout(40);
        }
      const frames = await recording;
      expectOnePopover(frames);
      for (const frame of frames) {
        const popover = frame.shown[0]!;
        expect(popover.nested, `${frame.t}ms`).toBe(0);
        const shown = popover.contents
          .filter((content) => content.shown > 0.02)
          .map((content) => content.text.slice(0, 6));
        expect(new Set(shown).size, `${frame.t}ms: ${shown.join(' + ')}`).toBe(
          shown.length,
        );
      }
    });

    test('back to a menu still leaving, its content comes back from where it is', async ({
      page,
    }) => {
      await open(page);
      const file = await boxOf(page, 'New Tab');
      const recording = recordPopovers(page, 900);
      await hover(page, 'Edit');
      await page.waitForTimeout(50);
      await hover(page, 'File');
      const frames = await recording;
      expectOnePopover(frames);
      // File's content, frame by frame: leaving inside Edit's popover, then
      // File's own again.
      const seen = frames.flatMap((frame) => {
        const popover = frame.shown[0]!;
        const content = popover.contents.find((c) =>
          c.text.startsWith('New Tab'),
        );
        return content
          ? [{ t: frame.t, own: popover.label.startsWith('New Tab'), content }]
          : [];
      });
      const back = seen.findIndex(
        (frame, i) => i > 0 && frame.own && !seen[i - 1]!.own,
      );
      expect(back).toBeGreaterThan(0);
      const leaving = seen[back - 1]!.content;
      const returning = seen[back]!.content;
      // Still in sight when it comes back, it goes on from there (give or
      // take the frame or two it went on fading out, quickly at first): not
      // from nothing, not from 6px aside.
      expect(leaving.shown).toBeGreaterThan(0.1);
      expect(returning.shown).toBeGreaterThan(leaving.shown * 0.6);
      expect(Math.abs(returning.left - leaving.left)).toBeLessThan(1.5);
      // Then it only clears up, and slides back to its place, one way.
      const rest = seen.slice(back);
      for (let i = 1; i < rest.length; i++)
        expect(
          rest[i]!.content.shown,
          `${rest[i]!.t}ms`,
        ).toBeGreaterThanOrEqual(rest[i - 1]!.content.shown - 0.01);
      expectOneWay(
        rest.map((frame) => frame.content.left),
        1,
      );
      const last = rest.at(-1)!.content;
      expect(last.shown).toBe(1);
      expect(Math.abs(last.left - file.firstLeft)).toBeLessThan(0.2);
    });

    test('two moves within one frame still hand over the popover on screen', async ({
      page,
    }) => {
      await open(page);
      const file = await boxOf(page, 'New Tab');
      const cdp = await page.context().newCDPSession(page);
      const recording = recordPopovers(page, 900);
      // Both keys wait behind a busy main thread: they're handled within
      // the same frame, the second before the first handoff has run.
      await page.evaluate(() =>
        setTimeout(() => {
          const end = performance.now() + 150;
          while (performance.now() < end);
        }),
      );
      const key = {
        type: 'rawKeyDown',
        key: 'ArrowRight',
        code: 'ArrowRight',
        windowsVirtualKeyCode: 39,
      } as const;
      await Promise.all([
        cdp.send('Input.dispatchKeyEvent', key),
        cdp.send('Input.dispatchKeyEvent', key),
      ]);
      await cdp.send('Input.dispatchKeyEvent', { ...key, type: 'keyUp' });
      const frames = await recording;
      expectOnePopover(frames, file.top);
      // View takes over the popover on screen: File's.
      const view = frames.find((frame) => frame.shown[0]!.copy)!.shown[0]!;
      expect(view.copy!.text).toContain('New Window');
      expect(Math.abs(view.left - file.left)).toBeLessThan(1.5);
    });

    test('once it has landed, nothing of the handoff is left', async ({
      page,
    }) => {
      await open(page);
      await hover(page, 'Edit');
      await page.waitForTimeout(700);
      await expect(page.locator(CONTENT)).toHaveCount(1);
      await expect(page.locator(COPY)).toHaveCount(0);
      const rest = await page.locator(CONTENT).evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          inline: [
            'width',
            'height',
            'translate',
            'overflow',
            'visibility',
            'white-space',
            'position',
            'min-width',
            'max-height',
            'margin-right',
            'margin-bottom',
          ].filter((name) => el.style.getPropertyValue(name) !== ''),
          transform: style.transform,
          translate: style.translate,
          animations: el.getAnimations({ subtree: true }).length,
        };
      });
      expect(rest).toEqual({
        inline: [],
        transform: 'none',
        translate: 'none',
        animations: 0,
      });
      // So its submenus open beside their trigger (a transform would contain
      // their fixed positioning).
      await trigger(page, 'Find').hover();
      const item = page.getByRole('menuitem', { name: 'Search the web' });
      await expect(item).toBeVisible();
      await page.waitForTimeout(400);
      const find = (await trigger(page, 'Find').boundingBox())!;
      const sub = (await item.boundingBox())!;
      expect(sub.x).toBeGreaterThan(find.x + find.width - 8);
      expect(Math.abs(sub.y - find.y)).toBeLessThan(12);
    });

    test('the menu left goes at once, so coming back to it works', async ({
      page,
    }) => {
      await open(page);
      // Unmounted within a few frames, not after its exit.
      const gone = page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            const t0 = performance.now();
            const check = () => {
              const contents = document.querySelectorAll(
                '[data-slot="menubar-content"]',
              );
              const swapping = document.querySelector(
                '[data-slot="menubar-content"] [data-animate-ui-handoff]',
              );
              const elapsed = performance.now() - t0;
              if ((contents.length === 1 && swapping) || elapsed > 1000)
                resolve(elapsed);
              else requestAnimationFrame(check);
            };
            requestAnimationFrame(check);
          }),
      );
      await hover(page, 'Edit');
      expect(await gone).toBeLessThan(150);

      // Back to File and Escape at once: the bar closes.
      await page.waitForTimeout(80);
      await hover(page, 'File');
      await page.waitForTimeout(80);
      await page.keyboard.press('Escape');
      await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 700 });

      // Back to Edit at once: the keys reach its items.
      await open(page);
      for (const name of ['Edit', 'View', 'Edit']) {
        await hover(page, name);
        await page.waitForTimeout(80);
      }
      await page.waitForTimeout(400);
      await page.keyboard.press('ArrowDown');
      await expect(page.getByRole('menuitem', { name: /Undo/ })).toBeFocused();
    });

    test('an open submenu goes with its menu', async ({ page }) => {
      await open(page);
      await trigger(page, 'Share').hover();
      await expect(
        page.getByRole('menuitem', { name: 'Email link' }),
      ).toBeVisible();
      await page.waitForTimeout(400);
      const recording = recordPopovers(page, 500);
      await hover(page, 'Edit');
      const frames = await recording;
      expectOnePopover(frames);
      // Shown until the move, gone in the frame Edit shows.
      expect(frames[0]!.subs).toBe(1);
      expect(
        frames.filter(
          (frame) =>
            frame.subs > 0 &&
            frame.shown.some((popover) => popover.label.startsWith('Undo')),
        ),
      ).toEqual([]);
    });

    test('after the keyboard, hovering another menu moves there', async ({
      page,
    }) => {
      await open(page);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(300);
      await hover(page, 'Edit');
      await page.waitForTimeout(700);
      await expect(page.locator(CONTENT)).toHaveCount(1);
      await expect(page.locator(CONTENT)).toContainText('Undo');
    });

    test('closing right after a move plays the exit, then leaves nothing', async ({
      page,
    }) => {
      await open(page);
      await hover(page, 'Edit');
      await page.waitForTimeout(100);
      await page.keyboard.press('Escape');
      await expect
        .poll(
          async () =>
            page
              .locator(CONTENT, { hasText: 'Undo' })
              .evaluate((el) => Number(getComputedStyle(el).opacity))
              .catch(() => 0),
          { intervals: [16] },
        )
        .toBeLessThan(1);
      await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 700 });
      await expect(page.locator(COPY)).toHaveCount(0);
    });

    test('above the bar, it moves without covering it', async ({ page }) => {
      await placeBar(page, 'bottom');
      await open(page);
      const file = await boxOf(page, 'New Tab');
      const bar = (await trigger(page, 'Edit').boundingBox())!;
      expect(file.bottom).toBeLessThan(bar.y);
      const recording = recordPopovers(page, 600);
      await hover(page, 'Edit');
      const frames = await recording;
      expectOnePopover(frames);
      expectFrom(frames, 'Undo', file);
      // Its bottom edge holds above the triggers while it grows upward.
      for (const bottom of series(frames, 'Undo', (p) => p.top + p.height))
        expect(Math.abs(bottom - file.bottom)).toBeLessThan(1.5);
      expectOneWay(
        series(frames, 'Undo', (p) => p.left),
        1,
      );
    });

    test('against the edge of the page, it moves only toward its place', async ({
      page,
    }) => {
      await placeBar(page, 'right');
      await open(page, 'View');
      const view = await boxOf(page, 'Bookmarks');
      const recording = recordPopovers(page, 600);
      await hover(page, 'Profiles');
      const frames = await recording;
      expectOnePopover(frames);
      // It starts where View's was, and only moves toward its place: against
      // the edge, it doesn't overshoot (it would go past the page).
      expectFrom(frames, 'Andy', view);
      expectOneWay(
        series(frames, 'Andy', (p) => p.left),
        1,
      );
      expectOneWay(
        series(frames, 'Andy', (p) => p.left + p.width),
        1,
      );
      const pageWidth = await page.evaluate(
        () => document.documentElement.clientWidth,
      );
      for (const right of series(frames, 'Andy', (p) => p.left + p.width))
        expect(right).toBeLessThanOrEqual(pageWidth + 0.5);
    });
  });

  test.describe(`${title}, touch`, () => {
    test.describe.configure({ timeout: 180_000 });
    test.use({ hasTouch: true });
    test('tapping another menu hands the popover over', async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      await trigger(page, 'File').tap();
      await page.waitForTimeout(500);
      const recording = recordPopovers(page, 600);
      await trigger(page, 'Edit').tap();
      const frames = await recording;
      expectOnePopover(frames);
      expect(frames.some((frame) => frame.shown[0]!.copy)).toBe(true);
    });
  });

  test.describe(`${title}, narrow page`, () => {
    test.describe.configure({ timeout: 180_000 });
    test.use({ viewport: { width: 330, height: 700 } });
    test('it moves only toward its place', async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      await trigger(page, 'View').click();
      await page.waitForTimeout(500);
      const view = await boxOf(page, 'Bookmarks');
      const recording = recordPopovers(page, 600);
      await hover(page, 'Profiles');
      const frames = await recording;
      expectOnePopover(frames);
      expectFrom(frames, 'Andy', view);
      expectOneWay(
        series(frames, 'Andy', (p) => p.left),
        1,
      );
    });
  });

  test.describe(`${title}, reduced motion`, () => {
    test.describe.configure({ timeout: 180_000 });
    test('each menu fades in place', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path, { waitUntil: 'networkidle' });
      await trigger(page, 'File').click();
      await page.waitForTimeout(500);
      const recording = recordPopovers(page, 500);
      await hover(page, 'Edit');
      const frames = await recording;
      const edit = await boxOf(page, 'Undo');
      expect(frames.every((frame) => frame.shown.every((p) => !p.copy))).toBe(
        true,
      );
      const first = firstShowing(frames, 'Undo')!.shown.find((p) =>
        p.label.startsWith('Undo'),
      )!;
      expect(Math.abs(first.left - edit.left)).toBeLessThan(0.5);
      expect(first.scale).toBe(1);
      expect(first.opacity).toBeLessThan(1);
    });
  });
}

/**
 * Menus kept mounted while closed (Radix's `forceMount`, Base UI's
 * `keepMounted`), on a fixture: Gamma, then Delta, taller and wider.
 */
export function describeKeptMountedHandoff(title: string, path: string) {
  test.describe(title, () => {
    test.describe.configure({ timeout: 180_000 });
    test('the next menu takes the popover over all the same', async ({
      page,
    }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      await trigger(page, 'Gamma').click();
      await page.waitForTimeout(500);
      const gamma = await boxOf(page, 'Gamma item');
      const recording = recordPopovers(page, 700);
      await hover(page, 'Delta');
      const frames = await recording;
      const delta = await boxOf(page, 'Delta second');
      // Not from its closed opacity or scale: from Gamma's, at its box, to
      // its own full size.
      expectOnePopover(frames, gamma.top);
      expectFrom(frames, 'Delta', gamma);
      expect(delta.height - gamma.height).toBeGreaterThan(20);
      const last = frames.at(-1)!.shown[0]!;
      expect(Math.abs(last.width - delta.width)).toBeLessThan(0.5);
      expect(Math.abs(last.height - delta.height)).toBeLessThan(0.5);
      expectOneWay(
        series(frames, 'Delta', (p) => p.height),
        1,
      );
    });
  });
}
