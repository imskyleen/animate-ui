'use client';

import * as React from 'react';
import {
  MotionConfig,
  MotionConfigContext,
  useReducedMotionConfig,
  type Transition,
} from 'motion/react';

/**
 * Animate UI motion tokens.
 *
 * Single source of truth for curves, durations and springs used by every
 * component. Values follow Emil Kowalski's animation guidelines:
 * strong ease-out for UI, UI motion under 300ms, never scale from 0.
 *
 * Keep in sync with the `cssVars.theme` entries of registry-item.json
 * (Tailwind utilities `ease-out-strong`, `ease-in-out-strong`, `ease-drawer`).
 */

const ease = {
  /** Entering / exiting UI. Starts fast so the response is immediate. */
  out: [0.23, 1, 0.32, 1],
  /** Moving or morphing something already on screen. */
  inOut: [0.77, 0, 0.175, 1],
  /** Drawers and sheets (iOS-like). */
  drawer: [0.32, 0.72, 0, 1],
} as const;

/** Durations in seconds (Motion's unit). */
const duration = {
  press: 0.12,
  tooltip: 0.15,
  dropdown: 0.2,
  modal: 0.3,
  /** Dismissals are the system's response: faster than the entrance. */
  modalExit: 0.2,
} as const;

const spring = {
  /** Default for interruptible, dynamic UI (indicators, toggles, layout). */
  default: { type: 'spring', duration: 0.5, bounce: 0.2 },
  /** No overshoot: crisp controls used many times a day. */
  snappy: { type: 'spring', duration: 0.3, bounce: 0 },
} as const satisfies Record<string, Transition>;

const scale = {
  /** Starting scale for anything that appears. Never 0. */
  enter: 0.96,
  /** Press feedback. */
  press: 0.97,
} as const;

/** Ready-made transitions for the common cases. */
const transition = {
  press: { duration: duration.press, ease: ease.out },
  tooltip: { duration: duration.tooltip, ease: ease.out },
  dropdown: { duration: duration.dropdown, ease: ease.out },
  modal: { duration: duration.modal, ease: ease.out },
  modalExit: { duration: duration.modalExit, ease: ease.out },
  drawer: { duration: 0.5, ease: ease.drawer },
} as const satisfies Record<string, Transition>;

const motionTokens = { ease, duration, spring, scale, transition } as const;

type ReducedMotionConfigProps = { children: React.ReactNode };

/**
 * Makes every `motion` element inside respect the OS "reduce motion" setting:
 * transform, size, position and layout animations jump to their end state,
 * while opacity, color and filter still animate.
 *
 * Wrap each component's motion tree with it so this works without any app
 * setup. An app-level `<MotionConfig reducedMotion="always">` is preserved.
 */
function ReducedMotionConfig({ children }: ReducedMotionConfigProps) {
  const { reducedMotion } = React.use(MotionConfigContext);

  return (
    <MotionConfig
      reducedMotion={reducedMotion === 'always' ? 'always' : 'user'}
    >
      {children}
    </MotionConfig>
  );
}

/**
 * True when motion should be reduced. Call it inside `ReducedMotionConfig`.
 *
 * Motion's reduced-motion setting only skips individual transform props
 * (`x`, `scale`…), not a `transform` string. Components animate `transform`
 * strings (hardware accelerated), so they neutralize them with this:
 * `const enter = reduce ? 1 : scale.enter`.
 */
const useShouldReduceMotion = useReducedMotionConfig;

export {
  motionTokens,
  ease,
  duration,
  spring,
  scale,
  transition,
  ReducedMotionConfig,
  useShouldReduceMotion,
  type ReducedMotionConfigProps,
};
