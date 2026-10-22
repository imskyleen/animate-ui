'use client';

import DefaultSearchDialog from 'fumadocs-ui/components/dialog/search-default';
import { useSyncExternalStore, type ComponentProps } from 'react';

const subscribeNever = () => () => {};

/**
 * Mounted once hydrated: a Base UI popup opened before then marks the page
 * `aria-hidden`, and the server's HTML for this dialog wouldn't match.
 */
export function SearchDialog(
  props: ComponentProps<typeof DefaultSearchDialog>,
) {
  const hydrated = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  return hydrated ? <DefaultSearchDialog {...props} /> : null;
}
