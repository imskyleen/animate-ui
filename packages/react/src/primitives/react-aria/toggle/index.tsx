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

type ToggleButtonProps = ToggleButtonPrimitiveProps & {
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

type ToggleButtonGroupProps = ToggleButtonGroupPrimitiveProps & {
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
