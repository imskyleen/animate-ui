'use client';

import type { Transition } from 'motion/react';

import {
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';

const PRESS_TRANSITION: Transition = motionTokens.spring.press;

const PRESSED_SCALE = motionTokens.scale.press;

type PressOptions = {
  disabled?: boolean;
  transition?: Transition;
  scale?: number;
};

function usePressMotion({
  disabled,
  transition,
  scale = PRESSED_SCALE,
}: PressOptions = {}) {
  const reduce = useShouldReduceMotion();
  const spring = useTempoTransition(transition ?? PRESS_TRANSITION);
  if (reduce || disabled) return {};
  return {
    initial: { transform: 'scale(1)' },
    whileTap: { transform: `scale(${scale})` },
    transition: spring,
  };
}

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
