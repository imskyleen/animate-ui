import {
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
  type InjectionKey,
  type Ref,
} from 'vue';
import type { Transition } from 'motion-v';

import { motionTokens, toCssTiming, useTempoTransition } from '../utils/motion';
import { carries, curveFrom, velocityOf, type Run } from './momentum';

class HandoffEntry {
  node: HTMLElement | null = null;
  open = false;
  openedAt = 0;
  movedOn = false;
  dropped = false;
  pending: HandoffEntry | null = null;
  readonly nested = new Set<HTMLElement>();
  private onDrop = () => {};

  attach(node: HTMLElement | null, onDrop: () => void) {
    this.node = node;
    this.onDrop = onDrop;
  }

  drop() {
    this.dropped = true;
    this.pending = null;
    for (const node of [this.node, ...this.nested]) hide(node);
    this.onDrop();
  }

  reopen() {
    if (!this.dropped) return;
    this.dropped = false;
    show(this.node);
  }

  await(source: HandoffEntry | null) {
    this.pending = source;
  }

  addNested(node: HTMLElement) {
    show(node);
    this.nested.add(node);
    return () => {
      this.nested.delete(node);
    };
  }
}

const hidden = new WeakSet<HTMLElement>();

function hide(node: HTMLElement | null) {
  if (!node) return;
  node.style.visibility = 'hidden';
  hidden.add(node);
}

function show(node: HTMLElement | null) {
  if (!node || !hidden.has(node)) return;
  node.style.visibility = '';
  hidden.delete(node);
}

class HandoffGroup {
  private entries = new Set<HandoffEntry>();
  private clock = 0;

  add(entry: HandoffEntry) {
    this.entries.add(entry);
    return () => {
      this.entries.delete(entry);
    };
  }

  setOpen(entry: HandoffEntry, open: boolean, movedOn: boolean) {
    entry.open = open;
    entry.movedOn = !open && movedOn;
    if (open) entry.openedAt = this.clock += 1;
  }

  source(self: HandoffEntry) {
    let source: HandoffEntry | null = null;
    for (const entry of this.entries) {
      if (entry === self || entry.dropped) continue;
      if (!entry.open && !(entry.movedOn && isShown(entry.node))) continue;
      if (!entry.node?.isConnected) continue;
      if (!source || entry.openedAt > source.openedAt) source = entry;
    }
    const skipped: HandoffEntry[] = [];
    while (
      source?.pending &&
      !source.pending.dropped &&
      source.pending.node?.isConnected
    ) {
      skipped.push(source);
      source = source.pending;
    }
    return source ? { entry: source, skipped } : null;
  }
}

function isShown(node: HTMLElement | null) {
  if (!node?.isConnected) return false;
  const style = getComputedStyle(node);
  return style.visibility !== 'hidden' && Number(style.opacity) > 0.02;
}

function canAnimate() {
  return (
    typeof Element !== 'undefined' &&
    typeof Element.prototype.animate === 'function' &&
    typeof Element.prototype.getAnimations === 'function'
  );
}

const MenuHandoffKey: InjectionKey<HandoffGroup> = Symbol(
  'AnimateUIMenuHandoff',
);

const HandoffNestedKey: InjectionKey<HandoffEntry | null> = Symbol(
  'AnimateUIHandoffNested',
);

/** The menus of a menubar: one popover handed from menu to menu. */
function provideHandoffGroup(): HandoffGroup {
  const group = new HandoffGroup();
  provide(MenuHandoffKey, group);
  return group;
}

/** A submenu hides along with the menu it's nested in when that one is dropped. */
function useHandoffNested(node: Ref<HTMLElement | null>, nested: boolean) {
  const parent = inject(HandoffNestedKey, null);
  if (!nested || !parent) return;
  let remove: (() => void) | undefined;
  watch(
    node,
    (el) => {
      remove?.();
      remove = el ? parent.addNested(el) : undefined;
    },
    { immediate: true, flush: 'post' },
  );
  onBeforeUnmount(() => remove?.());
}

type Opening = {
  open: boolean;
  source: HandoffEntry | null;
  skipped: HandoffEntry[];
  opacity: number;
};

const UNIQUE_ATTRIBUTES = [
  'id',
  'data-testid',
  'tabindex',
  'autofocus',
  'data-reka-collection-item',
];

const ANIMATED_PROPERTIES = [
  'opacity',
  'transform',
  'translate',
  'scale',
  'rotate',
  'filter',
  'clip-path',
] as const;

const SKIP = 'data-animate-ui-handoff-skip';

const LAYER = 'data-animate-ui-handoff';

type Layer = {
  menu: string | null;
  to: [number, number];
  fade: Animation | null;
};

const layers = new WeakMap<HTMLElement, Layer>();

const menuOf = (popover: HTMLElement) =>
  popover.id || popover.getAttribute('aria-labelledby') || null;

function translationOf(style: CSSStyleDeclaration): [number, number] {
  const match = style.transform.match(/^matrix\(([^)]+)\)$/);
  if (!match) return [0, 0];
  const values = match[1]!.split(',').map(Number);
  return [values[4] ?? 0, values[5] ?? 0];
}

type ContentCopy = {
  element: HTMLElement;
  menu: string | null;
  left: number;
  top: number;
  scrolls: [Element, number, number][];
};

function freeze(
  original: Element,
  copy: Element,
  scrolls: ContentCopy['scrolls'],
) {
  const style = (copy as Partial<ElementCSSInlineStyle>).style;
  if (style && original.getAnimations().length > 0) {
    const computed = getComputedStyle(original);
    for (const property of ANIMATED_PROPERTIES)
      style.setProperty(property, computed.getPropertyValue(property));
  }
  if (original.scrollTop || original.scrollLeft)
    scrolls.push([copy, original.scrollTop, original.scrollLeft]);
  for (let i = 0; i < original.children.length; i++) {
    const child = copy.children[i];
    if (child) freeze(original.children[i]!, child, scrolls);
  }
}

function copyContent(popover: HTMLElement, nested: Set<HTMLElement>) {
  const computed = getComputedStyle(popover);
  const element = popover.ownerDocument.createElement('div');
  element.setAttribute('aria-hidden', 'true');
  element.setAttribute('inert', '');
  element.setAttribute(LAYER, '');
  Object.assign(element.style, {
    position: 'absolute',
    margin: '0px',
    boxSizing: 'border-box',
    width: `${popover.clientWidth}px`,
    height: `${popover.clientHeight}px`,
    overflow: 'hidden',
    pointerEvents: 'none',
    padding: computed.padding,
    display: computed.display === 'inline' ? 'block' : computed.display,
    flexDirection: computed.flexDirection,
    flexWrap: computed.flexWrap,
    alignItems: computed.alignItems,
    justifyContent: computed.justifyContent,
    gap: computed.gap,
    gridTemplateColumns: computed.gridTemplateColumns,
    gridTemplateRows: computed.gridTemplateRows,
  });
  const skipped: Element[] = [];
  for (const node of nested) {
    if (!popover.contains(node)) continue;
    const top = node.closest('[data-reka-popper-content-wrapper]') ?? node;
    if (popover.contains(top) && top !== popover) {
      top.setAttribute(SKIP, '');
      skipped.push(top);
    }
  }
  const scrolls: ContentCopy['scrolls'] = [];
  if (popover.scrollTop || popover.scrollLeft)
    scrolls.push([element, popover.scrollTop, popover.scrollLeft]);
  for (const node of Array.from(popover.childNodes)) {
    if (
      node instanceof Element &&
      (node.hasAttribute(LAYER) || node.hasAttribute(SKIP))
    )
      continue;
    const copy = node.cloneNode(true);
    if (node instanceof Element && copy instanceof Element) {
      freeze(node, copy, scrolls);
      for (const element of [copy, ...copy.querySelectorAll('*')])
        for (const name of UNIQUE_ATTRIBUTES) element.removeAttribute(name);
      for (const element of copy.querySelectorAll(`[${SKIP}]`))
        element.remove();
    }
    element.appendChild(copy);
  }
  for (const node of skipped) node.removeAttribute(SKIP);
  return {
    element,
    menu: menuOf(popover),
    left: popover.clientLeft,
    top: popover.clientTop,
    scrolls,
  } satisfies ContentCopy;
}

type Leaving = {
  element: HTMLElement;
  menu: string | null;
  box: DOMRect;
  opacity: number;
  slide: [number, number];
  to: [number, number];
};

function leavingIn(popover: HTMLElement): Leaving[] {
  const found: Leaving[] = [];
  for (const element of Array.from(popover.children)) {
    if (!(element instanceof HTMLElement) || !element.hasAttribute(LAYER))
      continue;
    const style = getComputedStyle(element);
    const layer = layers.get(element);
    found.push({
      element,
      menu: layer?.menu ?? null,
      box: element.getBoundingClientRect(),
      opacity: Number(style.opacity),
      slide: translationOf(style),
      to: layer?.to ?? [0, 0],
    });
  }
  return found;
}

type HandoffTimings = {
  move: Transition;
  velocity?: number[];
  since?: number | null;
  out: Transition;
  fadeIn: Transition;
  slideIn: Transition;
};

const running = new WeakMap<HTMLElement, Animation[]>();
const moving = new WeakMap<HTMLElement, { run: Run; animation: Animation }>();

function velocityOfPopover(popover: HTMLElement) {
  const move = moving.get(popover);
  const time = move?.animation.currentTime;
  if (!move || typeof time !== 'number') return [0, 0, 0, 0];
  return velocityOf(move.run, time);
}
const positioned = new WeakSet<HTMLElement>();

function release(popover: HTMLElement) {
  if (!positioned.has(popover) || popover.querySelector(`:scope > [${LAYER}]`))
    return;
  positioned.delete(popover);
  popover.style.position = '';
}

function handOver(
  popover: HTMLElement,
  from: DOMRect,
  previous: ContentCopy,
  leaving: Leaving[],
  timings: HandoffTimings,
) {
  for (const animation of running.get(popover) ?? []) animation.cancel();
  for (const copy of popover.querySelectorAll(`:scope > [${LAYER}]`))
    copy.remove();
  const animations: Animation[] = [];
  running.set(popover, animations);
  const animate = (
    element: Element,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions,
  ) => {
    const animation = element.animate(keyframes, options);
    animations.push(animation);
    return animation;
  };

  const transform = popover.style.transform;
  popover.style.transform = 'none';
  const to = popover.getBoundingClientRect();
  popover.style.transform = transform;
  const computed = getComputedStyle(popover);
  const items = Array.from(popover.children).filter(
    (item) => !item.hasAttribute(LAYER),
  );

  const shift = motionTokens.shift.handoff;
  const x = from.left - to.left;
  const y = from.top - to.top;
  const offset = [x, y, from.width - to.width, from.height - to.height];
  const curve = curveFrom(
    timings.move,
    offset,
    timings.velocity ?? [0, 0, 0, 0],
  );
  const move = { duration: curve.duration, easing: curve.easing };
  const horizontal = Math.abs(x) >= Math.abs(y);
  const way = -Math.sign(horizontal ? x : y);
  const along = (distance: number): [number, number] =>
    horizontal ? [distance, 0] : [0, distance];

  const menu = menuOf(popover);
  const back = menu
    ? leaving.find((layer) => layer.menu === menu && layer.opacity > 0.02)
    : undefined;
  let enter: { slide: [number, number]; shown: number } = {
    slide: along(way * shift),
    shown: 0,
  };
  const first = items[0];
  const theirs = back?.element.firstElementChild;
  if (back && first && theirs) {
    const own = first.getBoundingClientRect();
    const box = theirs.getBoundingClientRect();
    const rest = Number(getComputedStyle(first).opacity) || 1;
    enter = {
      slide: [box.left - own.left, box.top - own.top],
      shown: Math.min(
        1,
        (back.opacity * Number(getComputedStyle(theirs).opacity)) / rest,
      ),
    };
  }

  const marginRight = parseFloat(computed.marginRight) || 0;
  const marginBottom = parseFloat(computed.marginBottom) || 0;
  const sizing = {
    boxSizing: 'border-box',
    minWidth: '0px',
    maxWidth: 'none',
    minHeight: '0px',
    maxHeight: 'none',
  };
  const moved: Animation[] = [];
  const resize = animate(
    popover,
    [
      {
        ...sizing,
        width: `${from.width}px`,
        height: `${from.height}px`,
        marginRight: `${marginRight + to.width - from.width}px`,
        marginBottom: `${marginBottom + to.height - from.height}px`,
      },
      {
        ...sizing,
        width: `${to.width}px`,
        height: `${to.height}px`,
        marginRight: `${marginRight}px`,
        marginBottom: `${marginBottom}px`,
      },
    ],
    move,
  );
  moving.set(popover, { run: { offset, curve }, animation: resize });
  moved.push(resize);
  const moves = Math.abs(x) >= 0.5 || Math.abs(y) >= 0.5;
  if (moves) {
    const translate = animate(
      popover,
      [{ translate: `${x}px ${y}px` }, { translate: '0px 0px' }],
      {
        ...move,
        composite: 'add',
      },
    );
    moved.push(translate);
  }
  const fadeIn = toCssTiming(timings.fadeIn);
  const slideIn = toCssTiming(timings.slideIn);
  const out = toCssTiming(timings.out);
  const clip = { overflow: 'hidden', whiteSpace: 'nowrap' };
  animate(popover, [clip, clip], {
    duration: Math.max(move.duration, out.duration, fadeIn.duration),
  });

  const [slideX, slideY] = enter.slide;
  const slides = Math.abs(slideX) >= 0.5 || Math.abs(slideY) >= 0.5;
  for (const item of items) {
    const rest = getComputedStyle(item).opacity;
    animate(
      item,
      [{ opacity: Number(rest) * enter.shown }, { opacity: rest }],
      fadeIn,
    );
    if (moves)
      moved.push(
        animate(
          item,
          [{ translate: `${-x}px ${-y}px` }, { translate: '0px 0px' }],
          {
            ...move,
            composite: 'add',
          },
        ),
      );
    if (slides)
      animate(
        item,
        [{ translate: `${slideX}px ${slideY}px` }, { translate: '0px 0px' }],
        {
          ...slideIn,
          composite: 'add',
        },
      );
  }

  if (computed.position === 'static' || positioned.has(popover)) {
    positioned.add(popover);
    popover.style.position = 'relative';
  }
  const originLeft = from.left + popover.clientLeft;
  const originTop = from.top + popover.clientTop;
  const leave = (
    element: HTMLElement,
    {
      menu: layerMenu,
      left,
      top,
      opacity,
      slide,
      to: slideTo,
    }: {
      menu: string | null;
      left: number;
      top: number;
      opacity: number;
      slide: [number, number];
      to: [number, number];
    },
  ) => {
    for (const animation of element.getAnimations()) animation.cancel();
    element.style.left = `${left - originLeft}px`;
    element.style.top = `${top - originTop}px`;
    popover.appendChild(element);
    if (moves)
      moved.push(
        element.animate(
          [{ translate: '0px 0px' }, { translate: `${x}px ${y}px` }],
          { ...move, composite: 'add', fill: 'forwards' },
        ),
      );
    if (slide[0] !== slideTo[0] || slide[1] !== slideTo[1])
      element.animate(
        [
          { transform: `translate(${slide[0]}px, ${slide[1]}px)` },
          { transform: `translate(${slideTo[0]}px, ${slideTo[1]}px)` },
        ],
        { ...out, composite: 'add', fill: 'forwards' },
      );
    const fade = element.animate([{ opacity }, { opacity: 0 }], {
      ...out,
      fill: 'forwards',
    });
    const layer: Layer = { menu: layerMenu, to: slideTo, fade };
    layers.set(element, layer);
    const remove = () => {
      if (layers.get(element)?.fade !== fade) return;
      element.remove();
      release(popover);
    };
    fade.finished.then(remove, remove);
  };

  for (const layer of leaving) {
    if (layer === back) {
      layers.delete(layer.element);
      layer.element.remove();
      continue;
    }
    if (layer.opacity <= 0.02) continue;
    leave(layer.element, {
      menu: layer.menu,
      left: layer.box.left - layer.slide[0],
      top: layer.box.top - layer.slide[1],
      opacity: layer.opacity,
      slide: layer.slide,
      to: layer.to,
    });
  }

  const copy = previous.element;
  leave(copy, {
    menu: previous.menu,
    left: from.left + previous.left,
    top: from.top + previous.top,
    opacity: 1,
    slide: [0, 0],
    to: along(-way * shift),
  });
  for (const [element, top, left] of previous.scrolls) {
    element.scrollTop = top;
    element.scrollLeft = left;
  }

  const timeline = popover.ownerDocument.timeline;
  const now = timeline.currentTime;
  if (
    carries(curve, offset) &&
    typeof now === 'number' &&
    typeof timings.since === 'number'
  ) {
    const since = Math.max(timings.since, now - move.duration);
    for (const animation of moved) animation.startTime = since;
    return;
  }
  for (const animation of moved) animation.pause();
  requestAnimationFrame(() => {
    const start = timeline.currentTime;
    for (const animation of moved)
      if (animation.playState === 'paused') animation.startTime = start;
  });
}

type HandoffOptions = {
  node: Ref<HTMLElement | null>;
  open: () => boolean;
  movedOn?: () => boolean;
  transition: () => Transition;
  reduce: () => boolean;
  onDrop?: () => void;
};

type Handoff = {
  from: Ref<{ opacity: number } | null>;
  dropped: Ref<boolean>;
  entry: HandoffEntry;
};

function isInstant(transition: Transition) {
  return toCssTiming(transition).duration === 0;
}

/**
 * A menubar menu's popover: opened while another menu's is showing, it takes
 * over that one's place and size, and morphs to its own while the old
 * content fades out of it.
 */
function useMenuHandoff(
  group: HandoffGroup | null,
  {
    node,
    open,
    movedOn = () => false,
    transition,
    reduce,
    onDrop,
  }: HandoffOptions,
): Handoff {
  const entry = new HandoffEntry();
  const enabled = () => group !== null && !reduce() && canAnimate();
  const take = (isOpen: boolean): Opening => {
    const found = isOpen && enabled() ? group!.source(entry) : null;
    return {
      open: isOpen,
      source: found?.entry ?? null,
      skipped: found?.skipped ?? [],
      opacity: found?.entry.node
        ? Number(getComputedStyle(found.entry.node).opacity)
        : 1,
    };
  };
  let opening = take(open());
  const from = ref<{ opacity: number } | null>(
    opening.source ? { opacity: opening.opacity } : null,
  );
  const dropped = ref(false);
  const out = useTempoTransition(() => motionTokens.transition.handoffOut);
  const fadeIn = useTempoTransition(() => motionTokens.transition.handoffIn);
  const slideIn = useTempoTransition(() => motionTokens.spring.handoff);
  const timings = (): HandoffTimings => ({
    move: transition(),
    out: out.value,
    fadeIn: fadeIn.value,
    slideIn: slideIn.value,
  });

  watch(
    open,
    (isOpen) => {
      opening = take(isOpen);
      from.value = opening.source ? { opacity: opening.opacity } : null;
      if (isOpen) dropped.value = false;
    },
    { flush: 'sync' },
  );

  watch(
    node,
    (el) =>
      entry.attach(el, () => {
        dropped.value = true;
        onDrop?.();
      }),
    { immediate: true },
  );
  if (group) onBeforeUnmount(group.add(entry));
  watch(
    () => [open(), movedOn()] as const,
    ([isOpen, moved]) => group?.setOpen(entry, isOpen, moved),
    // After the render, as the next menu's popover reads it while rendering.
    { immediate: true, flush: 'post' },
  );

  let stop: (() => void) | undefined;
  const begin = () => {
    stop?.();
    stop = undefined;
    const el = node.value;
    if (!opening.open || !el) return;
    entry.reopen();
    const source = opening.source;
    if (!source?.node) return;
    entry.await(source);
    const skipped = opening.skipped;
    const fromBox = source.node.getBoundingClientRect();
    const velocity = velocityOfPopover(source.node);
    const since = source.node.ownerDocument.timeline.currentTime;
    const previous = isInstant(transition())
      ? null
      : copyContent(source.node, source.nested);
    let swapped = false;
    const swap = () => {
      if (swapped) return;
      swapped = true;
      stop?.();
      entry.await(null);
      const leaving = previous && source.node ? leavingIn(source.node) : [];
      for (const other of skipped) other.drop();
      source.drop();
      if (el.isConnected && previous)
        handOver(el, fromBox, previous, leaving, {
          ...timings(),
          velocity,
          since: typeof since === 'number' ? since : null,
        });
      if (source.node) release(source.node);
    };
    const observer =
      typeof ResizeObserver === 'function' ? new ResizeObserver(swap) : null;
    observer?.observe(el);
    const frame = requestAnimationFrame(swap);
    stop = () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  };
  onMounted(begin);
  watch(open, (isOpen) => isOpen && begin(), { flush: 'post' });
  onBeforeUnmount(() => stop?.());

  return { from, dropped, entry };
}

function takeOver(
  from: { opacity: number },
  transition: Transition,
): { opacity: number[]; scale: number; transition: Transition } {
  return {
    opacity: [from.opacity, 1],
    scale: 1,
    transition: { ...transition, scale: { duration: 0 } },
  };
}

export {
  freeze,
  release,
  layers,
  positioned,
  LAYER,
  UNIQUE_ATTRIBUTES,
  type Layer,
  HandoffNestedKey,
  MenuHandoffKey,
  takeOver,
  provideHandoffGroup,
  useHandoffNested,
  useMenuHandoff,
  type HandoffGroup,
  type HandoffEntry,
};
