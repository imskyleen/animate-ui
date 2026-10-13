'use client';

import * as React from 'react';
import {
  Checkbox as CheckboxPrimitive,
  type CheckboxProps as CheckboxPrimitiveProps,
} from 'react-aria-components';

import { ReducedMotionConfig, useCheckAnimation } from '../../../utils/motion';
import {
  mergeRefs,
  type CheckAnimationProps,
  type IndicatorAnimationProps,
} from '../../../internal/controls/indicator';
import {
  RenderedIndicator,
  renderChildren,
} from '../../../internal/controls/aria';

type CheckboxProps = CheckboxPrimitiveProps &
  IndicatorAnimationProps &
  CheckAnimationProps;

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
  animation,
  transition,
  exitTransition,
  children,
  ref,
  ...props
}: CheckboxProps & React.RefAttributes<HTMLLabelElement>) {
  const look = useCheckAnimation(animation);
  const rootRef = React.useRef<HTMLLabelElement>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, rootRef), [ref]);

  return (
    <CheckboxPrimitive {...props} ref={mergedRef}>
      {(values) => (
        <>
          {renderChildren(children, values)}
          <RenderedIndicator
            rootRef={rootRef}
            selector={INDICATOR}
            kind="check"
            animation={look}
            checked={values.isSelected || values.isIndeterminate}
            indeterminate={values.isIndeterminate}
            transition={transition}
            exitTransition={exitTransition}
          />
        </>
      )}
    </CheckboxPrimitive>
  );
}

export { Checkbox, type CheckboxProps };
