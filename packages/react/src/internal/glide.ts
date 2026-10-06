'use client';

import type { Transition } from 'motion/react';

import { toCssTiming } from '../utils/motion';

// An element moving from where it was on screen to where it now rests (FLIP),
// on the compositor: a Web Animation of `translate`, added to the element's
// own (a `translate` or `transform` from its styles stays as it is). A list's
// check gliding to the chosen item, chips making room for one added.

/** Running glides, by element. */
const glides = new WeakMap<Element, Animation>();

/** Stops `element`'s glide: it's where it rests. */
function stopGlide(element: Element) {
  glides.get(element)?.cancel();
  glides.delete(element);
}

/**
 * Moves `element` from `start` (a box on screen, read before it moved) to
 * where it rests, measured now (its glide stopped first).
 */
function glideFrom(element: HTMLElement, start: DOMRect, glide: Transition) {
  // Without Web Animations (a test DOM), it's where it rests.
  if (typeof element.animate !== 'function') return;
  stopGlide(element);
  const end = element.getBoundingClientRect();
  const x = start.left - end.left;
  const y = start.top - end.top;
  if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5) return;
  const { duration, easing } = toCssTiming(glide);
  const animation = element.animate(
    [{ translate: `${x}px ${y}px` }, { translate: '0px 0px' }],
    { duration, easing, composite: 'add' },
  );
  glides.set(element, animation);
  animation.finished.then(
    () => glides.get(element) === animation && glides.delete(element),
    () => {},
  );
}

export { glideFrom, stopGlide };
