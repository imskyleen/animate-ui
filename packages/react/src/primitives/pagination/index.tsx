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

// shadcn/ui's pagination, headless and library-agnostic: the part of it that
// carries the motion, for the pagination of any shadcn/ui base (Radix UI,
// Base UI, React Aria) or your own.
//
// - `Root` is shadcn/ui's `<nav>`. The page links inside it (shadcn/ui's
//   `PaginationLink`: `data-slot="pagination-link"`) share one surface: the
//   current page's (`aria-current="page"`, the outline variant shadcn/ui
//   gives it). Another page becoming current slides it there from the one
//   before on `spring.selection`, instead of the outline jumping from link to
//   link: picked up on the way (quick clicks), it goes on from where it is,
//   with the speed it had (internal/sliding-indicator, like the tabs'
//   indicator).
// - The surface copies the current link's classes and data attributes, so it
//   looks like it in every style and theme (border, background, corners,
//   shadow, dark mode) when its look comes from those (the variant,
//   `data-active`), not from `aria-current`, which it doesn't copy. It sits
//   behind the links, while a small stylesheet hides the current link's own
//   border, background and shadow.
//   Hovered, the current link paints its own hover background (the surface's
//   own fades away under it once it has arrived, so they don't add up);
//   keyboard-focused, it keeps its own focus ring.
// - It slides from where it was drawn: page numbers shifting in the same
//   commit (a window of pages moving with the current one) don't make it jump.
//   A current link staying where it was (the numbers changing around it)
//   doesn't move it.
// - Nothing moves on mount: a pagination remounted by a navigation shows the
//   new page at once. Under reduced motion it crossfades: out on the link it
//   leaves, in on the new one, on `transition.fade`.
// - `AnimateUIProvider`'s `tempo` paces it.

/** Set on the Root, so each one only animates its own links. */
const ROOT_ATTRIBUTE = 'data-animate-ui-pagination';
/** Set on the Root once its surface is on screen. */
const READY_ATTRIBUTE = 'data-animate-ui-pagination-ready';
/** Set on the Root in the frame its surface shows in. */
const SETTLING_ATTRIBUTE = 'data-animate-ui-pagination-settling';
/** shadcn/ui's page links, and its ellipsis. */
const LINK = '[data-slot="pagination-link"]';
const ELLIPSIS = '[data-slot="pagination-ellipsis"]';
const CURRENT = `${LINK}[aria-current="page"]`;
/** The surface's `data-slot`. */
const SLOT = 'pagination-indicator';

// Unlayered, so it wins over Tailwind's layered utilities.
// - The current link's own border, shadow and background are hidden while the
//   surface stands in for them: not its focus ring (border and box-shadow),
//   nor its hover background, where hover is a thing (Tailwind's `hover:` is
//   the same media). Under it, the surface's own background goes once it has
//   arrived (on `transition.color`), so the two don't add up (shadcn/ui's
//   dark `bg-input/30` under `hover:bg-input/50` would look lighter than its
//   own hovered link); a nested pagination's hovered link doesn't count.
// - In the frame the surface shows in, the link's own look goes without its
//   transition (shadcn/ui's `transition-all` would fade it over the surface).
// - The surface (z-index 1) is drawn over what's in the Root (a background on
//   the list or its items, positioned or not), under the links and the
//   ellipsis, positioned above it (z-index 2): in a layer Tailwind's
//   utilities win over (a link's own `absolute`).
const SURFACE_CSS = [
  `[${READY_ATTRIBUTE}] ${CURRENT}:not(:focus-visible){border-color:transparent;box-shadow:none}`,
  `@media not all and (hover:hover){[${READY_ATTRIBUTE}] ${CURRENT}{background-color:transparent;background-image:none}}`,
  `@media (hover:hover){[${READY_ATTRIBUTE}] ${CURRENT}:not(:hover){background-color:transparent;background-image:none}}`,
  `@media (hover:hover){[${READY_ATTRIBUTE}]:has(${CURRENT}:hover):not(:has([${ROOT_ATTRIBUTE}] ${CURRENT}:hover))>[data-slot="${SLOT}"]:not([${SLIDING_ATTRIBUTE}]):not([${LEAVING_ATTRIBUTE}]){background-color:transparent;background-image:none}}`,
  `[${SETTLING_ATTRIBUTE}] ${CURRENT}{transition:none}`,
  `@layer base{[${READY_ATTRIBUTE}] :is(${LINK},${ELLIPSIS}){position:relative;z-index:2}}`,
].join('');

/**
 * The Root's current link: its own (not a nested pagination's), and drawn
 * (not a copy hidden at this breakpoint).
 */
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
  // A link clicked eases back from its press (shadcn/ui's `translate-y-px`, a
  // press scale) as the page changes: the surface lands where it rests.
  untransformed: true,
  // Over the list's and items' backgrounds, under the links.
  zIndex: 1,
};

type RootProps = React.ComponentProps<'nav'> & {
  /**
   * Transition of the current page's surface sliding from link to link.
   * Defaults to a spring (stiffness 300, damping 30).
   */
  transition?: Transition;
};

/**
 * shadcn/ui's pagination `<nav>`: its page links share one surface, the
 * current page's, which slides from link to link as the page changes.
 */
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
