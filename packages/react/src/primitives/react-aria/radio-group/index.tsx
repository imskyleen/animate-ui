'use client';

import * as React from 'react';
import {
  Radio as RadioPrimitive,
  RadioGroup as RadioGroupPrimitive,
  type RadioGroupProps,
  type RadioProps as RadioPrimitiveProps,
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

// Same API as React Aria's RadioGroup and Radio, animated like Animate UI
// v1's Radix UI radio group (v1 had no React Aria one): radios scale to 0.95
// while pressed (no hover scale), and the dot the user renders inside
// `data-slot="radio-group-indicator"` (shadcn/ui's indicator) pops in (scale
// and opacity from 0, spring stiffness 200, damping 16) and out the same way.

/** React Aria's props, plus Animate UI's `transition` and `exitTransition`. */
type RadioProps = RadioPrimitiveProps & IndicatorAnimationProps;

const INDICATOR = '[data-slot="radio-group-indicator"]';

// Nothing animates on the group itself.
const RadioGroup = RadioGroupPrimitive;

function Radio(props: RadioProps & React.RefAttributes<HTMLLabelElement>) {
  return (
    <ReducedMotionConfig>
      <AnimatedRadio {...props} />
    </ReducedMotionConfig>
  );
}

function AnimatedRadio({
  transition,
  exitTransition,
  render,
  children,
  ref,
  ...props
}: RadioProps & React.RefAttributes<HTMLLabelElement>) {
  const rootRef = React.useRef<HTMLLabelElement>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, rootRef), [ref]);

  return (
    <RadioPrimitive
      {...props}
      ref={mergedRef}
      render={
        render ??
        ((domProps, values) => (
          <PressedMotion
            {...domProps}
            as="label"
            isPressed={values.isPressed}
            isDisabled={values.isDisabled}
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
            kind="dot"
            checked={values.isSelected}
            transition={transition}
            exitTransition={exitTransition}
          />
        </>
      )}
    </RadioPrimitive>
  );
}

export { RadioGroup, Radio, type RadioGroupProps, type RadioProps };
