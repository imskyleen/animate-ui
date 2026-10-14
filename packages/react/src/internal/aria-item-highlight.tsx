'use client';

import * as React from 'react';

import { mergeRefs } from './anchored';
import { useItemHighlight, withHighlight } from './item-highlight';

type ItemDOMProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
  href?: string;
};

type ItemRender<Values> = (props: never, values: Values) => React.ReactElement;

type HighlightedItemProps<Values extends { isDisabled: boolean }> = {
  domProps: unknown;
  values: Values;
  render: ItemRender<Values> | undefined;
};

function HighlightedItem<Values extends { isDisabled: boolean }>({
  domProps,
  values,
  render,
}: HighlightedItemProps<Values>) {
  const own = domProps as ItemDOMProps;
  const { ref: highlightRef, highlight } = useItemHighlight(values.isDisabled, {
    attribute: 'data-focused',
    followFocus: true,
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
  if (props.href) return <a {...(props as React.ComponentProps<'a'>)} />;
  return <div {...(props as React.ComponentProps<'div'>)} />;
}

export { HighlightedItem, type ItemRender };
