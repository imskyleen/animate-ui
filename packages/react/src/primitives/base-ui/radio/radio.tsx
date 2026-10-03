'use client';
/* eslint-disable @typescript-eslint/no-namespace -- each part keeps Base UI's `Part.Props`/`Part.State` type namespace */

import * as React from 'react';
import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import { usePressMotion } from '../../../internal/controls/press';
import {
  IndicatorPresence,
  type IndicatorAnimationProps,
} from '../../../internal/controls/indicator';

// Same API as Base UI's Radio. The Root gives press feedback; the Indicator's
// dot scales in, and stays mounted while it scales out. Inside Animate UI's
// RadioGroup, selecting with the arrow keys swaps the dots at once.

/** Animate UI's additions to `Radio.Root`. */
type RootAnimationProps = {
  /** Transition of the press feedback. Defaults to `transition.press` (150ms). */
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
  /** Base UI's props, plus Animate UI's `transition`. */
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
  const press = usePressMotion(transition);
  // The user's own element: Base UI's behaviour, no animation.
  if (render) return <RadioPrimitive.Root<Value> {...props} render={render} />;

  // A native <button> when the user asks Base UI for one (`nativeButton`).
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
      {/* Always mounted for Base UI: the presence below decides, from the
          state Base UI hands to `render`. */}
      <RadioPrimitive.Indicator
        {...props}
        keepMounted
        render={(elementProps, state) => (
          <IndicatorPresence
            {...(elementProps as React.ComponentPropsWithRef<'span'>)}
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
  /** Base UI's props, plus Animate UI's `transition` and `exitTransition`. */
  export type Props = RadioPrimitive.Indicator.Props & IndicatorAnimationProps;
  export type State = RadioPrimitive.Indicator.State;
}

export { Root, Indicator };
