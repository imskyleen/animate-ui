'use client';
/* eslint-disable @typescript-eslint/no-namespace -- each part keeps Base UI's `Part.Props`/`Part.State` type namespace */

import * as React from 'react';
import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import { usePressMotion } from '../../../internal/controls/press';
import {
  IndicatorPresence,
  type IndicatorAnimationProps,
} from '../../../internal/controls/indicator';

// Same API as Base UI's Checkbox. The Root gives press feedback; the Indicator
// stays mounted while its check scales out, then unmounts like Base UI's.

/** Animate UI's additions to `Checkbox.Root`. */
type RootAnimationProps = {
  /** Transition of the press feedback. Defaults to `transition.press` (150ms). */
  transition?: Transition;
};

function Root(props: Root.Props) {
  return (
    <ReducedMotionConfig>
      <AnimatedRoot {...props} />
    </ReducedMotionConfig>
  );
}

namespace Root {
  /** Base UI's props, plus Animate UI's `transition`. */
  export type Props = CheckboxPrimitive.Root.Props & RootAnimationProps;
  export type State = CheckboxPrimitive.Root.State;
  export type ChangeEventReason = CheckboxPrimitive.Root.ChangeEventReason;
  export type ChangeEventDetails = CheckboxPrimitive.Root.ChangeEventDetails;
}

function AnimatedRoot({ transition, render, ...props }: Root.Props) {
  const press = usePressMotion(transition);
  // The user's own element: Base UI's behaviour, no animation.
  if (render) return <CheckboxPrimitive.Root {...props} render={render} />;

  // A native <button> when the user asks Base UI for one (`nativeButton`).
  const Element = (
    props.nativeButton ? motion.button : motion.span
  ) as typeof motion.span;
  return (
    <CheckboxPrimitive.Root
      {...props}
      // Base UI's props (className, style, data-checked, handlers…) land on
      // the motion element.
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
      <CheckboxPrimitive.Indicator
        {...props}
        keepMounted={keepMounted}
        render={render}
      />
    );

  return (
    <ReducedMotionConfig>
      {/* Always mounted for Base UI: the presence below decides, from the
          state Base UI hands to `render`. */}
      <CheckboxPrimitive.Indicator
        {...props}
        keepMounted
        render={(elementProps, state) => (
          <IndicatorPresence
            {...(elementProps as React.ComponentPropsWithRef<'span'>)}
            checked={state.checked || state.indeterminate}
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
  export type Props = CheckboxPrimitive.Indicator.Props &
    IndicatorAnimationProps;
  export type State = CheckboxPrimitive.Indicator.State;
}

export { Root, Indicator };
