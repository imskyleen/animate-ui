'use client';

import * as React from 'react';
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { motion, type Transition } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import { usePressMotion } from '../../../internal/controls/press';

// Same API as Radix's Toggle Group. Items give press feedback. Arrow keys only
// move the focus (roving tabindex), which never animates.

/** Animate UI's additions to `ToggleGroup.Item`. */
type ItemAnimationProps = {
  /** Transition of the press feedback. Defaults to `transition.press` (150ms). */
  transition?: Transition;
};

type ToggleGroupSingleProps = ToggleGroupPrimitive.ToggleGroupSingleProps;
type ToggleGroupMultipleProps = ToggleGroupPrimitive.ToggleGroupMultipleProps;
type ToggleGroupItemProps = ToggleGroupPrimitive.ToggleGroupItemProps &
  ItemAnimationProps;

const Root = ToggleGroupPrimitive.Root;

function Item(
  props: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
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
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  ItemAnimationProps) {
  const press = usePressMotion(transition);
  if (asChild)
    return (
      <ToggleGroupPrimitive.Item {...props} asChild>
        {children}
      </ToggleGroupPrimitive.Item>
    );

  return (
    <ToggleGroupPrimitive.Item {...props} asChild>
      <motion.button {...press}>{children}</motion.button>
    </ToggleGroupPrimitive.Item>
  );
}

const createToggleGroupScope: typeof ToggleGroupPrimitive.createToggleGroupScope =
  ToggleGroupPrimitive.createToggleGroupScope;

export {
  Root,
  Item,
  Root as ToggleGroup,
  Item as ToggleGroupItem,
  createToggleGroupScope,
  type ToggleGroupSingleProps,
  type ToggleGroupMultipleProps,
  type ToggleGroupItemProps,
};
