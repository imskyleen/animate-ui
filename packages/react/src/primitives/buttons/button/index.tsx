'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { Slot, type WithAsChild } from '../../slot';
import { SCALE_SPRING, TAP_SCALE } from '../_button';

type ButtonProps = WithAsChild<
  HTMLMotionProps<'button'> & {
    /**
     * Scale while hovered. Animate UI buttons answer the press, not the
     * hover: no hover scale unless you set one.
     * @default 1
     */
    hoverScale?: number;
    /**
     * Scale while pressed.
     * @default 0.97
     */
    tapScale?: number;
  }
>;

function Button(props: ButtonProps) {
  return (
    <ReducedMotionConfig>
      <ButtonContent {...props} />
    </ReducedMotionConfig>
  );
}

function ButtonContent({
  hoverScale = 1,
  tapScale = TAP_SCALE,
  asChild = false,
  transition,
  ...props
}: ButtonProps) {
  const reduce = useShouldReduceMotion();
  const defaultTransition = useTempoTransition(SCALE_SPRING);
  const Component = asChild ? Slot : motion.button;

  return (
    <Component
      data-slot="button"
      whileTap={{ scale: reduce ? 1 : tapScale }}
      whileHover={
        reduce || hoverScale === 1 ? undefined : { scale: hoverScale }
      }
      transition={transition ?? defaultTransition}
      {...props}
    />
  );
}

export { Button, type ButtonProps };
