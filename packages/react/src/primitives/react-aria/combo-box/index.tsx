'use client';

import * as React from 'react';
import {
  ComboBox as ComboBoxPrimitive,
  type ComboBoxProps,
} from 'react-aria-components';

import { mergeRefs } from '../../../internal/controls/indicator';
import { useInputSwap } from '../../../internal/value-swap';

function ComboBox<T extends object>({
  ref,
  onSelectionChange,
  ...props
}: ComboBoxProps<T> & React.RefAttributes<HTMLDivElement>) {
  const swap = useInputSwap();
  const rootRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      swap.ref(node?.querySelector('input') ?? null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const mergedRef = React.useMemo(
    () => mergeRefs(ref, rootRef),
    [ref, rootRef],
  );

  return (
    <ComboBoxPrimitive
      {...props}
      ref={mergedRef}
      onSelectionChange={(key) => {
        onSelectionChange?.(key);
        swap.changed();
      }}
    />
  );
}

export { ComboBox, type ComboBoxProps };
