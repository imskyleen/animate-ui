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
  KeyboardSelectionContext,
  mergeRefs,
  useKeyboardSelection,
  type IndicatorAnimationProps,
} from '../../../internal/controls/indicator';
import {
  PressedMotion,
  RenderedIndicator,
  renderChildren,
} from '../../../internal/controls/aria';

// Same API as React Aria's RadioGroup and Radio. Radios give press feedback;
// the dot the user renders inside `data-slot="radio-group-indicator"`
// (shadcn/ui's indicator) scales in. Selecting with the arrow keys (keyboard
// navigation) swaps the dots at once.

/** React Aria's props, plus Animate UI's `transition` and `exitTransition`. */
type RadioProps = RadioPrimitiveProps & IndicatorAnimationProps;

const INDICATOR = '[data-slot="radio-group-indicator"]';

function RadioGroup({
  render,
  ...props
}: RadioGroupProps & React.RefAttributes<HTMLDivElement>) {
  const { keyboard, handlers } = useKeyboardSelection<
    React.KeyboardEvent<HTMLDivElement>,
    React.PointerEvent<HTMLDivElement>
  >();

  return (
    <KeyboardSelectionContext value={keyboard}>
      <ReducedMotionConfig>
        <RadioGroupPrimitive
          {...props}
          // React Aria takes no keyboard handlers on the group: they go on
          // the element it renders, before its own arrow-key handling.
          render={(domProps, values) => {
            const withHandlers = {
              ...domProps,
              onKeyDownCapture: (
                event: React.KeyboardEvent<HTMLDivElement>,
              ) => {
                handlers.onKeyDownCapture(event);
                domProps.onKeyDownCapture?.(event);
              },
              onPointerDownCapture: (
                event: React.PointerEvent<HTMLDivElement>,
              ) => {
                handlers.onPointerDownCapture(event);
                domProps.onPointerDownCapture?.(event);
              },
            };
            return render ? (
              render(withHandlers, values)
            ) : (
              <div {...withHandlers} />
            );
          }}
        />
      </ReducedMotionConfig>
    </KeyboardSelectionContext>
  );
}

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
