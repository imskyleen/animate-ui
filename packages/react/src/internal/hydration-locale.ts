'use client';

import * as React from 'react';

// Base UI formats the numbers of a Progress and a Slider (their values'
// text and `aria-valuetext`) with `Intl.NumberFormat`, in the runtime's
// locale when none is given: the server's on the server, the browser's once
// in the browser. Rendered by a server set to another locale (an English
// server, a French browser: "13%" against "13 %"), the page doesn't match
// what React hydrates. Like React Aria, they're formatted in en-US on the
// server and while the page hydrates, then in the browser's locale.

/** The locale numbers are formatted in on the server and while hydrating. */
const SERVER_LOCALE = 'en-US';

const subscribe = () => () => {};

/**
 * The locale to hand Base UI: `locale` when it's given, else en-US on the
 * server and while the page hydrates, then the runtime's (`undefined`).
 */
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
