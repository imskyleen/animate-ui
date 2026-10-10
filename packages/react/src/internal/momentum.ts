'use client';

import {
  createGeneratorEasing,
  generateLinearEasing,
  spring as springGenerator,
  type Transition,
} from 'motion/react';

import { toCssTiming } from '../utils/motion';

// A popover moving and resizing from one content to the next (a menubar's
// handed from menu to menu, a navigation menu's changing items), played by
// Web Animations or CSS transitions on a spring (`spring.morph`): it starts
// gently and eases in. Started over on the way (moving on to another menu
// before it landed), it keeps the speed it had, so a sweep across the items
// is one glide (started from rest each time, it would stop at each item).
// Only as much of it as takes it toward its next place without going past
// it, though: sent back the way it came, it turns back at once, from rest,
// instead of carrying on first (no bounce either way).

/** A Web Animations (or CSS transitions) timing, and its progress (0 to 1). */
type Curve = {
  /** In ms. */
  duration: number;
  easing: string;
  /** Its progress `time` ms in. */
  at(time: number): number;
  /** Its speed `time` ms in: progress per ms (a tween's isn't carried on). */
  speed(time: number): number;
  /** The speed it starts with (progress per ms): 0 from rest. */
  initial: number;
};

/** A move under way: from `offset` (to its rest) to none, on `curve`. */
type Run = { offset: number[]; curve: Curve };

const INSTANT: Curve = {
  duration: 0,
  easing: 'linear',
  at: () => 1,
  speed: () => 0,
  initial: 0,
};

/** Rounding: progress this far past either end still counts as within. */
const SLACK = 0.002;

const SPRING_KEYS = [
  'stiffness',
  'damping',
  'mass',
  'bounce',
  'visualDuration',
];

const isSpring = (options: Record<string, unknown>) =>
  options.type === 'spring' || SPRING_KEYS.some((key) => key in options);

/**
 * A spring's progress over time (0 to 1) from `speed` (progress per ms), and
 * how far it goes either way. Null for a tween.
 */
function shapeOf(transition: Transition, speed: number) {
  const options = transition as Record<string, unknown>;
  if (!isSpring(options)) return null;
  const { ease, duration: seconds } = createGeneratorEasing(
    {
      ...options,
      // Motion's spring takes a time-defined `duration` in ms.
      ...(typeof options.duration === 'number'
        ? { duration: options.duration * 1000 }
        : null),
      // On a 0 to 100 scale, in units per second.
      velocity: speed * 100_000,
    },
    100,
    springGenerator,
  );
  const duration = Math.round(seconds * 1000);
  let peak = 1;
  let trough = 0;
  for (let time = 0; time <= duration; time += 5) {
    const progress = ease(time / duration);
    peak = Math.max(peak, progress);
    trough = Math.min(trough, progress);
  }
  return { ease, duration, peak, trough };
}

/**
 * `transition`'s curve, from `initial` (progress per ms, carried on from a
 * move started over).
 */
function curveOf(transition: Transition, initial = 0): Curve {
  const shape = shapeOf(transition, initial);
  if (!shape) {
    const { duration, easing } = toCssTiming(transition);
    return {
      duration,
      easing,
      // Roughly: only read to know where a move was cut short.
      at: (time) => (time >= duration ? 1 : Math.max(0, time / duration)),
      speed: () => 0,
      initial: 0,
    };
  }
  const { ease, duration } = shape;
  if (duration === 0) return INSTANT;
  const step = 0.5;
  return {
    duration,
    easing: generateLinearEasing(ease, duration),
    at: (time) => (time >= duration ? 1 : ease(Math.max(0, time) / duration)),
    speed(time) {
      if (!(time >= 0) || time >= duration) return 0;
      // Not started yet (held at its first keyframe): the speed it starts
      // with.
      if (time === 0) return initial;
      // Motion snaps a spring to its rest once it's still: from then on it
      // doesn't move (read across the snap, it would seem to jump).
      if (ease(time / duration) === 1) return 0;
      const before = Math.max(0, time - step);
      let after = Math.min(duration, time + step);
      if (ease(after / duration) === 1) after = time;
      return after > before
        ? (ease(after / duration) - ease(before / duration)) / (after - before)
        : initial;
    },
    initial,
  };
}

/**
 * A curve carries on a move's speed: from `offset` (px), it starts faster
 * than a hair (a px per s).
 */
function carries(curve: Curve, offset: number[]) {
  return curve.initial * Math.hypot(...offset) > 0.001;
}

/** A run's velocity `time` ms in: per component, per ms. */
function velocityOf(run: Run, time: number) {
  const speed = run.curve.speed(time);
  return run.offset.map((offset) => -offset * speed);
}

/**
 * How fast a move from `offset` to none (its components on one curve)
 * starts, carrying on `velocity` (per component, per ms) as close as one
 * curve can, along the way it goes: as much of it as never takes it past
 * its place (beyond the spring's own overshoot, none for `spring.morph`),
 * none of it the other way. In progress per ms.
 */
function startOf(transition: Transition, offset: number[], velocity: number[]) {
  let length = 0;
  let along = 0;
  offset.forEach((value, i) => {
    length += value * value;
    along += value * (velocity[i] ?? 0);
  });
  // Moving toward its rest, its offset shrinks: `offset * (1 - progress)`.
  const speed = length < 0.25 ? 0 : -along / length;
  const rest = shapeOf(transition, 0);
  if (!rest || speed <= 0) return 0;
  const within = (share: number) => {
    const shape = shapeOf(transition, speed * share)!;
    return (
      shape.trough >= -SLACK && shape.peak <= Math.max(rest.peak, 1) + SLACK
    );
  };
  if (within(1)) return speed;
  // The largest share of it that stays within, found by halves.
  let low = 0;
  let high = 1;
  for (let i = 0; i < 8; i++) {
    const share = (low + high) / 2;
    if (within(share)) low = share;
    else high = share;
  }
  return speed * low;
}

/** The curve of a move from `offset` to none (see `startOf`). */
function curveFrom(
  transition: Transition,
  offset: number[],
  velocity: number[],
): Curve {
  return curveOf(transition, startOf(transition, offset, velocity));
}

export {
  carries,
  curveFrom,
  curveOf,
  startOf,
  velocityOf,
  INSTANT,
  type Curve,
  type Run,
};
