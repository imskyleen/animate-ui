'use client';

import type { Transition } from 'motion/react';

import { useShouldReduceMotion, useTempoTransition } from '../../utils/motion';

// Press and hover feedback of the choice controls and toggles, as Animate UI
// v1's: the control scales to 0.95 while pressed (`whileTap`: Checkbox,
// Radio, Toggle, Toggle Group item) and to 1.05 while hovered (`whileHover`:
// Checkbox and Radio), on Motion's default spring for scale, which v1 used.

/** Motion's default transition for `scale` (v1's `whileTap`/`whileHover`). */
const PRESS_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 550,
  damping: 30,
  restSpeed: 10,
};

/** v1's `whileTap={{ scale: 0.95 }}`. */
const PRESSED_SCALE = 0.95;
/** v1's `whileHover={{ scale: 1.05 }}`. */
const HOVERED_SCALE = 1.05;

type PressOptions = {
  /** Also scale up while hovered (v1's Checkbox and Radio). */
  hover?: boolean;
  disabled?: boolean;
  transition?: Transition;
};

/**
 * Motion props for a control's root rendered as a motion element (Radix
 * `asChild`, Base UI `render`). None under reduced motion.
 */
function usePressMotion({ hover, disabled, transition }: PressOptions = {}) {
  const reduce = useShouldReduceMotion();
  const spring = useTempoTransition(transition ?? PRESS_TRANSITION);
  if (reduce || disabled) return {};
  // A `transform` string runs on the compositor (WAAPI): a CSS transition on
  // `transform` (shadcn/ui's `transition-all`) can't tween its frames. Motion
  // reads a missing base transform as `none`, which it can only interpolate
  // from `scale(0)`: the resting value is written out.
  return {
    initial: { transform: 'scale(1)' },
    whileTap: { transform: `scale(${PRESSED_SCALE})` },
    ...(hover ? { whileHover: { transform: `scale(${HOVERED_SCALE})` } } : {}),
    transition: spring,
  };
}

/**
 * Motion props driven by React Aria's `isPressed` and `isHovered` render
 * props (`isPressed` also covers Space and Enter, and cancelled touches).
 */
function usePressedMotion(
  { isPressed, isHovered }: { isPressed: boolean; isHovered?: boolean },
  { hover, disabled, transition }: PressOptions = {},
) {
  const reduce = useShouldReduceMotion();
  const spring = useTempoTransition(transition ?? PRESS_TRANSITION);
  if (reduce || disabled) return {};
  const scale = isPressed
    ? PRESSED_SCALE
    : hover && isHovered
      ? HOVERED_SCALE
      : 1;
  return {
    initial: false as const,
    animate: { transform: `scale(${scale})` },
    transition: spring,
  };
}

export {
  PRESS_TRANSITION,
  PRESSED_SCALE,
  HOVERED_SCALE,
  usePressMotion,
  usePressedMotion,
};
