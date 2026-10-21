import type { Transition } from 'motion-v';

import { toCssTiming } from '../utils/motion';
import { screenScale } from './screen-scale';

type Glide = {
  animation: Animation;
  distance: number;
};

const glides = new WeakMap<Element, Glide>();

function stopGlide(element: Element) {
  glides.get(element)?.animation.cancel();
  glides.delete(element);
}

function glideFrom(
  element: HTMLElement,
  start: DOMRect,
  glide: Transition,
  end?: DOMRect,
) {
  if (typeof element.animate !== 'function') return;
  stopGlide(element);
  end ??= element.getBoundingClientRect();
  const [sx, sy] = screenScale(element.parentElement);
  const x = (start.left - end.left) / sx;
  const y = (start.top - end.top) / sy;
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
    const progress = animation.effect?.getComputedTiming().progress;
    if (progress == null || Math.abs(1 - progress) * distance < 0.5) land();
    else frame = requestAnimationFrame(check);
  };
  animation.finished.then(land, land);
  frame = requestAnimationFrame(check);
  return stop;
}

export { glideFrom, stopGlide, whenLanded };
