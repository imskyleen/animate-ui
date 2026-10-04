'use client';

import * as React from 'react';
import { Toggle as TogglePrimitive } from 'radix-ui';
import { motion, type Transition } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import { usePressMotion } from '../../../internal/controls/press';

// Same API as Radix's Toggle, animated like Animate UI v1's toggle: it scales
// to 0.95 while pressed. The on/off colours stay the component's CSS.

/** Animate UI's additions to `Toggle.Root`. */
type RootAnimationProps = {
  /**
   * Transition of the press scale. Defaults to a spring (stiffness 550,
   * damping 30).
   */
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
    // Radix's props (className, data-state, aria-pressed, handlers…) land on
    // the motion.button through asChild.
    <TogglePrimitive.Root {...props} asChild>
      <motion.button {...press}>{children}</motion.button>
    </TogglePrimitive.Root>
  );
}

export { Root, Root as Toggle, type ToggleProps };
