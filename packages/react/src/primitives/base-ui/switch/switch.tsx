'use client';
/* eslint-disable @typescript-eslint/no-namespace -- each part keeps Base UI's `Part.Props`/`Part.State` type namespace */

import * as React from 'react';
import { Switch as SwitchPrimitive } from '@base-ui/react/switch';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import { usePressMotion } from '../../../internal/controls/press';
import { mergeRefs } from '../../../internal/controls/indicator';
import {
  useThumbGlide,
  type ThumbAnimationProps,
} from '../../../internal/controls/thumb';

// Same API as Base UI's Switch. The Root gives press feedback; the Thumb glides
// to its new side with a spring, through a transform.

/** Animate UI's additions to `Switch.Root`. */
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
  export type Props = SwitchPrimitive.Root.Props & RootAnimationProps;
  export type State = SwitchPrimitive.Root.State;
  export type ChangeEventReason = SwitchPrimitive.Root.ChangeEventReason;
  export type ChangeEventDetails = SwitchPrimitive.Root.ChangeEventDetails;
}

function AnimatedRoot({ transition, render, ...props }: Root.Props) {
  const press = usePressMotion(transition);
  // The user's own element: Base UI's behaviour, no animation.
  if (render) return <SwitchPrimitive.Root {...props} render={render} />;

  // A native <button> when the user asks Base UI for one (`nativeButton`).
  const Element = (
    props.nativeButton ? motion.button : motion.span
  ) as typeof motion.span;
  return (
    <SwitchPrimitive.Root
      {...props}
      render={(elementProps) => (
        <Element {...(elementProps as HTMLMotionProps<'span'>)} {...press} />
      )}
    />
  );
}

function Thumb({ render, transition, ...props }: Thumb.Props) {
  if (render) return <SwitchPrimitive.Thumb {...props} render={render} />;

  return (
    <ReducedMotionConfig>
      <SwitchPrimitive.Thumb
        {...props}
        render={(elementProps, state) => (
          <GlidingThumb
            {...(elementProps as React.ComponentPropsWithRef<'span'>)}
            checked={state.checked}
            transition={transition}
          />
        )}
      />
    </ReducedMotionConfig>
  );
}

namespace Thumb {
  /** Base UI's props, plus Animate UI's `transition`. */
  export type Props = SwitchPrimitive.Thumb.Props & ThumbAnimationProps;
  export type State = SwitchPrimitive.Thumb.State;
}

function GlidingThumb({
  checked,
  transition,
  ref,
  ...props
}: React.ComponentPropsWithRef<'span'> &
  ThumbAnimationProps & { checked: boolean }) {
  const localRef = React.useRef<HTMLSpanElement>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, localRef), [ref]);
  useThumbGlide(() => localRef.current, checked, { transition });
  return <span {...props} ref={mergedRef} />;
}

export { Root, Thumb };
