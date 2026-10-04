import { expect, type Page } from '@playwright/test';

import { expectSpringPace, type Sample } from './spring-curves';

// Frame-by-frame recording of the modal primitives (Dialog, Alert Dialog,
// Sheet), sampled in the page on every animation frame so it holds up on a
// busy machine, plus the assertions of Animate UI v1's modal motion:
//
// - overlay: fades (and un-blurs) in 200ms, easeInOut, both ways;
// - dialog content: from `perspective(500px) rotateX(-20deg) scale(0.8)`,
//   blur(4px) and transparent, on a spring (stiffness 150, damping 25) that
//   settles well after the overlay; it leaves the same way, still visible
//   once the overlay is gone;
// - sheet: slides from its edge by its own size and fades, on the same
//   spring.

/** v1's dialog spring: sheets, drawers and edge toasts move on it too. */
export const DIALOG_SPRING = { stiffness: 150, damping: 25 };
/** v1's sheet spring (sheets, drawers, toasts from an edge): livelier. */
export const SHEET_SPRING = { stiffness: 150, damping: 22 };

export type ModalSample = {
  opacity: number;
  /** filter: blur(), px. */
  blur: number;
  /** rotateX, degrees (negative: tipped back, top away). */
  tilt: number;
  /** Scale along x. */
  scale: number;
  /** Translation as a share of the element's own width / height. */
  x: number;
  y: number;
  /** Alpha of the background color. */
  bg: number;
};

export type ModalFrame = {
  t: number;
  samples: Record<string, ModalSample | null>;
};

/** Defines `window.__readModal` in the page (idempotent). */
async function install(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as {
      __readModal?: (el: Element) => unknown;
    };
    if (w.__readModal) return;
    w.__readModal = (el: Element) => {
      const cs = getComputedStyle(el);
      const m = new DOMMatrix(
        cs.transform === 'none' ? undefined : cs.transform,
      );
      const box = el as HTMLElement;
      const blur = /blur\(([\d.]+)px\)/.exec(cs.filter);
      const color = cs.backgroundColor;
      const slash = /\/\s*([\d.]+)\s*\)$/.exec(color);
      const rgba = /^rgba\(.*,\s*([\d.]+)\)$/.exec(color);
      return {
        opacity: Number(cs.opacity),
        blur: blur ? Number(blur[1]) : 0,
        tilt: (Math.atan2(m.m23, m.m22) * 180) / Math.PI,
        scale: Math.hypot(m.m11, m.m12, m.m13),
        x: box.offsetWidth ? m.m41 / box.offsetWidth : 0,
        y: box.offsetHeight ? m.m42 / box.offsetHeight : 0,
        bg: slash ? Number(slash[1]) : rgba ? Number(rgba[1]) : 1,
      };
    };
  });
}

/** The current state of the first element matching `selector`. */
export async function readState(page: Page, selector: string) {
  await install(page);
  return page
    .locator(selector)
    .first()
    .evaluate((el) =>
      (
        window as unknown as {
          __readModal: (el: Element) => ModalSample;
        }
      ).__readModal(el),
    );
}

/**
 * Starts recording `targets` (name → selector) on every animation frame.
 * Trigger the change, wait for it to finish, then `stop()`.
 */
export async function recordTimeline(
  page: Page,
  targets: Record<string, string>,
) {
  await install(page);
  await page.evaluate((targets) => {
    const w = window as unknown as {
      __readModal: (el: Element) => unknown;
      __modalTimeline?: { frames: unknown[]; stopped: boolean };
    };
    const timeline = { frames: [] as unknown[], stopped: false };
    w.__modalTimeline = timeline;
    const t0 = performance.now();
    const tick = () => {
      if (timeline.stopped) return;
      const samples: Record<string, unknown> = {};
      for (const [name, selector] of Object.entries(targets)) {
        const el = document.querySelector(selector);
        samples[name] = el ? w.__readModal(el) : null;
      }
      timeline.frames.push({ t: performance.now() - t0, samples });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, targets);
  return {
    stop: () =>
      page.evaluate(() => {
        const timeline = (
          window as unknown as {
            __modalTimeline: { frames: ModalFrame[]; stopped: boolean };
          }
        ).__modalTimeline;
        timeline.stopped = true;
        return timeline.frames;
      }),
  };
}

/** Frames where `name` is in the page. */
export const present = (frames: ModalFrame[], name: string) =>
  frames.filter((frame) => frame.samples[name]);

/** Waits until the element sits upright, sharp and opaque. */
export async function expectDialogSettled(page: Page, selector: string) {
  await expect
    .poll(
      async () => {
        const state = await readState(page, selector);
        return (
          state.opacity === 1 &&
          state.blur < 0.05 &&
          Math.abs(state.tilt) < 0.1 &&
          Math.abs(state.scale - 1) < 0.002
        );
      },
      { timeout: 5000 },
    )
    .toBe(true);
}

type OverlayOptions = {
  /** What fades on the overlay: its opacity, or its background's alpha. */
  overlayFade?: 'opacity' | 'bg';
  /** The overlay's resting value of that property. */
  overlayRest?: number;
};

const overlayLevel = (
  sample: ModalSample,
  { overlayFade = 'opacity' }: OverlayOptions,
) => (overlayFade === 'bg' ? sample.bg : sample.opacity);

/**
 * v1's dialog entrance: tipped back, scaled to 0.8, blurred and transparent
 * at first; the overlay is fully in long before the content's spring settles,
 * and the content comes upright without swinging past it.
 */
export function expectDialogEntrance(
  frames: ModalFrame[],
  options: OverlayOptions & { content?: string; overlay?: string } = {},
) {
  const { content = 'content', overlay = 'overlay', overlayRest = 1 } = options;
  const shown = present(frames, content);
  const first = shown[0]!.samples[content]!;
  expect(first.tilt).toBeLessThan(-12);
  expect(first.scale).toBeLessThan(0.88);
  expect(first.blur).toBeGreaterThan(2.5);
  expect(first.opacity).toBeLessThan(0.3);

  // Comes upright steadily (a critically damped spring doesn't overshoot).
  for (let i = 1; i < shown.length; i++) {
    const before = shown[i - 1]!.samples[content]!;
    const after = shown[i]!.samples[content]!;
    expect(after.tilt).toBeGreaterThanOrEqual(before.tilt - 0.5);
    expect(after.tilt).toBeLessThan(0.5);
  }

  // The overlay's 200ms fade is over while the content is still coming in.
  const overlayIn = frames.find((frame) => {
    const sample = frame.samples[overlay];
    return sample && overlayLevel(sample, options) >= overlayRest * 0.99;
  })!;
  expect(overlayIn).toBeTruthy();
  const contentThen = overlayIn.samples[content]!;
  expect(contentThen.opacity).toBeLessThan(0.9);
  expect(contentThen.tilt).toBeLessThan(-0.5);
  const overlayStart = frames.find((frame) => frame.samples[overlay])!;
  expect(overlayIn.t - overlayStart.t).toBeLessThan(450);
}

/**
 * v1's dialog exit: the content tips back, shrinks and blurs as it fades,
 * still visible once the overlay's 200ms fade is over.
 */
export function expectDialogExit(
  frames: ModalFrame[],
  options: OverlayOptions & { content?: string; overlay?: string } = {},
) {
  const { content = 'content', overlay = 'overlay', overlayRest = 1 } = options;
  const shown = present(frames, content);
  const last = shown.at(-1)!.samples[content]!;
  expect(last.opacity).toBeLessThan(0.2);
  expect(last.tilt).toBeLessThan(-12);
  expect(last.scale).toBeLessThan(0.88);
  expect(last.blur).toBeGreaterThan(2.5);

  const overlayOut = frames.find((frame) => {
    const sample = frame.samples[overlay];
    return sample && overlayLevel(sample, options) <= overlayRest * 0.01;
  })!;
  expect(overlayOut).toBeTruthy();
  const contentThen = overlayOut.samples[content];
  expect(contentThen).toBeTruthy();
  expect(contentThen!.opacity).toBeGreaterThan(0.1);
}

export const SHEET_TRAVEL = {
  top: { axis: 'y', sign: -1 },
  right: { axis: 'x', sign: 1 },
  bottom: { axis: 'y', sign: 1 },
  left: { axis: 'x', sign: -1 },
} as const;

/**
 * v1's sheet entrance: from its edge, by its own size, fading in, on the
 * dialog's spring.
 */
export function expectSheetEntrance(
  frames: ModalFrame[],
  side: keyof typeof SHEET_TRAVEL,
  name = 'content',
) {
  const { axis, sign } = SHEET_TRAVEL[side];
  const shown = present(frames, name);
  const first = shown[0]!.samples[name]!;
  expect(first[axis] * sign).toBeGreaterThan(0.6);
  expect(first.opacity).toBeLessThan(0.3);
  // It fades in while it slides.
  const midway = shown.find(
    (frame) => Math.abs(frame.samples[name]![axis]) < 0.5,
  )!;
  expect(midway.samples[name]!.opacity).toBeGreaterThan(0.2);
  expect(midway.samples[name]!.opacity).toBeLessThan(0.95);
  // From a full size away to its edge: from 10% to 98% of the way in the
  // time the spring takes.
  expectSpringPace(
    shown.map((frame): Sample => [frame.t, frame.samples[name]![axis] * sign]),
    SHEET_SPRING,
    { from: 1, to: 0, a: 0.9, b: 0.02 },
  );
}

/** v1's sheet exit: back to its edge, fading out. */
export function expectSheetExit(
  frames: ModalFrame[],
  side: keyof typeof SHEET_TRAVEL,
  name = 'content',
) {
  const { axis, sign } = SHEET_TRAVEL[side];
  const shown = present(frames, name);
  const last = shown.at(-1)!.samples[name]!;
  expect(last[axis] * sign).toBeGreaterThan(0.6);
  expect(last.opacity).toBeLessThan(0.2);
}

/** Waits until the sheet rests at its edge, opaque. */
export async function expectSheetSettled(
  page: Page,
  selector: string,
  side: keyof typeof SHEET_TRAVEL,
) {
  const { axis } = SHEET_TRAVEL[side];
  await expect
    .poll(
      async () => {
        const state = await readState(page, selector);
        return state.opacity === 1 && Math.abs(state[axis]) < 0.002;
      },
      { timeout: 5000 },
    )
    .toBe(true);
}
