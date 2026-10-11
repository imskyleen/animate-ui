'use client';

import * as React from 'react';
import {
  ToggleButton as ToggleButtonPrimitive,
  ToggleButtonGroup as ToggleButtonGroupPrimitive,
  type ToggleButtonGroupProps as ToggleButtonGroupPrimitiveProps,
  type ToggleButtonProps as ToggleButtonPrimitiveProps,
} from 'react-aria-components';
import type { Transition } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import { mergeRefs } from '../../../internal/controls/indicator';
import { PressedMotion } from '../../../internal/controls/aria';
import {
  toggleGroupItemProps,
  useToggleGroupHighlight,
} from '../../../internal/controls/highlight';

// Same API as React Aria's ToggleButton and ToggleButtonGroup: a toggle
// button scales to 0.97 while pressed (pointer or keyboard), like Animate UI
// v1's Radix UI toggle (v1 had no React Aria ones). In a group, selected
// items' surfaces grow in like a fill and neighbours join into one surface
// (multiple selection), or one surface slides to the selected item (single
// selection), and a hover highlight glides between items (see
// ../../../internal/controls/highlight). A toggle button alone keeps its
// colours in the component's CSS.

/** React Aria's props, plus Animate UI's `transition` (the press scale's). */
type ToggleButtonProps = ToggleButtonPrimitiveProps & {
  /**
   * Transition of the press scale. Defaults to a spring (stiffness 550,
   * damping 30).
   */
  transition?: Transition;
};

function ToggleButton({
  transition,
  render,
  ...props
}: ToggleButtonProps & React.RefAttributes<HTMLButtonElement>) {
  return (
    <ReducedMotionConfig>
      <ToggleButtonPrimitive
        {...props}
        // React Aria's props land on the motion element. A custom `render`
        // keeps React Aria's behaviour, without the press scale.
        render={
          render ??
          ((domProps, values) => (
            <PressedMotion
              {...domProps}
              {...toggleGroupItemProps}
              as="button"
              isPressed={values.isPressed}
              isDisabled={values.isDisabled}
              transition={transition}
            />
          ))
        }
      />
    </ReducedMotionConfig>
  );
}

/** React Aria's props, plus Animate UI's `transition` (the slide's). */
type ToggleButtonGroupProps = ToggleButtonGroupPrimitiveProps & {
  /**
   * Transition of the surface sliding between items (single selection).
   * Defaults to a spring (stiffness 300, damping 30).
   */
  transition?: Transition;
};

function ToggleButtonGroup({
  transition,
  ref,
  ...props
}: ToggleButtonGroupProps & React.RefAttributes<HTMLDivElement>) {
  const [root, setRoot] = React.useState<HTMLDivElement | null>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, setRoot), [ref]);
  const { style, rootProps } = useToggleGroupHighlight(root, {
    library: 'aria',
    multiple: props.selectionMode === 'multiple',
    transition,
  });

  return (
    <ReducedMotionConfig>
      {style}
      <ToggleButtonGroupPrimitive {...props} {...rootProps} ref={mergedRef} />
    </ReducedMotionConfig>
  );
}

export {
  ToggleButton,
  ToggleButtonGroup,
  type ToggleButtonProps,
  type ToggleButtonGroupProps,
};
