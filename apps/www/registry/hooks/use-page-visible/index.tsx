'use client';

import * as React from 'react';

function subscribeToVisibility(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
}

/**
 * False while the tab is hidden. Pair it with `useInView` and
 * `useShouldReduceMotion` to pause looping animations nobody can see.
 */
function usePageVisible() {
  return React.useSyncExternalStore(
    subscribeToVisibility,
    () => document.visibilityState === 'visible',
    () => true,
  );
}

export { usePageVisible };
