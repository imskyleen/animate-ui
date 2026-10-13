'use client';

import * as React from 'react';

const SERVER_LOCALE = 'en-US';

const subscribe = () => () => {};

function useHydrationLocale(
  locale: Intl.LocalesArgument | undefined,
): Intl.LocalesArgument | undefined {
  const hydrating = React.useSyncExternalStore(
    subscribe,
    () => false,
    () => true,
  );
  return locale ?? (hydrating ? SERVER_LOCALE : undefined);
}

export { useHydrationLocale };
