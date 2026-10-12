'use client';

import type { Transition } from 'motion/react';

import {
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';

// Press feedback of the choice controls and toggles (Checkbox, Radio, Toggle,
// Toggle Group item), like the buttons': the control scales to 0.95 while
// pressed (v1's `whileTap`), on Motion's default spring for scale, which v1
// used. Nothing scales on hover: they answer the press, not the pointer
// passing over them.

/** Motion's default transition for `scale` (v1's `whileTap`). */
const PRESS_TRANSITION: Transition = motionTokens.spring.press;

/** v1's `whileTap={{ scale: 0.95 }}`. */
const PRESSED_SCALE = motionTokens.scale.press;

type PressOptions = {
  disabled?: boolean;
  transition?: Transition;
  /** The pressed scale (`scale.press` by default). */
  scale?: number;
};

/**
 * Motion props for a control's root rendered as a motion element (Radix
 * `asChild`, Base UI `render`). None under reduced motion.
 */
function usePressMotion({
  disabled,
  transition,
  scale = PRESSED_SCALE,
}: PressOptions = {}) {
  const reduce = useShouldReduceMotion();
  const spring = useTempoTransition(transition ?? PRESS_TRANSITION);
  if (reduce || disabled) return {};
  // A `transform` string runs on the compositor (WAAPI): a CSS transition on
  // `transform` (shadcn/ui's `transition-all`) can't tween its frames. Motion
  // reads a missing base transform as `none`, which it can only interpolate
  // from `scale(0)`: the resting value is written out.
  return {
    initial: { transform: 'scale(1)' },
    whileTap: { transform: `scale(${scale})` },
    transition: spring,
  };
}

/**
 * Motion props driven by React Aria's `isPressed` render prop (it also covers
 * Space and Enter, and cancelled touches).
 */
function usePressedMotion(
  { isPressed }: { isPressed: boolean },
  { disabled, transition }: PressOptions = {},
) {
  const reduce = useShouldReduceMotion();
  const spring = useTempoTransition(transition ?? PRESS_TRANSITION);
  if (reduce || disabled) return {};
  const scale = isPressed ? PRESSED_SCALE : 1;
  return {
    initial: false as const,
    animate: { transform: `scale(${scale})` },
    transition: spring,
  };
}

export { PRESS_TRANSITION, PRESSED_SCALE, usePressMotion, usePressedMotion };
