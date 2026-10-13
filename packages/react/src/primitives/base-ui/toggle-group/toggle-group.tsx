'use client';
/* eslint-disable @typescript-eslint/no-namespace */

import * as React from 'react';
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group';
import type { Transition } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import { mergeRefs } from '../../../internal/controls/indicator';
import { useToggleGroupHighlight } from '../../../internal/controls/highlight';

type ToggleGroupAnimationProps = {
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
    multiple: Boolean(props.multiple),
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
  export type Props<Value extends string = string> =
    ToggleGroupPrimitive.Props<Value> & ToggleGroupAnimationProps;
  export type ChangeEventReason = ToggleGroupPrimitive.ChangeEventReason;
  export type ChangeEventDetails = ToggleGroupPrimitive.ChangeEventDetails;
}

export { ToggleGroup };
