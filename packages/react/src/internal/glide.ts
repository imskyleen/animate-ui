'use client';

import type { Transition } from 'motion/react';

import { toCssTiming } from '../utils/motion';

// An element moving from where it was on screen to where it now rests (FLIP),
// on the compositor: a Web Animation of `translate`, added to the element's
// own (a `translate` or `transform` from its styles stays as it is). A list's
// check gliding to the chosen item, chips making room for one added.

type Glide = {
  animation: Animation;
  /** How far it travels, in px. */
  distance: number;
};

/** Running glides, by element. */
const glides = new WeakMap<Element, Glide>();

/** Stops `element`'s glide: it's where it rests. */
function stopGlide(element: Element) {
  glides.get(element)?.animation.cancel();
  glides.delete(element);
}

/**
 * Moves `element` from `start` (a box on screen, read before it moved) to
 * `end`: where it rests, measured now (its glide stopped first), unless the
 * caller measured it. Returns the glide, if it moves.
 */
function glideFrom(
  element: HTMLElement,
  start: DOMRect,
  glide: Transition,
  end?: DOMRect,
) {
  // Without Web Animations (a test DOM), it's where it rests.
  if (typeof element.animate !== 'function') return;
  stopGlide(element);
  end ??= element.getBoundingClientRect();
  const x = start.left - end.left;
  const y = start.top - end.top;
  if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5) return;
  const { duration, easing } = toCssTiming(glide);
  const animation = element.animate(
    [{ translate: `${x}px ${y}px` }, { translate: '0px 0px' }],
    { duration, easing, composite: 'add' },
  );
  glides.set(element, { animation, distance: Math.hypot(x, y) });
  animation.finished.then(
    () =>
      glides.get(element)?.animation === animation && glides.delete(element),
    () => {},
  );
  return animation;
}

/**
 * Calls `landed` once `element` is where it rests, to the eye: its glide less
 * than half a pixel away (a spring's tail goes on unseen), over, stopped, or
 * none. Returns a function that stops waiting.
 */
function whenLanded(element: Element, landed: () => void) {
  const glide = glides.get(element);
  let frame = 0;
  let waiting = true;
  const stop = () => {
    waiting = false;
    cancelAnimationFrame(frame);
  };
  const land = () => {
    if (!waiting) return;
    stop();
    landed();
  };
  if (!glide) {
    land();
    return stop;
  }
  const { animation, distance } = glide;
  const check = () => {
    // Eased: how far along it is. None once it's over.
    const progress = animation.effect?.getComputedTiming().progress;
    if (progress == null || Math.abs(1 - progress) * distance < 0.5) land();
    else frame = requestAnimationFrame(check);
  };
  animation.finished.then(land, land);
  frame = requestAnimationFrame(check);
  return stop;
}

export { glideFrom, stopGlide, whenLanded };
