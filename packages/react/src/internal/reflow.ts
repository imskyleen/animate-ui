'use client';

import * as React from 'react';
import type { Transition } from 'motion/react';

import { motionTokens, toCssTiming } from '../utils/motion';
import { glideFrom, stopGlide } from './glide';

// A row of chips (a Base UI combobox's chips, React Aria's tags) and what
// follows them (the input): adding a chip or removing one moves the others.
// They glide from where they were to where they land, and a removed chip
// leaves through a copy of itself, shrinking in place out of the flow while
// the others close its gap. When the row wraps onto a line more, or one less,
// the box around it (the field) grows or shrinks on the same spring instead
// of jumping. An added chip pops in on its own (its part plays it), from
// CHIP_SCALE.

/** A chip popping in starts at half its size, and a removed one ends there. */
const CHIP_SCALE = 0.5;
/** A chip popping in: the popovers' spring. */
const CHIP_TRANSITION: Transition = motionTokens.spring.pop;
/** A removed chip shrinking out, quicker than it came. */
const CHIP_EXIT_TRANSITION: Transition = motionTokens.transition.popOut;
/** The others making room or closing the gap: quick, without overshoot. */
const REFLOW_TRANSITION: Transition = motionTokens.spring.reflow;

/** Copies of removed chips, still leaving. */
const copies = new WeakSet<Element>();
/** Running resizes, by container. */
const resizes = new WeakMap<Element, Animation>();

/** The CSS `height` that gives `container` a box `height` px tall. */
function cssHeight(container: HTMLElement, height: number) {
  const style = getComputedStyle(container);
  if (style.boxSizing === 'border-box') return height;
  return (
    height -
    parseFloat(style.paddingTop) -
    parseFloat(style.paddingBottom) -
    parseFloat(style.borderTopWidth) -
    parseFloat(style.borderBottomWidth)
  );
}

/**
 * Grows or shrinks `container` from the `from` px height it had to the one
 * it now has, and returns where its items are at its start: wherever its
 * free space puts them (a centered row), they glide with it from there.
 */
function resize(
  container: HTMLElement,
  items: HTMLElement[],
  from: number,
  to: number,
  glide: Transition,
) {
  const start = `${cssHeight(container, from)}px`;
  // Held at its height before, while its items are measured.
  const inline = container.style.height;
  container.style.height = start;
  const held = new Map(
    items.map((item) => [item, item.getBoundingClientRect()]),
  );
  container.style.height = inline;
  const { duration, easing } = toCssTiming(glide);
  const animation = container.animate(
    [{ height: start }, { height: `${cssHeight(container, to)}px` }],
    { duration, easing },
  );
  resizes.set(container, animation);
  animation.finished.then(
    () => resizes.get(container) === animation && resizes.delete(container),
    () => {},
  );
  return held;
}

/** The element laying `element` out: itself, or its closest box (not `display: contents`). */
function layoutBox(element: HTMLElement): HTMLElement {
  let box = element;
  while (box.parentElement && getComputedStyle(box).display === 'contents')
    box = box.parentElement;
  return box;
}

/** The boxes laid out in `container`: its children, through `display: contents` ones. */
function layoutItems(container: Element): HTMLElement[] {
  return Array.from(container.children).flatMap((child) => {
    if (!(child instanceof HTMLElement) || copies.has(child)) return [];
    return getComputedStyle(child).display === 'contents'
      ? layoutItems(child)
      : [child];
  });
}

type Leaving = {
  element: HTMLElement;
  copy: HTMLElement;
  rect: DOMRect;
  transition: Transition;
  reduce: boolean;
};

/** Puts a removed chip's copy where it was, out of the flow, and lets it go. */
function leaveThrough(
  container: HTMLElement,
  { copy, rect, transition, reduce }: Leaving,
) {
  copies.add(copy);
  // Only seen: no id or test id twice on the page.
  for (const element of [
    copy,
    ...copy.querySelectorAll('[id], [data-testid]'),
  ]) {
    element.removeAttribute('id');
    element.removeAttribute('data-testid');
  }
  copy.setAttribute('aria-hidden', 'true');
  copy.setAttribute('inert', '');
  copy.setAttribute('data-exiting', '');
  Object.assign(copy.style, {
    position: 'absolute',
    top: '0px',
    left: '0px',
    margin: '0px',
    boxSizing: 'border-box',
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    pointerEvents: 'none',
  });
  container.appendChild(copy);
  // Measured once in: wherever its containing block is.
  const at = copy.getBoundingClientRect();
  copy.style.left = `${rect.left - at.left}px`;
  copy.style.top = `${rect.top - at.top}px`;
  // Without Web Animations (a test DOM), it goes at once.
  if (typeof copy.animate !== 'function') return copy.remove();
  // One animation for both, from where it is (a chip still popping in):
  // they move on the same progress.
  const { duration, easing } = toCssTiming(transition);
  const animation = copy.animate(
    reduce ? { opacity: 0 } : { opacity: 0, scale: String(CHIP_SCALE) },
    { duration, easing, fill: 'forwards' },
  );
  animation.finished.then(
    () => copy.remove(),
    () => copy.remove(),
  );
}

/**
 * A chip row's reflow: its chips tell it when one is about to be added
 * (`measure`, while it renders) and once it is (`settle`), and when one is
 * about to be removed (`leave`, while it's still on the page).
 */
type Reflow = {
  /** Where everything is, before the page changes. */
  measure: () => void;
  /** A chip was added: what moved glides, before the next frame. */
  settle: () => void;
  /** A chip is about to leave the page: it leaves through a copy. */
  leave: (
    element: HTMLElement,
    transition: Transition,
    reduce: boolean,
  ) => void;
};

type ReflowOptions = {
  /**
   * The element laying the chips out, when it's known. Otherwise, a removed
   * chip's parent box.
   */
  container: () => HTMLElement | null;
  glide: Transition;
  reduce: boolean;
};

function createReflow(options: () => ReflowOptions): Reflow {
  let before: Map<HTMLElement, DOMRect> | null = null;
  /** The container's height, before (on screen: resizing, maybe). */
  let height = 0;
  let frame = 0;
  let scheduled = false;
  let leaving: Leaving[] = [];
  /** The container measured, for the next settle. */
  let target: HTMLElement | null = null;

  const measure = (container = options().container()) => {
    if (before || !container?.isConnected) return;
    target = container;
    height = container.getBoundingClientRect().height;
    before = new Map(
      layoutItems(container).map((item) => [
        item,
        item.getBoundingClientRect(),
      ]),
    );
    // Measured for a change that didn't come (a render React dropped).
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (!scheduled) before = target = null;
    });
  };

  const settle = () => {
    scheduled = false;
    cancelAnimationFrame(frame);
    const from = before;
    const gone = leaving;
    const container = target ?? options().container();
    before = target = null;
    leaving = [];
    if (!container?.isConnected) return;
    const { glide, reduce } = options();
    const items = layoutItems(container);
    // Where everything rests now: the glides and the resize running stop.
    for (const item of items) stopGlide(item);
    resizes.get(container)?.cancel();
    const now = container.getBoundingClientRect().height;
    // Onto a line more, or one less: its height glides too (without Web
    // Animations, a test DOM, it's at its height at once).
    const resized =
      from !== null &&
      !reduce &&
      Math.abs(now - height) > 0.5 &&
      typeof container.animate === 'function';
    const held = resized ? resize(container, items, height, now, glide) : null;
    if (!reduce)
      for (const item of items) {
        const start = from?.get(item);
        // From where it was (gliding, maybe) to where it lands.
        if (start) glideFrom(item, start, glide, held?.get(item));
      }
    // Still on the page: it wasn't removed (a ref handed over).
    for (const item of gone)
      if (!item.element.isConnected) leaveThrough(container, item);
  };

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(settle);
  };

  return {
    measure: () => measure(),
    settle: schedule,
    leave: (element, transition, reduce) => {
      if (
        !element.isConnected ||
        leaving.some((item) => item.element === element)
      )
        return;
      const parent = element.parentElement;
      measure(options().container() ?? (parent && layoutBox(parent)));
      leaving.push({
        element,
        copy: element.cloneNode(true) as HTMLElement,
        rect: element.getBoundingClientRect(),
        transition,
        reduce,
      });
      schedule();
    },
  };
}

/** A chip row's reflow, for its chips (see `Reflow`). */
function useReflow(options: ReflowOptions): Reflow {
  const optionsRef = React.useRef(options);
  React.useLayoutEffect(() => {
    optionsRef.current = options;
  });
  // Read while a chip renders, on purpose: where everything is before the
  // page changes.
  // eslint-disable-next-line react-hooks/refs
  const [reflow] = React.useState(() => createReflow(() => optionsRef.current));
  return reflow;
}

export {
  CHIP_EXIT_TRANSITION,
  CHIP_SCALE,
  CHIP_TRANSITION,
  REFLOW_TRANSITION,
  layoutBox,
  useReflow,
  type Reflow,
};
