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
