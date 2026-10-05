'use client';

import * as React from 'react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { motion, type Transition } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import { usePressMotion } from '../../../internal/controls/press';
import {
  IndicatorPresence,
  type IndicatorAnimationProps,
} from '../../../internal/controls/indicator';

// Same API as Radix's Checkbox, animated like Animate UI v1's checkbox: the
// Root scales to 0.95 while pressed (no hover scale), and the check
// draws itself (its stroke and opacity, 0.3s after 0.2s) and erases in 0.3s.
// The Indicator stays mounted while its check erases, then unmounts like
// Radix's.

/** Animate UI's additions to `Checkbox.Root`. */
type RootAnimationProps = {
  /**
   * Transition of the press scale. Defaults to a spring (stiffness 550,
   * damping 30).
   */
  transition?: Transition;
};

type CheckboxProps = CheckboxPrimitive.CheckboxProps & RootAnimationProps;
type CheckboxIndicatorProps = CheckboxPrimitive.CheckboxIndicatorProps &
  IndicatorAnimationProps;
type CheckedState = CheckboxPrimitive.CheckedState;

function Root(
  props: React.ComponentProps<typeof CheckboxPrimitive.Root> &
    RootAnimationProps,
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
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & RootAnimationProps) {
  const press = usePressMotion({
    disabled: props.disabled,
    transition,
  });
  // The user's own element: Radix's behaviour, no animation.
  if (asChild)
    return (
      <CheckboxPrimitive.Root {...props} asChild>
        {children}
      </CheckboxPrimitive.Root>
    );

  return (
    // Radix's props (className, style, data-state, aria-checked, handlers…)
    // land on the motion.button through asChild.
    <CheckboxPrimitive.Root {...props} asChild>
      <motion.button {...press}>{children}</motion.button>
    </CheckboxPrimitive.Root>
  );
}

function Indicator({
  forceMount,
  asChild,
  children,
  transition,
  exitTransition,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Indicator> &
  IndicatorAnimationProps) {
  if (asChild)
    return (
      <CheckboxPrimitive.Indicator {...props} forceMount={forceMount} asChild>
        {children}
      </CheckboxPrimitive.Indicator>
    );

  return (
    <ReducedMotionConfig>
      {/* Always mounted for Radix: the presence below decides, from the
          data-state Radix passes down. */}
      <CheckboxPrimitive.Indicator {...props} forceMount asChild>
        <RadixIndicator
          keepMounted={forceMount}
          transition={transition}
          exitTransition={exitTransition}
        >
          {children}
        </RadixIndicator>
      </CheckboxPrimitive.Indicator>
    </ReducedMotionConfig>
  );
}

function RadixIndicator(
  props: Omit<
    React.ComponentProps<typeof IndicatorPresence>,
    'checked' | 'kind'
  > & {
    'data-state'?: string;
  },
) {
  const state = props['data-state'];
  return (
    <IndicatorPresence
      {...props}
      kind="check"
      checked={state === 'checked' || state === 'indeterminate'}
      indeterminate={state === 'indeterminate'}
    />
  );
}

const createCheckboxScope: typeof CheckboxPrimitive.createCheckboxScope =
  CheckboxPrimitive.createCheckboxScope;

// Radix's unstable composition API, untouched (an Indicator inside it still
// animates).
const unstable_CheckboxProvider = CheckboxPrimitive.unstable_CheckboxProvider;
const unstable_CheckboxTrigger = CheckboxPrimitive.unstable_CheckboxTrigger;
const unstable_CheckboxBubbleInput =
  CheckboxPrimitive.unstable_CheckboxBubbleInput;
type unstable_CheckboxProviderProps =
  CheckboxPrimitive.unstable_CheckboxProviderProps;
type unstable_CheckboxTriggerProps =
  CheckboxPrimitive.unstable_CheckboxTriggerProps;
type unstable_CheckboxBubbleInputProps =
  CheckboxPrimitive.unstable_CheckboxBubbleInputProps;

export {
  Root,
  Indicator,
  Root as Checkbox,
  Indicator as CheckboxIndicator,
  createCheckboxScope,
  unstable_CheckboxProvider,
  unstable_CheckboxProvider as unstable_Provider,
  unstable_CheckboxTrigger,
  unstable_CheckboxTrigger as unstable_Trigger,
  unstable_CheckboxBubbleInput,
  unstable_CheckboxBubbleInput as unstable_BubbleInput,
  type CheckboxProps,
  type CheckboxIndicatorProps,
  type CheckedState,
  type unstable_CheckboxProviderProps,
  type unstable_CheckboxTriggerProps,
  type unstable_CheckboxBubbleInputProps,
};
