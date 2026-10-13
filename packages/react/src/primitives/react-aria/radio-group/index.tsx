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

type RadioProps = RadioPrimitiveProps & IndicatorAnimationProps;

const INDICATOR = '[data-slot="radio-group-indicator"]';

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
