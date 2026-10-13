'use client';
/* eslint-disable @typescript-eslint/no-namespace */

import * as React from 'react';
import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import { usePressMotion } from '../../../internal/controls/press';
import {
  IndicatorPresence,
  type IndicatorAnimationProps,
} from '../../../internal/controls/indicator';

type RootAnimationProps = {
  transition?: Transition;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Root<Value = any>(props: Root.Props<Value>) {
  return (
    <ReducedMotionConfig>
      <AnimatedRoot<Value> {...props} />
    </ReducedMotionConfig>
  );
}

namespace Root {
  export type State = RadioPrimitive.Root.State;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type Props<TValue = any> = RadioPrimitive.Root.Props<TValue> &
    RootAnimationProps;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AnimatedRoot<Value = any>({
  transition,
  render,
  ...props
}: Root.Props<Value>) {
  const press = usePressMotion({
    disabled: props.disabled,
    transition,
  });
  if (render) return <RadioPrimitive.Root<Value> {...props} render={render} />;

  const Element = (
    props.nativeButton ? motion.button : motion.span
  ) as typeof motion.span;
  return (
    <RadioPrimitive.Root<Value>
      {...props}
      render={(elementProps) => (
        <Element {...(elementProps as HTMLMotionProps<'span'>)} {...press} />
      )}
    />
  );
}

function Indicator({
  keepMounted,
  render,
  transition,
  exitTransition,
  ...props
}: Indicator.Props) {
  if (render)
    return (
      <RadioPrimitive.Indicator
        {...props}
        keepMounted={keepMounted}
        render={render}
      />
    );

  return (
    <ReducedMotionConfig>
      <RadioPrimitive.Indicator
        {...props}
        keepMounted
        render={(elementProps, state) => (
          <IndicatorPresence
            {...(elementProps as React.ComponentPropsWithRef<'span'>)}
            kind="dot"
            checked={state.checked}
            keepMounted={keepMounted}
            transition={transition}
            exitTransition={exitTransition}
          />
        )}
      />
    </ReducedMotionConfig>
  );
}

namespace Indicator {
  export type Props = RadioPrimitive.Indicator.Props & IndicatorAnimationProps;
  export type State = RadioPrimitive.Indicator.State;
}

export { Root, Indicator };
