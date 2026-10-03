'use client';

import * as React from 'react';
import {
  Checkbox as CheckboxPrimitive,
  type CheckboxProps as CheckboxPrimitiveProps,
} from 'react-aria-components';

import { ReducedMotionConfig } from '../../../utils/motion';
import {
  mergeRefs,
  type IndicatorAnimationProps,
} from '../../../internal/controls/indicator';
import {
  PressedMotion,
  RenderedIndicator,
  renderChildren,
} from '../../../internal/controls/aria';

// Same API as React Aria's Checkbox. The checkbox gives press feedback; the
// check the user renders inside `data-slot="checkbox-indicator"` (shadcn/ui's
// indicator) scales in when selected and out when cleared.

/** React Aria's props, plus Animate UI's `transition` and `exitTransition`. */
type CheckboxProps = CheckboxPrimitiveProps & IndicatorAnimationProps;

const INDICATOR = '[data-slot="checkbox-indicator"]';

function Checkbox(
  props: CheckboxProps & React.RefAttributes<HTMLLabelElement>,
) {
  return (
    <ReducedMotionConfig>
      <AnimatedCheckbox {...props} />
    </ReducedMotionConfig>
  );
}

function AnimatedCheckbox({
  transition,
  exitTransition,
  render,
  children,
  ref,
  ...props
}: CheckboxProps & React.RefAttributes<HTMLLabelElement>) {
  const rootRef = React.useRef<HTMLLabelElement>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, rootRef), [ref]);

  return (
    <CheckboxPrimitive
      {...props}
      ref={mergedRef}
      // React Aria's props (resolved className and style, data-selected,
      // handlers, ref) land on the motion element. A custom `render` keeps
      // React Aria's behaviour, without the press feedback.
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
          <RenderedIndicator
            rootRef={rootRef}
            selector={INDICATOR}
            checked={values.isSelected || values.isIndeterminate}
            transition={transition}
            exitTransition={exitTransition}
          />
        </>
      )}
    </CheckboxPrimitive>
  );
}

export { Checkbox, type CheckboxProps };
