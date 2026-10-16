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
    hoverScale?: number;
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
      initial={reduce ? undefined : { transform: 'scale(1)' }}
      whileTap={reduce ? undefined : { transform: `scale(${tapScale})` }}
      whileHover={
        reduce || hoverScale === 1
          ? undefined
          : { transform: `scale(${hoverScale})` }
      }
      transition={transition ?? defaultTransition}
      {...props}
    />
  );
}

export { Button, type ButtonProps };
