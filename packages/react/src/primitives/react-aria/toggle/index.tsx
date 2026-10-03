'use client';

import * as React from 'react';
import {
  ToggleButton as ToggleButtonPrimitive,
  type ToggleButtonProps as ToggleButtonPrimitiveProps,
} from 'react-aria-components';
import type { Transition } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import { PressedMotion } from '../../../internal/controls/aria';

// Same API as React Aria's ToggleButton (also the item of a
// ToggleButtonGroup). Pressing it, with a pointer or the keyboard, scales it
// down a touch; the selected colours stay the component's CSS.

/** React Aria's props, plus Animate UI's `transition` (the press feedback). */
type ToggleButtonProps = ToggleButtonPrimitiveProps & {
  /** Transition of the press feedback. Defaults to `transition.press` (150ms). */
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
        // keeps React Aria's behaviour, without the press feedback.
        render={
          render ??
          ((domProps, values) => (
            <PressedMotion
              {...domProps}
              as="button"
              isPressed={values.isPressed}
              transition={transition}
            />
          ))
        }
      />
    </ReducedMotionConfig>
  );
}

export { ToggleButton, type ToggleButtonProps };
