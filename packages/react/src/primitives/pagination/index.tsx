'use client';

import * as React from 'react';
import type { Transition } from 'motion/react';

import { mergeRefs } from '../../internal/anchored';
import {
  LEAVING_ATTRIBUTE,
  SLIDING_ATTRIBUTE,
  useSlidingIndicator,
  type SlidingIndicatorConfig,
} from '../../internal/sliding-indicator';

const ROOT_ATTRIBUTE = 'data-animate-ui-pagination';
const READY_ATTRIBUTE = 'data-animate-ui-pagination-ready';
const SETTLING_ATTRIBUTE = 'data-animate-ui-pagination-settling';
const LINK = '[data-slot="pagination-link"]';
const ELLIPSIS = '[data-slot="pagination-ellipsis"]';
const CURRENT = `${LINK}[aria-current="page"]`;
const SLOT = 'pagination-indicator';

const SURFACE_CSS = [
  `[${READY_ATTRIBUTE}] ${CURRENT}:not(:focus-visible){border-color:transparent;box-shadow:none}`,
  `@media not all and (hover:hover){[${READY_ATTRIBUTE}] ${CURRENT}{background-color:transparent;background-image:none}}`,
  `@media (hover:hover){[${READY_ATTRIBUTE}] ${CURRENT}:not(:hover){background-color:transparent;background-image:none}}`,
  `@media (hover:hover){[${READY_ATTRIBUTE}]:has(${CURRENT}:hover):not(:has([${ROOT_ATTRIBUTE}] ${CURRENT}:hover))>[data-slot="${SLOT}"]:not([${SLIDING_ATTRIBUTE}]):not([${LEAVING_ATTRIBUTE}]){background-color:transparent;background-image:none}}`,
  `[${SETTLING_ATTRIBUTE}] ${CURRENT}{transition:none}`,
  `@layer base{[${READY_ATTRIBUTE}] :is(${LINK},${ELLIPSIS}){position:relative;z-index:2}}`,
].join('');

function findCurrent(root: HTMLElement) {
  for (const link of root.querySelectorAll<HTMLElement>(CURRENT)) {
    if (
      link.closest(`[${ROOT_ATTRIBUTE}]`) === root &&
      link.getClientRects().length > 0
    )
      return link;
  }
  return null;
}

const PAGINATION_INDICATOR: SlidingIndicatorConfig = {
  findActive: findCurrent,
  items: LINK,
  attributes: ['aria-current', 'class', 'data-active', 'data-disabled'],
  style: { href: 'animate-ui-pagination-indicator', css: SURFACE_CSS },
  slot: SLOT,
  reducedMotion: 'fade',
  fadeBackground: true,
  untransformed: true,
  zIndex: 1,
};

type RootProps = React.ComponentProps<'nav'> & {
  transition?: Transition;
};

function Root({ ref, transition, children, ...props }: RootProps) {
  const [root, setRoot] = React.useState<HTMLElement | null>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, setRoot), [ref]);
  const { indicator, ready, settling } = useSlidingIndicator(
    root,
    PAGINATION_INDICATOR,
    { transition },
  );

  return (
    <nav
      ref={mergedRef}
      {...{ [ROOT_ATTRIBUTE]: '' }}
      {...(ready ? { [READY_ATTRIBUTE]: '' } : {})}
      {...(settling ? { [SETTLING_ATTRIBUTE]: '' } : {})}
      {...props}
    >
      {indicator}
      {children}
    </nav>
  );
}

export { Root, type RootProps };
