import {
  defineComponent,
  h,
  shallowRef,
  watchPostEffect,
  type Component,
} from 'vue';

import { motionTokens, toCssTiming, useTempoTransition } from '../utils/motion';

type Timing = { duration: number; easing: string; blur: string };

const GHOST = 'data-animate-ui-value-ghost';

function holdPosition(parent: HTMLElement) {
  if (getComputedStyle(parent).position !== 'static') return () => {};
  const previous = parent.style.position;
  parent.style.position = 'relative';
  return () => {
    parent.style.position = previous;
  };
}

type Box = { left: number; top: number; width: number; height: number };

const boxOf = (el: HTMLElement): Box => ({
  left: el.offsetLeft,
  top: el.offsetTop,
  width: el.offsetWidth,
  height: el.offsetHeight,
});

/** The old content fades out into a blur where it was, as the new one fades in out of it. */
function crossfade(el: HTMLElement, ghost: HTMLElement, box: Box, timing: Timing) {
  const parent = el.parentElement;
  if (!parent) return null;
  const release = holdPosition(parent);
  ghost.setAttribute(GHOST, '');
  ghost.setAttribute('aria-hidden', 'true');
  ghost.removeAttribute('id');
  Object.assign(ghost.style, {
    position: 'absolute',
    left: `${box.left}px`,
    top: `${box.top}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
    margin: '0',
    pointerEvents: 'none',
  });
  parent.insertBefore(ghost, el.nextSibling);
  const options = { duration: timing.duration, easing: timing.easing };
  const out = ghost.animate(
    [
      { opacity: 1, filter: 'blur(0px)' },
      { opacity: 0, filter: timing.blur },
    ],
    { ...options, fill: 'forwards' },
  );
  const inside = el.animate(
    [
      { opacity: 0, filter: timing.blur },
      { opacity: 1, filter: 'blur(0px)' },
    ],
    options,
  );
  const stop = () => {
    out.cancel();
    inside.cancel();
    ghost.remove();
    release();
  };
  out.finished.then(stop, () => {});
  return stop;
}

/** Swaps a value's text (a select's or a combobox's) through a blur as it changes. */
function watchValueText(el: HTMLElement, timing: () => Timing) {
  let text = el.textContent ?? '';
  let copy = el.cloneNode(true) as HTMLElement;
  let box = boxOf(el);
  let stop: (() => void) | null = null;

  const observer = new MutationObserver(() => {
    const next = el.textContent ?? '';
    if (next === text) return;
    stop?.();
    stop = crossfade(el, copy, box, timing());
    text = next;
    copy = el.cloneNode(true) as HTMLElement;
    box = boxOf(el);
  });
  observer.observe(el, { childList: true, subtree: true, characterData: true });
  const resize = new ResizeObserver(() => {
    box = boxOf(el);
  });
  resize.observe(el);
  return () => {
    observer.disconnect();
    resize.disconnect();
    stop?.();
  };
}

/** A part showing a value: its text swaps through a blur as it changes. */
function withValueSwap<C extends Component>(component: C, name: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      const swap = useTempoTransition(() => motionTokens.transition.swap);
      const timing = () => ({
        ...toCssTiming(swap.value),
        blur: motionTokens.blur.icon,
      });
      const part = shallowRef<{ $el?: unknown } | null>(null);
      watchPostEffect((onCleanup) => {
        const el = part.value?.$el;
        if (el instanceof HTMLElement) onCleanup(watchValueText(el, timing));
      });
      return () => h(component as Component, { ...attrs, ref: part }, slots);
    },
  }) as unknown as C;
}

export { watchValueText, withValueSwap, type Timing };
