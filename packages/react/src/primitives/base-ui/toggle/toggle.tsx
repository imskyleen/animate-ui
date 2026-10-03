'use client';
/* eslint-disable @typescript-eslint/no-namespace -- keeps Base UI's `Toggle.Props`/`Toggle.State` type namespace */

import * as React from 'react';
import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import { usePressMotion } from '../../../internal/controls/press';

// Same API as Base UI's Toggle (also the item of a Toggle Group). Pressing it
// scales it down a touch; the pressed colours stay the component's CSS.

/** Animate UI's additions to `Toggle`. */
type ToggleAnimationProps = {
  /** Transition of the press feedback. Defaults to `transition.press` (150ms). */
  transition?: Transition;
};

function Toggle<Value extends string = string>(props: Toggle.Props<Value>) {
  return (
    <ReducedMotionConfig>
      <AnimatedToggle<Value> {...props} />
    </ReducedMotionConfig>
  );
}

namespace Toggle {
  export type State = TogglePrimitive.State;
  /** Base UI's props, plus Animate UI's `transition`. */
  export type Props<TValue extends string = string> =
    TogglePrimitive.Props<TValue> &
      ToggleAnimationProps &
      React.RefAttributes<HTMLButtonElement>;
  export type ChangeEventReason = TogglePrimitive.ChangeEventReason;
  export type ChangeEventDetails = TogglePrimitive.ChangeEventDetails;
}

function AnimatedToggle<Value extends string = string>({
  transition,
  render,
  ...props
}: Toggle.Props<Value>) {
  const press = usePressMotion(transition);
  // The user's own element: Base UI's behaviour, no animation.
  if (render) return <TogglePrimitive<Value> {...props} render={render} />;

  return (
    <TogglePrimitive<Value>
      {...props}
      render={(elementProps) => (
        <motion.button
          {...(elementProps as HTMLMotionProps<'button'>)}
          {...press}
        />
      )}
    />
  );
}

export { Toggle };
