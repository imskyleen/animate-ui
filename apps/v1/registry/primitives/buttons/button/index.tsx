'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

import {
  scale as motionScale,
  transition as motionTransition,
  useShouldReduceMotion,
} from '@/registry/lib/motion';
import { Slot, type WithAsChild } from '@/registry/primitives/animate/slot';

type ButtonProps = WithAsChild<
  HTMLMotionProps<'button'> & {
    hoverScale?: number;
    tapScale?: number;
  }
>;

function Button({
  hoverScale = 1.02,
  tapScale = motionScale.press,
  asChild = false,
  ...props
}: ButtonProps) {
  const reduce = useShouldReduceMotion();
  const Component = asChild ? Slot : motion.button;

  return (
    <Component
      whileTap={{
        scale: reduce ? 1 : tapScale,
        transition: motionTransition.press,
      }}
      whileHover={{
        scale: reduce ? 1 : hoverScale,
        transition: motionTransition.press,
      }}
      transition={motionTransition.press}
      {...props}
    />
  );
}

export { Button, type ButtonProps };
