'use client';
/* eslint-disable @typescript-eslint/no-namespace */

import * as React from 'react';
import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import { usePressMotion } from '../../../internal/controls/press';
import { toggleGroupItemProps } from '../../../internal/controls/highlight';

type ToggleAnimationProps = {
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
  const press = usePressMotion({ disabled: props.disabled, transition });
  if (render) return <TogglePrimitive<Value> {...props} render={render} />;

  return (
    <TogglePrimitive<Value>
      {...props}
      render={(elementProps) => (
        <motion.button
          {...(elementProps as HTMLMotionProps<'button'>)}
          {...toggleGroupItemProps}
          {...press}
        />
      )}
    />
  );
}

export { Toggle };
