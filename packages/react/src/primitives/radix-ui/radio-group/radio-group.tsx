'use client';

import * as React from 'react';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import { motion, type Transition } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import { usePressMotion } from '../../../internal/controls/press';
import {
  IndicatorPresence,
  type IndicatorAnimationProps,
} from '../../../internal/controls/indicator';

// Same API as Radix's Radio Group, animated like Animate UI v1's radio group:
// items scale to 1.05 while hovered and 0.95 while pressed, and the
// Indicator's dot pops in (scale and opacity from 0, spring stiffness 200,
// damping 16) and out the same way, staying mounted until it has left.

/** Animate UI's additions to `RadioGroup.Item`. */
type ItemAnimationProps = {
  /**
   * Transition of the hover and press scale. Defaults to a spring (stiffness
   * 550, damping 30).
   */
  transition?: Transition;
};

type RadioGroupProps = RadioGroupPrimitive.RadioGroupProps;
type RadioGroupItemProps = RadioGroupPrimitive.RadioGroupItemProps &
  ItemAnimationProps;
type RadioGroupIndicatorProps = RadioGroupPrimitive.RadioGroupIndicatorProps &
  IndicatorAnimationProps;

// Nothing animates on the group itself.
const Root = RadioGroupPrimitive.Root;

function Item(
  props: React.ComponentProps<typeof RadioGroupPrimitive.Item> &
    ItemAnimationProps,
) {
  return (
    <ReducedMotionConfig>
      <AnimatedItem {...props} />
    </ReducedMotionConfig>
  );
}

function AnimatedItem({
  transition,
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> & ItemAnimationProps) {
  const press = usePressMotion({
    hover: true,
    disabled: props.disabled,
    transition,
  });
  if (asChild)
    return (
      <RadioGroupPrimitive.Item {...props} asChild>
        {children}
      </RadioGroupPrimitive.Item>
    );

  return (
    <RadioGroupPrimitive.Item {...props} asChild>
      <motion.button {...press}>{children}</motion.button>
    </RadioGroupPrimitive.Item>
  );
}

function Indicator({
  forceMount,
  asChild,
  children,
  transition,
  exitTransition,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Indicator> &
  IndicatorAnimationProps) {
  if (asChild)
    return (
      <RadioGroupPrimitive.Indicator {...props} forceMount={forceMount} asChild>
        {children}
      </RadioGroupPrimitive.Indicator>
    );

  return (
    <ReducedMotionConfig>
      {/* Always mounted for Radix: the presence below decides, from the
          data-state Radix passes down. */}
      <RadioGroupPrimitive.Indicator {...props} forceMount asChild>
        <RadixIndicator
          keepMounted={forceMount}
          transition={transition}
          exitTransition={exitTransition}
        >
          {children}
        </RadixIndicator>
      </RadioGroupPrimitive.Indicator>
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
  return (
    <IndicatorPresence
      {...props}
      kind="dot"
      checked={props['data-state'] === 'checked'}
    />
  );
}

const createRadioGroupScope: typeof RadioGroupPrimitive.createRadioGroupScope =
  RadioGroupPrimitive.createRadioGroupScope;

// Radix's unstable composition API, untouched (an Indicator inside it still
// animates).
const unstable_RadioGroupItemProvider =
  RadioGroupPrimitive.unstable_RadioGroupItemProvider;
const unstable_RadioGroupItemTrigger =
  RadioGroupPrimitive.unstable_RadioGroupItemTrigger;
const unstable_RadioGroupItemBubbleInput =
  RadioGroupPrimitive.unstable_RadioGroupItemBubbleInput;
type unstable_RadioGroupItemProviderProps =
  RadioGroupPrimitive.unstable_RadioGroupItemProviderProps;
type unstable_RadioGroupItemTriggerProps =
  RadioGroupPrimitive.unstable_RadioGroupItemTriggerProps;
type unstable_RadioGroupItemBubbleInputProps =
  RadioGroupPrimitive.unstable_RadioGroupItemBubbleInputProps;

export {
  Root,
  Item,
  Indicator,
  Root as RadioGroup,
  Item as RadioGroupItem,
  Indicator as RadioGroupIndicator,
  createRadioGroupScope,
  unstable_RadioGroupItemProvider,
  unstable_RadioGroupItemProvider as unstable_ItemProvider,
  unstable_RadioGroupItemTrigger,
  unstable_RadioGroupItemTrigger as unstable_ItemTrigger,
  unstable_RadioGroupItemBubbleInput,
  unstable_RadioGroupItemBubbleInput as unstable_ItemBubbleInput,
  type RadioGroupProps,
  type RadioGroupItemProps,
  type RadioGroupIndicatorProps,
  type unstable_RadioGroupItemProviderProps,
  type unstable_RadioGroupItemTriggerProps,
  type unstable_RadioGroupItemBubbleInputProps,
};
