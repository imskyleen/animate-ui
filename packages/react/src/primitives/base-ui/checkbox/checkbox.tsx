'use client';
/* eslint-disable @typescript-eslint/no-namespace -- each part keeps Base UI's `Part.Props`/`Part.State` type namespace */

import * as React from 'react';
import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';

import { ReducedMotionConfig } from '../../../utils/motion';
import {
  IndicatorPresence,
  type IndicatorAnimationProps,
} from '../../../internal/controls/indicator';

// Same API as Base UI's Checkbox, animated like Animate UI v1's checkbox: the
// check draws itself (its stroke and opacity, 0.3s after 0.2s) and erases in
// 0.3s. The Indicator stays mounted while its check erases, then unmounts like
// Base UI's. The Root is Base UI's: unlike v1's, it doesn't scale when pressed
// or hovered, the check (and the box's own fill) answer the click.

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
  transition,
  exitTransition,
  ...props
}: Indicator.Props) {
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
      {/* Always mounted for Base UI: the presence below decides, from the
          state Base UI hands to `render`. */}
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
            transition={transition}
            exitTransition={exitTransition}
          />
        )}
      />
    </ReducedMotionConfig>
  );
}

namespace Indicator {
  /** Base UI's props, plus Animate UI's `transition` and `exitTransition`. */
  export type Props = CheckboxPrimitive.Indicator.Props &
    IndicatorAnimationProps;
  export type State = CheckboxPrimitive.Indicator.State;
}

export { Root, Indicator };
