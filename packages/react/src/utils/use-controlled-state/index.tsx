'use client';

import * as React from 'react';

interface CommonControlledStateProps<T> {
  value?: T;
  defaultValue?: T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useControlledState<T, Rest extends any[] = []>(
  props: CommonControlledStateProps<T> & {
    onChange?: (value: T, ...args: Rest) => void;
  },
): readonly [T, (next: T, ...args: Rest) => void] {
  const { value, defaultValue, onChange } = props;

  const controlled = value !== undefined;
  const [internalState, setInternalState] = React.useState<T>(
    defaultValue as T,
  );
  const state = controlled ? value : internalState;

  const setState = React.useCallback(
    (next: T, ...args: Rest) => {
      if (!controlled) setInternalState(next);
      onChange?.(next, ...args);
    },
    [controlled, onChange],
  );

  return [state, setState] as const;
}
