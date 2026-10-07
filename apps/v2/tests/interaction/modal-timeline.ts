import { expect, type Page } from '@playwright/test';

import {
  expectCurvePace,
  type CurveOptions,
  type Sample,
} from './spring-curves';

// Frame-by-frame recording of the modal primitives (Dialog, Alert Dialog,
// Sheet, Drawer), sampled in the page on every animation frame so it holds
// up on a busy machine, plus the assertions of Animate UI's modal motion:
//
// - overlay (a dialog's, a sheet's, a drawer's): fades (and un-blurs) in
//   400ms on a soft ease-out, both ways: the page dims smoothly as the
//   content arrives, and clears as it leaves; it's clear before it unmounts;
// - dialog content: from `perspective(500px) rotateX(-20deg) scale(0.8)`,
//   blur(4px) and transparent, on a spring (stiffness 150, damping 25) that
//   settles after the overlay, fading in with the overlay, ahead of its
//   movement; dismissed, it goes back the
//   way it came, at once, quicker and speeding away (0.2s, a steady push),
//   out of sight just before its overlay has cleared;
// - sheet: slides from its edge by its own size and fades, in 0.4s on a soft
//   ease-out, never past its edge's rest; dismissed, it speeds off its edge
//   like a dialog (0.2s, a steady push);
// - drawer: slides opaque in 0.4s with a hint of bounce (a hair past its
//   rest, then back), and leaves quickly, speeding off its edge (0.16s on an
//   ease-in), without crawling out; its shadow lifts off the page with it,
//   from none.

/** v1's dialog spring. */
export const DIALOG_SPRING = { stiffness: 150, damping: 25 };
/** v1's sheet spring, for the toasts from an edge: livelier. */
export const SHEET_SPRING = { stiffness: 150, damping: 22 };
/** A drawer sliding in: 0.4s that answers at once, with a hint of bounce. */
export const DRAWER_CURVE: CurveOptions = {
  duration: 400,
  ease: [0.34, 1.2, 0.64, 1],
};
/** A sheet sliding in: 0.4s on a soft ease-out, without a bounce. */
export const SHEET_CURVE: CurveOptions = {
  duration: 400,
  ease: [0.215, 0.61, 0.355, 1],
};
/**
 * A dialog, a drawer or a sheet dismissed: 0.2s, a steady push from half its
 * average speed to one and a half.
 */
export const DISMISS_CURVE: CurveOptions = {
  duration: 200,
  ease: [0.33, 0.17, 0.67, 0.5],
};
/** A drawer closed: 0.16s on an ease-in, seen speeding off its edge. */
export const DRAWER_EXIT_CURVE: CurveOptions = {
  duration: 160,
  ease: [0.4, 0, 1, 1],
};
/** An overlay coming in and clearing: 400ms on a soft ease-out. */
export const OVERLAY_CURVE: CurveOptions = {
  duration: 400,
  ease: [0.215, 0.61, 0.355, 1],
};

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
  /** backdrop-filter: blur(), px. */
  backdrop: number;
  /** The strongest alpha of its box-shadow's colors (0 without one). */
  shadow: number;
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
      const backdrop = /blur\(([\d.e-]+)px\)/.exec(cs.backdropFilter);
      const color = cs.backgroundColor;
      const slash = /\/\s*([\d.]+(?:e[+-]?\d+)?)\s*\)$/.exec(color);
      const rgba = /^rgba\(.*,\s*([\d.]+)\)$/.exec(color);
      const shadows = [
        ...cs.boxShadow.matchAll(/rgba\([^)]*,\s*([\d.e-]+)\)|rgb\(/g),
      ].map((match) => (match[1] === undefined ? 1 : Number(match[1])));
      return {
        opacity: Number(cs.opacity),
        blur: blur ? Number(blur[1]) : 0,
        tilt: (Math.atan2(m.m23, m.m22) * 180) / Math.PI,
        scale: Math.hypot(m.m11, m.m12, m.m13),
        x: box.offsetWidth ? m.m41 / box.offsetWidth : 0,
        y: box.offsetHeight ? m.m42 / box.offsetHeight : 0,
        bg: slash ? Number(slash[1]) : rgba ? Number(rgba[1]) : 1,
        backdrop: backdrop ? Number(backdrop[1]) : 0,
        shadow: Math.max(0, ...shadows),
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
      __modalTimeline?: {
        frames: unknown[];
        timings: Record<string, unknown>;
        stopped: boolean;
      };
    };
    const timeline = {
      frames: [] as unknown[],
      timings: {} as Record<string, unknown>,
      stopped: false,
    };
    w.__modalTimeline = timeline;
    const t0 = performance.now();
    const tick = () => {
      if (timeline.stopped) return;
      const samples: Record<string, unknown> = {};
      for (const [name, selector] of Object.entries(targets)) {
        const el = document.querySelector(selector);
        samples[name] = el ? w.__readModal(el) : null;
        // The first Web Animation of its transform (Motion hands the
        // browser its tweens and springs): its timing.
        const moving =
          el &&
          !timeline.timings[name] &&
          el
            .getAnimations()
            .find((animation) =>
              (animation.effect as KeyframeEffect | null)
                ?.getKeyframes()
                .some((keyframe) => 'transform' in keyframe),
            );
        if (moving) {
          const { duration, easing } = moving.effect!.getTiming();
          timeline.timings[name] = { duration, easing };
        }
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
    /** The timing of the first Web Animation of `name`'s transform. */
    timing: (name: string) =>
      page.evaluate(
        (name) =>
          (
            window as unknown as {
              __modalTimeline: { timings: Record<string, AnimationTiming> };
            }
          ).__modalTimeline.timings[name] ?? null,
        name,
      ),
  };
}

export type AnimationTiming = { duration: number; easing: string };

/**
 * Expects a Web Animation to run the tween: its duration and curve, as the
 * browser was handed them (a frame-free check, unlike a pace).
 */
export function expectAnimationCurve(
  timing: AnimationTiming | null,
  options: CurveOptions,
) {
  expect(timing).toEqual({
    duration: options.duration,
    easing: `cubic-bezier(${options.ease.join(', ')})`,
  });
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
  /**
   * What fades on the overlay: its background's alpha (the overlays fade
   * their background color and backdrop filter), or its opacity.
   */
  overlayFade?: 'opacity' | 'bg';
  /** The overlay's resting value of that property. */
  overlayRest?: number;
};

const overlayLevel = (
  sample: ModalSample,
  { overlayFade = 'bg' }: OverlayOptions,
) => (overlayFade === 'bg' ? sample.bg : sample.opacity);

/** How far in the overlay is, from 0 to 1 (0 when absent). */
const overlayProgress = (
  frame: ModalFrame,
  overlay: string,
  options: OverlayOptions,
) => {
  const sample = frame.samples[overlay];
  return sample
    ? overlayLevel(sample, options) / (options.overlayRest ?? 0.1)
    : 0;
};

/**
 * The page behind blurs progressively with the tint, from 0: the overlay's
 * opacity never fades, which would cross-fade the sharp page with an already
 * blurred one. The largest backdrop blur seen, or 0 without one.
 */
function expectProgressiveBackdrop(frames: ModalFrame[], overlay: string) {
  const veil = present(frames, overlay).map((frame) => frame.samples[overlay]!);
  for (const sample of veil) expect(sample.opacity).toBe(1);
  return Math.max(0, ...veil.map((sample) => sample.backdrop));
}

/**
 * v1's dialog entrance: tipped back, scaled to 0.8, blurred and transparent
 * at first, and coming upright without swinging past it. It fades in with
 * its overlay, which dims the page smoothly, ahead of its own movement: it's
 * there first, then it settles.
 */
export function expectDialogEntrance(
  frames: ModalFrame[],
  options: OverlayOptions & { content?: string; overlay?: string } = {},
) {
  const { content = 'content', overlay = 'overlay' } = options;
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

  // The page behind blurs from 0, through every value in between.
  const blurRest = expectProgressiveBackdrop(frames, overlay);
  if (blurRest > 0) {
    const veil = present(frames, overlay);
    expect(veil[0]!.samples[overlay]!.backdrop).toBeLessThan(blurRest * 0.2);
    expect(
      veil.some(({ samples }) => {
        const blur = samples[overlay]!.backdrop;
        return blur > blurRest * 0.3 && blur < blurRest * 0.7;
      }),
    ).toBe(true);
  }

  // The overlay fades in over ~350ms (400ms soft ease-out), not in a couple
  // of frames. A busy machine only delays it.
  const overlayStart = frames.find((frame) => frame.samples[overlay])!;
  const overlayIn = frames.find(
    (frame) => overlayProgress(frame, overlay, options) >= 0.99,
  )!;
  expect(overlayIn).toBeTruthy();
  expect(overlayIn.t - overlayStart.t).toBeGreaterThan(250);
  expect(overlayIn.t - overlayStart.t).toBeLessThan(700);
  // With the content: about as far in when the content is half in.
  const halfway = frames.find(
    (frame) => (frame.samples[content]?.opacity ?? 0) >= 0.5,
  )!;
  expect(
    Math.abs(
      overlayProgress(halfway, overlay, options) -
        halfway.samples[content]!.opacity,
    ),
  ).toBeLessThan(0.2);
  // The content's opacity ahead of its movement: mostly in (0.7) while it
  // has grown less than 60% of the way from 0.8.
  const mostlyIn = frames.find(
    (frame) => (frame.samples[content]?.opacity ?? 0) >= 0.7,
  )!;
  expect((mostlyIn.samples[content]!.scale - 0.8) / 0.2).toBeLessThan(0.6);
}

/**
 * A dialog's exit: the content tips back, shrinks and blurs as it fades, the
 * way it came, but at once, quicker and speeding away (0.2s, a steady push):
 * out of sight within ~0.2s, half faded well into that time (an ease-out
 * would be half faded at a quarter of it). The overlay clears a
 * little ahead of it, and behind it, and is clear before it unmounts.
 */
export function expectDialogExit(
  frames: ModalFrame[],
  options: OverlayOptions & { content?: string; overlay?: string } = {},
) {
  const { content = 'content', overlay = 'overlay' } = options;
  const shown = present(frames, content);
  const last = shown.at(-1)!.samples[content]!;
  expect(last.opacity).toBeLessThan(0.2);
  expect(last.tilt).toBeLessThan(-12);
  expect(last.scale).toBeLessThan(0.88);
  expect(last.blur).toBeGreaterThan(2.5);

  // Both leave together: the overlay's fade starts fast, so its first frame
  // tells when (the content's starts slow, it can't).
  const leaving = frames.findIndex(
    (frame) => overlayProgress(frame, overlay, options) < 0.99,
  );
  const exitStart = frames[Math.max(leaving - 1, 0)]!;

  // Then out of sight quickly (0.2s; a busy machine only delays it), and
  // speeding away.
  const gone = shown.find((frame) => frame.samples[content]!.opacity < 0.02)!;
  expect(gone).toBeTruthy();
  expect(gone.t - exitStart.t).toBeLessThan(400);
  // When its opacity crosses `level`, between the frames around it.
  const crossing = (level: number) => {
    const i = shown.findIndex(
      (frame) => frame.samples[content]!.opacity <= level,
    );
    const [a, b] = [shown[i - 1]!, shown[i]!];
    const [oa, ob] = [a.samples[content]!.opacity, b.samples[content]!.opacity];
    return a.t + ((oa - level) / (oa - ob)) * (b.t - a.t);
  };
  const half = crossing(0.5) - exitStart.t;
  const out = crossing(0.02) - exitStart.t;
  // ~0.6 on its curve, timed from its overlay's start (the content can start
  // a frame later), an ease-out ~0.1; its exact curve is checked as Motion
  // hands it to the browser.
  expect(half / out).toBeGreaterThan(0.3);

  // The overlay fades out over ~350ms, not in a couple of frames.
  const overlayOut = frames.find(
    (frame) =>
      frame.samples[overlay] &&
      overlayProgress(frame, overlay, options) <= 0.01,
  )!;
  expect(overlayOut).toBeTruthy();
  expect(overlayOut.t - exitStart.t).toBeGreaterThan(250);
  // A little ahead of the content: further out when the content is half out…
  const halfOut = frames.find(
    (frame) => frame.t > exitStart.t && frame.samples[content]!.opacity <= 0.5,
  )!;
  expect(overlayProgress(halfOut, overlay, options)).toBeLessThan(
    halfOut.samples[content]!.opacity,
  );
  // …and cleared behind it: the page is still dimmed when it's out of sight.
  expect(overlayOut.t).toBeGreaterThanOrEqual(gone.t);
  // The page behind is sharp again, its blur gone with the tint.
  const blurRest = expectProgressiveBackdrop(frames, overlay);
  expect(overlayOut.samples[overlay]!.backdrop).toBeLessThanOrEqual(
    blurRest * 0.05,
  );
  expectClearBeforeUnmount(
    frames,
    { bg: options.overlayRest ?? 0.1, blur: blurRest },
    overlay,
    options,
  );
}

/**
 * The overlay is clear before it unmounts: on its last frame in the page,
 * under 2% of its tint (or opacity) and of its blur are left (a
 * fade cut short, 4% to 8% from the end, snapped the page back sharp).
 */
export function expectClearBeforeUnmount(
  frames: ModalFrame[],
  rest: { bg: number; blur: number },
  name = 'overlay',
  options: OverlayOptions = {},
) {
  const last = present(frames, name).at(-1)!.samples[name]!;
  const fade = options.overlayFade ?? 'bg';
  expect(
    overlayLevel(last, options) / (fade === 'bg' ? rest.bg : 1),
  ).toBeLessThan(0.02);
  if (rest.blur > 0) expect(last.backdrop / rest.blur).toBeLessThan(0.02);
}

/**
 * A drawer's shadow lifts off the page with it: none on its first frame,
 * off screen, then through the values in between up to `rest` (the
 * strongest alpha of its colors) as it comes in; or back down to none on
 * its last frame as it leaves, rather than riding out at full strength.
 */
export function expectShadowLifts(
  frames: ModalFrame[],
  rest: number,
  { leaving = false } = {},
  name = 'content',
) {
  const shadow = present(frames, name).map(
    (frame) => frame.samples[name]!.shadow,
  );
  expect(leaving ? shadow.at(-1)! : shadow[0]!).toBeLessThan(rest * 0.05);
  expect(shadow.some((alpha) => alpha > rest * 0.2 && alpha < rest * 0.8)).toBe(
    true,
  );
}

export const SHEET_TRAVEL = {
  top: { axis: 'y', sign: -1 },
  right: { axis: 'x', sign: 1 },
  bottom: { axis: 'y', sign: 1 },
  left: { axis: 'x', sign: -1 },
} as const;

/** `name`'s way along `axis` towards its edge, frame by frame: 0 at rest. */
const travel = (
  frames: ModalFrame[],
  name: string,
  axis: 'x' | 'y',
  sign: number,
) =>
  frames.map((frame): Sample => [frame.t, frame.samples[name]![axis] * sign]);

/** When `way` first gets to `level`: interpolated, and the frames around. */
function crossing(way: Sample[], level: number) {
  const i = way.findIndex(([, value]) => value >= level);
  expect(i, `it starts short of ${level} and gets there`).toBeGreaterThan(0);
  const [ta, va] = way[i - 1]!;
  const [tb, vb] = way[i]!;
  return {
    t: ta + ((level - va) / (vb - va)) * (tb - ta),
    before: ta,
    after: tb,
  };
}

/**
 * v1's sheet entrance: from its edge, by its own size, fading in, from 10%
 * to 90% of the way in the time its curve takes (0.4s on a soft ease-out),
 * and never past its rest: held against the screen's edge, a sheet going
 * past it would open a gap there.
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
  const way = travel(shown, name, axis, sign);
  expectCurvePace(way, SHEET_CURVE, { from: 1, to: 0, a: 0.9, b: 0.1 });
  for (const [, share] of way) expect(share).toBeGreaterThan(-0.002);
}

/**
 * A drawer's entrance: from its edge, by its own size, opaque all the way (a
 * sheet sliding in, not a fade), from 10% to 90% of the way in the time its
 * curve takes (0.4s that answers at once), with a hint of bounce: a hair
 * past its rest (0.3% to 3% of its size), then back to it.
 */
export function expectDrawerEntrance(
  frames: ModalFrame[],
  side: keyof typeof SHEET_TRAVEL,
  name = 'content',
) {
  const { axis, sign } = SHEET_TRAVEL[side];
  const shown = present(frames, name);
  const way = travel(shown, name, axis, sign);
  const start = way[0]![1];
  expect(start).toBeGreaterThan(0.6);
  // Opaque to the eye (shadcn/ui's Base UI drawer ends at 0.9999 so its exit
  // has a transition to wait for).
  for (const frame of shown)
    expect(frame.samples[name]!.opacity).toBeGreaterThan(0.999);
  expectCurvePace(way, DRAWER_CURVE, {
    from: start,
    to: 0,
    a: start * 0.9,
    b: start * 0.1,
  });
  const past = Math.min(...way.map(([, share]) => share));
  expect(past, 'a hair past its rest').toBeLessThan(-0.003);
  expect(past, 'only a hair').toBeGreaterThan(-0.03);
}

/**
 * A drawer's exit (0.16s on an ease-in): back to its edge, opaque all the
 * way, quickly, speeding away. It's half way out only well into its time out (an ease-out would be
 * at a quarter of it), and its last stretch, from 90% of the way, takes a
 * few frames: it never crawls out.
 */
export function expectDrawerExit(
  frames: ModalFrame[],
  side: keyof typeof SHEET_TRAVEL,
  name = 'content',
) {
  const { axis, sign } = SHEET_TRAVEL[side];
  const shown = present(frames, name);
  const way = travel(shown, name, axis, sign);
  const last = way.at(-1)![1];
  expect(last).toBeGreaterThan(0.6);
  // Opaque to the eye (shadcn/ui's Base UI drawer ends at 0.9999 so its exit
  // has a transition to wait for).
  for (const frame of shown)
    expect(frame.samples[name]!.opacity).toBeGreaterThan(0.999);
  const end = Math.max(1, last);
  // Its last stretch is quick enough to end between two frames: the frame
  // it's gone from counts as its edge.
  const gone = frames.find((frame) => frame.t > shown.at(-1)!.t);
  if (gone) way.push([gone.t, end]);
  const [t10, t50, t90, t97] = [0.1, 0.5, 0.9, 0.97].map((share) =>
    crossing(way, end * share),
  );
  expect((t50!.t - t10!.t) / (t97!.t - t10!.t)).toBeGreaterThan(0.4);
  expect(t97!.before - t90!.after, 'its last stretch').toBeLessThan(60);
}

/**
 * A drawer's overlay, timed like a dialog's (400ms on a soft ease-out): its tint from 10% to 90% of the way in the time that curve takes,
 * coming in, or clearing (`leaving`). Clearing, it leads the drawer, which
 * speeds away: mostly clear once the drawer is half way out along `axis`.
 */
export function expectDialogLikeOverlay(
  frames: ModalFrame[],
  {
    rest,
    leaving = false,
    axis,
  }: { rest: number; leaving?: boolean; axis?: 'x' | 'y' },
  overlay = 'overlay',
  name = 'content',
) {
  const tint = present(frames, overlay).map((frame): Sample => [
    frame.t,
    frame.samples[overlay]!.bg,
  ]);
  expectCurvePace(
    tint,
    OVERLAY_CURVE,
    leaving
      ? { from: rest, to: 0, a: rest * 0.9, b: rest * 0.1 }
      : { from: 0, to: rest, a: rest * 0.1, b: rest * 0.9 },
  );
  if (!leaving || !axis) return;
  const halfOut = frames.find((frame) => {
    const sample = frame.samples[name];
    return sample && Math.abs(sample[axis]) >= 0.5;
  })!;
  expect(halfOut.samples[overlay]!.bg).toBeLessThan(rest * 0.35);
}

/**
 * A drawer thrown off by a drag, let go `released` of the way to its edge
 * (a share of its size), keeps the finger's speed: a steady pace (linear)
 * from there to its edge, every frame within a tenth of the way of that
 * straight line, so it neither stalls after the release nor crawls out (an
 * ease-out or an ease-in would stray by a third of it).
 */
export function expectThrown(
  frames: ModalFrame[],
  side: keyof typeof SHEET_TRAVEL,
  released: number,
  name = 'content',
) {
  const { axis, sign } = SHEET_TRAVEL[side];
  const way = travel(present(frames, name), name, axis, sign);
  const end = Math.max(1, way.at(-1)![1]);
  // The frames on its way: past where the finger let go, short of its edge
  // (a frame once it's there would bend the line).
  const moving = way.filter(
    ([, share]) => share > released + 0.01 && share < end * 0.99,
  );
  expect(moving.length, 'frames on its way out').toBeGreaterThan(1);
  const [t0, v0] = moving[0]!;
  const [t1, v1] = moving.at(-1)!;
  for (const [t, share] of moving) {
    const steady = v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    expect(Math.abs(share - steady) / (end - released)).toBeLessThan(0.1);
  }
}

/**
 * An overlay coming in or clearing the way the dialogs' does: never through
 * its opacity, its tint and its backdrop blur growing from 0 together (or
 * back), through the values in between, up to its classes' `rest` values.
 */
export function expectProgressiveOverlay(
  frames: ModalFrame[],
  rest: { bg: number; blur: number },
  name = 'overlay',
) {
  const veil = present(frames, name).map((frame) => frame.samples[name]!);
  for (const sample of veil) {
    expect(sample.opacity).toBe(1);
    if (rest.blur > 0)
      expect(
        Math.abs(sample.backdrop / rest.blur - sample.bg / rest.bg),
      ).toBeLessThan(0.1);
  }
  expect(
    veil.some(
      (sample) => sample.bg > rest.bg * 0.1 && sample.bg < rest.bg * 0.9,
    ),
  ).toBe(true);
}

/**
 * When (ms) the drawer `name` gets half way along `axis` (towards its edge
 * when `leaving`), and when the overlay's tint gets half way to its `rest`:
 * they move together when these are close.
 */
export function halfwayTimes(
  frames: ModalFrame[],
  {
    axis,
    rest,
    leaving = false,
  }: { axis: 'x' | 'y'; rest: number; leaving?: boolean },
  name = 'content',
  overlay = 'overlay',
) {
  const drawer = frames.find((frame) => {
    const sample = frame.samples[name];
    if (!sample) return false;
    const share = Math.abs(sample[axis]);
    return leaving ? share > 0.5 : share < 0.5;
  })!;
  const veil = frames.find((frame) => {
    const sample = frame.samples[overlay];
    if (!sample) return false;
    return leaving ? sample.bg < rest / 2 : sample.bg > rest / 2;
  })!;
  return { drawer: drawer.t, overlay: veil.t };
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
