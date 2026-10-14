'use client';

import * as React from 'react';
import { Toggle as TogglePrimitive } from 'radix-ui';
import { motion, type Transition } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import { usePressMotion } from '../../../internal/controls/press';

type RootAnimationProps = {
  transition?: Transition;
};

type ToggleProps = TogglePrimitive.ToggleProps & RootAnimationProps;

function Root(
  props: React.ComponentProps<typeof TogglePrimitive.Root> & RootAnimationProps,
) {
  return (
    <ReducedMotionConfig>
      <AnimatedRoot {...props} />
    </ReducedMotionConfig>
  );
}

function AnimatedRoot({
  transition,
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & RootAnimationProps) {
  const press = usePressMotion({ disabled: props.disabled, transition });
  if (asChild)
    return (
      <TogglePrimitive.Root {...props} asChild>
        {children}
      </TogglePrimitive.Root>
    );

  return (
    <TogglePrimitive.Root {...props} asChild>
      <motion.button {...press}>{children}</motion.button>
    </TogglePrimitive.Root>
  );
}

Root.displayName = 'Toggle';

export { Root, Root as Toggle, type ToggleProps };
