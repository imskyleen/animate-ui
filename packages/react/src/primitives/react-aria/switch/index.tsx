'use client';

import * as React from 'react';
import {
  Switch as SwitchPrimitive,
  type SwitchProps as SwitchPrimitiveProps,
} from 'react-aria-components';

import { ReducedMotionConfig } from '../../../utils/motion';
import { mergeRefs } from '../../../internal/controls/indicator';
import { type ThumbAnimationProps } from '../../../internal/controls/thumb';
import { RenderedThumb, renderChildren } from '../../../internal/controls/aria';

// Same API as React Aria's Switch, animated like Animate UI v1's Radix and
// Headless UI switches: while the switch is pressed (pointer or keyboard,
// React Aria's `isPressed`), the thumb the user renders
// (`data-slot="switch-thumb"`, shadcn/ui's thumb) stretches toward the middle
// of the track; when it changes, the thumb springs to its new side (stiffness
// 300, damping 25). The switch itself doesn't move, and its colours are the
// component's CSS.

/** React Aria's props, plus Animate UI's `transition` (the thumb's). */
type SwitchProps = SwitchPrimitiveProps & ThumbAnimationProps;

function Switch({
  transition,
  children,
  ref,
  ...props
}: SwitchProps & React.RefAttributes<HTMLLabelElement>) {
  const rootRef = React.useRef<HTMLLabelElement>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, rootRef), [ref]);

  return (
    <ReducedMotionConfig>
      <SwitchPrimitive {...props} ref={mergedRef}>
        {(values) => (
          <>
            {renderChildren(children, values)}
            <RenderedThumb
              rootRef={rootRef}
              checked={values.isSelected}
              pressed={values.isPressed}
              transition={transition}
            />
          </>
        )}
      </SwitchPrimitive>
    </ReducedMotionConfig>
  );
}

export { Switch, type SwitchProps };
