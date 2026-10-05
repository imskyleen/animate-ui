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

/**
 * Animate UI motion tokens: one value per motion role, shared by every
 * primitive, so two components that do the same thing move the same way.
 *
 * Springs first: nearly everything moves on a spring (stiffness / damping),
 * which carries its velocity when interrupted and overshoots a little where
 * that makes motion feel alive. Tweens are for fades, menus, disclosure
 * heights and swaps, and pick their curve by what the element does: ease-out
 * to enter or leave, a softer ease-out for large surfaces (a panel unfolding,
 * an overlay dimming the page), ease-in-out to move on screen. Pressables scale on press only; anchored popups grow from their
 * trigger, from farther when they are small; two states swapping in place are
 * bridged with a light blur, and unfolding content clears from one.
 *
 * The tokens are the values at tempo 1. Components pass them through
 * `useTempoTransition` (or read them from `useMotionTokens()`), so an optional
 * `<AnimateUIProvider tempo={…}>` paces the whole app.
 */

/** Curves of the tweens, picked by what the element does. */
const ease = {
  /** Entering or leaving: starts fast, so the interface answers at once. */
  out: [0.23, 1, 0.32, 1],
  /**
   * Large surfaces the eye watches change: a panel unfolding and pushing the
   * page (accordion, collapsible), an overlay dimming it. A softer start than
   * `out`, so the change is seen rather than snapped.
   */
  soft: [0.215, 0.61, 0.355, 1],
  /**
   * A mark drawing itself in a control (a checkbox's check): Motion's own
   * easeOut, v1's, gentle enough for the stroke to be seen being drawn.
   */
  draw: [0, 0, 0.58, 1],
  /** Moving or morphing something already on screen. */
  inOut: [0.77, 0, 0.175, 1],
} as const;

/** Springs, one per role (stiffness / damping, mass 1). */
const spring = {
  /** Press feedback: Motion's own spring for `scale`. */
  press: { type: 'spring', stiffness: 550, damping: 30, restSpeed: 10 },
  /**
   * Tooltips, popovers and hover cards growing from their trigger: there in
   * ~200ms, a little overshoot, settled by ~500ms.
   */
  pop: { type: 'spring', stiffness: 300, damping: 25 },
  /** Dialogs tipping forward: calm, no overshoot. */
  dialog: { type: 'spring', stiffness: 150, damping: 25 },
  /** Sheets, drawers and toasts from an edge: livelier, they travel farther. */
  sheet: { type: 'spring', stiffness: 150, damping: 22 },
  /** A selection sliding between items (tabs, toggle groups). */
  selection: { type: 'spring', stiffness: 200, damping: 25 },
  /** A surface following the pointer: quick, so it never trails behind it. */
  highlight: { type: 'spring', stiffness: 350, damping: 35 },
  /** A height following its content, without overshoot. */
  height: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    bounce: 0,
    restDelta: 0.01,
  },
  /** A switch or slider thumb gliding and stretching. */
  thumb: { type: 'spring', stiffness: 300, damping: 25 },
  /** Small marks popping inside a control (radio dot, OTP characters). */
  bounce: { type: 'spring', stiffness: 200, damping: 16 },
  /** Effects bringing content in (Fade, Slide, Zoom, Blur): playful. */
  entrance: { type: 'spring', stiffness: 200, damping: 20 },
  /** A progress bar and its value. */
  progress: { type: 'spring', stiffness: 100, damping: 30 },
  /** Numbers rolling to their value without overshooting. */
  number: { type: 'spring', stiffness: 90, damping: 50 },
} as const satisfies Record<string, Transition>;

/** Tweens, one per role. */
const transition = {
  /** Menus, selects, comboboxes and navigation menus: short and exact. */
  menu: { duration: 0.2, ease: ease.out },
  /**
   * An overlay or backdrop fading in, the page behind blurring from 0, and
   * out: the page dims smoothly while the content arrives.
   */
  overlay: { duration: 0.4, ease: ease.soft },
  /** Content fading in place, out of the way (a toast behind the front one). */
  fade: { duration: 0.2, ease: ease.out },
  /** Accordion and collapsible panels unfolding, and folding back. */
  disclosure: { duration: 0.35, ease: ease.soft },
  /** A panel coming in from a blur (tab panels). */
  panel: { duration: 0.5, ease: ease.out },
  /**
   * A check drawing itself, once the box has answered the press: v1's delay
   * and curve, drawn a little slower than v1's 0.2s so it's seen.
   */
  check: { duration: 0.3, delay: 0.2, ease: ease.draw },
  /** A check erasing itself, as slowly as it draws. */
  uncheck: { duration: 0.3, ease: ease.draw },
  /** Two icons or labels swapping in place. */
  swap: { duration: 0.2, ease: ease.out },
  /** Deliberately no animation. */
  instant: { duration: 0 },
} as const satisfies Record<string, Transition>;

/** Scales, by role. */
const scale = {
  /** Anything pressed. Nothing scales on hover. */
  press: 0.95,
  /** Where anchored popups grow from: the smaller, the farther. */
  tooltip: 0.7,
  popover: 0.8,
  menu: 0.9,
  /** Dialog content, with `perspective(500px) rotateX(-20deg)`. */
  dialog: 0.8,
  /** An icon swapping for another. */
  icon: 0.5,
} as const;

/** Blurs bridging two states. */
const blur = {
  /** Icons and short labels swapping in place. */
  icon: 'blur(2px)',
  /** The content of an accordion or collapsible panel, as it unfolds. */
  disclosure: 'blur(2px)',
  /** Panels and surfaces coming in: tab panels, dialogs. */
  surface: 'blur(4px)',
} as const;

/**
 * The tokens at a pace: `tempo` multiplies the tweens' durations and delays,
 * and time-scales the springs (see `scaleTransition`). 1 is the default, 0.8
 * feels crisper, 1.2 more relaxed. Curves, scales and blurs don't change.
 */
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
    spring: pace(spring),
    transition: pace(transition),
  } as const;
}

type MotionTokens = ReturnType<typeof createMotionTokens>;

/** The default tokens (tempo 1). */
const motionTokens: MotionTokens = createMotionTokens();

const MotionTokensContext = React.createContext<MotionTokens>(motionTokens);

const TIME_KEYS = ['duration', 'delay', 'repeatDelay', 'delayChildren'];

/**
 * Time-scales a transition by `tempo` (1 = as written): durations and delays
 * are multiplied, and a stiffness/damping spring keeps its exact shape
 * (stiffness / tempo², damping / tempo). Per-value transitions
 * (`{ opacity: {…}, default: {…} }`) are scaled too.
 *
 * Primitives write their transitions literally (the production values) and
 * pass them through this, so `AnimateUIProvider`'s tempo reaches springs too.
 */
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

/** `scaleTransition` with the tempo of the closest `AnimateUIProvider`. */
function useTempoTransition<T extends Transition | undefined>(
  transition: T,
): T {
  const { tempo } = React.use(MotionTokensContext);
  return scaleTransition(transition, tempo);
}

/** The tokens of the closest `AnimateUIProvider`, or the defaults. */
function useMotionTokens(): MotionTokens {
  return React.use(MotionTokensContext);
}

/* CSS timing -------------------------------------------------------------- */

/** A CSS transition timing: duration in milliseconds and timing function. */
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

/**
 * A Motion transition (tempo already applied) as a CSS duration and timing
 * function, for the parts a library drives with CSS transitions (Base UI's
 * Drawer and Toast follow the finger through CSS variables). A spring becomes
 * the `linear()` curve Motion itself hands the browser (same duration, same
 * 10ms resolution), so it moves exactly like Motion's; a tween keeps its
 * `duration` (Motion's default 0.3s) and cubic-bezier or named `ease`
 * (Motion's default easeInOut).
 */
function toCssTiming(motionTransition: Transition): CssTiming {
  const options = motionTransition as Record<string, unknown>;
  const isSpring =
    options.type === 'spring' || SPRING_KEYS.some((key) => key in options);

  if (isSpring) {
    // Motion's spring takes a time-defined `duration` in ms.
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
  /**
   * Remount the children when the reduced-motion preference changes. Use it
   * for animations that play on mount (text entrances, counters): the server
   * render can't know the preference, so without it an entrance started during
   * hydration would keep playing after the preference resolves to "reduce".
   */
  remount?: boolean;
};

/**
 * Makes every `motion` element inside respect the OS "reduce motion" setting:
 * transform, size, position and layout animations jump to their end state,
 * while opacity, color and filter still animate.
 *
 * Wrap each component's motion tree with it so this works without any app
 * setup. An app-level `<MotionConfig reducedMotion="always">` is preserved.
 */
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

/**
 * True when motion should be reduced: an app-level
 * `<MotionConfig reducedMotion="always">`, or else the OS setting. Works with
 * or without `ReducedMotionConfig` around it. Motion's own default
 * (`"never"`) doesn't count, as in `ReducedMotionConfig`: without this,
 * calling it outside one would always return false.
 *
 * Motion's reduced-motion setting only skips individual transform props
 * (`x`, `scale`…), not a `transform` string. Components that animate a
 * `transform` string (hardware accelerated) neutralize it with this:
 * `const pressed = reduce ? 1 : scale.press`.
 *
 * Unlike Motion's `useReducedMotion`, it follows OS setting changes while the
 * component stays mounted.
 */
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
  ease,
  spring,
  transition,
  scale,
  blur,
  ReducedMotionConfig,
  useShouldReduceMotion,
  scaleTransition,
  useTempoTransition,
  toCssTiming,
  type CssTiming,
  type ReducedMotionConfigProps,
  type MotionTokens,
};
