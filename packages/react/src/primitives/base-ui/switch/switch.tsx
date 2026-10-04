'use client';
/* eslint-disable @typescript-eslint/no-namespace -- each part keeps Base UI's `Part.Props`/`Part.State` type namespace */

import * as React from 'react';
import { Switch as SwitchPrimitive } from '@base-ui/react/switch';
import { motion, type HTMLMotionProps } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import { mergeRefs } from '../../../internal/controls/indicator';
import {
  SwitchPressedContext,
  useSwitchThumb,
  type ThumbAnimationProps,
} from '../../../internal/controls/thumb';

// Same API as Base UI's Switch, animated like Animate UI v1's switch: while
// the switch is pressed, the Thumb stretches toward the middle of the track;
// when it changes, the Thumb springs to its new side (stiffness 300, damping
// 25). The Root itself doesn't move, and its colours are the component's CSS.

function Root({ render, ...props }: Root.Props) {
  const [pressed, setPressed] = React.useState(false);

  // The user's own element: Base UI's behaviour, and a Thumb that still
  // glides (without the press stretch).
  if (render) return <SwitchPrimitive.Root {...props} render={render} />;

  // A native <button> when the user asks Base UI for one (`nativeButton`).
  const Element = (
    props.nativeButton ? motion.button : motion.span
  ) as typeof motion.span;
  return (
    <SwitchPressedContext value={pressed}>
      <SwitchPrimitive.Root
        {...props}
        // Base UI's props (className, data-checked, handlers…) land on the
        // motion element. Its press gesture is v1's: pointer, and Enter.
        render={(elementProps) => (
          <Element
            {...(elementProps as HTMLMotionProps<'span'>)}
            onTapStart={() => {
              if (!props.disabled) setPressed(true);
            }}
            onTap={() => setPressed(false)}
            onTapCancel={() => setPressed(false)}
          />
        )}
      />
    </SwitchPressedContext>
  );
}

namespace Root {
  export type Props = SwitchPrimitive.Root.Props;
  export type State = SwitchPrimitive.Root.State;
  export type ChangeEventReason = SwitchPrimitive.Root.ChangeEventReason;
  export type ChangeEventDetails = SwitchPrimitive.Root.ChangeEventDetails;
}

function Thumb({ render, transition, ...props }: Thumb.Props) {
  if (render) return <SwitchPrimitive.Thumb {...props} render={render} />;

  return (
    <ReducedMotionConfig>
      <SwitchPrimitive.Thumb
        {...props}
        render={(elementProps, state) => (
          <AnimatedThumb
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

function AnimatedThumb({
  checked,
  transition,
  ref,
  ...props
}: React.ComponentPropsWithRef<'span'> &
  ThumbAnimationProps & { checked: boolean }) {
  const localRef = React.useRef<HTMLSpanElement>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, localRef), [ref]);
  useSwitchThumb(() => localRef.current, {
    checked,
    pressed: React.use(SwitchPressedContext),
    transition,
  });
  return <span {...props} ref={mergedRef} />;
}

export { Root, Thumb };
