'use client';

import * as React from 'react';
import {
  createGeneratorEasing,
  generateLinearEasing,
  MotionConfig,
  MotionConfigContext,
  spring as springGenerator,
  type Transition,
} from 'motion/react';

const ease = {
  out: [0.23, 1, 0.32, 1],
  soft: [0.215, 0.61, 0.355, 1],
  draw: [0, 0, 0.58, 1],
  inOut: [0.77, 0, 0.175, 1],
  away: [0.33, 0.17, 0.67, 0.5],
  in: [0.4, 0, 1, 1],
  drawer: [0.34, 1.2, 0.64, 1],
  arrive: [0.11, 0, 0.5, 0],
  color: [0.25, 0.1, 0.25, 1],
  leave: [0, 0, 0.58, 1],
  enter: [0.25, 0.1, 0.35, 1],
  resize: [0.4, 0, 0.1, 1],
  fill: [0.4, 0, 0.2, 1],
} as const;

const spring = {
  press: { type: 'spring', stiffness: 550, damping: 30, restSpeed: 10 },
  pop: { type: 'spring', stiffness: 400, damping: 29 },
  tooltip: { type: 'spring', stiffness: 400, damping: 31 },
  dialog: { type: 'spring', stiffness: 150, damping: 25 },
  toast: { type: 'spring', stiffness: 280, damping: 24 },
  selection: { type: 'spring', stiffness: 300, damping: 30 },
  highlight: { type: 'spring', stiffness: 500, damping: 40 },
  reflow: { type: 'spring', stiffness: 500, damping: 40 },
  handoff: { type: 'spring', stiffness: 450, damping: 43 },
  morph: { type: 'spring', stiffness: 660, damping: 52 },
  height: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    bounce: 0,
    restDelta: 0.01,
  },
  slide: { type: 'spring', stiffness: 300, damping: 35, restDelta: 0.01 },
  thumb: { type: 'spring', stiffness: 300, damping: 25 },
  slider: { type: 'spring', stiffness: 400, damping: 32 },
  bounce: { type: 'spring', stiffness: 200, damping: 16 },
  glyph: { type: 'spring', stiffness: 500, damping: 45 },
  checkPop: { type: 'spring', stiffness: 500, damping: 24 },
  entrance: { type: 'spring', stiffness: 200, damping: 20 },
  progress: {
    type: 'spring',
    stiffness: 300,
    damping: 35,
    restDelta: 0.01,
    restSpeed: 0.1,
  },
  number: { type: 'spring', stiffness: 90, damping: 50 },
} as const satisfies Record<string, Transition>;

const transition = {
  menu: { duration: 0.22, ease: ease.soft },
  overlay: { duration: 0.4, ease: ease.soft },
  dialogFade: { duration: 0.4, ease: ease.soft },
  fade: { duration: 0.2, ease: ease.out },
  color: { duration: 0.2, ease: ease.color },
  reveal: { duration: 0.3, ease: ease.out },
  disclosure: { duration: 0.35, ease: ease.soft },
  panelOut: { duration: 0.15, ease: ease.leave },
  panelIn: { duration: 0.3, ease: ease.enter },
  tooltipIn: { duration: 0.34, ease: ease.enter },
  tooltipOut: { duration: 0.13, ease: ease.leave },
  panelHeight: { duration: 0.45, ease: ease.resize },
  check: { duration: 0.3, delay: 0.2, ease: ease.draw },
  uncheck: { duration: 0.3, ease: ease.draw },
  fill: { duration: 0.3, ease: ease.fill },
  popOut: { duration: 0.15, ease: ease.out },
  swap: { duration: 0.15, ease: ease.out },
  spin: { duration: 0.3, ease: ease.out },
  handoffOut: { duration: 0.22, ease: ease.soft },
  handoffIn: { duration: 0.26, ease: ease.arrive },
  dismiss: { duration: 0.2, ease: ease.away },
  shake: { duration: 0.4, ease: ease.inOut },
  drawerOut: { duration: 0.16, ease: ease.in },
  drawer: { duration: 0.4, ease: ease.drawer },
  sheet: { duration: 0.4, ease: ease.soft },
  collapse: { duration: 0.28, ease: ease.inOut },
  collapseLabel: { duration: 0.14, ease: ease.out },
  instant: { duration: 0 },
} as const satisfies Record<string, Transition>;

const scale = {
  press: 0.97,
  choice: 0.985,
  tooltip: 0.7,
  popover: 0.8,
  menu: 0.9,
  dialog: 0.8,
  icon: 0.5,
  toast: 0.96,
  fill: 0.7,
  action: 0.9,
} as const;

const blur = {
  icon: 'blur(2px)',
  tooltip: 'blur(6px)',
  disclosure: 'blur(2px)',
  surface: 'blur(4px)',
  panel: 'blur(5px)',
} as const;

const rotate = {
  icon: 90,
} as const;

const shift = {
  handoff: 6,
  navigation: 24,
  tabs: 12,
  step: 24,
  tooltip: 40,
  shake: 3,
} as const;

const stagger: { readonly stack: number } = {
  stack: 0.03,
};

function createMotionTokens(tempo = 1) {
  const pace = <T extends Record<string, Transition>>(set: T): T =>
    tempo === 1
      ? set
      : (Object.fromEntries(
          Object.entries(set).map(([role, value]) => [
            role,
            scaleTransition(value, tempo),
          ]),
        ) as T);

  return {
    tempo,
    ease,
    scale,
    blur,
    rotate,
    shift,
    stagger:
      tempo === 1
        ? stagger
        : (Object.fromEntries(
            Object.entries(stagger).map(([role, delay]) => [
              role,
              delay * tempo,
            ]),
          ) as typeof stagger),
    spring: pace(spring),
    transition: pace(transition),
  } as const;
}

type MotionTokens = ReturnType<typeof createMotionTokens>;

const motionTokens: MotionTokens = createMotionTokens();

const MotionTokensContext = React.createContext<MotionTokens>(motionTokens);

const TIME_KEYS = ['duration', 'delay', 'repeatDelay', 'delayChildren'];

function scaleTransition<T extends Transition | undefined>(
  transition: T,
  tempo: number,
): T {
  if (!transition || tempo === 1 || typeof transition !== 'object')
    return transition;
  const scaled: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(transition)) {
    if (typeof value === 'number' && TIME_KEYS.includes(key))
      scaled[key] = value * tempo;
    else if (typeof value === 'number' && key === 'stiffness')
      scaled[key] = value / (tempo * tempo);
    else if (typeof value === 'number' && key === 'damping')
      scaled[key] = value / tempo;
    else if (value && typeof value === 'object' && !Array.isArray(value))
      scaled[key] = scaleTransition(value as Transition, tempo);
    else scaled[key] = value;
  }
  return scaled as T;
}

function useTempoTransition<T extends Transition | undefined>(
  transition: T,
): T {
  const { tempo } = React.use(MotionTokensContext);
  return scaleTransition(transition, tempo);
}

function useMotionTokens(): MotionTokens {
  return React.use(MotionTokensContext);
}

type CheckAnimation = 'draw' | 'pop';

const CheckAnimationContext = React.createContext<CheckAnimation>('draw');

function useCheckAnimation(own?: CheckAnimation): CheckAnimation {
  const inherited = React.use(CheckAnimationContext);
  return own ?? inherited;
}

type CssTiming = { duration: number; easing: string };

const CSS_EASINGS: Record<string, string> = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
  easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
  circIn: 'cubic-bezier(0, 0.65, 0.55, 1)',
  circOut: 'cubic-bezier(0.55, 0, 1, 0.45)',
  backIn: 'cubic-bezier(0.31, 0.01, 0.66, -0.59)',
  backOut: 'cubic-bezier(0.33, 1.53, 0.69, 0.99)',
};

const SPRING_KEYS = [
  'stiffness',
  'damping',
  'mass',
  'bounce',
  'visualDuration',
];

function toCssEase(curve: unknown): string {
  if (
    Array.isArray(curve) &&
    curve.length === 4 &&
    curve.every(Number.isFinite)
  )
    return `cubic-bezier(${curve.join(', ')})`;
  if (typeof curve === 'string') return CSS_EASINGS[curve] ?? 'ease';
  return CSS_EASINGS.easeInOut!;
}

function toCssTiming(motionTransition: Transition): CssTiming {
  const options = motionTransition as Record<string, unknown>;
  const isSpring =
    options.type === 'spring' || SPRING_KEYS.some((key) => key in options);

  if (isSpring) {
    const springOptions =
      typeof options.duration === 'number'
        ? { ...options, duration: options.duration * 1000 }
        : options;
    const { duration, ease: curve } = createGeneratorEasing(
      springOptions,
      100,
      springGenerator,
    );
    const ms = Math.round(duration * 1000);
    return { duration: ms, easing: generateLinearEasing(curve, ms) };
  }

  const seconds = typeof options.duration === 'number' ? options.duration : 0.3;
  return {
    duration: Math.round(seconds * 1000),
    easing: toCssEase(options.ease),
  };
}

type ReducedMotionConfigProps = {
  children: React.ReactNode;
  remount?: boolean;
};

function ReducedMotionConfig({ children, remount }: ReducedMotionConfigProps) {
  const { reducedMotion } = React.use(MotionConfigContext);

  return (
    <MotionConfig
      reducedMotion={reducedMotion === 'always' ? 'always' : 'user'}
    >
      {remount ? <RemountOnReduce>{children}</RemountOnReduce> : children}
    </MotionConfig>
  );
}

function RemountOnReduce({ children }: { children: React.ReactNode }) {
  const reduce = useShouldReduceMotion();
  return (
    <React.Fragment key={reduce ? 'reduce' : 'full'}>{children}</React.Fragment>
  );
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToReducedMotion(onChange: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

function useShouldReduceMotion() {
  const { reducedMotion } = React.use(MotionConfigContext);
  const prefersReduced = React.useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );

  return reducedMotion === 'always' || prefersReduced;
}

export {
  createMotionTokens,
  motionTokens,
  MotionTokensContext,
  useMotionTokens,
  CheckAnimationContext,
  useCheckAnimation,
  ease,
  spring,
  transition,
  scale,
  blur,
  rotate,
  shift,
  stagger,
  ReducedMotionConfig,
  useShouldReduceMotion,
  scaleTransition,
  useTempoTransition,
  toCssTiming,
  type CssTiming,
  type ReducedMotionConfigProps,
  type MotionTokens,
  type CheckAnimation,
};
