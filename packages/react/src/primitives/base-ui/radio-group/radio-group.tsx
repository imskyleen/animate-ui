'use client';
/* eslint-disable @typescript-eslint/no-namespace -- keeps Base UI's `RadioGroup.Props`/`RadioGroup.State` type namespace */

import * as React from 'react';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';

import { ReducedMotionConfig } from '../../../utils/motion';
import {
  KeyboardSelectionContext,
  useKeyboardSelection,
} from '../../../internal/controls/indicator';

// Same API as Base UI's Radio Group. Nothing animates on the group itself: it
// tells its Radios when a selection comes from the arrow keys (keyboard
// navigation), so their dots swap at once.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RadioGroup<Value = any>({
  onKeyDownCapture,
  onPointerDownCapture,
  ...props
}: RadioGroup.Props<Value>) {
  const { keyboard, handlers } = useKeyboardSelection(
    onKeyDownCapture,
    onPointerDownCapture,
  );

  return (
    <KeyboardSelectionContext value={keyboard}>
      <ReducedMotionConfig>
        <RadioGroupPrimitive<Value> {...props} {...handlers} />
      </ReducedMotionConfig>
    </KeyboardSelectionContext>
  );
}

namespace RadioGroup {
  export type State = RadioGroupPrimitive.State;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type Props<TValue = any> = RadioGroupPrimitive.Props<TValue>;
  export type ChangeEventReason = RadioGroupPrimitive.ChangeEventReason;
  export type ChangeEventDetails = RadioGroupPrimitive.ChangeEventDetails;
}

export { RadioGroup };
