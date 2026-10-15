import { expect, type Page } from '../test';

import {
  expectCurvePace,
  type CurveOptions,
  type Sample,
} from './spring-curves';

export const DIALOG_SPRING = { stiffness: 150, damping: 25 };
export const SHEET_SPRING = { stiffness: 150, damping: 22 };
export const DRAWER_CURVE: CurveOptions = {
  duration: 400,
  ease: [0.34, 1.2, 0.64, 1],
};
export const SHEET_CURVE: CurveOptions = {
  duration: 400,
  ease: [0.215, 0.61, 0.355, 1],
};
export const DISMISS_CURVE: CurveOptions = {
  duration: 200,
  ease: [0.33, 0.17, 0.67, 0.5],
};
export const DRAWER_EXIT_CURVE: CurveOptions = {
  duration: 160,
  ease: [0.4, 0, 1, 1],
};
export const OVERLAY_CURVE: CurveOptions = {
  duration: 400,
  ease: [0.215, 0.61, 0.355, 1],
};

export type ModalSample = {
  opacity: number;
  blur: number;
  tilt: number;
  scale: number;
  x: number;
  y: number;
  bg: number;
  backdrop: number;
  shadow: number;
};

export type ModalFrame = {
  t: number;
  samples: Record<string, ModalSample | null>;
};

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

export function expectAnimationCurve(
  timing: AnimationTiming | null,
  options: CurveOptions,
) {
  expect(timing).toEqual({
    duration: options.duration,
    easing: `cubic-bezier(${options.ease.join(', ')})`,
  });
}

export const present = (frames: ModalFrame[], name: string) =>
  frames.filter((frame) => frame.samples[name]);

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
  overlayFade?: 'opacity' | 'bg';
  overlayRest?: number;
};

const overlayLevel = (
  sample: ModalSample,
  { overlayFade = 'bg' }: OverlayOptions,
) => (overlayFade === 'bg' ? sample.bg : sample.opacity);

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

function expectProgressiveBackdrop(frames: ModalFrame[], overlay: string) {
  const veil = present(frames, overlay).map((frame) => frame.samples[overlay]!);
  for (const sample of veil) expect(sample.opacity).toBe(1);
  return Math.max(0, ...veil.map((sample) => sample.backdrop));
}

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

  for (let i = 1; i < shown.length; i++) {
    const before = shown[i - 1]!.samples[content]!;
    const after = shown[i]!.samples[content]!;
    expect(after.tilt).toBeGreaterThanOrEqual(before.tilt - 0.5);
    expect(after.tilt).toBeLessThan(0.5);
  }

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

  const overlayStart = frames.find((frame) => frame.samples[overlay])!;
  const overlayIn = frames.find(
    (frame) => overlayProgress(frame, overlay, options) >= 0.99,
  )!;
  expect(overlayIn).toBeTruthy();
  expect(overlayIn.t - overlayStart.t).toBeGreaterThan(250);
  expect(overlayIn.t - overlayStart.t).toBeLessThan(700);
  const halfway = frames.find(
    (frame) => (frame.samples[content]?.opacity ?? 0) >= 0.5,
  )!;
  expect(
    Math.abs(
      overlayProgress(halfway, overlay, options) -
        halfway.samples[content]!.opacity,
    ),
  ).toBeLessThan(0.2);
  const mostlyIn = frames.find(
    (frame) => (frame.samples[content]?.opacity ?? 0) >= 0.7,
  )!;
  expect((mostlyIn.samples[content]!.scale - 0.8) / 0.2).toBeLessThan(0.6);
}

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

  const leaving = frames.findIndex(
    (frame) => overlayProgress(frame, overlay, options) < 0.99,
  );
  const exitStart = frames[Math.max(leaving - 1, 0)]!;

  const gone = shown.find((frame) => frame.samples[content]!.opacity < 0.02)!;
  expect(gone).toBeTruthy();
  expect(gone.t - exitStart.t).toBeLessThan(400);
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
  expect(half / out).toBeGreaterThan(0.3);

  const overlayOut = frames.find(
    (frame) =>
      frame.samples[overlay] &&
      overlayProgress(frame, overlay, options) <= 0.01,
  )!;
  expect(overlayOut).toBeTruthy();
  expect(overlayOut.t - exitStart.t).toBeGreaterThan(250);
  const halfOut = frames.find(
    (frame) => frame.t > exitStart.t && frame.samples[content]!.opacity <= 0.5,
  )!;
  expect(overlayProgress(halfOut, overlay, options)).toBeLessThan(
    halfOut.samples[content]!.opacity,
  );
  expect(overlayOut.t).toBeGreaterThanOrEqual(gone.t);
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

const travel = (
  frames: ModalFrame[],
  name: string,
  axis: 'x' | 'y',
  sign: number,
) =>
  frames.map((frame): Sample => [frame.t, frame.samples[name]![axis] * sign]);

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
  const midway = shown.find(
    (frame) => Math.abs(frame.samples[name]![axis]) < 0.5,
  )!;
  expect(midway.samples[name]!.opacity).toBeGreaterThan(0.2);
  expect(midway.samples[name]!.opacity).toBeLessThan(0.95);
  const way = travel(shown, name, axis, sign);
  expectCurvePace(way, SHEET_CURVE, { from: 1, to: 0, a: 0.9, b: 0.1 });
  for (const [, share] of way) expect(share).toBeGreaterThan(-0.002);
}

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
  for (const frame of shown)
    expect(frame.samples[name]!.opacity).toBeGreaterThan(0.999);
  const end = Math.max(1, last);
  const gone = frames.find((frame) => frame.t > shown.at(-1)!.t);
  if (gone) way.push([gone.t, end]);
  const [t10, t50, t90, t97] = [0.1, 0.5, 0.9, 0.97].map((share) =>
    crossing(way, end * share),
  );
  expect((t50!.t - t10!.t) / (t97!.t - t10!.t)).toBeGreaterThan(0.4);
  expect(t97!.before - t90!.after, 'its last stretch').toBeLessThan(60);
}

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
  expect(halfOut.samples[overlay]!.bg).toBeLessThan(rest * 0.4);
}

export function expectThrown(
  frames: ModalFrame[],
  side: keyof typeof SHEET_TRAVEL,
  released: number,
  name = 'content',
) {
  const { axis, sign } = SHEET_TRAVEL[side];
  const way = travel(present(frames, name), name, axis, sign);
  const end = Math.max(1, way.at(-1)![1]);
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
