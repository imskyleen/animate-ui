'use client';
/* eslint-disable @typescript-eslint/no-namespace */

import * as React from 'react';
import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';

import { ReducedMotionConfig, useCheckAnimation } from '../../../utils/motion';
import {
  IndicatorPresence,
  type CheckAnimationProps,
  type IndicatorAnimationProps,
} from '../../../internal/controls/indicator';

const Root = CheckboxPrimitive.Root;

namespace Root {
  export type Props = CheckboxPrimitive.Root.Props;
  export type State = CheckboxPrimitive.Root.State;
  export type ChangeEventReason = CheckboxPrimitive.Root.ChangeEventReason;
  export type ChangeEventDetails = CheckboxPrimitive.Root.ChangeEventDetails;
}

function Indicator({
  keepMounted,
  render,
  animation,
  transition,
  exitTransition,
  ...props
}: Indicator.Props) {
  const look = useCheckAnimation(animation);
  if (render)
    return (
      <CheckboxPrimitive.Indicator
        {...props}
        keepMounted={keepMounted}
        render={render}
      />
    );

  return (
    <ReducedMotionConfig>
      <CheckboxPrimitive.Indicator
        {...props}
        keepMounted
        render={(elementProps, state) => (
          <IndicatorPresence
            {...(elementProps as React.ComponentPropsWithRef<'span'>)}
            kind="check"
            checked={state.checked || state.indeterminate}
            indeterminate={state.indeterminate}
            keepMounted={keepMounted}
            animation={look}
            transition={transition}
            exitTransition={exitTransition}
          />
        )}
      />
    </ReducedMotionConfig>
  );
}

namespace Indicator {
  export type Props = CheckboxPrimitive.Indicator.Props &
    IndicatorAnimationProps &
    CheckAnimationProps;
  export type State = CheckboxPrimitive.Indicator.State;
}

export { Root, Indicator };
