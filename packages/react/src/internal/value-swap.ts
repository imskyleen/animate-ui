import * as React from 'react';

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

/** A list laid over its trigger (item-aligned) hides the value until it starts fading out. */
function covered(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  for (const list of document.querySelectorAll('[role="listbox"]')) {
    if (list.contains(el)) continue;
    const box = list.getBoundingClientRect();
    if (x < box.left || x > box.right || y < box.top || y > box.bottom)
      continue;
    let opacity = 1;
    for (let node: Element | null = list; node; node = node.parentElement)
      opacity *= Number(getComputedStyle(node).opacity);
    if (opacity > 0.9) return true;
  }
  return false;
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
    if (covered(el)) {
      frame = requestAnimationFrame(settle);
      return;
    }
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

const COPIED = [
  'font',
  'letterSpacing',
  'wordSpacing',
  'textTransform',
  'textAlign',
  'textIndent',
  'color',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'boxSizing',
] as const;

/** Swaps an input's text when it's set from outside (an option picked), not typed. */
function watchInputValue(input: HTMLInputElement, timing: () => Timing) {
  let stop: (() => void) | null = null;
  let waiting = 0;

  const copyOf = (text: string) => {
    const span = document.createElement('span');
    const style = getComputedStyle(input);
    for (const key of COPIED) span.style[key] = style[key];
    Object.assign(span.style, {
      display: 'flex',
      alignItems: 'center',
      whiteSpace: 'pre',
      overflow: 'hidden',
      borderStyle: 'solid',
      borderColor: 'transparent',
      background: 'transparent',
    });
    span.textContent = text;
    return span;
  };

  /**
   * The input's own text can't blur without its border: the old one leaves
   * as a copy, the new one comes in as its text's shadow, right where it is.
   */
  const swap = (previous: string) => {
    stop?.();
    stop = crossfade(
      input,
      copyOf(previous),
      boxOf(input),
      timing(),
      (options) => {
        const t = timing();
        const color = getComputedStyle(input).color;
        const radius = 2 * Number(t.blur.match(/[\d.]+/)?.[0] ?? 0);
        const { caretColor, transition } = input.style;
        const own = input.style.color;
        input.setAttribute(INCOMING, '');
        input.style.transition = 'none';
        input.style.caretColor = color;
        input.style.color = 'transparent';
        const animation = input.animate(
          [
            { textShadow: `0 ${t.shift}px ${radius}px transparent` },
            { textShadow: `0 0 0 ${color}` },
          ],
          options,
        );
        return {
          animation,
          stop: () => {
            animation.cancel();
            input.removeAttribute(INCOMING);
            input.style.color = own;
            input.style.caretColor = caretColor;
            void input.offsetWidth;
            input.style.transition = transition;
          },
        };
      },
    );
  };

  return {
    /** Call when the selection changes: the input's new text swaps in once it's set. */
    changed: () => {
      cancelAnimationFrame(waiting);
      const previous = input.value;
      let frames = 0;
      const check = () => {
        if (input.value !== previous) swap(previous);
        else if (++frames < 30) waiting = requestAnimationFrame(check);
      };
      waiting = requestAnimationFrame(check);
    },
    stop: () => {
      cancelAnimationFrame(waiting);
      stop?.();
    },
  };
}

function useSwapTiming() {
  const swap = useTempoTransition(SWAP);
  const timing = React.useRef<Timing>(null!);
  timing.current = { ...toCssTiming(swap), blur: BLUR, shift: SHIFT };
  return () => timing.current;
}

/** A ref for an element showing a value: its text swaps through a blur as it changes. */
function useValueSwap<T extends HTMLElement>(
  ref?: React.Ref<T>,
): React.RefCallback<T> {
  const timing = useSwapTiming();
  return React.useCallback(
    (node: T | null) => {
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.RefObject<T | null>).current = node;
      if (!node) return;
      return watchValueText(node, timing);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ref],
  );
}

/** Watches a combobox's input: call `changed()` when the selection changes. */
function useInputSwap() {
  const timing = useSwapTiming();
  const watcher = React.useRef<ReturnType<typeof watchInputValue> | null>(null);
  const ref = React.useCallback((node: HTMLInputElement | null) => {
    watcher.current?.stop();
    watcher.current = node ? watchInputValue(node, timing) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { ref, changed: () => watcher.current?.changed() };
}

export {
  watchValueText,
  watchInputValue,
  useValueSwap,
  useInputSwap,
  type Timing,
};
