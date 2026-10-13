'use client';

import {
  createGeneratorEasing,
  generateLinearEasing,
  spring as springGenerator,
  type Transition,
} from 'motion/react';

import { toCssTiming } from '../utils/motion';

type Curve = {
  duration: number;
  easing: string;
  at(time: number): number;
  speed(time: number): number;
  initial: number;
};

type Run = { offset: number[]; curve: Curve };

const INSTANT: Curve = {
  duration: 0,
  easing: 'linear',
  at: () => 1,
  speed: () => 0,
  initial: 0,
};

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

function shapeOf(transition: Transition, speed: number) {
  const options = transition as Record<string, unknown>;
  if (!isSpring(options)) return null;
  const { ease, duration: seconds } = createGeneratorEasing(
    {
      ...options,
      ...(typeof options.duration === 'number'
        ? { duration: options.duration * 1000 }
        : null),
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

function curveOf(transition: Transition, initial = 0): Curve {
  const shape = shapeOf(transition, initial);
  if (!shape) {
    const { duration, easing } = toCssTiming(transition);
    return {
      duration,
      easing,
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
      if (time === 0) return initial;
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

function carries(curve: Curve, offset: number[]) {
  return curve.initial * Math.hypot(...offset) > 0.001;
}

function velocityOf(run: Run, time: number) {
  const speed = run.curve.speed(time);
  return run.offset.map((offset) => -offset * speed);
}

function startOf(transition: Transition, offset: number[], velocity: number[]) {
  let length = 0;
  let along = 0;
  offset.forEach((value, i) => {
    length += value * value;
    along += value * (velocity[i] ?? 0);
  });
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
  let low = 0;
  let high = 1;
  for (let i = 0; i < 8; i++) {
    const share = (low + high) / 2;
    if (within(share)) low = share;
    else high = share;
  }
  return speed * low;
}

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
