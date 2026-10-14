'use client';

import * as React from 'react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';

import { ReducedMotionConfig, useCheckAnimation } from '../../../utils/motion';
import {
  IndicatorPresence,
  type CheckAnimationProps,
  type IndicatorAnimationProps,
} from '../../../internal/controls/indicator';

type CheckboxProps = CheckboxPrimitive.CheckboxProps;
type CheckboxIndicatorProps = CheckboxPrimitive.CheckboxIndicatorProps &
  IndicatorAnimationProps &
  CheckAnimationProps;
type CheckedState = CheckboxPrimitive.CheckedState;

const Root = CheckboxPrimitive.Root;

function Indicator({
  forceMount,
  asChild,
  children,
  animation,
  transition,
  exitTransition,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Indicator> &
  IndicatorAnimationProps &
  CheckAnimationProps) {
  const look = useCheckAnimation(animation);
  if (asChild)
    return (
      <CheckboxPrimitive.Indicator {...props} forceMount={forceMount} asChild>
        {children}
      </CheckboxPrimitive.Indicator>
    );

  return (
    <ReducedMotionConfig>
      <CheckboxPrimitive.Indicator {...props} forceMount asChild>
        <RadixIndicator
          keepMounted={forceMount}
          animation={look}
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

Indicator.displayName = 'CheckboxIndicator';

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
