'use client';

import * as React from 'react';
import {
  Switch as SwitchPrimitive,
  type SwitchProps as SwitchPrimitiveProps,
} from 'react-aria-components';

import { ReducedMotionConfig } from '../../../utils/motion';
import { mergeRefs } from '../../../internal/controls/indicator';
import { type ThumbAnimationProps } from '../../../internal/controls/thumb';
import {
  PressedMotion,
  RenderedThumb,
  renderChildren,
} from '../../../internal/controls/aria';

// Same API as React Aria's Switch. The switch gives press feedback; the thumb
// the user renders (`data-slot="switch-thumb"`, shadcn/ui's thumb) glides to
// its new side with a spring, through a transform.

/** React Aria's props, plus Animate UI's `transition` (the thumb's glide). */
type SwitchProps = SwitchPrimitiveProps & ThumbAnimationProps;

function Switch(props: SwitchProps & React.RefAttributes<HTMLLabelElement>) {
  return (
    <ReducedMotionConfig>
      <AnimatedSwitch {...props} />
    </ReducedMotionConfig>
  );
}

function AnimatedSwitch({
  transition,
  render,
  children,
  ref,
  ...props
}: SwitchProps & React.RefAttributes<HTMLLabelElement>) {
  const rootRef = React.useRef<HTMLLabelElement>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, rootRef), [ref]);

  return (
    <SwitchPrimitive
      {...props}
      ref={mergedRef}
      render={
        render ??
        ((domProps, values) => (
          <PressedMotion
            {...domProps}
            as="label"
            isPressed={values.isPressed}
          />
        ))
      }
    >
      {(values) => (
        <>
          {renderChildren(children, values)}
          <RenderedThumb
            rootRef={rootRef}
            checked={values.isSelected}
            transition={transition}
          />
        </>
      )}
    </SwitchPrimitive>
  );
}

export { Switch, type SwitchProps };
