'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

import {
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
} from '../../../utils/motion';
import { Slot, type WithAsChild } from '../../slot';

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
  hoverScale = 1.02,
  tapScale,
  asChild = false,
  ...props
}: ButtonProps) {
  const tokens = useMotionTokens();
  const reduce = useShouldReduceMotion();
  const press = tokens.transition.press;
  const Component = asChild ? Slot : motion.button;

  return (
    <Component
      data-slot="button"
      whileTap={{
        scale: reduce ? 1 : (tapScale ?? tokens.scale.press),
        transition: press,
      }}
      whileHover={{
        scale: reduce ? 1 : hoverScale,
        transition: press,
      }}
      transition={press}
      {...props}
    />
  );
}

export { Button, type ButtonProps };
