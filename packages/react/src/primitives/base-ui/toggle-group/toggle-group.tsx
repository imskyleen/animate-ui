'use client';
/* eslint-disable @typescript-eslint/no-namespace -- keeps Base UI's `ToggleGroup.Props`/`ToggleGroup.State` type namespace */

import * as React from 'react';
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group';
import type { Transition } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import { mergeRefs } from '../../../internal/controls/indicator';
import { useToggleGroupHighlight } from '../../../internal/controls/highlight';

// Same API as Base UI's Toggle Group, animated like Animate UI v1's toggle
// group: its items are Toggles (`@animate-ui/react/primitives/base-ui/toggle`,
// pressed: 0.97) and, without `multiple`, the selected item's surface slides
// to the next selected item (see ../../../internal/controls/highlight). Arrow
// keys only move the focus.

/** Animate UI's additions to `ToggleGroup`. */
type ToggleGroupAnimationProps = {
  /**
   * Transition of the highlight sliding between items (without `multiple`).
   * Defaults to a spring (stiffness 300, damping 30).
   */
  transition?: Transition;
};

function ToggleGroup<Value extends string = string>({
  transition,
  ref,
  ...props
}: ToggleGroup.Props<Value> & React.RefAttributes<HTMLDivElement>) {
  const [root, setRoot] = React.useState<HTMLDivElement | null>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, setRoot), [ref]);
  const { style, rootProps } = useToggleGroupHighlight(root, {
    library: 'base',
    enabled: !props.multiple,
    transition,
  });

  return (
    <ReducedMotionConfig>
      {style}
      <ToggleGroupPrimitive<Value> {...props} {...rootProps} ref={mergedRef} />
    </ReducedMotionConfig>
  );
}

namespace ToggleGroup {
  export type State = ToggleGroupPrimitive.State;
  /** Base UI's props, plus Animate UI's `transition`. */
  export type Props<Value extends string = string> =
    ToggleGroupPrimitive.Props<Value> & ToggleGroupAnimationProps;
  export type ChangeEventReason = ToggleGroupPrimitive.ChangeEventReason;
  export type ChangeEventDetails = ToggleGroupPrimitive.ChangeEventDetails;
}

export { ToggleGroup };
