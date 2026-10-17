'use client';

import * as React from 'react';
import { animate, type Transition } from 'motion/react';

import { motionTokens, toCssTiming } from '../utils/motion';
import { glideFrom, stopGlide, whenLanded } from './glide';
import { screenScale } from './screen-scale';

const CHIP_SCALE = 0.5;
const CHIP_TRANSITION: Transition = motionTokens.spring.pop;
const CHIP_EXIT_TRANSITION: Transition = motionTokens.transition.popOut;
const REFLOW_TRANSITION: Transition = motionTokens.spring.reflow;
const PLACEHOLDER_TRANSITION: Transition = motionTokens.transition.reveal;
const PLACEHOLDER_BLUR = motionTokens.blur.icon;

const copies = new WeakSet<Element>();
const resizes = new WeakMap<Element, Animation>();
const entering = new WeakMap<HTMLElement, () => void>();

const PLACEHOLDER_ENTERING = 'data-placeholder-entering';
const PLACEHOLDER_OPACITY = '--animate-ui-placeholder-opacity';
const PLACEHOLDER_FILTER = '--animate-ui-placeholder-filter';

const REFLOW_STYLE = {
  href: 'animate-ui-reflow',
  css: `[${PLACEHOLDER_ENTERING}]::placeholder { opacity: var(${PLACEHOLDER_OPACITY}, 0) !important; filter: var(${PLACEHOLDER_FILTER}, none); }`,
};

function hasPlaceholder(item: HTMLElement) {
  const field = item as Partial<HTMLInputElement>;
  return (
    typeof field.placeholder === 'string' &&
    field.placeholder !== '' &&
    field.value === ''
  );
}

function showPlaceholder(input: HTMLElement) {
  entering.get(input)?.();
}

function enterPlaceholder(input: HTMLElement, fade: Transition) {
  showPlaceholder(input);
  const opacity = Number(getComputedStyle(input, '::placeholder').opacity);
  input.setAttribute(PLACEHOLDER_ENTERING, '');
  let fading: { stop: () => void } | null = null;
  let stopWaiting = () => {};
  const end = () => {
    stopWaiting();
    fading?.stop();
    if (entering.get(input) !== end) return;
    entering.delete(input);
    input.removeAttribute(PLACEHOLDER_ENTERING);
    input.style.removeProperty(PLACEHOLDER_OPACITY);
    input.style.removeProperty(PLACEHOLDER_FILTER);
  };
  entering.set(input, end);
  stopWaiting = whenLanded(input, () => {
    const animation = animate(
      input,
      {
        [PLACEHOLDER_OPACITY]: [0, Number.isFinite(opacity) ? opacity : 1],
        [PLACEHOLDER_FILTER]: [PLACEHOLDER_BLUR, 'blur(0px)'],
      },
      fade,
    );
    fading = animation;
    animation.then(end, end);
  });
}

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

function resize(
  container: HTMLElement,
  items: HTMLElement[],
  from: number,
  to: number,
  glide: Transition,
) {
  const start = `${cssHeight(container, from)}px`;
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

function layoutBox(element: HTMLElement): HTMLElement {
  let box = element;
  while (box.parentElement && getComputedStyle(box).display === 'contents')
    box = box.parentElement;
  return box;
}

function layoutItems(container: Element): HTMLElement[] {
  return Array.from(container.children).flatMap((child) => {
    if (!(child instanceof HTMLElement) || copies.has(child)) return [];
    return getComputedStyle(child).display === 'contents'
      ? layoutItems(child)
      : [child];
  });
}

const SHOWN_PROPERTIES = [
  'opacity',
  'transform',
  'scale',
  'translate',
  'filter',
] as const;

function copyAsShown(element: HTMLElement) {
  const copy = element.cloneNode(true) as HTMLElement;
  if (element.getAnimations().length > 0) {
    const computed = getComputedStyle(element);
    for (const property of SHOWN_PROPERTIES)
      copy.style.setProperty(property, computed.getPropertyValue(property));
  }
  return copy;
}

type Leaving = {
  element: HTMLElement;
  copy: HTMLElement;
  rect: DOMRect;
  transition: Transition;
  reduce: boolean;
};

function leaveThrough(
  container: HTMLElement,
  { copy, rect, transition, reduce }: Leaving,
) {
  copies.add(copy);
  const [sx, sy] = screenScale(container);
  for (const element of [
    copy,
    ...copy.querySelectorAll('[id], [data-testid]'),
  ]) {
    element.removeAttribute('id');
    element.removeAttribute('data-testid');
  }
  copy.removeAttribute('data-slot');
  copy.setAttribute('aria-hidden', 'true');
  copy.setAttribute('inert', '');
  copy.setAttribute('data-exiting', '');
  Object.assign(copy.style, {
    position: 'absolute',
    top: '0px',
    left: '0px',
    margin: '0px',
    boxSizing: 'border-box',
    width: `${rect.width / sx}px`,
    height: `${rect.height / sy}px`,
    pointerEvents: 'none',
  });
  container.appendChild(copy);
  const at = copy.getBoundingClientRect();
  copy.style.left = `${(rect.left - at.left) / sx}px`;
  copy.style.top = `${(rect.top - at.top) / sy}px`;
  if (typeof copy.animate !== 'function') return copy.remove();
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

type Reflow = {
  measure: () => void;
  settle: () => void;
  leave: (
    element: HTMLElement,
    transition: Transition,
    reduce: boolean,
  ) => void;
};

type ReflowOptions = {
  container: () => HTMLElement | null;
  glide: Transition;
  fade: Transition;
  reduce: boolean;
};

function createReflow(options: () => ReflowOptions): Reflow {
  let before: Map<HTMLElement, DOMRect> | null = null;
  let shown = new Set<HTMLElement>();
  let height = 0;
  let frame = 0;
  let scheduled = false;
  let leaving: Leaving[] = [];
  let target: HTMLElement | null = null;

  const measure = (container = options().container()) => {
    if (before || !container?.isConnected) return;
    target = container;
    height = container.getBoundingClientRect().height;
    const items = layoutItems(container);
    before = new Map(items.map((item) => [item, item.getBoundingClientRect()]));
    shown = new Set(
      items.filter((item) => hasPlaceholder(item) && !entering.has(item)),
    );
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
    const { glide, fade, reduce } = options();
    const items = layoutItems(container);
    for (const item of items) stopGlide(item);
    resizes.get(container)?.cancel();
    const now = container.getBoundingClientRect().height;
    const resized =
      from !== null &&
      !reduce &&
      Math.abs(now - height) > 0.5 &&
      typeof container.animate === 'function';
    const held = resized ? resize(container, items, height, now, glide) : null;
    for (const item of items) {
      const start = reduce ? undefined : from?.get(item);
      if (start) glideFrom(item, start, glide, held?.get(item));
      if (from && hasPlaceholder(item) && !shown.has(item))
        enterPlaceholder(item, fade);
      else showPlaceholder(item);
    }
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
        copy: copyAsShown(element),
        rect: element.getBoundingClientRect(),
        transition,
        reduce,
      });
      schedule();
    },
  };
}

function useReflow(options: ReflowOptions): Reflow {
  const optionsRef = React.useRef(options);
  React.useLayoutEffect(() => {
    optionsRef.current = options;
  });
  // eslint-disable-next-line react-hooks/refs
  const [reflow] = React.useState(() => createReflow(() => optionsRef.current));
  return reflow;
}

export {
  CHIP_EXIT_TRANSITION,
  CHIP_SCALE,
  CHIP_TRANSITION,
  PLACEHOLDER_TRANSITION,
  REFLOW_STYLE,
  REFLOW_TRANSITION,
  layoutBox,
  useReflow,
  type Reflow,
};
