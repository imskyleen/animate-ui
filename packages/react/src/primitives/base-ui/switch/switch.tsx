'use client';
/* eslint-disable @typescript-eslint/no-namespace */

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

function Root({ render, ...props }: Root.Props) {
  const [pressed, setPressed] = React.useState(false);

  if (render) return <SwitchPrimitive.Root {...props} render={render} />;

  const Element = (
    props.nativeButton ? motion.button : motion.span
  ) as typeof motion.span;
  return (
    <SwitchPressedContext value={pressed}>
      <SwitchPrimitive.Root
        {...props}
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
