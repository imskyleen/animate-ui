import * as React from 'react';

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
function crossfade(
  el: HTMLElement,
  ghost: HTMLElement,
  box: Box,
  timing: Timing,
  fade: (keyframes: Keyframe[]) => Animation,
) {
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
  const inside = fade([
    { opacity: 0, filter: timing.blur },
    { opacity: 1, filter: 'blur(0px)' },
  ]);
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
    stop = crossfade(el, copy, box, timing(), (keyframes) =>
      el.animate(keyframes, {
        duration: timing().duration,
        easing: timing().easing,
      }),
    );
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

  const swap = (previous: string) => {
    stop?.();
    const ghost = document.createElement('span');
    const style = getComputedStyle(input);
    for (const key of COPIED) ghost.style[key] = style[key];
    Object.assign(ghost.style, {
      display: 'flex',
      alignItems: 'center',
      whiteSpace: 'pre',
      overflow: 'hidden',
      borderStyle: 'solid',
      borderColor: 'transparent',
      background: 'transparent',
    });
    ghost.textContent = previous;
    const color = style.color;
    stop = crossfade(input, ghost, boxOf(input), timing(), (keyframes) =>
      input.animate(
        keyframes.map((_, i) => ({ color: i === 0 ? 'transparent' : color })),
        { duration: timing().duration, easing: timing().easing },
      ),
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
  const swap = useTempoTransition(motionTokens.transition.swap);
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
