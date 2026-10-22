'use client';

import * as React from 'react';
import {
  ComboBox as ComboBoxPrimitive,
  type ComboBoxProps,
} from 'react-aria-components';

import { mergeRefs } from '../../../internal/controls/indicator';
import { useInputSwap } from '../../../internal/value-swap';

function ComboBox<T, M extends 'single' | 'multiple' = 'single'>({
  ref,
  onSelectionChange,
  ...props
}: ComboBoxProps<T, M> & React.RefAttributes<HTMLDivElement>) {
  const swap = useInputSwap();
  const inputRef = swap.ref;
  const rootRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      inputRef(node?.querySelector('input') ?? null);
    },
    [inputRef],
  );
  const mergedRef = React.useMemo(
    () => mergeRefs(ref, rootRef),
    [ref, rootRef],
  );

  return (
    <ComboBoxPrimitive<T, M>
      {...props}
      ref={mergedRef}
      onSelectionChange={(
        ...args: Parameters<NonNullable<typeof onSelectionChange>>
      ) => {
        onSelectionChange?.(...args);
        swap.changed();
      }}
    />
  );
}

export { ComboBox, type ComboBoxProps };
