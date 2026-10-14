import type * as React from 'react';

export type Part<P> = ((props: P) => React.ReactNode) & {
  displayName?: string;
};
