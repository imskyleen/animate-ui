'use client';

import * as React from 'react';
import { Switch as SwitchPrimitive } from 'radix-ui';
import { motion, type Transition } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import { usePressMotion } from '../../../internal/controls/press';
import { mergeRefs } from '../../../internal/controls/indicator';
import {
  useThumbGlide,
  type ThumbAnimationProps,
} from '../../../internal/controls/thumb';

// Same API as Radix's Switch. The Root gives press feedback; the Thumb glides
// to its new side with a spring, through a transform.

/** Animate UI's additions to `Switch.Root`. */
type RootAnimationProps = {
  /** Transition of the press feedback. Defaults to `transition.press` (150ms). */
  transition?: Transition;
};

type SwitchProps = SwitchPrimitive.SwitchProps & RootAnimationProps;
type SwitchThumbProps = SwitchPrimitive.SwitchThumbProps & ThumbAnimationProps;

function Root(
  props: React.ComponentProps<typeof SwitchPrimitive.Root> & RootAnimationProps,
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
}: React.ComponentProps<typeof SwitchPrimitive.Root> & RootAnimationProps) {
  const press = usePressMotion(transition);
  if (asChild)
    return (
      <SwitchPrimitive.Root {...props} asChild>
        {children}
      </SwitchPrimitive.Root>
    );

  return (
    <SwitchPrimitive.Root {...props} asChild>
      <motion.button {...press}>{children}</motion.button>
    </SwitchPrimitive.Root>
  );
}

function Thumb({
  asChild,
  children,
  transition,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Thumb> & ThumbAnimationProps) {
  if (asChild)
    return (
      <SwitchPrimitive.Thumb {...props} asChild>
        {children}
      </SwitchPrimitive.Thumb>
    );

  return (
    <ReducedMotionConfig>
      {/* Radix's props (className, data-state…) land on the span through
          asChild, which re-renders it on every change. */}
      <SwitchPrimitive.Thumb {...props} asChild>
        <GlidingThumb transition={transition}>{children}</GlidingThumb>
      </SwitchPrimitive.Thumb>
    </ReducedMotionConfig>
  );
}

function GlidingThumb({
  transition,
  ref,
  ...props
}: React.ComponentPropsWithRef<'span'> &
  ThumbAnimationProps & { 'data-state'?: string }) {
  const localRef = React.useRef<HTMLSpanElement>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, localRef), [ref]);
  useThumbGlide(() => localRef.current, props['data-state'] === 'checked', {
    transition,
  });
  return <span {...props} ref={mergedRef} />;
}

const createSwitchScope: typeof SwitchPrimitive.createSwitchScope =
  SwitchPrimitive.createSwitchScope;

// Radix's unstable composition API, untouched (a Thumb inside it still
// glides).
const unstable_SwitchProvider = SwitchPrimitive.unstable_SwitchProvider;
const unstable_SwitchTrigger = SwitchPrimitive.unstable_SwitchTrigger;
const unstable_SwitchBubbleInput = SwitchPrimitive.unstable_SwitchBubbleInput;
type unstable_SwitchProviderProps =
  SwitchPrimitive.unstable_SwitchProviderProps;
type unstable_SwitchTriggerProps = SwitchPrimitive.unstable_SwitchTriggerProps;
type unstable_SwitchBubbleInputProps =
  SwitchPrimitive.unstable_SwitchBubbleInputProps;

export {
  Root,
  Thumb,
  Root as Switch,
  Thumb as SwitchThumb,
  createSwitchScope,
  unstable_SwitchProvider,
  unstable_SwitchProvider as unstable_Provider,
  unstable_SwitchTrigger,
  unstable_SwitchTrigger as unstable_Trigger,
  unstable_SwitchBubbleInput,
  unstable_SwitchBubbleInput as unstable_BubbleInput,
  type SwitchProps,
  type SwitchThumbProps,
  type unstable_SwitchProviderProps,
  type unstable_SwitchTriggerProps,
  type unstable_SwitchBubbleInputProps,
};
