'use client';

import * as React from 'react';
import {
  MotionConfig,
  MotionConfigContext,
  type Transition,
} from 'motion/react';

/**
 * Animate UI motion tokens.
 *
 * Single source of truth for curves, durations and springs used by every
 * primitive. Entrances and state changes take 600ms on a strong ease-out
 * (most of the movement happens in the first ~150ms), exits 400ms, press
 * feedback 150ms. Never scale from 0.
 *
 * Primitives read them with `useMotionTokens()`, so an optional
 * `<AnimateUIProvider tempo={…}>` can change the pace of the whole app.
 * Without a provider, the defaults below apply.
 */

const ease = {
  /** Entering / exiting UI. Starts fast so the response is immediate. */
  out: [0.23, 1, 0.32, 1],
  /** Moving or morphing something already on screen. */
  inOut: [0.77, 0, 0.175, 1],
  /** Drawers and sheets (iOS-like). */
  drawer: [0.32, 0.72, 0, 1],
} as const;

const scale = {
  /** Starting scale for anything that appears. Never 0. */
  enter: 0.95,
  /** Press feedback. */
  press: 0.96,
} as const;

/**
 * Builds the tokens for a pace. `tempo` multiplies every duration and spring:
 * 1 is the default, 0.8 feels crisper, 1.2 more relaxed.
 */
function createMotionTokens(tempo = 1) {
  const t = (seconds: number) => seconds * tempo;

  /** Durations in seconds (Motion's unit). */
  const duration = {
    press: t(0.15),
    /** Any other state change: checkmarks, swapped icons, labels. */
    change: t(0.6),
    tooltip: t(0.6),
    /** Popovers, menus, selects, hover cards. */
    dropdown: t(0.6),
    /** Closing tooltips, popovers and menus: faster than their entrance. */
    exit: t(0.4),
    /** Swapping content in place (tab panels). */
    fade: t(0.6),
    /** Accordion and collapsible height. */
    disclosure: t(0.6),
    modal: t(0.6),
    /** Dismissals are the system's response: faster than the entrance. */
    modalExit: t(0.4),
    drawer: t(0.6),
    drawerExit: t(0.4),
  };

  const spring = {
    /** Default for interruptible, dynamic UI (cursors, magnetic, follow). */
    default: { type: 'spring', duration: t(0.6), bounce: 0.2 },
    /** Indicators, toggles and highlights: quick with a hint of overshoot. */
    snappy: { type: 'spring', duration: t(0.6), bounce: 0.15 },
  } as const satisfies Record<string, Transition>;

  /** Ready-made transitions for the common cases. */
  const transition = {
    press: { duration: duration.press, ease: ease.out },
    change: { duration: duration.change, ease: ease.out },
    tooltip: { duration: duration.tooltip, ease: ease.out },
    dropdown: { duration: duration.dropdown, ease: ease.out },
    exit: { duration: duration.exit, ease: ease.out },
    /** Swapping content in place (tab panels): a fade, no exit. */
    fade: { duration: duration.fade, ease: ease.out },
    /** Accordion and collapsible height (one of the few layout animations). */
    disclosure: { duration: duration.disclosure, ease: ease.out },
    modal: { duration: duration.modal, ease: ease.out },
    modalExit: { duration: duration.modalExit, ease: ease.out },
    drawer: { duration: duration.drawer, ease: ease.drawer },
    drawerExit: { duration: duration.drawerExit, ease: ease.drawer },
    /** Deliberately no animation (e.g. keyboard-driven changes). */
    instant: { duration: 0 },
  } as const satisfies Record<string, Transition>;

  return { tempo, ease, scale, duration, spring, transition } as const;
}

type MotionTokens = ReturnType<typeof createMotionTokens>;

/** The default tokens (tempo 1). */
const motionTokens: MotionTokens = createMotionTokens();
const { duration, spring, transition } = motionTokens;

const MotionTokensContext = React.createContext<MotionTokens>(motionTokens);

/** The tokens of the closest `AnimateUIProvider`, or the defaults. */
function useMotionTokens(): MotionTokens {
  return React.use(MotionTokensContext);
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
 * True when motion should be reduced. Call it inside `ReducedMotionConfig`.
 *
 * Motion's reduced-motion setting only skips individual transform props
 * (`x`, `scale`…), not a `transform` string. Components animate `transform`
 * strings (hardware accelerated), so they neutralize them with this:
 * `const enter = reduce ? 1 : scale.enter`.
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

  if (reducedMotion === 'always') return true;
  if (reducedMotion === 'never') return false;
  return prefersReduced;
}

export {
  createMotionTokens,
  motionTokens,
  MotionTokensContext,
  useMotionTokens,
  ease,
  duration,
  spring,
  scale,
  transition,
  ReducedMotionConfig,
  useShouldReduceMotion,
  type ReducedMotionConfigProps,
  type MotionTokens,
};
