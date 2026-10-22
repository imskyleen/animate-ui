'use client';

import * as React from 'react';
import {
  SelectValue as SelectValuePrimitive,
  type SelectValueProps,
} from 'react-aria-components';

import { useValueSwap } from '../../../internal/value-swap';

function SelectValue<T extends object>({
  ref,
  ...props
}: SelectValueProps<T> & React.RefAttributes<HTMLSpanElement>) {
  return <SelectValuePrimitive {...props} ref={useValueSwap(ref)} />;
}

export { SelectValue, type SelectValueProps };
