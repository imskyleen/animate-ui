import * as React from 'react';

import { motionTokens, toCssTiming, useTempoTransition } from '../utils/motion';

type Timing = { duration: number; easing: string; blur: string };

const GHOST = 'data-animate-ui-value-ghost';
const INCOMING = 'data-animate-ui-value-incoming';
const SWAP = { ...motionTokens.transition.swap, duration: 0.25 };

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

function place(el: HTMLElement, span: HTMLElement, box: Box) {
  span.setAttribute('aria-hidden', 'true');
  span.removeAttribute('id');
  Object.assign(span.style, {
    position: 'absolute',
    left: `${box.left}px`,
    top: `${box.top}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
    margin: '0',
    pointerEvents: 'none',
  });
  el.parentElement!.insertBefore(span, el.nextSibling);
}

/** The old content fades out into a blur where it was, as the new one fades in out of it. */
function crossfade(
  el: HTMLElement,
  ghost: HTMLElement,
  box: Box,
  timing: Timing,
  fade: (keyframes: Keyframe[], options: KeyframeAnimationOptions) => () => void,
) {
  const parent = el.parentElement;
  if (!parent) return null;
  const release = holdPosition(parent);
  ghost.setAttribute(GHOST, '');
  place(el, ghost, box);
  const options = { duration: timing.duration, easing: timing.easing };
  const out = ghost.animate(
    [
      { opacity: 1, filter: 'blur(0px)' },
      { opacity: 0, filter: timing.blur },
    ],
    { ...options, fill: 'forwards' },
  );
  const stopInside = fade(
    [
      { opacity: 0, filter: timing.blur },
      { opacity: 1, filter: 'blur(0px)' },
    ],
    options,
  );
  const stop = () => {
    out.cancel();
    stopInside();
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
    stop = crossfade(el, copy, box, timing(), (keyframes, options) => {
      const inside = el.animate(keyframes, options);
      return () => inside.cancel();
    });
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

  /** The input's own text can't blur without its border: a copy of it does, over it. */
  const swap = (previous: string) => {
    stop?.();
    const box = boxOf(input);
    stop = crossfade(input, copyOf(previous), box, timing(), (keyframes, options) => {
      const incoming = copyOf(input.value);
      incoming.setAttribute(INCOMING, '');
      place(input, incoming, box);
      const { color, caretColor, transition } = input.style;
      input.style.transition = 'none';
      input.style.caretColor = getComputedStyle(input).color;
      input.style.color = 'transparent';
      const inside = incoming.animate(keyframes, options);
      return () => {
        inside.cancel();
        incoming.remove();
        input.style.color = color;
        input.style.caretColor = caretColor;
        void input.offsetWidth;
        input.style.transition = transition;
      };
    });
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
  timing.current = { ...toCssTiming(swap), blur: motionTokens.blur.icon };
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
