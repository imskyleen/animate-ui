'use client';

import * as React from 'react';
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { motion, type Transition } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import { usePressMotion } from '../../../internal/controls/press';
import { mergeRefs } from '../../../internal/controls/indicator';
import {
  toggleGroupItemProps,
  useToggleGroupHighlight,
} from '../../../internal/controls/highlight';

// Same API as Radix's Toggle Group, animated like Animate UI v1's toggle
// group: items scale to 0.97 while pressed and, with `type="single"`, the
// selected item's surface slides to the next selected item (see
// ../../../internal/controls/highlight). Arrow keys only move the focus
// (roving tabindex), which never animates.

/** Animate UI's additions to `ToggleGroup.Root`. */
type RootAnimationProps = {
  /**
   * Transition of the highlight sliding between items (`type="single"`).
   * Defaults to a spring (stiffness 300, damping 30).
   */
  transition?: Transition;
};

/** Animate UI's additions to `ToggleGroup.Item`. */
type ItemAnimationProps = {
  /**
   * Transition of the press scale. Defaults to a spring (stiffness 550,
   * damping 30).
   */
  transition?: Transition;
};

type ToggleGroupSingleProps = ToggleGroupPrimitive.ToggleGroupSingleProps &
  RootAnimationProps;
type ToggleGroupMultipleProps = ToggleGroupPrimitive.ToggleGroupMultipleProps &
  RootAnimationProps;
type ToggleGroupItemProps = ToggleGroupPrimitive.ToggleGroupItemProps &
  ItemAnimationProps;

function Root({
  transition,
  ref,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  RootAnimationProps) {
  const [root, setRoot] = React.useState<HTMLDivElement | null>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, setRoot), [ref]);
  const { style, rootProps } = useToggleGroupHighlight(root, {
    library: 'radix',
    enabled: props.type === 'single',
    transition,
  });

  return (
    <ReducedMotionConfig>
      {style}
      <ToggleGroupPrimitive.Root {...props} {...rootProps} ref={mergedRef}>
        {children}
      </ToggleGroupPrimitive.Root>
    </ReducedMotionConfig>
  );
}

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
  const press = usePressMotion({ disabled: props.disabled, transition });
  if (asChild)
    return (
      <ToggleGroupPrimitive.Item {...props} asChild>
        {children}
      </ToggleGroupPrimitive.Item>
    );

  return (
    <ToggleGroupPrimitive.Item {...props} asChild>
      <motion.button {...toggleGroupItemProps} {...press}>
        {children}
      </motion.button>
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
