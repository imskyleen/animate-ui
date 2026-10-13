import { expect } from '@playwright/test';
import {
  createGeneratorEasing,
  cubicBezier,
  generateLinearEasing,
  spring,
} from 'motion';

export type SpringOptions = {
  stiffness: number;
  damping: number;
  mass?: number;
  restDelta?: number;
};

function trajectory(options: SpringOptions, from: number, to: number) {
  const generator = spring({ keyframes: [from, to], ...options });
  const values: number[] = [];
  for (let t = 0; t <= 10_000; t++) {
    const { value, done } = generator.next(t);
    values.push(value);
    if (done) break;
  }
  return values;
}

export function overshootOf(options: SpringOptions) {
  return trajectory(options, 0, 1).reduce(
    (peak, value) => Math.max(peak, value - 1),
    0,
  );
}

export function springTimeTo(
  options: SpringOptions,
  from: number,
  to: number,
  value: number,
) {
  const sign = Math.sign(to - from);
  const t = trajectory(options, from, to).findIndex(
    (v) => (v - value) * sign >= 0,
  );
  if (t < 0) throw new Error(`The spring never reaches ${value}`);
  return t;
}

export function linearPoints(easing: string) {
  const inner = /^linear\((.*)\)$/.exec(easing.trim())?.[1];
  return inner ? inner.split(',').map((stop) => Number.parseFloat(stop)) : [];
}

export function springAsCss(options: SpringOptions) {
  const { duration, ease } = createGeneratorEasing(
    { type: 'spring', ...options },
    100,
    spring,
  );
  const ms = Math.round(duration * 1000);
  return { duration: ms, points: linearPoints(generateLinearEasing(ease, ms)) };
}

export function expectCssSpring(
  timing: { duration: string; easing: string },
  options: SpringOptions,
) {
  const expected = springAsCss(options);
  expect(timing.duration).toBe(`${expected.duration / 1000}s`);
  const points = linearPoints(timing.easing);
  expect(points).toHaveLength(expected.points.length);
  const deviation = Math.max(
    ...points.map((point, i) => Math.abs(point - expected.points[i]!)),
  );
  expect(deviation).toBeLessThan(1e-4);
}

export type CurveOptions = {
  duration: number;
  ease: [number, number, number, number];
};

export function curveTimeTo(
  options: CurveOptions,
  from: number,
  to: number,
  value: number,
) {
  const ease = cubicBezier(...options.ease);
  const share = (value - from) / (to - from);
  for (let t = 0; t <= options.duration; t++)
    if (ease(t / options.duration) >= share) return t;
  throw new Error(`The curve never reaches ${value}`);
}

export function expectCssCurve(
  timing: { duration: string; easing: string },
  options: CurveOptions,
) {
  expect(timing.duration).toBe(`${options.duration / 1000}s`);
  expect(timing.easing.split(', c')[0]).toBe(
    `cubic-bezier(${options.ease.join(', ')})`,
  );
}

export type Sample = [number, number];

type Pace = { from: number; to: number; a: number; b: number; slack?: number };

export function expectSpringPace(
  samples: Sample[],
  options: SpringOptions,
  { from, to, a, b, slack }: Pace,
) {
  expectPace(
    samples,
    springTimeTo(options, from, to, b) - springTimeTo(options, from, to, a),
    { from, to, a, b, slack },
    'the spring',
  );
}

export function expectCurvePace(
  samples: Sample[],
  options: CurveOptions,
  { from, to, a, b, slack }: Pace,
) {
  expectPace(
    samples,
    curveTimeTo(options, from, to, b) - curveTimeTo(options, from, to, a),
    { from, to, a, b, slack },
    'the curve',
  );
}

function expectPace(
  samples: Sample[],
  expected: number,
  { from, to, a, b, slack = 25 }: Pace,
  name: string,
) {
  const sign = Math.sign(to - from);
  const crossing = (value: number) => {
    const i = samples.findIndex(([, v]) => (v - value) * sign >= 0);
    expect(
      i,
      `the motion starts before ${value} and gets there`,
    ).toBeGreaterThan(0);
    return { before: samples[i - 1]![0], after: samples[i]![0] };
  };
  const start = crossing(a);
  const end = crossing(b);
  const shortest = end.before - start.after;
  const longest = end.after - start.before;
  const message = `${name} takes ${expected}ms from ${a} to ${b}, the frames ${Math.round(shortest)} to ${Math.round(longest)}ms`;
  expect(expected, message).toBeGreaterThanOrEqual(shortest - slack);
  expect(expected, message).toBeLessThanOrEqual(longest + slack);
}
