import { expect, test, type Page } from '../test';
import { cubicBezier } from 'motion';

import {
  expectCssCurve,
  expectCurvePace,
  expectSpringPace,
  overshootOf,
  type CurveOptions,
  type Sample,
  type SpringOptions,
} from './spring-curves';

export const FORM = 'form[data-animate-ui-questionnaire]';
export const STEP_OUT: CurveOptions = { duration: 150, ease: [0, 0, 0.58, 1] };
export const STEP_IN: CurveOptions = {
  duration: 300,
  ease: [0.25, 0.1, 0.35, 1],
};
export const STEP_HEIGHT: CurveOptions = {
  duration: 450,
  ease: [0.4, 0, 0.1, 1],
};
export const DISCLOSURE: CurveOptions = {
  duration: 350,
  ease: [0.215, 0.61, 0.355, 1],
};
export const SWAP: CurveOptions = { duration: 150, ease: [0.23, 1, 0.32, 1] };
export const FADE: CurveOptions = { duration: 200, ease: [0.23, 1, 0.32, 1] };
export const COLOR: CurveOptions = {
  duration: 200,
  ease: [0.25, 0.1, 0.25, 1],
};
export const CHECK: CurveOptions = { duration: 300, ease: [0, 0, 0.58, 1] };
export const CHECK_DELAY = 200;
export const DOT: SpringOptions = { stiffness: 200, damping: 16 };
export const SHIFT = 24;
export const BLUR = 5;
export const ACTION_SCALE = 0.9;
export const ACTION_BLUR = 2;
export const ERROR_BLUR = 2;

export const DIRECTION = 'What should the agent build next?';
export const SIGNALS = 'What should every progress update include?';
export const TIMING = 'When should work begin?';

export const atTempo = (curve: CurveOptions, tempo: number): CurveOptions => ({
  ...curve,
  duration: curve.duration * tempo,
});

export const easingOf = ({ ease }: CurveOptions) =>
  `cubic-bezier(${ease.join(', ')})`;

export type Anim = {
  properties: string[];
  duration: number;
  delay: number;
  easing: string;
  fill: string;
  currentTime: number | null;
  keyframes: Record<string, string>[];
};

export type PseudoFrame = {
  value: string;
  alt: string | null;
  o: number;
  ty: number;
  blur: number;
};

export type CountFrame = {
  text: string;
  from: string | null;
  to: string | null;
  hold: string | null;
  filled: boolean;
  before: PseudoFrame | null;
  after: PseudoFrame | null;
  rolling: number;
};

export const paintedOf = (count: CountFrame) =>
  count.filled
    ? [count.text]
    : [count.before, count.after]
        .filter((p): p is PseudoFrame => !!p && p.o > 0.02)
        .map((p) => p.value);

export type ItemFrame = {
  legend: string;
  active: boolean;
  hidden: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  o: number;
  blur: number;
  tx: number;
  ty: number;
  position: string;
  inert: boolean;
  pinned: string[];
  animations: Anim[];
  counts: CountFrame[];
};

export type ActionFrame = {
  slot: string;
  displayed: boolean;
  hidden: boolean;
  o: number;
  scale: number;
  blur: number;
  x: number;
  y: number;
  w: number;
  h: number;
  animations: Anim[];
};

export type ErrorFrame = {
  legend: string;
  displayed: boolean;
  invalid: boolean;
  y: number;
  h: number;
  mt: number;
  o: number;
  blur: number;
  text: string;
  animations: Anim[];
};

export type ChoiceFrame = {
  legend: string;
  name: string;
  type: string | null;
  checked: boolean;
  dot: { display: string; scale: number; o: number } | null;
  check: { display: string; o: number; dash: number } | null;
  bg: string | null;
};

export type Drawn = {
  formH: number;
  items: ItemFrame[];
  actions: ActionFrame[];
  errors: ErrorFrame[];
  choices: ChoiceFrame[];
  progress: {
    text: string;
    valuetext: string | null;
    rolls: number[];
    counts: boolean;
    numbers: CountFrame[];
  } | null;
  below: { y: number; h: number } | null;
  focus: string | null;
};

export type Frame = Drawn & { t: number };

function readQuestionnaire(form: Element | null) {
  if (!form) return null;
  const origin = form.getBoundingClientRect();
  const own = (el: Element) =>
    el.closest('[data-animate-ui-questionnaire]') === form;
  const shown = (el: Element) => el.getClientRects().length > 0;
  const boxOf = (el: Element) => {
    const b = el.getBoundingClientRect();
    return {
      x: b.left - origin.left,
      y: b.top - origin.top,
      w: b.width,
      h: b.height,
    };
  };
  const blurOf = (style: CSSStyleDeclaration) =>
    parseFloat(style.filter.match(/blur\(([^)]+)\)/)?.[1] ?? '0');
  const translateOf = (style: CSSStyleDeclaration) => {
    if (style.translate === 'none') return [0, 0];
    const [x = '0', y = '0'] = style.translate.split(' ');
    return [parseFloat(x), parseFloat(y)];
  };
  const scaleOf = (style: CSSStyleDeclaration) =>
    style.scale === 'none' ? 1 : parseFloat(style.scale);
  const matrixScale = (style: CSSStyleDeclaration) =>
    style.transform === 'none'
      ? 1
      : Number(style.transform.match(/matrix\(([^,]+)/)?.[1] ?? 1);
  const KEYS = [
    'opacity',
    'translate',
    'filter',
    'scale',
    'minHeight',
    'maxHeight',
    'height',
    'marginTop',
    'overflow',
    'overflowY',
  ];
  const SKIP = ['offset', 'easing', 'composite', 'computedOffset'];
  const animationsOf = (el: Element) =>
    el
      .getAnimations()
      .filter((animation) => !('transitionProperty' in animation))
      .map((animation) => {
        const effect = animation.effect as KeyframeEffect;
        const timing = effect.getTiming();
        const keyframes = effect.getKeyframes();
        return {
          properties: [
            ...new Set(
              keyframes.flatMap((keyframe) =>
                Object.keys(keyframe).filter((key) => !SKIP.includes(key)),
              ),
            ),
          ].sort(),
          duration: Number(timing.duration),
          delay: Number(timing.delay ?? 0),
          easing: String(timing.easing),
          fill: String(timing.fill),
          currentTime:
            animation.currentTime === null
              ? null
              : Number(animation.currentTime),
          keyframes: keyframes.map((keyframe) =>
            Object.fromEntries(
              Object.entries(keyframe)
                .filter(([key]) => KEYS.includes(key))
                .map(([key, value]) => [key, String(value)]),
            ),
          ),
        };
      });
  const pseudoOf = (el: Element, which: string) => {
    const style = getComputedStyle(el, which);
    if (!style.content || /^(none|normal)$/.test(style.content)) return null;
    const strings = [...style.content.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(
      (match) => match[1] ?? '',
    );
    return {
      value: strings[0] ?? '',
      alt: style.content.includes('/') ? (strings[1] ?? '') : null,
      o: Number(style.opacity),
      ty: translateOf(style)[1] ?? 0,
      blur: blurOf(style),
    };
  };
  const countsOf = (root: Element) =>
    [
      ...root.querySelectorAll<HTMLElement>(
        '[data-animate-ui-questionnaire-count]',
      ),
    ].map((count) => ({
      text: count.textContent?.trim() ?? '',
      from: count.getAttribute('data-animate-ui-from'),
      to: count.getAttribute('data-animate-ui-to'),
      hold: count.getAttribute('data-animate-ui-hold'),
      filled: !/^(rgba\(0, 0, 0, 0\)|transparent)$/.test(
        getComputedStyle(count).webkitTextFillColor,
      ),
      before: pseudoOf(count, '::before'),
      after: pseudoOf(count, '::after'),
      rolling: count
        .getAnimations({ subtree: true })
        .filter(
          (animation) =>
            (animation.effect as KeyframeEffect).pseudoElement &&
            animation.playState === 'running',
        ).length,
    }));
  const legendOf = (el: Element) =>
    el.querySelector('legend')?.textContent?.trim() ?? '';
  const nameOf = (label: Element) =>
    (
      [
        ...(label.querySelector('[data-slot="questionnaire-choice-label"]')
          ?.childNodes ?? []),
      ].find((node) => node.textContent?.trim())?.textContent ??
      label.textContent ??
      ''
    ).trim();

  const fieldsets = [...form.querySelectorAll('fieldset')].filter(own);
  const displayed = fieldsets.filter(shown);
  const items = displayed.map((el) => {
    const style = getComputedStyle(el);
    const [tx = 0, ty = 0] = translateOf(style);
    return {
      legend: legendOf(el),
      active: el.hasAttribute('data-active'),
      hidden: el.hidden,
      ...boxOf(el),
      o: Number(style.opacity),
      blur: blurOf(style),
      tx,
      ty,
      position: style.position,
      inert: (el as HTMLElement).inert,
      pinned: ['position', 'top', 'left', 'width', 'margin'].filter(
        (name) => el.style.getPropertyValue(name) !== '',
      ),
      animations: animationsOf(el),
      counts: countsOf(el),
    };
  });

  const choices = displayed.flatMap((fieldset) =>
    [
      ...fieldset.querySelectorAll('label[data-slot="questionnaire-choice"]'),
    ].map((label) => {
      const dot = label.querySelector(
        '[data-slot="questionnaire-choice-indicator-dot"]',
      );
      const check = label.querySelector(
        '[data-slot="questionnaire-choice-indicator-check"]',
      );
      const shape = check?.querySelector(
        'path, line, polyline, polygon, circle, ellipse, rect',
      );
      const indicator = label.querySelector(
        '[data-slot="questionnaire-choice-indicator"]',
      );
      const dotStyle = dot ? getComputedStyle(dot) : null;
      const shapeStyle = shape ? getComputedStyle(shape) : null;
      return {
        legend: legendOf(fieldset),
        name: nameOf(label),
        type: label.getAttribute('data-type'),
        checked: label.hasAttribute('data-checked'),
        dot: dotStyle
          ? {
              display: dotStyle.display,
              scale: matrixScale(dotStyle),
              o: Number(dotStyle.opacity),
            }
          : null,
        check: check
          ? {
              display: getComputedStyle(check).display,
              o: shapeStyle ? Number(shapeStyle.opacity) : 1,
              dash:
                !shapeStyle || shapeStyle.strokeDasharray === 'none'
                  ? 1
                  : parseFloat(shapeStyle.strokeDasharray),
            }
          : null,
        bg: indicator ? getComputedStyle(indicator).backgroundColor : null,
      };
    }),
  );

  const actions = [
    ...form.querySelectorAll<HTMLButtonElement>(
      'button[data-slot^="questionnaire-"]',
    ),
  ]
    .filter(own)
    .map((el) => {
      const style = getComputedStyle(el);
      return {
        slot: el.getAttribute('data-slot')!.replace('questionnaire-', ''),
        displayed: shown(el),
        hidden: el.hidden,
        o: Number(style.opacity),
        scale: scaleOf(style),
        blur: blurOf(style),
        ...boxOf(el),
        animations: animationsOf(el),
      };
    });

  const errors = fieldsets.flatMap((fieldset) =>
    [...fieldset.querySelectorAll('[data-slot="questionnaire-error"]')]
      .filter(own)
      .map((el) => {
        const style = getComputedStyle(el);
        return {
          legend: legendOf(fieldset),
          displayed: shown(el),
          invalid: el.hasAttribute('data-invalid'),
          y: boxOf(el).y,
          h: boxOf(el).h,
          mt: parseFloat(style.marginTop),
          o: Number(style.opacity),
          blur: blurOf(style),
          text: el.textContent?.trim() ?? '',
          animations: animationsOf(el),
        };
      }),
  );

  const bar = [...form.querySelectorAll('[role="progressbar"]')].find(own);
  let progress = null;
  if (bar) {
    const counts = [
      ...bar.querySelectorAll<HTMLElement>(
        '[data-animate-ui-questionnaire-count]',
      ),
    ];
    const rolls = counts.map((count) => {
      const value = Number(count.textContent);
      const from = count.getAttribute('data-animate-ui-from');
      if (from === null) return value;
      const coming = count
        .getAnimations({ subtree: true })
        .find((a) => (a.effect as KeyframeEffect).pseudoElement === '::after');
      const p = Number(coming?.effect?.getComputedTiming().progress ?? 0);
      return Number(from) + (value - Number(from)) * p;
    });
    progress = {
      text: (bar.textContent ?? '').replace(/\s+/g, ' ').trim(),
      valuetext: bar.getAttribute('aria-valuetext'),
      rolls,
      counts: counts.length > 0,
      numbers: countsOf(bar),
    };
  }

  let below: Element | null = fieldsets.at(-1)?.nextElementSibling ?? null;
  while (below && !shown(below)) below = below.nextElementSibling;

  const focused = document.activeElement;
  let focus: string | null = null;
  if (focused && form.contains(focused)) {
    const choice = focused.closest('label[data-slot="questionnaire-choice"]');
    focus =
      focused.tagName === 'FIELDSET'
        ? `item:${legendOf(focused)}`
        : choice
          ? `choice:${nameOf(choice)}`
          : (focused.getAttribute('data-slot') ??
            focused.tagName.toLowerCase());
  } else if (focused) focus = `outside:${focused.tagName.toLowerCase()}`;

  return {
    formH: origin.height,
    items,
    actions,
    errors,
    choices,
    progress,
    below: below ? { y: boxOf(below).y, h: boxOf(below).h } : null,
    focus,
  };
}
const READ = readQuestionnaire.toString();

export type Origin =
  | { active: string }
  | { checked: string }
  | { unchecked: string }
  | { invalid: string }
  | { valid: string };

function reachedOrigin(drawn: Drawn | null, origin: Origin) {
  if (!drawn) return false;
  if ('active' in origin)
    return drawn.items.some((i) => i.legend === origin.active && i.active);
  if ('checked' in origin)
    return drawn.choices.some((c) => c.name === origin.checked && c.checked);
  if ('unchecked' in origin)
    return drawn.choices.some((c) => c.name === origin.unchecked && !c.checked);
  if ('invalid' in origin)
    return drawn.errors.some((e) => e.legend === origin.invalid && e.invalid);
  return drawn.errors.some((e) => e.legend === origin.valid && !e.invalid);
}
const REACHED = reachedOrigin.toString();

export const drawnNow = (page: Page, form: string) =>
  page.evaluate(
    ({ read, form }) =>
      (
        new Function(`return (${read})`)() as (
          el: Element | null,
        ) => Drawn | null
      )(document.querySelector(form))!,
    { read: READ, form },
  );

export async function record(
  page: Page,
  form: string,
  origin: Origin,
  act: () => Promise<unknown>,
  ms = 900,
) {
  await page.evaluate(
    ({ read, reached, form, origin, ms }) => {
      const readFn = new Function(`return (${read})`)() as (
        el: Element | null,
      ) => Drawn | null;
      const reachedFn = new Function(`return (${reached})`)() as (
        drawn: Drawn | null,
        origin: Origin,
      ) => boolean;
      const w = window as unknown as {
        __frames: { t: number }[];
        __recording: Promise<unknown>;
        __hook?: (frames: Drawn[]) => boolean;
      };
      const frames: { t: number }[] = (w.__frames = []);
      w.__hook = undefined;
      let started: () => void;
      const ready = new Promise<void>((resolve) => (started = resolve));
      w.__recording = new Promise((resolve) => {
        const start = performance.now();
        let before = false;
        let at: number | null = null;
        const tick = (now: number) => {
          const drawn = readFn(document.querySelector(form));
          const shows = reachedFn(drawn, origin);
          if (at === null && before && shows) at = now;
          if (!shows) before = true;
          frames.push({ ...drawn!, t: now });
          if (frames.length === 2) started();
          const done = at === null ? now - start > 30_000 : now - at > ms;
          if (!done) {
            if (w.__hook)
              requestAnimationFrame(() => {
                if (w.__hook?.(frames as unknown as Drawn[]))
                  w.__hook = undefined;
              });
            requestAnimationFrame(tick);
          } else {
            started();
            const zero = at ?? start;
            resolve(frames.map((f) => ({ ...f, t: f.t - zero })));
          }
        };
        requestAnimationFrame(tick);
      });
      return ready;
    },
    { read: READ, reached: REACHED, form, origin, ms },
  );
  await act();
  return (await page.evaluate(
    () => (window as unknown as { __recording: Promise<unknown> }).__recording,
  )) as Frame[];
}

type Target = { slot: string } | { choice: string };

const clickWhen = (page: Page, form: string, when: string, target: Target) =>
  page.evaluate(
    ({ form, when, target }) => {
      const whenFn = new Function(`return (${when})`)() as (
        drawn: Drawn,
      ) => boolean;
      const w = window as unknown as {
        __at: number;
        __hook?: (frames: Drawn[]) => boolean;
      };
      const root = document.querySelector(form)!;
      const own = (el: Element) =>
        el.closest('[data-animate-ui-questionnaire]') === root;
      const find = () =>
        'slot' in target
          ? [
              ...root.querySelectorAll<HTMLElement>(
                `[data-slot="questionnaire-${target.slot}"]`,
              ),
            ].find(own)
          : [
              ...root.querySelectorAll(
                'label[data-slot="questionnaire-choice"]',
              ),
            ]
              .find(
                (el) =>
                  own(el) &&
                  el.closest('fieldset')!.getClientRects().length > 0 &&
                  (
                    [
                      ...(el.querySelector(
                        '[data-slot="questionnaire-choice-label"]',
                      )?.childNodes ?? []),
                    ].find((node) => node.textContent?.trim())?.textContent ??
                    ''
                  ).trim() === target.choice,
              )
              ?.querySelector('input');
      return new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          w.__hook = undefined;
          w.__at = -1;
          resolve();
        }, 10_000);
        w.__hook = (frames) => {
          const last = frames.at(-1);
          if (!last || !whenFn(last)) return false;
          clearTimeout(timeout);
          w.__at = frames.length;
          find()!.click();
          resolve();
          return true;
        };
      });
    },
    { form, when, target },
  );

export const pressWhen = (
  page: Page,
  form: string,
  when: string,
  slot: string,
) => clickWhen(page, form, when, { slot });

export const pickWhen = (
  page: Page,
  form: string,
  when: string,
  name: string,
) => clickWhen(page, form, when, { choice: name });

export const pressedAt = (page: Page) =>
  page.evaluate(() => (window as unknown as { __at: number }).__at);

export const press = (page: Page, form: string, slot: string) =>
  page.evaluate(
    ({ form, slot }) => {
      const root = document.querySelector(form)!;
      [
        ...root.querySelectorAll<HTMLElement>(
          `[data-slot="questionnaire-${slot}"]`,
        ),
      ]
        .find((el) => el.closest('[data-animate-ui-questionnaire]') === root)!
        .click();
    },
    { form, slot },
  );

export const pick = (page: Page, form: string, name: string) =>
  page.evaluate(
    ({ form, name }) => {
      const root = document.querySelector(form)!;
      const label = [
        ...root.querySelectorAll('label[data-slot="questionnaire-choice"]'),
      ].find(
        (el) =>
          el.closest('[data-animate-ui-questionnaire]') === root &&
          el.closest('fieldset')!.getClientRects().length > 0 &&
          (
            [
              ...(el.querySelector('[data-slot="questionnaire-choice-label"]')
                ?.childNodes ?? []),
            ].find((node) => node.textContent?.trim())?.textContent ?? ''
          ).trim() === name,
      );
      if (!label) throw new Error(`No choice "${name}" on screen`);
      label.querySelector('input')!.click();
    },
    { form, name },
  );

export const nextFrames = (page: Page, count: number) =>
  page.evaluate(
    (count) =>
      new Promise<void>((resolve) => {
        let left = count;
        const tick = () =>
          --left <= 0 ? resolve() : requestAnimationFrame(tick);
        requestAnimationFrame(tick);
      }),
    count,
  );

export async function settle(page: Page, form: string) {
  await page.waitForFunction(
    (form) => {
      const root = document.querySelector(form);
      if (!root) return false;
      const shownItems = [...root.querySelectorAll('fieldset')].filter(
        (el) =>
          el.closest('[data-animate-ui-questionnaire]') === root &&
          el.getClientRects().length > 0,
      );
      const animating = root
        .getAnimations({ subtree: true })
        .some(
          (animation) =>
            !('transitionProperty' in animation) &&
            animation.playState !== 'finished',
        );
      const indicators = [
        ...root.querySelectorAll<HTMLElement | SVGElement>(
          '[data-slot^="questionnaire-choice-indicator-"], [data-slot="questionnaire-choice-indicator-check"] *',
        ),
      ].every(
        (el) =>
          el.style.display === '' &&
          (el.style.opacity === '' || el.getClientRects().length === 0),
      );
      const digits = !root.querySelector('[data-animate-ui-from]');
      return shownItems.length === 1 && !animating && indicators && digits;
    },
    form,
    { polling: 'raf', timeout: 15_000 },
  );
  await nextFrames(page, 3);
}

export async function waitForQuestionnaires(page: Page) {
  await page.waitForFunction(() => {
    const forms = [
      ...document.querySelectorAll('form[data-animate-ui-questionnaire]'),
    ];
    const hydrated = (el: Element) =>
      Boolean(el.closest('[data-slot="vue-demo"][data-mounted]')) ||
      Object.keys(el).some((key) => key.startsWith('__reactProps'));
    return (
      forms.length > 0 &&
      forms.every(
        (form) =>
          hydrated(form) &&
          [...form.querySelectorAll('button, input')].every(hydrated) &&
          form.hasAttribute('data-animate-ui-questionnaire-ready'),
      )
    );
  });
}

export async function gotoQuestionnaire(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await waitForQuestionnaires(page);
  await page.mouse.move(0, 0);
  await page.waitForTimeout(250);
}

export const itemIn = (f: Drawn, legend: string) =>
  f.items.find((i) => i.legend === legend);

export const itemFrames = (frames: Frame[], legend: string, from = 0) =>
  frames.flatMap((f) => {
    const item = f.t >= from ? itemIn(f, legend) : undefined;
    return item ? [{ ...item, t: f.t }] : [];
  });

export const actionIn = (f: Drawn, slot: string) =>
  f.actions.find((a) => a.slot === slot)!;

export const inFlow = (f: Drawn) =>
  f.items.filter((i) => i.position !== 'absolute');

export const animating = (animations: Anim[], property: string) =>
  animations.find((a) => a.properties.includes(property));

export function firstAnimation<T extends { animations: Anim[] }>(
  frames: Frame[],
  pick: (f: Frame) => T | undefined,
  property: string,
) {
  for (const f of frames) {
    const animation = animating(pick(f)?.animations ?? [], property);
    if (animation) return animation;
  }
  return undefined;
}

export const pxOf = (value: string | undefined) =>
  parseFloat(value?.replace(/^blur\(/, '') ?? 'NaN');

export function curveAt(curve: CurveOptions, time: number, delay = 0) {
  const progress = Math.min(1, Math.max(0, (time - delay) / curve.duration));
  return cubicBezier(...curve.ease)(progress);
}

export function steepestOf(curve: CurveOptions) {
  const ease = cubicBezier(...curve.ease);
  let steepest = 0;
  for (let i = 0; i < 1000; i++)
    steepest = Math.max(
      steepest,
      (ease((i + 1) / 1000) - ease(i / 1000)) * 1000,
    );
  return steepest;
}

export function expectTiming(
  animation: Anim | undefined,
  curve: CurveOptions,
  delay = 0,
) {
  expect(animation, 'a Web Animation').toBeDefined();
  expect(animation!.duration, 'its duration').toBeCloseTo(curve.duration, 1);
  expect(animation!.delay, 'its delay').toBeCloseTo(delay, 1);
  expect(animation!.easing, 'its curve').toBe(easingOf(curve));
}

export function expectOnCurve(
  samples: { time: number | null; value: number }[],
  curve: CurveOptions,
  from: number,
  to: number,
  { delay = 0, tolerance = 0.01 }: { delay?: number; tolerance?: number } = {},
) {
  const timed = samples.filter((s) => s.time !== null);
  expect(timed.length, 'frames of the animation').toBeGreaterThan(1);
  for (const { time, value } of timed) {
    const expected = from + (to - from) * curveAt(curve, time!, delay);
    expect(
      Math.abs(value - expected),
      `${Math.round(time!)}ms into it: ${value}, the curve's ${expected}`,
    ).toBeLessThan(Math.abs(to - from) * tolerance + 1e-3);
  }
}

export function expectMonotonic(values: number[], sign: 1 | -1, label = '') {
  for (let i = 1; i < values.length; i++)
    expect(
      (values[i]! - values[i - 1]!) * sign,
      `${label} step ${i}: ${values[i - 1]} to ${values[i]}`,
    ).toBeGreaterThanOrEqual(-1e-3);
}

type StepOptions = {
  from: string;
  to: string;
  way: 1 | -1;
  out?: CurveOptions;
  into?: CurveOptions;
};

export function expectStep(
  frames: Frame[],
  { from, to, way, out = STEP_OUT, into = STEP_IN }: StepOptions,
) {
  for (const f of frames) {
    const when = `${Math.round(f.t)}ms`;
    expect(inFlow(f), when).toHaveLength(1);
    expect(f.items.length, when).toBeLessThanOrEqual(2);
  }
  for (const f of frames.filter((f) => f.t < 0))
    expect(inFlow(f)[0]!.legend, `${Math.round(f.t)}ms`).toBe(from);
  for (const f of frames.filter((f) => f.t >= 0))
    expect(inFlow(f)[0]!.legend, `${Math.round(f.t)}ms`).toBe(to);

  const leaving = itemFrames(frames, from);
  expect(leaving.length, `${from} shows as it leaves`).toBeGreaterThan(2);
  for (const f of frames.filter((f) => f.t >= 0)) {
    const left = itemIn(f, from);
    if (!left) continue;
    const next = itemIn(f, to)!;
    const when = `${Math.round(f.t)}ms`;
    expect(left.position, when).toBe('absolute');
    expect(left.inert, when).toBe(true);
    expect(left.active, when).toBe(false);
    expect(Math.abs(left.y - next.y), `${when}: its top`).toBeLessThan(EXACT);
    expect(
      Math.abs(left.x - left.tx - (next.x - next.tx)),
      `${when}: its left`,
    ).toBeLessThan(EXACT);
    expect(Math.abs(left.w - next.w), `${when}: its width`).toBeLessThan(EXACT);
  }
  const exit = firstAnimation(frames, (f) => itemIn(f, from), 'opacity');
  expectTiming(exit, out);
  expect(exit!.keyframes[0]).toMatchObject({ opacity: '1' });
  expect(pxOf(exit!.keyframes[0]!.translate)).toBe(0);
  expect(pxOf(exit!.keyframes[0]!.filter)).toBe(0);
  expect(exit!.keyframes.at(-1)).toMatchObject({ opacity: '0' });
  expect(pxOf(exit!.keyframes.at(-1)!.translate)).toBe(-way * SHIFT);
  expect(pxOf(exit!.keyframes.at(-1)!.filter)).toBe(BLUR);
  expectMonotonic(
    leaving.map((p) => p.o),
    -1,
    `${from}'s opacity`,
  );
  expectMonotonic(
    leaving.map((p) => p.tx * way),
    -1,
    `${from}'s slide`,
  );
  for (const p of leaving) {
    const gone = 1 - p.o;
    const when = `${Math.round(p.t)}ms`;
    expect(
      Math.abs(p.tx + way * SHIFT * gone),
      `${when}: tx ${p.tx}`,
    ).toBeLessThan(0.3);
    expect(
      Math.abs(p.blur - BLUR * gone),
      `${when}: blur ${p.blur}`,
    ).toBeLessThan(0.05);
    expect(p.ty).toBe(0);
  }
  expect(
    leaving.some((p) => p.o > 0.1 && p.o < 0.9),
    `${from} seen fading`,
  ).toBe(true);
  expectOnCurve(
    leaving.map((p) => ({
      time: animating(p.animations, 'opacity')?.currentTime ?? null,
      value: p.o,
    })),
    out,
    1,
    0,
  );
  const last = frames.filter((f) => f.t < 0).at(-1)!;
  expectCurvePace(
    [
      [last.t, itemIn(last, from)!.o] as Sample,
      ...leaving.map((p): Sample => [p.t, p.o]),
    ],
    out,
    { from: 1, to: 0, a: 0.8, b: 0.2 },
  );

  const coming = itemFrames(frames, to);
  const enter = firstAnimation(frames, (f) => itemIn(f, to), 'opacity');
  expectTiming(enter, into, out.duration);
  expect(enter!.keyframes[0]).toMatchObject({ opacity: '0' });
  expect(pxOf(enter!.keyframes[0]!.translate)).toBe(way * SHIFT);
  expect(pxOf(enter!.keyframes[0]!.filter)).toBe(BLUR);
  expect(enter!.keyframes.at(-1)).toMatchObject({ opacity: '1' });
  expect(pxOf(enter!.keyframes.at(-1)!.translate)).toBe(0);
  expect(pxOf(enter!.keyframes.at(-1)!.filter)).toBe(0);
  for (const p of coming) {
    const time = animating(p.animations, 'opacity')?.currentTime ?? null;
    if (time === null || time > out.duration) continue;
    const when = `${Math.round(p.t)}ms (${Math.round(time)}ms into it)`;
    expect(p.o, when).toBe(0);
    expect(p.tx, when).toBe(way * SHIFT);
    expect(p.blur, when).toBe(BLUR);
  }
  expectMonotonic(
    coming.map((p) => p.o),
    1,
    `${to}'s opacity`,
  );
  expectMonotonic(
    coming.map((p) => p.tx * way),
    -1,
    `${to}'s slide`,
  );
  for (const p of coming) {
    const left = 1 - p.o;
    const when = `${Math.round(p.t)}ms`;
    expect(
      Math.abs(p.tx - way * SHIFT * left),
      `${when}: tx ${p.tx}`,
    ).toBeLessThan(0.3);
    expect(
      Math.abs(p.blur - BLUR * left),
      `${when}: blur ${p.blur}`,
    ).toBeLessThan(0.05);
  }
  expect(
    coming.some((p) => p.o > 0.1 && p.o < 0.9),
    `${to} seen fading in`,
  ).toBe(true);
  expectOnCurve(
    coming.map((p) => ({
      time: animating(p.animations, 'opacity')?.currentTime ?? null,
      value: p.o,
    })),
    into,
    0,
    1,
    { delay: out.duration },
  );
  expectCurvePace(
    coming.map((p): Sample => [p.t, p.o]),
    into,
    { from: 0, to: 1, a: 0.2, b: 0.8 },
  );
  for (const f of frames) {
    const [a, b] = [itemIn(f, from), itemIn(f, to)];
    if (a && b)
      expect(
        Math.min(a.o, b.o),
        `${Math.round(f.t)}ms: both seen (${a.o}, ${b.o})`,
      ).toBeLessThan(0.02);
  }

  const end = frames.at(-1)!;
  expect(end.items).toHaveLength(1);
  expect(end.items[0]).toMatchObject({
    legend: to,
    active: true,
    o: 1,
    blur: 0,
    tx: 0,
    position: 'static',
    inert: false,
  });
  expect(end.items[0]!.animations).toEqual([]);
}

export const EXACT = 0.02;

export function expectHeightGlide(
  frames: Frame[],
  {
    to,
    before,
    after,
    height = STEP_HEIGHT,
    delay = STEP_OUT.duration,
  }: {
    to: string;
    before: number;
    after: number;
    height?: CurveOptions;
    delay?: number;
  },
) {
  const coming = itemFrames(frames, to);
  const gliding = coming.filter((p) => animating(p.animations, 'minHeight'));
  const sign = Math.sign(after - before) as 1 | -1;
  expect(
    Math.abs(after - before),
    'questions of different heights',
  ).toBeGreaterThan(20);
  const glide = firstAnimation(frames, (f) => itemIn(f, to), 'minHeight');
  expectTiming(glide, height, delay);
  expect(glide!.properties).toEqual(['maxHeight', 'minHeight', 'overflowY']);
  expect(
    Math.abs(pxOf(glide!.keyframes[0]!.minHeight) - before),
  ).toBeLessThanOrEqual(EXACT);
  expect(
    Math.abs(pxOf(glide!.keyframes.at(-1)!.minHeight) - after),
  ).toBeLessThanOrEqual(EXACT);
  const timed = coming.map((p) => ({
    p,
    time: animating(p.animations, 'minHeight')?.currentTime ?? null,
  }));
  const held = timed.filter(({ time }) => time !== null && time < delay);
  expect(held.length, 'frames held while the leaving one goes').toBeGreaterThan(
    2,
  );
  for (const { p, time } of held)
    expect(
      Math.abs(p.h - before),
      `${Math.round(p.t)}ms (${Math.round(time!)}ms into the glide): ${p.h}px, the leaving one's ${before}px`,
    ).toBeLessThanOrEqual(EXACT);
  expectOnCurve(
    timed.map(({ p, time }) => ({ time, value: p.h })),
    height,
    before,
    after,
    { delay },
  );
  for (const f of frames.filter((f) => f.t >= 0)) {
    const item = itemIn(f, to);
    if (!item || Math.abs(item.h - before) <= EXACT) continue;
    for (const other of f.items.filter((i) => i.legend !== to))
      expect(
        other.o,
        `${Math.round(f.t)}ms: ${other.legend} still seen as the height moves (${item.h}px)`,
      ).toBeLessThan(0.02);
  }
  expectMonotonic(
    gliding.map((p) => p.h),
    sign,
    `${to}'s height`,
  );
  for (const p of coming)
    expect(
      (p.h - after) * sign,
      `${Math.round(p.t)}ms: ${p.h}px, past its own (${after}px)`,
    ).toBeLessThanOrEqual(EXACT);
  expect(
    gliding.filter((p) => (p.h - before) * sign > 2 && (after - p.h) * sign > 2)
      .length,
    'frames on the way',
  ).toBeGreaterThanOrEqual(3);
  expectCurvePace(
    coming.map((p): Sample => [p.t, p.h]),
    height,
    {
      from: before,
      to: after,
      a: before + (after - before) * 0.1,
      b: before + (after - before) * 0.9,
    },
  );
  expect(coming.at(-1)!.animations, 'at rest').toEqual([]);
  const gap = (f: Frame) => {
    const item = inFlow(f)[0]!;
    return f.below!.y - (item.y + item.h);
  };
  const rest = gap(frames[0]!);
  for (const f of frames)
    expect(
      Math.abs(gap(f) - rest),
      `${Math.round(f.t)}ms: the gap below`,
    ).toBeLessThan(0.05);
  const fastest =
    (Math.abs(after - before) * steepestOf(height)) / height.duration;
  for (let i = 1; i < frames.length; i++) {
    const step = Math.abs(frames[i]!.below!.y - frames[i - 1]!.below!.y);
    const dt = frames[i]!.t - frames[i - 1]!.t;
    expect(
      step,
      `${Math.round(frames[i]!.t)}ms: what's below moved ${step}px`,
    ).toBeLessThanOrEqual(fastest * dt * 1.2 + EXACT + 0.1);
  }
}

export function expectExactHeights(
  frames: Frame[],
  {
    to,
    before,
    after,
    delay = STEP_OUT.duration,
  }: { to: string; before: number; after: number; delay?: number },
) {
  const coming = itemFrames(frames, to);
  const sign = Math.sign(after - before) as 1 | -1;
  const glide = firstAnimation(frames, (f) => itemIn(f, to), 'minHeight');
  expect(glide, 'a height glide').toBeDefined();
  expect(
    Math.abs(pxOf(glide!.keyframes[0]!.minHeight) - before),
    `it starts at ${glide!.keyframes[0]!.minHeight} (the leaving one: ${before}px)`,
  ).toBeLessThan(0.01);
  expect(
    Math.abs(pxOf(glide!.keyframes.at(-1)!.minHeight) - after),
    `it ends at ${glide!.keyframes.at(-1)!.minHeight} (its own: ${after}px)`,
  ).toBeLessThan(0.01);
  const at = (time: number) =>
    before + (after - before) * curveAt(STEP_HEIGHT, time, delay);
  for (const p of coming) {
    const time = animating(p.animations, 'minHeight')?.currentTime ?? null;
    const expected = time === null ? after : at(time);
    const slack =
      time === null ? 0 : Math.abs(at(time + 0.5) - at(time - 0.5)) / 2;
    expect(
      Math.abs(p.h - expected),
      `${Math.round(p.t)}ms${time === null ? ' (at rest)' : ` (${Math.round(time)}ms into the glide)`}: ${p.h}px, the curve's ${expected}px`,
    ).toBeLessThan(1 / 64 + 0.01 + slack);
  }
  expectMonotonic(
    coming.map((p) => p.h),
    sign,
    `${to}'s height, to rest`,
  );
  expectMonotonic(
    frames.map((f) => f.below!.y),
    sign,
    "what's below",
  );
  expect(coming.at(-1)!.h).toBeCloseTo(after, 2);
}

export function expectNoJumps(frames: Frame[]) {
  for (let i = 1; i < frames.length; i++) {
    const [a, b] = [frames[i - 1]!, frames[i]!];
    const dt = b.t - a.t;
    for (const item of b.items) {
      const was = itemIn(a, item.legend);
      if (!was) continue;
      const when = `${Math.round(b.t)}ms: ${item.legend}`;
      expect(
        Math.abs(item.o - was.o),
        `${when}: its opacity, ${was.o} to ${item.o}`,
      ).toBeLessThanOrEqual(0.0125 * dt + 0.02);
      expect(
        Math.abs(item.tx - was.tx),
        `${when}: its slide, ${was.tx} to ${item.tx}`,
      ).toBeLessThanOrEqual(0.3 * dt + 0.5);
    }
  }
}

export function expectSteadyHeight(frames: Frame[]) {
  const ys = frames.map((f) => f.below!.y);
  const range = Math.max(...ys) - Math.min(...ys);
  const pace =
    range *
    Math.max(
      steepestOf(STEP_HEIGHT) / STEP_HEIGHT.duration,
      steepestOf(DISCLOSURE) / DISCLOSURE.duration,
    );
  for (let i = 1; i < frames.length; i++) {
    const [a, b] = [frames[i - 1]!, frames[i]!];
    const when = `${Math.round(b.t)}ms`;
    const step = Math.abs(b.below!.y - a.below!.y);
    expect(
      step,
      `${when}: what's below moved ${step}px (${a.below!.y} to ${b.below!.y})`,
    ).toBeLessThanOrEqual(pace * (b.t - a.t) * 1.2 + 0.5);
    const [was, now] = [inFlow(a)[0]!, inFlow(b)[0]!];
    if (
      was.legend === now.legend &&
      animating(was.animations, 'minHeight') &&
      !animating(now.animations, 'minHeight')
    )
      expect(
        Math.abs(now.h - was.h),
        `${when}: a glide ending, ${was.h}px to ${now.h}px`,
      ).toBeLessThan(1);
  }
}

export async function expectRestingOn(
  page: Page,
  form: string,
  legend: string,
) {
  const drawn = await drawnNow(page, form);
  expect(drawn.items).toHaveLength(1);
  expect(drawn.items[0]).toMatchObject({
    legend,
    active: true,
    o: 1,
    blur: 0,
    tx: 0,
    position: 'static',
    pinned: [],
    animations: [],
  });
  const others = await page.evaluate(
    ({ form, legend }) =>
      [...document.querySelector(form)!.querySelectorAll('fieldset')]
        .filter(
          (el) =>
            el.closest('[data-animate-ui-questionnaire]') ===
              document.querySelector(form) &&
            el.querySelector('legend')?.textContent?.trim() !== legend,
        )
        .map((el) => ({
          legend: el.querySelector('legend')?.textContent,
          hidden: el.hidden,
          inline: [
            'position',
            'top',
            'left',
            'width',
            'margin',
            'min-height',
            'max-height',
          ]
            .map((name) => el.style.getPropertyValue(name))
            .join(''),
          animations: el.getAnimations().length,
        })),
    { form, legend },
  );
  expect(others.length).toBeGreaterThan(0);
  for (const other of others)
    expect(other, `${other.legend}`).toMatchObject({
      hidden: true,
      inline: '',
      animations: 0,
    });
}

export function expectErrorShows(
  frames: Frame[],
  legend: string,
  { exact = true }: { exact?: boolean } = {},
) {
  const shown = frames.filter((f) => f.t >= 0);
  expect(shown.length).toBeGreaterThan(3);
  for (const f of shown) {
    const error = f.errors.find((e) => e.legend === legend)!;
    const item = itemIn(f, legend)!;
    const when = `${Math.round(f.t)}ms`;
    expect(error.displayed, when).toBe(true);
    const [bottom, ends] = [item.y + item.h, error.y + error.h];
    if (exact)
      expect(
        Math.abs(bottom - ends),
        `${when}: the question ends at ${bottom}, its error at ${ends}`,
      ).toBeLessThan(0.5);
    else
      expect(
        ends,
        `${when}: the question ends at ${bottom}, cutting its error (to ${ends})`,
      ).toBeLessThanOrEqual(bottom + 0.5);
  }
  const end = shown.at(-1)!;
  expect(end.errors.find((e) => e.legend === legend)).toMatchObject({
    o: 1,
    blur: 0,
  });
}

export function expectRollPainted(
  frames: Frame[],
  index: number,
  from: string,
  to: string,
) {
  const numbers = frames.map((f) => ({
    t: f.t,
    ...f.progress!.numbers[index]!,
  }));
  const rolling = numbers.filter((n) => n.from !== null);
  expect(
    rolling.filter((n) => n.after!.o > 0.1 && n.after!.o < 0.9).length,
    `frames rolling from ${from} to ${to}`,
  ).toBeGreaterThanOrEqual(2);
  for (const n of numbers) {
    const when = `${Math.round(n.t)}ms`;
    if (n.from === null) {
      expect(n, `${when}: at rest`).toMatchObject({
        filled: true,
        before: null,
        after: null,
        hold: null,
      });
      expect(paintedOf(n), when).toEqual([n.text]);
      continue;
    }
    expect(n.text, `${when}: its own text`).toBe(to);
    expect(n.filled, `${when}: its own text painted under the roll`).toBe(
      false,
    );
    expect(n.before, `${when}: ::before`).toMatchObject({
      value: from,
      alt: '',
    });
    expect(n.after, `${when}: ::after`).toMatchObject({ value: to, alt: '' });
    expect(
      Math.abs(n.before!.o + n.after!.o - 1),
      `${when}: ${from} at ${n.before!.o}, ${to} at ${n.after!.o}`,
    ).toBeLessThan(0.02);
  }
  expectMonotonic(
    rolling.map((n) => n.before!.o),
    -1,
    `${from} fading out`,
  );
  expectMonotonic(
    rolling.map((n) => n.after!.o),
    1,
    `${to} fading in`,
  );
  expect(numbers.at(-1)!.from, 'at rest at the end').toBeNull();
}

export async function expectRollReadAs(
  page: Page,
  form: string,
  act: () => Promise<unknown>,
  again: () => Promise<unknown>,
) {
  const bar = page.locator(form).getByRole('progressbar');
  const rolling = () =>
    page
      .locator(form)
      .evaluate(
        (el) =>
          !!el.querySelector('[role="progressbar"] [data-animate-ui-from]'),
      );
  for (let attempt = 0; attempt < 4; attempt++) {
    await (attempt % 2 ? again : act)();
    await expect.poll(rolling, { intervals: [0] }).toBe(true);
    const snapshot = await bar.ariaSnapshot();
    const text = await bar.evaluate((el) =>
      (el.textContent ?? '').replace(/\s+/g, ' ').trim(),
    );
    if (!(await rolling())) continue;
    expect(snapshot, 'read mid-roll').toMatch(
      new RegExp(`^- progressbar "[^"]*": ${text}$`),
    );
    return;
  }
  throw new Error('No snapshot taken mid-roll');
}

async function pressChoice(page: Page, form: string, label: string, ms = 250) {
  const choice = page.locator(form).locator('label', { hasText: label });
  const box = (await choice.boundingBox())!;
  await page.evaluate(
    ({ form, label }) => {
      const el = [...document.querySelectorAll(`${form} label`)].find((l) =>
        l.textContent?.includes(label),
      )!;
      const w = window as unknown as { __scales: number[] };
      w.__scales = [];
      const tick = () => {
        const m = new DOMMatrix(getComputedStyle(el).transform);
        w.__scales.push(m.a);
        if (w.__scales.length < 90) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
    { form, label },
  );
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(ms);
  const held = await page.evaluate(
    () => (window as unknown as { __scales: number[] }).__scales.length,
  );
  await page.mouse.up();
  await page.waitForTimeout(700);
  const scales = await page.evaluate(
    () => (window as unknown as { __scales: number[] }).__scales,
  );
  return { scales, held };
}

export function describeQuestionnaire(
  library: string,
  url = `/tests/demos/${library}/questionnaire`,
) {
  const form = FORM;
  const restingOn = (legend: string) =>
    `(d) => d.items.length === 1 && d.items[0].legend === ${JSON.stringify(legend)} && d.items[0].animations.length === 0`;

  const toSignals = async (page: Page) => {
    await pick(page, form, 'Approval checkpoints');
    await press(page, form, 'next');
    await settle(page, form);
  };

  test.describe(`${library} questionnaire demo`, () => {
    test.describe.configure({ timeout: 120_000 });
    test.beforeEach(async ({ page }) => {
      await gotoQuestionnaire(page, url);
    });

    test('a choice pressed scales to 0.985 (lighter than the buttons, at 0.97) on spring.press, and back up when let go', async ({
      page,
    }) => {
      const { scales, held } = await pressChoice(
        page,
        form,
        'Approval checkpoints',
      );
      expect(scales[0], 'at rest').toBe(1);
      const down = scales.slice(0, held);
      expect(Math.min(...down)).toBeGreaterThan(0.981);
      expect(Math.abs(down.at(-1)! - 0.985)).toBeLessThan(0.0015);
      expect(
        down.filter((v) => v < 0.998 && v > 0.988).length,
      ).toBeGreaterThanOrEqual(1);
      expect(scales.at(-1), 'let go: back up').toBeCloseTo(1, 3);
    });

    test('at rest: the first question alone, Next alone, "Question 1 of 3"', async ({
      page,
    }) => {
      const drawn = await drawnNow(page, form);
      expect(drawn.items.map((i) => i.legend)).toEqual([DIRECTION]);
      expect(drawn.items[0]).toMatchObject({ o: 1, tx: 0, blur: 0 });
      expect(
        drawn.actions.filter((a) => a.displayed).map((a) => a.slot),
      ).toEqual(['next']);
      expect(drawn.progress).toMatchObject({
        text: 'Question 1 of 3',
        valuetext: 'Question 1 of 3',
        counts: true,
      });
    });

    test('Next slides forward: the question leaving goes toward the start into the blur, pinned over the next, then the next comes in from the end out of it, on the step tokens', async ({
      page,
    }) => {
      await pick(page, form, 'Approval checkpoints');
      await settle(page, form);
      const frames = await record(page, form, { active: SIGNALS }, () =>
        page.locator(form).locator('[data-slot="questionnaire-next"]').click(),
      );
      expectStep(frames, { from: DIRECTION, to: SIGNALS, way: 1 });
      for (const f of frames.filter((f) => f.t >= 0))
        expect(f.focus, `${Math.round(f.t)}ms`).toBe(`item:${SIGNALS}`);
      await settle(page, form);
      await expectRestingOn(page, form, SIGNALS);
      expectNoJumps(frames);
    });

    test("the next question's height glides from the leaving one's to its own, never past it, and what's below follows it", async ({
      page,
    }) => {
      await pick(page, form, 'Approval checkpoints');
      await settle(page, form);
      const before = itemIn(await drawnNow(page, form), DIRECTION)!.h;
      const frames = await record(page, form, { active: SIGNALS }, () =>
        press(page, form, 'next'),
      );
      await settle(page, form);
      const after = itemIn(await drawnNow(page, form), SIGNALS)!.h;
      expectHeightGlide(frames, { to: SIGNALS, before, after });
    });

    test('Previous slides back: the question leaving goes toward the end, the previous one comes in from the start; the height glides back', async ({
      page,
    }) => {
      await toSignals(page);
      const before = itemIn(await drawnNow(page, form), SIGNALS)!.h;
      const frames = await record(page, form, { active: DIRECTION }, () =>
        page
          .locator(form)
          .locator('[data-slot="questionnaire-previous"]')
          .click(),
      );
      expectStep(frames, { from: SIGNALS, to: DIRECTION, way: -1 });
      for (const f of frames.filter((f) => f.t >= 0))
        expect(f.focus, `${Math.round(f.t)}ms`).toBe(`item:${DIRECTION}`);
      await settle(page, form);
      const after = itemIn(await drawnNow(page, form), DIRECTION)!.h;
      expectHeightGlide(frames, { to: DIRECTION, before, after });
      await expectRestingOn(page, form, DIRECTION);
      expect(
        (await drawnNow(page, form)).choices.find(
          (c) => c.name === 'Approval checkpoints',
        )!.checked,
      ).toBe(true);
      expectNoJumps(frames);
    });

    test("the next question takes over at the leaving one's exact height and comes to rest on its own exactly: what's below never jumps, even by a fraction of a pixel", async ({
      page,
    }) => {
      await pick(page, form, 'Approval checkpoints');
      await settle(page, form);
      const first = itemIn(await drawnNow(page, form), DIRECTION)!.h;
      const on = await record(page, form, { active: SIGNALS }, () =>
        press(page, form, 'next'),
      );
      await settle(page, form);
      const second = itemIn(await drawnNow(page, form), SIGNALS)!.h;
      expect(first % 1, 'a question of a fractional height').not.toBe(0);
      expectExactHeights(on, { to: SIGNALS, before: first, after: second });
      const back = await record(page, form, { active: DIRECTION }, () =>
        press(page, form, 'previous'),
      );
      expectExactHeights(back, { to: DIRECTION, before: second, after: first });
    });

    test('keyboard: Enter on an answer goes on as a click does, the focus staying on the next question all the way, and ArrowLeft goes back on the way', async ({
      page,
    }) => {
      await page
        .locator(form)
        .locator('label', { hasText: 'Approval checkpoints' })
        .click();
      await settle(page, form);
      await expect(
        page.locator(form).locator('input[value="approvals"]'),
      ).toBeFocused();
      const frames = await record(
        page,
        form,
        { active: DIRECTION },
        async () => {
          await page.keyboard.press('Enter');
          await page.waitForFunction(
            (legend) =>
              (window as unknown as { __frames: Drawn[] }).__frames.some((f) =>
                f.items.some((i) => i.legend === legend && i.active),
              ),
            SIGNALS,
            { polling: 'raf' },
          );
          await page.keyboard.press('ArrowLeft');
        },
      );
      const on = frames.findIndex((f) => itemIn(f, SIGNALS)?.active);
      const back = frames.findIndex((f) => f.t >= 0);
      expect(on, 'on to the next question').toBeGreaterThan(0);
      expect(back, 'back to the first question').toBeGreaterThan(on);
      for (const f of frames.slice(on, back)) {
        expect(inFlow(f)[0]!.legend, `${Math.round(f.t)}ms`).toBe(SIGNALS);
        const leaving = itemIn(f, DIRECTION);
        if (leaving)
          expect(leaving, `${Math.round(f.t)}ms`).toMatchObject({
            position: 'absolute',
            inert: true,
          });
      }
      const before = frames[back - 1]!;
      expect(
        itemIn(before, SIGNALS)!.animations.some(
          (a) => a.currentTime !== null && a.currentTime < a.delay + a.duration,
        ),
        `${Math.round(before.t)}ms: still coming in`,
      ).toBe(true);
      for (const f of frames.slice(on, back))
        expect(f.focus, `${Math.round(f.t)}ms`).toBe(`item:${SIGNALS}`);
      for (const f of frames.slice(back))
        expect(f.focus, `${Math.round(f.t)}ms`).toBe(`item:${DIRECTION}`);
      for (const f of frames)
        expect(inFlow(f), `${Math.round(f.t)}ms`).toHaveLength(1);
      await settle(page, form);
      await expectRestingOn(page, form, DIRECTION);
      expectNoJumps(frames);
    });

    test('Previous while the question leaves: it comes back from where it is, the next one never shows', async ({
      page,
    }) => {
      await pick(page, form, 'Approval checkpoints');
      await settle(page, form);
      const frames = await record(
        page,
        form,
        { active: SIGNALS },
        async () => {
          await press(page, form, 'next');
          await pressWhen(
            page,
            form,
            `(d) => d.items.some((i) => i.legend === ${JSON.stringify(DIRECTION)} && i.position === 'absolute' && i.o > 0.3 && i.o < 0.75)`,
            'previous',
          );
        },
        1000,
      );
      const at = await pressedAt(page);
      expect(at, 'Previous pressed').toBeGreaterThan(0);
      const was = itemIn(frames[at - 1]!, DIRECTION)!;
      expect(was.position, 'leaving when Previous is pressed').toBe('absolute');
      const now = itemIn(frames[at]!, DIRECTION)!;
      expect(now).toMatchObject({ active: true, position: 'static' });
      const comeback = animating(now.animations, 'opacity')!;
      expectTiming(comeback, STEP_IN);
      const dt = frames[at]!.t - frames[at - 1]!.t;
      expect(
        Math.abs(Number(comeback.keyframes[0]!.opacity) - was.o),
        'from where it was',
      ).toBeLessThan(0.0125 * dt + 0.02);
      const back = itemFrames(frames.slice(at), DIRECTION);
      expect(Number(comeback.keyframes[0]!.opacity)).toBeCloseTo(back[0]!.o, 2);
      expectMonotonic(
        back.map((p) => p.o),
        1,
        'its opacity',
      );
      expectMonotonic(
        back.map((p) => p.tx),
        1,
        'its slide (back from the start)',
      );
      expectMonotonic(
        back.map((p) => p.blur),
        -1,
        'its blur',
      );
      const heights = frames.map((f) => inFlow(f)[0]!.h);
      for (let i = 1; i < heights.length; i++)
        expect(
          Math.abs(heights[i]! - heights[i - 1]!),
          `${Math.round(frames[i]!.t)}ms`,
        ).toBeLessThan(6);
      expect(itemIn(frames.at(-1)!, SIGNALS)).toBeUndefined();
      await settle(page, form);
      await expectRestingOn(page, form, DIRECTION);
      for (const f of frames)
        expect(
          itemIn(f, SIGNALS)?.o ?? 0,
          `${Math.round(f.t)}ms: the next question seen`,
        ).toBeLessThan(0.02);
      expectNoJumps(frames);
    });

    test('Previous while the next question comes in: it leaves from where it is, toward the end, shortened by what is left of it, and the previous one comes in after it', async ({
      page,
    }) => {
      await pick(page, form, 'Approval checkpoints');
      await settle(page, form);
      const frames = await record(
        page,
        form,
        { active: SIGNALS },
        async () => {
          await press(page, form, 'next');
          await pressWhen(
            page,
            form,
            `(d) => d.items.some((i) => i.legend === ${JSON.stringify(SIGNALS)} && i.o > 0.3 && i.o < 0.7)`,
            'previous',
          );
        },
        1100,
      );
      const at = await pressedAt(page);
      expect(at, 'Previous pressed').toBeGreaterThan(0);
      const was = itemIn(frames[at - 1]!, SIGNALS)!;
      expect(itemIn(frames[at]!, DIRECTION)?.active).toBe(true);
      const exit = animating(
        itemIn(frames[at]!, SIGNALS)!.animations,
        'opacity',
      )!;
      const from = Number(exit.keyframes[0]!.opacity);
      const dt = frames[at]!.t - frames[at - 1]!.t;
      expect(Math.abs(from - was.o), 'from where it was').toBeLessThan(
        0.0125 * dt + 0.02,
      );
      expect(
        Math.abs(pxOf(exit.keyframes[0]!.translate) - was.tx),
      ).toBeLessThan(0.3 * dt + 0.5);
      expect(exit.easing).toBe(easingOf(STEP_OUT));
      expect(exit.duration, 'shortened by what is left of it').toBeCloseTo(
        STEP_OUT.duration * from,
        0,
      );
      expect(pxOf(exit.keyframes.at(-1)!.translate)).toBe(SHIFT);
      expect(pxOf(exit.keyframes.at(-1)!.filter)).toBe(BLUR);
      const leaving = itemFrames(frames.slice(at + 1), SIGNALS);
      expect(leaving.length).toBeGreaterThan(1);
      expectMonotonic(
        leaving.map((p) => p.o),
        -1,
        'its opacity',
      );
      expectMonotonic(
        leaving.map((p) => p.tx),
        1,
        'its slide',
      );
      for (const p of leaving) {
        expect(p.position).toBe('absolute');
        expect(p.tx).toBeLessThanOrEqual(SHIFT + 0.01);
      }
      const enter = animating(
        itemIn(frames[at]!, DIRECTION)!.animations,
        'opacity',
      )!;
      expectTiming(enter, STEP_IN, exit.duration);
      expect(pxOf(enter.keyframes[0]!.translate)).toBe(-SHIFT);
      for (const f of frames.slice(at)) {
        const [a, b] = [itemIn(f, SIGNALS), itemIn(f, DIRECTION)];
        if (a && b)
          expect(Math.min(a.o, b.o), `${Math.round(f.t)}ms`).toBeLessThan(0.02);
      }
      expectMonotonic(
        itemFrames(frames.slice(at), DIRECTION).map((p) => p.tx),
        1,
        'the previous one slides in',
      );
      await settle(page, form);
      await expectRestingOn(page, form, DIRECTION);
      const pressed = itemIn(frames[at]!, SIGNALS)!;
      expect(
        Math.abs(pressed.o - was.o),
        `the frame it was pressed in: its opacity ${was.o} to ${pressed.o}`,
      ).toBeLessThan(0.0125 * dt + 0.02);
      expect(
        Math.abs(pressed.tx - was.tx),
        `the frame it was pressed in: its slide ${was.tx} to ${pressed.tx}`,
      ).toBeLessThan(0.3 * dt + 0.5);
      expectNoJumps(frames);
    });

    test('the progress reads "Question 2 of 3" on step 2, its digit rolling there', async ({
      page,
    }) => {
      await pick(page, form, 'Approval checkpoints');
      await settle(page, form);
      const frames = await record(page, form, { active: SIGNALS }, () =>
        press(page, form, 'next'),
      );
      expect(frames[0]!.progress!.text).toBe('Question 1 of 3');
      const rolls = frames.map((f) => f.progress!.rolls[0]!);
      expect(
        rolls.filter((r) => r > 1.05 && r < 1.95).length,
        'frames rolling from 1 to 2',
      ).toBeGreaterThanOrEqual(2);
      expectMonotonic(rolls, 1, 'the digit');
      for (const f of frames)
        expect(f.progress!.rolls[1], 'the total stays').toBe(3);
      expectRollPainted(frames, 0, '1', '2');
      await settle(page, form);
      expect((await drawnNow(page, form)).progress).toMatchObject({
        text: 'Question 2 of 3',
        valuetext: 'Question 2 of 3',
        rolls: [2, 3],
      });
      await expect(page.locator(form).getByRole('progressbar')).toHaveAttribute(
        'aria-valuenow',
        '2',
      );
    });

    test("choosing an answer: its dot pops in on spring.bounce, the indicator's colors change on transition.color; the dot left springs back out, held shown", async ({
      page,
    }) => {
      const indicator = page
        .locator(form)
        .locator('[data-slot="questionnaire-choice-indicator"]')
        .first();
      expectCssCurve(
        await indicator.evaluate((el) => {
          const style = getComputedStyle(el);
          return {
            duration: style.transitionDuration,
            easing: style.transitionTimingFunction,
          };
        }),
        COLOR,
      );
      const name = 'Approval checkpoints';
      const choice = (f: Frame) => f.choices.find((c) => c.name === name)!;
      const frames = await record(page, form, { checked: name }, () =>
        pick(page, form, name),
      );
      const shown = frames
        .filter((f) => f.t >= 0)
        .map((f) => ({ t: f.t, ...choice(f) }));
      for (const c of shown) expect(c.dot!.display).toBe('block');
      expect(shown[0]!.dot!.scale).toBeLessThan(0.35);
      const peak = Math.max(...shown.map((c) => c.dot!.scale));
      expect(peak).toBeGreaterThan(1 + overshootOf(DOT) * 0.6);
      expect(peak).toBeLessThan(1 + overshootOf(DOT) + 0.02);
      expectSpringPace(
        [
          [frames.filter((f) => f.t < 0).at(-1)!.t, 0] as Sample,
          ...shown.map((c): Sample => [c.t, c.dot!.scale]),
        ],
        DOT,
        { from: 0, to: 1, a: 0.2, b: 0.8 },
      );
      expect(shown.at(-1)!.dot).toEqual({ display: 'block', scale: 1, o: 1 });
      const colors = frames.map((f) => choice(f).bg);
      expect(new Set(colors).size).toBeGreaterThan(3);
      const changed = frames.find((f) => choice(f).bg !== colors[0])!;
      const reached = frames.find((f) => choice(f).bg === colors.at(-1))!;
      expect(reached.t - changed.t).toBeGreaterThan(120);
      expect(reached.t - changed.t).toBeLessThan(COLOR.duration + 80);

      const left = await record(page, form, { unchecked: name }, () =>
        pick(page, form, 'Tool call timeline'),
      );
      const going = left
        .filter((f) => f.t >= 0)
        .map((f) => ({ t: f.t, ...choice(f) }));
      const out = going.filter((c) => c.dot!.display === 'block');
      expect(out.length, 'held shown as it goes').toBeGreaterThan(3);
      expect(out.some((c) => c.dot!.scale > 0.1 && c.dot!.scale < 0.9)).toBe(
        true,
      );
      expect(Math.min(...out.map((c) => c.dot!.scale))).toBeLessThan(-0.05);
      const hiddenAt = going.findIndex((c) => c.dot!.display === 'none');
      expect(hiddenAt, 'hidden once it has gone').toBeGreaterThan(0);
      for (const c of going.slice(hiddenAt))
        expect(c.dot!.display).toBe('none');
    });

    test('a multiple-choice answer: its check draws after 200ms in 300ms; unchecked, it erases at once, held shown until erased', async ({
      page,
    }) => {
      await toSignals(page);
      const name = 'Risks';
      const choice = (f: Frame) => f.choices.find((c) => c.name === name)!;
      const frames = await record(page, form, { checked: name }, () =>
        pick(page, form, name),
      );
      const drawn = frames
        .filter((f) => f.t >= 0)
        .map((f) => ({ t: f.t, ...choice(f).check! }));
      for (const c of drawn) expect(c.display).toBe('block');
      for (const c of drawn.filter((c) => c.t < CHECK_DELAY - 25))
        expect(c.o, `${Math.round(c.t)}ms`).toBeLessThan(0.02);
      const drawing = drawn.filter((c) => c.dash > 0.05 && c.dash < 0.95);
      expect(drawing.length).toBeGreaterThanOrEqual(2);
      for (const c of drawing)
        expect(Math.abs(c.dash - c.o), `${Math.round(c.t)}ms`).toBeLessThan(
          0.05,
        );
      expectCurvePace(
        drawn.map((c): Sample => [c.t, c.o]),
        CHECK,
        { from: 0, to: 1, a: 0.2, b: 0.8 },
      );
      expect(drawn.at(-1)).toMatchObject({ display: 'block', o: 1, dash: 1 });

      const erased = await record(page, form, { unchecked: name }, () =>
        pick(page, form, name),
      );
      const going = erased
        .filter((f) => f.t >= 0)
        .map((f) => ({ t: f.t, ...choice(f).check! }));
      const shown = going.filter((c) => c.display === 'block');
      expect(shown.length).toBeGreaterThan(3);
      expect(shown.some((c) => c.dash > 0.1 && c.dash < 0.9)).toBe(true);
      expectMonotonic(
        shown.map((c) => c.dash),
        -1,
        'its stroke',
      );
      expectCurvePace(
        [
          [erased.filter((f) => f.t < 0).at(-1)!.t, 1] as Sample,
          ...shown.map((c): Sample => [c.t, c.dash]),
        ],
        CHECK,
        { from: 1, to: 0, a: 0.8, b: 0.2 },
      );
      const hiddenAt = going.findIndex((c) => c.display === 'none');
      expect(hiddenAt, 'hidden once erased').toBeGreaterThan(0);
      expect(going[hiddenAt - 1]!.dash).toBeLessThan(0.1);
      for (const c of going.slice(hiddenAt)) expect(c.display).toBe('none');
    });

    test('Next without an answer on step 2: the error unfolds on transition.disclosure, the question growing with it; answering folds it back', async ({
      page,
    }) => {
      await toSignals(page);
      await page.waitForTimeout(1000);
      const before = itemIn(await drawnNow(page, form), SIGNALS)!.h;
      const frames = await record(page, form, { invalid: SIGNALS }, () =>
        press(page, form, 'next'),
      );
      const error = (f: Frame) => f.errors.find((e) => e.legend === SIGNALS)!;
      const unfolding = frames
        .filter((f) => f.t >= 0)
        .map((f) => ({ t: f.t, ...error(f) }));
      const open = unfolding.at(-1)!;
      expect(open).toMatchObject({
        displayed: true,
        o: 1,
        blur: 0,
        text: 'Choose an answer or skip this question.',
      });
      expect(open.h).toBeGreaterThan(10);
      const gap = await page
        .locator(form)
        .locator('fieldset[data-active]')
        .evaluate((el) => parseFloat(getComputedStyle(el).rowGap));
      expect(gap).toBeGreaterThan(0);
      const animation = firstAnimation(frames, error, 'height');
      expectTiming(animation, DISCLOSURE);
      expect(animation!.keyframes[0]).toMatchObject({
        height: '0px',
        opacity: '0',
        filter: `blur(${ERROR_BLUR}px)`,
      });
      expect(pxOf(animation!.keyframes[0]!.marginTop)).toBe(-gap);
      expect(pxOf(animation!.keyframes.at(-1)!.height)).toBeCloseTo(open.h, 1);
      expect(pxOf(animation!.keyframes.at(-1)!.marginTop)).toBe(open.mt);
      for (const e of unfolding) {
        const p = e.h / open.h;
        const when = `${Math.round(e.t)}ms`;
        expect(Math.abs(e.o - p), when).toBeLessThan(0.02);
        expect(
          Math.abs(e.mt - (-gap + (open.mt + gap) * p)),
          when,
        ).toBeLessThan(0.5);
        expect(Math.abs(e.blur - ERROR_BLUR * (1 - p)), when).toBeLessThan(
          0.05,
        );
      }
      expectOnCurve(
        unfolding.map((e) => ({
          time: animating(e.animations, 'height')?.currentTime ?? null,
          value: e.o,
        })),
        DISCLOSURE,
        0,
        1,
      );
      expectCurvePace(
        unfolding.map((e): Sample => [e.t, e.o]),
        DISCLOSURE,
        { from: 0, to: 1, a: 0.2, b: 0.8 },
      );
      expectErrorShows(frames, SIGNALS);
      const heights = frames.map((f) => itemIn(f, SIGNALS)!.h);
      expect(Math.abs(heights[0]! - before)).toBeLessThan(0.01);
      expectMonotonic(heights, 1, "the question's height");
      const grows = gap + open.mt + open.h;
      const fastest = (grows * steepestOf(DISCLOSURE)) / DISCLOSURE.duration;
      for (let i = 1; i < frames.length; i++)
        expect(
          heights[i]! - heights[i - 1]!,
          `${Math.round(frames[i]!.t)}ms`,
        ).toBeLessThanOrEqual(
          fastest * (frames[i]!.t - frames[i - 1]!.t) * 1.2 + 0.5,
        );
      expect(heights.at(-1)! - before).toBeCloseTo(grows, 1);

      const folding = await record(page, form, { valid: SIGNALS }, () =>
        pick(page, form, 'Decisions'),
      );
      const going = folding
        .filter((f) => f.t >= 0)
        .map((f) => ({ t: f.t, ...error(f) }));
      const shown = going.filter((e) => e.displayed);
      expect(shown.length).toBeGreaterThan(3);
      const fold = firstAnimation(folding, error, 'height');
      expectTiming(fold, DISCLOSURE);
      expect(fold!.keyframes.at(-1)).toMatchObject({
        height: '0px',
        opacity: '0',
        filter: `blur(${ERROR_BLUR}px)`,
      });
      expectMonotonic(
        shown.map((e) => e.h),
        -1,
        'its height',
      );
      expectMonotonic(
        shown.map((e) => e.o),
        -1,
        'its opacity',
      );
      expect(going.at(-1)!.displayed).toBe(false);
      const back = folding.map((f) => itemIn(f, SIGNALS)!.h);
      expectMonotonic(back, -1, "the question's height");
      expect(back.at(-1)).toBeCloseTo(before, 1);
    });

    test('an error showing as soon as the question has arrived unfolds the same: the question grows with it, never cutting it', async ({
      page,
    }) => {
      await pick(page, form, 'Approval checkpoints');
      await settle(page, form);
      const frames = await record(
        page,
        form,
        { invalid: SIGNALS },
        async () => {
          await press(page, form, 'next');
          await pressWhen(page, form, restingOn(SIGNALS), 'next');
        },
        700,
      );
      expect(await pressedAt(page), 'Next pressed again').toBeGreaterThan(0);
      expectErrorShows(frames, SIGNALS);
      const heights = itemFrames(frames, SIGNALS).map((p) => p.h);
      expect(heights.length).toBeGreaterThan(10);
      expectMonotonic(heights, 1, "the question's height");
    });

    test('Next pressed again on the way, without an answer: the error unfolds as the question comes in, never cut', async ({
      page,
    }) => {
      await pick(page, form, 'Approval checkpoints');
      await settle(page, form);
      const frames = await record(
        page,
        form,
        { invalid: SIGNALS },
        async () => {
          await press(page, form, 'next');
          await pressWhen(
            page,
            form,
            `(d) => d.items.some((i) => i.legend === ${JSON.stringify(SIGNALS)} && i.o > 0.3)`,
            'next',
          );
        },
        900,
      );
      expect(await pressedAt(page), 'Next pressed again').toBeGreaterThan(0);
      expectErrorShows(frames, SIGNALS, { exact: false });
      const end = frames.at(-1)!;
      const [item, error] = [
        itemIn(end, SIGNALS)!,
        end.errors.find((e) => e.legend === SIGNALS)!,
      ];
      expect(item.y + item.h).toBeCloseTo(error.y + error.h, 1);
    });

    test("Next pressed again the frame the next question shows, without an answer: its height holds on that frame (the leaving one's), then follows its error, never dropping", async ({
      page,
    }) => {
      await pick(page, form, 'Approval checkpoints');
      await settle(page, form);
      const before = itemIn(await drawnNow(page, form), DIRECTION)!.h;
      const frames = await record(
        page,
        form,
        { invalid: SIGNALS },
        async () => {
          await press(page, form, 'next');
          await pressWhen(
            page,
            form,
            `(d) => d.items.some((i) => i.legend === ${JSON.stringify(SIGNALS)} && i.active)`,
            'next',
          );
        },
        900,
      );
      const at = await pressedAt(page);
      expect(at, 'Next pressed again').toBeGreaterThan(0);
      expect(frames[at]!.t, 'drawn first after the press').toBe(0);
      const height = (f: Frame) => inFlow(f)[0]!.h;
      expect(height(frames[at - 1]!)).toBeCloseTo(before, 2);
      expect(
        Math.abs(height(frames[at]!) - height(frames[at - 1]!)),
        `the frame Next was pressed in: ${height(frames[at - 1]!)}px to ${height(frames[at]!)}px`,
      ).toBeLessThan(1);
      expect(
        Math.abs(frames[at]!.below!.y - frames[at - 1]!.below!.y),
        "what's below, the frame Next was pressed in",
      ).toBeLessThan(1);
      expectSteadyHeight(frames);
      expectErrorShows(frames, SIGNALS, { exact: false });
    });

    test('the error answered as it unfolds, the step still settling: the question goes on from its height, never jumping as an earlier glide ends', async ({
      page,
    }) => {
      await pick(page, form, 'Approval checkpoints');
      await settle(page, form);
      const frames = await record(
        page,
        form,
        { active: SIGNALS },
        async () => {
          await press(page, form, 'next');
          await pressWhen(
            page,
            form,
            `(d) => d.items.some((i) => i.legend === ${JSON.stringify(DIRECTION)} && i.position === 'absolute' && i.o > 0.3 && i.o < 0.7)`,
            'next',
          );
          await pickWhen(
            page,
            form,
            `(d) => d.errors.some((e) => e.legend === ${JSON.stringify(SIGNALS)} && e.invalid && e.o > 0.3 && e.o < 0.8)`,
            'Decisions',
          );
        },
        1200,
      );
      expect(await pressedAt(page), 'answered').toBeGreaterThan(0);
      const error = (f: Drawn) => f.errors.find((e) => e.legend === SIGNALS)!;
      expect(
        frames.some((f) => error(f).invalid),
        'the error showed',
      ).toBe(true);
      expectSteadyHeight(frames);
      await settle(page, form);
      const end = await drawnNow(page, form);
      expect(error(end).displayed).toBe(false);
      expect(itemIn(frames.at(-1)!, SIGNALS)!.h).toBeCloseTo(
        itemIn(end, SIGNALS)!.h,
        1,
      );
    });

    test('an error answered as it unfolds folds back from where it is: its height, margin and opacity only ever go down', async ({
      page,
    }) => {
      await toSignals(page);
      await page.waitForTimeout(1000);
      const frames = await record(
        page,
        form,
        { invalid: SIGNALS },
        async () => {
          await press(page, form, 'next');
          await pickWhen(
            page,
            form,
            `(d) => d.errors.some((e) => e.legend === ${JSON.stringify(SIGNALS)} && e.invalid && e.o > 0.3 && e.o < 0.7)`,
            'Decisions',
          );
        },
        800,
      );
      const at = await pressedAt(page);
      expect(at, 'answered').toBeGreaterThan(0);
      const error = (f: Frame) => f.errors.find((e) => e.legend === SIGNALS)!;
      const was = error(frames[at - 1]!);
      const now = error(frames[at]!);
      expect(was.invalid).toBe(true);
      expect(now.invalid).toBe(false);
      const fold = animating(now.animations, 'height')!;
      expectTiming(fold, DISCLOSURE);
      const first = fold.keyframes[0]!;
      const room = was.h / Math.max(was.o, 0.01);
      const frame =
        ((room * steepestOf(DISCLOSURE)) / DISCLOSURE.duration) *
          (frames[at]!.t - frames[at - 1]!.t) *
          1.2 +
        0.5;
      expect(
        Math.abs(pxOf(first.height) - was.h),
        `it folds from ${first.height}, drawn at ${was.h}px`,
      ).toBeLessThan(frame);
      expect(Math.abs(Number(first.opacity) - was.o)).toBeLessThan(0.2);
      const going = frames
        .slice(at)
        .map(error)
        .filter((e) => e.displayed);
      expect(going.length).toBeGreaterThan(3);
      expectMonotonic(
        going.map((e) => e.h),
        -1,
        'its height',
      );
      expectMonotonic(
        going.map((e) => e.mt),
        -1,
        'its margin',
      );
      expectMonotonic(
        going.map((e) => e.o),
        -1,
        'its opacity',
      );
      expectMonotonic(
        frames.slice(at).map((f) => f.below!.y),
        -1,
        "what's below",
      );
      expect(error(frames.at(-1)!).displayed).toBe(false);
    });

    test('an error shown again as it folds unfolds from where it is: its height, margin and opacity only ever go up', async ({
      page,
    }) => {
      await toSignals(page);
      await press(page, form, 'next');
      await settle(page, form);
      const error = (f: Drawn) => f.errors.find((e) => e.legend === SIGNALS)!;
      const open = error(await drawnNow(page, form));
      expect(open).toMatchObject({ displayed: true, invalid: true, o: 1 });
      const frames = await record(
        page,
        form,
        { valid: SIGNALS },
        async () => {
          await pick(page, form, 'Decisions');
          await pickWhen(
            page,
            form,
            `(d) => d.errors.some((e) => e.legend === ${JSON.stringify(SIGNALS)} && !e.invalid && e.o > 0.25 && e.o < 0.7)`,
            'Decisions',
          );
        },
        800,
      );
      const at = await pressedAt(page);
      expect(at, 'unanswered again').toBeGreaterThan(0);
      const was = error(frames[at - 1]!);
      const now = error(frames[at]!);
      expect(was).toMatchObject({ invalid: false, displayed: true });
      expect(now.invalid).toBe(true);
      const unfold = animating(now.animations, 'height')!;
      expectTiming(unfold, DISCLOSURE);
      const first = unfold.keyframes[0]!;
      const frame =
        ((open.h * steepestOf(DISCLOSURE)) / DISCLOSURE.duration) *
          (frames[at]!.t - frames[at - 1]!.t) *
          1.2 +
        0.5;
      expect(
        Math.abs(pxOf(first.height) - was.h),
        `it unfolds from ${first.height}, drawn at ${was.h}px`,
      ).toBeLessThan(frame);
      expect(Math.abs(Number(first.opacity) - was.o)).toBeLessThan(0.2);
      const coming = frames.slice(at).map(error);
      for (const e of coming) expect(e.displayed).toBe(true);
      expectMonotonic(
        coming.map((e) => e.h),
        1,
        'its height',
      );
      expectMonotonic(
        coming.map((e) => e.mt),
        1,
        'its margin',
      );
      expectMonotonic(
        coming.map((e) => e.o),
        1,
        'its opacity',
      );
      expectMonotonic(
        frames.slice(at).map((f) => f.below!.y),
        1,
        "what's below",
      );
      expect(coming.at(-1)).toMatchObject({ o: 1, blur: 0 });
      expect(coming.at(-1)!.h).toBeCloseTo(open.h, 1);
    });

    test('Skip while the error shows: the question leaves with its error as it was, folding it; what is below holds until the question has gone', async ({
      page,
    }) => {
      await toSignals(page);
      await press(page, form, 'next');
      await settle(page, form);
      const error = (f: Drawn) => f.errors.find((e) => e.legend === SIGNALS)!;
      const open = error(await drawnNow(page, form));
      expect(open).toMatchObject({ displayed: true, invalid: true, o: 1 });
      const frames = await record(page, form, { active: TIMING }, () =>
        press(page, form, 'skip'),
      );
      const rest = frames.filter((f) => f.t < 0).at(-1)!;
      const leaving = frames.filter((f) => f.t >= 0 && itemIn(f, SIGNALS));
      expect(leaving.length, `${SIGNALS} seen leaving`).toBeGreaterThan(2);
      const fold = firstAnimation(frames, error, 'height');
      expectTiming(fold, DISCLOSURE);
      expect(
        pxOf(fold!.keyframes[0]!.height),
        'it folds from its height',
      ).toBeCloseTo(open.h, 1);
      expect(
        error(leaving[0]!).h,
        'its first frame, the question leaving',
      ).toBeGreaterThan(open.h * 0.6);
      for (const f of leaving)
        expect(error(f).displayed, `${Math.round(f.t)}ms`).toBe(true);
      expectMonotonic(
        leaving.map((f) => error(f).h),
        -1,
        'its height',
      );
      for (const f of leaving)
        expect(
          Math.abs(f.below!.y - rest.below!.y),
          `${Math.round(f.t)}ms: what's below moved from ${rest.below!.y} to ${f.below!.y}`,
        ).toBeLessThan(EXACT);
      await settle(page, form);
      await expectRestingOn(page, form, TIMING);
    });

    test('Skip while the first question still leaves: the third waits for it, never seen with it; the second never shows', async ({
      page,
    }) => {
      await pick(page, form, 'Approval checkpoints');
      await settle(page, form);
      const frames = await record(
        page,
        form,
        { active: TIMING },
        async () => {
          await press(page, form, 'next');
          await pressWhen(
            page,
            form,
            `(d) => d.items.some((i) => i.legend === ${JSON.stringify(DIRECTION)} && i.position === 'absolute' && i.o > 0.3 && i.o < 0.7)`,
            'skip',
          );
        },
        1000,
      );
      const at = await pressedAt(page);
      expect(at, 'Skip pressed').toBeGreaterThan(0);
      const left = itemIn(frames[at - 1]!, DIRECTION)!;
      const enter = animating(
        itemIn(frames[at]!, TIMING)!.animations,
        'opacity',
      )!;
      expect(enter.easing).toBe(easingOf(STEP_IN));
      const remaining =
        STEP_OUT.duration -
        (animating(left.animations, 'opacity')?.currentTime ?? 0);
      expect(
        enter.delay,
        `its delay (${DIRECTION} had ${remaining}ms left)`,
      ).toBeGreaterThan(remaining - 40);
      expect(enter.delay).toBeLessThanOrEqual(STEP_OUT.duration);
      for (const f of frames) {
        const seen = f.items.filter((i) => i.o > 0.02).map((i) => i.legend);
        expect(
          seen.length,
          `${Math.round(f.t)}ms: ${seen}`,
        ).toBeLessThanOrEqual(1);
        expect(
          itemIn(f, SIGNALS)?.o ?? 0,
          `${Math.round(f.t)}ms: ${SIGNALS}`,
        ).toBeLessThan(0.02);
      }
      expectNoJumps(frames);
      await settle(page, form);
      await expectRestingOn(page, form, TIMING);
    });

    test('the progress changed again as its number rolls: the number coming in goes on from where it is', async ({
      page,
    }) => {
      await pick(page, form, 'Approval checkpoints');
      await settle(page, form);
      const frames = await record(
        page,
        form,
        { active: TIMING },
        async () => {
          await press(page, form, 'next');
          await pressWhen(
            page,
            form,
            `(d) => d.progress.rolls[0] > 1.3 && d.progress.rolls[0] < 1.7`,
            'skip',
          );
        },
        1000,
      );
      const at = await pressedAt(page);
      expect(at, 'Skip pressed').toBeGreaterThan(0);
      const number = (f: Frame) => f.progress!.numbers[0]!;
      const was = number(frames[at - 1]!);
      const now = number(frames[at]!);
      expect(was).toMatchObject({ from: '1', to: '2' });
      expect(now).toMatchObject({ from: '2', to: '3' });
      expect(was.after!.value).toBe('2');
      expect(now.before!.value).toBe('2');
      const dt = frames[at]!.t - frames[at - 1]!.t;
      expect(
        Math.abs(now.before!.o - was.after!.o),
        `"2" from ${was.after!.o} to ${now.before!.o}`,
      ).toBeLessThan(0.0065 * dt + 0.05);
      expect(
        Math.abs(now.before!.ty - was.after!.ty),
        `"2" moved from ${was.after!.ty}px to ${now.before!.ty}px`,
      ).toBeLessThan(0.05 * dt + 0.3);
      expect(
        Math.abs(now.before!.blur - was.after!.blur),
        `"2" blurred from ${was.after!.blur}px to ${now.before!.blur}px`,
      ).toBeLessThan(0.02 * dt + 0.1);
      const rolling = frames
        .slice(at)
        .map(number)
        .filter((n) => n.from === '2');
      expectMonotonic(
        rolling.map((n) => n.before!.o),
        -1,
        '"2" fading out',
      );
      expectMonotonic(
        rolling.map((n) => n.after!.o),
        1,
        '"3" fading in',
      );
      await settle(page, form);
      expect((await drawnNow(page, form)).progress!.text).toBe(
        'Question 3 of 3',
      );
    });

    test('the progress reads as its own text while its numbers roll, never the numbers drawn on the way', async ({
      page,
    }) => {
      await pick(page, form, 'Approval checkpoints');
      await settle(page, form);
      await expectRollReadAs(
        page,
        form,
        () => press(page, form, 'next'),
        () => press(page, form, 'previous'),
      );
    });

    test('step 2: Previous and Skip come in from scale.action out of blur.icon on transition.swap; Next stays', async ({
      page,
    }) => {
      await pick(page, form, 'Approval checkpoints');
      await settle(page, form);
      const frames = await record(page, form, { active: SIGNALS }, () =>
        press(page, form, 'next'),
      );
      for (const slot of ['previous', 'skip']) {
        const coming = frames
          .filter((f) => f.t >= 0)
          .map((f) => ({ t: f.t, ...actionIn(f, slot) }));
        for (const a of coming) expect(a.displayed, slot).toBe(true);
        const animation = firstAnimation(
          frames,
          (f) => actionIn(f, slot),
          'opacity',
        );
        expectTiming(animation, SWAP);
        expect(animation!.keyframes[0]).toMatchObject({
          opacity: '0',
          scale: String(ACTION_SCALE),
          filter: `blur(${ACTION_BLUR}px)`,
        });
        expect(animation!.keyframes.at(-1)).toMatchObject({
          opacity: '1',
          scale: '1',
          filter: 'blur(0px)',
        });
        for (const a of coming) {
          const when = `${slot} ${Math.round(a.t)}ms`;
          expect(
            Math.abs(a.scale - (ACTION_SCALE + (1 - ACTION_SCALE) * a.o)),
            when,
          ).toBeLessThan(0.002);
          expect(Math.abs(a.blur - ACTION_BLUR * (1 - a.o)), when).toBeLessThan(
            0.02,
          );
        }
        expectOnCurve(
          coming.map((a) => ({
            time: animating(a.animations, 'opacity')?.currentTime ?? null,
            value: a.o,
          })),
          SWAP,
          0,
          1,
        );
        expectMonotonic(
          coming.map((a) => a.o),
          1,
          slot,
        );
        expect(coming.at(-1)).toMatchObject({ o: 1, scale: 1, blur: 0 });
        expect(coming.at(-1)!.animations).toEqual([]);
      }
      for (const f of frames)
        expect(actionIn(f, 'next')).toMatchObject({
          displayed: true,
          o: 1,
          scale: 1,
          blur: 0,
        });
    });

    test('the last step: Next gives way to Submit, both on screen through the swap, then Next hidden; Skip goes', async ({
      page,
    }) => {
      await toSignals(page);
      const frames = await record(page, form, { active: TIMING }, () =>
        press(page, form, 'skip'),
      );
      const after = frames.filter((f) => f.t >= 0);
      const both = after.filter(
        (f) => actionIn(f, 'next').displayed && actionIn(f, 'submit').displayed,
      );
      expect(both.length, 'frames with both').toBeGreaterThanOrEqual(2);
      for (const f of both) {
        const [next, submit] = [actionIn(f, 'next'), actionIn(f, 'submit')];
        expect(
          Math.abs(next.y + next.h / 2 - (submit.y + submit.h / 2)),
        ).toBeLessThan(1);
        expect(
          Math.abs(next.x + next.w - (submit.x + submit.w)),
          'both at the end of the cell',
        ).toBeLessThan(6);
      }
      for (const slot of ['next', 'skip']) {
        const going = after.map((f) => ({ t: f.t, ...actionIn(f, slot) }));
        const shown = going.filter((a) => a.displayed);
        expect(shown.length, `${slot} held shown`).toBeGreaterThanOrEqual(2);
        const animation = firstAnimation(
          frames,
          (f) => actionIn(f, slot),
          'opacity',
        );
        expectTiming(animation, SWAP);
        expect(animation!.keyframes.at(-1)).toMatchObject({
          opacity: '0',
          scale: String(ACTION_SCALE),
          filter: `blur(${ACTION_BLUR}px)`,
        });
        expectMonotonic(
          shown.map((a) => a.o),
          -1,
          slot,
        );
        expect(going.at(-1)).toMatchObject({ displayed: false, hidden: true });
      }
      const submit = after.map((f) => ({ t: f.t, ...actionIn(f, 'submit') }));
      for (const a of submit) expect(a.displayed).toBe(true);
      expectTiming(
        firstAnimation(frames, (f) => actionIn(f, 'submit'), 'opacity'),
        SWAP,
      );
      expectMonotonic(
        submit.map((a) => a.o),
        1,
        'submit',
      );
      expect(submit.at(-1)).toMatchObject({ o: 1, scale: 1, blur: 0 });
      await expect(
        page.locator(form).locator('[data-slot="questionnaire-submit"]'),
      ).toHaveText('Save plan');
    });

    test('the buttons staying or leaving never jump sideways as Next and Submit swap', async ({
      page,
    }) => {
      await toSignals(page);
      await pick(page, form, 'Risks');
      await settle(page, form);
      const centers = (frames: Frame[]) => {
        for (let i = 1; i < frames.length; i++)
          for (const a of frames[i]!.actions) {
            const was = actionIn(frames[i - 1]!, a.slot);
            if (!a.displayed || !was.displayed) continue;
            const [x, from] = [a.x + a.w / 2, was.x + was.w / 2];
            expect(
              Math.abs(x - from),
              `${Math.round(frames[i]!.t)}ms: ${a.slot} (opacity ${a.o}) moved from ${from} to ${x}`,
            ).toBeLessThan(1);
          }
      };
      centers(
        await record(page, form, { active: TIMING }, () =>
          press(page, form, 'next'),
        ),
      );
      await settle(page, form);
      centers(
        await record(page, form, { active: SIGNALS }, () =>
          press(page, form, 'previous'),
        ),
      );
    });

    test("submitting: every answer is the form's, the hidden questions' included", async ({
      page,
    }) => {
      await pick(page, form, 'Approval checkpoints');
      await press(page, form, 'next');
      await pick(page, form, 'Decisions');
      await pick(page, form, 'Risks');
      await press(page, form, 'next');
      await pick(page, form, 'Start now');
      await page
        .locator(form)
        .locator('[data-slot="questionnaire-submit"]')
        .click();
      await expect(
        page.getByText(
          'Direction: approvals · Progress signals: decisions, risks · Timing: now',
        ),
      ).toBeVisible();
    });
  });

  test.describe(`${library} questionnaire demo, on load`, () => {
    test.describe.configure({ timeout: 120_000 });
    test('nothing moves: from its first frame, the first question rests, Next alone', async ({
      page,
    }) => {
      await page.addInitScript(
        ({ read, form }) => {
          const readFn = new Function(`return (${read})`)() as (
            el: Element | null,
          ) => unknown;
          const w = window as unknown as { __load: unknown[] };
          w.__load = [];
          const tick = () => {
            const el = document.querySelector(form);
            if (el) w.__load.push(readFn(el));
            if (w.__load.length < 3600) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        },
        { read: READ, form },
      );
      await gotoQuestionnaire(page, url);
      await page.waitForTimeout(400);
      const load = await page.evaluate(
        () => (window as unknown as { __load: Drawn[] }).__load,
      );
      expect(load.length).toBeGreaterThan(10);
      for (const [i, drawn] of load.entries()) {
        const when = `frame ${i}`;
        expect(drawn.items, when).toHaveLength(1);
        expect(drawn.items[0], when).toMatchObject({
          legend: DIRECTION,
          o: 1,
          blur: 0,
          tx: 0,
          animations: [],
        });
        const shown = drawn.actions.filter((a) => a.displayed);
        expect(
          shown.map((a) => a.slot),
          when,
        ).toEqual(['next']);
        expect(shown[0], when).toMatchObject({
          o: 1,
          scale: 1,
          blur: 0,
          animations: [],
        });
        expect(
          drawn.errors.some((e) => e.displayed),
          when,
        ).toBe(false);
        expect(drawn.progress!.text, when).toBe('Question 1 of 3');
        expect(drawn.progress!.rolls, when).toEqual([1, 3]);
      }
    });
  });

  test.describe(`${library} questionnaire demo, reduced motion`, () => {
    test.describe.configure({ timeout: 120_000 });
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await gotoQuestionnaire(page, url);
    });

    test("a choice pressed doesn't scale", async ({ page }) => {
      const { scales } = await pressChoice(page, form, 'Approval checkpoints');
      expect(new Set(scales)).toEqual(new Set([1]));
    });

    test('the questions still change one after the other, fading only (200ms each), the height jumping once the question leaving has faded out; the buttons fade in place', async ({
      page,
    }) => {
      await pick(page, form, 'Approval checkpoints');
      await settle(page, form);
      const before = itemIn(await drawnNow(page, form), DIRECTION)!.h;
      const frames = await record(page, form, { active: SIGNALS }, () =>
        press(page, form, 'next'),
      );
      const after = itemIn(frames.at(-1)!, SIGNALS)!.h;
      expect(Math.abs(after - before)).toBeGreaterThan(20);
      for (const f of frames)
        for (const i of f.items) {
          const when = `${Math.round(f.t)}ms: ${i.legend}`;
          expect(i.tx, when).toBe(0);
          expect(i.blur, when).toBe(0);
        }
      const jump = firstAnimation(
        frames,
        (f) => itemIn(f, SIGNALS),
        'minHeight',
      );
      expect(jump, 'the height held, then changed').toBeDefined();
      expect(jump!.delay, 'once the question leaving has gone').toBeCloseTo(
        FADE.duration,
        1,
      );
      expect(jump!.duration, 'at once').toBeLessThanOrEqual(1);
      expect(pxOf(jump!.keyframes[0]!.minHeight)).toBeCloseTo(before, 2);
      expect(pxOf(jump!.keyframes.at(-1)!.minHeight)).toBeCloseTo(after, 2);
      const rest = frames.filter((f) => f.t < 0).at(-1)!.below!.y;
      for (const f of frames.filter((f) => f.t >= 0)) {
        const item = itemIn(f, SIGNALS)!;
        const time = animating(item.animations, 'minHeight')?.currentTime;
        const when = `${Math.round(f.t)}ms`;
        if (time !== undefined && time !== null && time < jump!.delay) {
          expect(item.h, `${when}: held`).toBeCloseTo(before, 2);
          expect(f.below!.y, `${when}: what's below`).toBeCloseTo(rest, 2);
        } else if (time === undefined || time === null) {
          expect(item.h, `${when}: its own`).toBeCloseTo(after, 2);
        }
        if (Math.abs(f.below!.y - rest) > 0.05)
          expect(
            itemIn(f, DIRECTION)?.o ?? 0,
            `${when}: ${DIRECTION} still seen as what's below moves`,
          ).toBeLessThan(0.02);
      }
      expect(
        frames.filter(
          (f) =>
            f.t >= 0 &&
            (itemIn(f, DIRECTION)?.o ?? 0) > 0.05 &&
            Math.abs(f.below!.y - rest) <= 0.05,
        ).length,
        'frames held while the question leaving fades out',
      ).toBeGreaterThan(2);
      const exit = firstAnimation(
        frames,
        (f) => itemIn(f, DIRECTION),
        'opacity',
      );
      expectTiming(exit, FADE);
      expect(exit!.properties).toEqual(['opacity']);
      const enter = firstAnimation(
        frames,
        (f) => itemIn(f, SIGNALS),
        'opacity',
      );
      expectTiming(enter, FADE, FADE.duration);
      expect(enter!.properties).toEqual(['opacity']);
      const leaving = itemFrames(frames, DIRECTION);
      const coming = itemFrames(frames, SIGNALS);
      expect(leaving.some((p) => p.o > 0.05 && p.o < 0.95)).toBe(true);
      expect(coming.some((p) => p.o > 0.05 && p.o < 0.95)).toBe(true);
      expectMonotonic(
        leaving.map((p) => p.o),
        -1,
        'out',
      );
      expectMonotonic(
        coming.map((p) => p.o),
        1,
        'in',
      );
      for (const f of frames) {
        const [a, b] = [itemIn(f, DIRECTION), itemIn(f, SIGNALS)];
        if (a && b) expect(Math.min(a.o, b.o)).toBeLessThan(0.02);
        expect(inFlow(f)).toHaveLength(1);
      }
      for (const f of frames.filter((f) => f.t >= 0))
        for (const slot of ['previous', 'skip'])
          expect(actionIn(f, slot)).toMatchObject({ scale: 1, blur: 0 });
      expect(
        frames.some(
          (f) =>
            actionIn(f, 'previous').o > 0.05 &&
            actionIn(f, 'previous').o < 0.95,
        ),
      ).toBe(true);
      expectTiming(
        firstAnimation(frames, (f) => actionIn(f, 'previous'), 'opacity'),
        FADE,
      );
      await settle(page, form);
      await expectRestingOn(page, form, SIGNALS);
    });

    test('an error fades in place, the question taking its height at once; a dot fades without popping', async ({
      page,
    }) => {
      await toSignals(page);
      const before = itemIn(await drawnNow(page, form), SIGNALS)!.h;
      const frames = await record(page, form, { invalid: SIGNALS }, () =>
        press(page, form, 'next'),
      );
      const error = (f: Frame) => f.errors.find((e) => e.legend === SIGNALS)!;
      const shown = frames.filter((f) => f.t >= 0).map(error);
      const full = shown.at(-1)!;
      expect(full.h).toBeGreaterThan(10);
      for (const e of shown) {
        expect(e.h).toBeCloseTo(full.h, 2);
        expect(e.mt).toBe(full.mt);
        expect(e.blur).toBe(0);
      }
      expect(shown.some((e) => e.o > 0.05 && e.o < 0.95)).toBe(true);
      expectTiming(firstAnimation(frames, error, 'opacity'), FADE);
      const after = itemIn(frames.at(-1)!, SIGNALS)!.h;
      expect(after).toBeGreaterThan(before + 20);
      for (const f of frames.filter((f) => f.t >= 0))
        expect(itemIn(f, SIGNALS)!.h).toBeCloseTo(after, 2);

      await press(page, form, 'previous');
      await settle(page, form);
      const name = 'Sub-agent handoffs';
      const picked = await record(page, form, { checked: name }, () =>
        pick(page, form, name),
      );
      const dots = picked
        .filter((f) => f.t >= 0)
        .map((f) => f.choices.find((c) => c.name === name)!.dot!);
      for (const dot of dots) expect(dot.scale).toBe(1);
      expect(dots.some((dot) => dot.o > 0.05 && dot.o < 0.95)).toBe(true);
    });

    test('an error answered folds back fading in place, its height kept until it has gone', async ({
      page,
    }) => {
      await toSignals(page);
      await press(page, form, 'next');
      await settle(page, form);
      const error = (f: Drawn) => f.errors.find((e) => e.legend === SIGNALS)!;
      const open = error(await drawnNow(page, form));
      expect(open).toMatchObject({ displayed: true, o: 1 });
      const frames = await record(page, form, { valid: SIGNALS }, () =>
        pick(page, form, 'Decisions'),
      );
      const going = frames.filter((f) => f.t >= 0).map(error);
      const shown = going.filter((e) => e.displayed);
      expect(shown.some((e) => e.o > 0.05 && e.o < 0.95)).toBe(true);
      for (const e of shown) {
        expect(e.h).toBeCloseTo(open.h, 2);
        expect(e.mt).toBe(open.mt);
        expect(e.blur).toBe(0);
      }
      expectMonotonic(
        shown.map((e) => e.o),
        -1,
        'its opacity',
      );
      const fold = firstAnimation(frames, error, 'opacity');
      expectTiming(fold, FADE);
      expect(fold!.properties).toEqual(['opacity', 'overflow']);
      expect(going.at(-1)!.displayed).toBe(false);
    });

    test('the last step: Next and Submit swap fading in place, Skip fades out', async ({
      page,
    }) => {
      await toSignals(page);
      const frames = await record(page, form, { active: TIMING }, () =>
        press(page, form, 'skip'),
      );
      for (const f of frames.filter((f) => f.t >= 0))
        for (const slot of ['next', 'submit', 'skip']) {
          const a = actionIn(f, slot);
          if (!a.displayed) continue;
          expect(a, `${Math.round(f.t)}ms: ${slot}`).toMatchObject({
            scale: 1,
            blur: 0,
          });
        }
      for (const slot of ['next', 'submit', 'skip']) {
        const animation = firstAnimation(
          frames,
          (f) => actionIn(f, slot),
          'opacity',
        );
        expectTiming(animation, FADE);
        expect(animation!.properties, slot).toEqual(['opacity']);
        expect(
          frames.some((f) => {
            const a = actionIn(f, slot);
            return a.displayed && a.o > 0.05 && a.o < 0.95;
          }),
          `${slot} seen fading`,
        ).toBe(true);
      }
      expect(actionIn(frames.at(-1)!, 'submit')).toMatchObject({
        displayed: true,
        o: 1,
      });
      expect(actionIn(frames.at(-1)!, 'next').displayed).toBe(false);
    });

    test('the progress numbers crossfade, read as the progress reads (never the numbers drawn on the way)', async ({
      page,
    }) => {
      await pick(page, form, 'Approval checkpoints');
      await settle(page, form);
      const frames = await record(page, form, { active: SIGNALS }, () =>
        press(page, form, 'next'),
      );
      expectRollPainted(frames, 0, '1', '2');
      for (const n of frames.flatMap((f) => f.progress!.numbers))
        for (const p of [n.before, n.after])
          if (p) {
            expect(p.ty, 'no slide').toBe(0);
            expect(p.blur, 'no blur').toBe(0);
          }
      await settle(page, form);
      await expectRollReadAs(
        page,
        form,
        () => press(page, form, 'previous'),
        () => press(page, form, 'next'),
      );
    });
  });
}
