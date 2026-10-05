'use client';

import * as React from 'react';

import { mergeRefs } from './anchored';
import { useItemHighlight, withHighlight } from './item-highlight';

// React Aria's collection items (ListBoxItem, MenuItem) in the highlight of
// their list (internal/item-highlight), on the item React Aria marks
// `data-focused`: the pointer and the arrow keys move it alike.
//
// Items are collection items: React Aria renders the real element later, from
// the props the item gave the collection. So the highlight is rendered through
// the item's `render` prop, which React Aria calls with the element's props.

/** The props React Aria hands an item's `render`: a `<div>`'s, or a link's. */
type ItemDOMProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
  href?: string;
};

type ItemRender<Values> = (props: never, values: Values) => React.ReactElement;

type HighlightedItemProps<Values extends { isDisabled: boolean }> = {
  domProps: unknown;
  values: Values;
  /** The user's own `render`, still honoured. */
  render: ItemRender<Values> | undefined;
};

/** The element React Aria asked for, with the highlight inside. */
function HighlightedItem<Values extends { isDisabled: boolean }>({
  domProps,
  values,
  render,
}: HighlightedItemProps<Values>) {
  const own = domProps as ItemDOMProps;
  const { ref: highlightRef, highlight } = useItemHighlight(values.isDisabled, {
    attribute: 'data-focused',
  });
  const ownRef = own.ref;
  const ref = React.useMemo(
    () => mergeRefs(ownRef, highlightRef),
    [ownRef, highlightRef],
  );
  const props: ItemDOMProps = {
    ...own,
    ref,
    children: withHighlight(own.children, highlight),
  };

  if (render) return render(props as never, values);
  // A link item renders an `<a>`, like React Aria's.
  if (props.href) return <a {...(props as React.ComponentProps<'a'>)} />;
  return <div {...(props as React.ComponentProps<'div'>)} />;
}

export { HighlightedItem, type ItemRender };
