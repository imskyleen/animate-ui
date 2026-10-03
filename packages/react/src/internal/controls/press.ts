'use client';

import type { Transition } from 'motion/react';

import { useMotionTokens, useShouldReduceMotion } from '../../utils/motion';

// Press feedback shared by the toggles and choice controls (Checkbox, Radio,
// Switch, Toggle, Toggle Group item): a subtle scale while held.

/**
 * Motion props for a control's root rendered as a motion element (Radix
 * `asChild`, Base UI `render`). Call inside `ReducedMotionConfig`.
 */
function usePressMotion(transition?: Transition) {
  const tokens = useMotionTokens();
  const reduce = useShouldReduceMotion();
  const press = transition ?? tokens.transition.press;

  if (reduce) return {};
  return {
    // Motion reads a missing base transform as `none`, which it can only
    // interpolate from `scale(0)`: give the release an explicit resting value.
    initial: { transform: 'scale(1)' },
    whileTap: { transform: `scale(${tokens.scale.press})`, transition: press },
    transition: press,
  };
}

/**
 * Motion props driven by React Aria's `isPressed` render prop, which also
 * covers keyboard presses (Space / Enter) and cancelled touches.
 */
function usePressedMotion(isPressed: boolean, transition?: Transition) {
  const tokens = useMotionTokens();
  const reduce = useShouldReduceMotion();
  const press = transition ?? tokens.transition.press;

  if (reduce) return {};
  return {
    initial: false as const,
    animate: {
      transform: `scale(${isPressed ? tokens.scale.press : 1})`,
      transition: press,
    },
  };
}

export { usePressMotion, usePressedMotion };
