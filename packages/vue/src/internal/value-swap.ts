import {
  defineComponent,
  h,
  shallowRef,
  watchPostEffect,
  type Component,
} from 'vue';

import { motionTokens, toCssTiming, useTempoTransition } from '../utils/motion';

type Timing = { duration: number; easing: string; blur: string; shift: number };

const GHOST = 'data-animate-ui-value-ghost';
const INCOMING = 'data-animate-ui-value-incoming';
const SWAP = { duration: 0.4, ease: motionTokens.ease.soft };
const BLUR = 'blur(4px)';
const SHIFT = 6;

function holdPosition(parent: HTMLElement) {
  if (getComputedStyle(parent).position !== 'static') return () => {};
  const previous = parent.style.position;
  parent.style.position = 'relative';
  return () => {
    parent.style.position = previous;
  };
}

type Box = { left: number; top: number; width: number; height: number };

/** Where `el` sits in its parent, to the subpixel (offsetTop rounds) and unscaled. */
function boxOf(el: HTMLElement): Box {
  const parent = el.parentElement;
  const rect = el.getBoundingClientRect();
  if (!parent)
    return { left: 0, top: 0, width: rect.width, height: rect.height };
  const outer = parent.getBoundingClientRect();
  const scale = parent.offsetWidth ? outer.width / parent.offsetWidth : 1;
  return {
    left:
      (rect.left - outer.left) / scale - parent.clientLeft + parent.scrollLeft,
    top: (rect.top - outer.top) / scale - parent.clientTop + parent.scrollTop,
    width: rect.width / scale,
    height: rect.height / scale,
  };
}

function place(el: HTMLElement, copy: HTMLElement, box: Box) {
  copy.setAttribute('aria-hidden', 'true');
  copy.removeAttribute('id');
  Object.assign(copy.style, {
    position: 'absolute',
    left: `${box.left}px`,
    top: `${box.top}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
    margin: '0',
    pointerEvents: 'none',
  });
  el.parentElement!.insertBefore(copy, el.nextSibling);
}

/**
 * The old text rises out into a blur where it was, as `enter` brings the
 * new one up out of it.
 */
function crossfade(
  el: HTMLElement,
  ghost: HTMLElement,
  from: Box,
  timing: Timing,
  enter: (options: KeyframeAnimationOptions) => {
    animation: Animation;
    stop: () => void;
  },
) {
  const parent = el.parentElement;
  if (!parent) return null;
  const release = holdPosition(parent);
  ghost.setAttribute(GHOST, '');
  place(el, ghost, from);
  const options = { duration: timing.duration, easing: timing.easing };
  const out = ghost.animate(
    [
      { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0px)' },
      {
        opacity: 0,
        filter: timing.blur,
        transform: `translateY(${-timing.shift}px)`,
      },
    ],
    { ...options, fill: 'forwards' },
  );
  const inside = enter({ ...options, fill: 'forwards' });
  const stop = () => {
    out.cancel();
    inside.stop();
    ghost.remove();
    release();
  };
  inside.animation.finished.then(stop, () => {});
  return stop;
}

/** Swaps a value's text (a select's or a combobox's) through a blur as it changes. */
function watchValueText(el: HTMLElement, timing: () => Timing) {
  let text = el.textContent ?? '';
  let copy = el.cloneNode(true) as HTMLElement;
  let box = boxOf(el);
  let stop: (() => void) | null = null;

  let frame = 0;

  /** Once a frame, before it's painted: a text changed and changed back in between doesn't swap. */
  const settle = () => {
    const next = el.textContent ?? '';
    if (next === text) return;
    stop?.();
    stop = crossfade(el, copy, box, timing(), (options) => {
      const incoming = el.cloneNode(true) as HTMLElement;
      incoming.setAttribute(INCOMING, '');
      place(el, incoming, boxOf(el));
      const { opacity } = el.style;
      el.style.opacity = '0';
      const t = timing();
      const animation = incoming.animate(
        [
          {
            opacity: 0,
            filter: t.blur,
            transform: `translateY(${t.shift}px)`,
          },
          { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0px)' },
        ],
        options,
      );
      return {
        animation,
        stop: () => {
          animation.cancel();
          incoming.remove();
          el.style.opacity = opacity;
        },
      };
    });
    text = next;
    copy = el.cloneNode(true) as HTMLElement;
    box = boxOf(el);
  };
  const observer = new MutationObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(settle);
  });
  observer.observe(el, { childList: true, subtree: true, characterData: true });
  const resize = new ResizeObserver(() => {
    box = boxOf(el);
  });
  resize.observe(el);
  return () => {
    cancelAnimationFrame(frame);
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
      const swap = useTempoTransition(() => SWAP);
      const timing = () => ({
        ...toCssTiming(swap.value),
        blur: BLUR,
        shift: SHIFT,
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
