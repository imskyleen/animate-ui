'use client';

import * as React from 'react';
import type { Transition } from 'motion/react';

import { motionTokens, toCssTiming, useTempoTransition } from '../utils/motion';

// A menubar's popover, handed from one menu to the next. Moving from an open
// menu to another (hovering the next trigger, clicking or tapping it, or the
// arrow keys), the next menu doesn't pop up on its own while the previous one
// fades out in place: it takes the previous one's popover over, which moves
// from where it was on screen to its own place, resizing on the way. The
// content changes like Motion's mega menu
// (motion.dev/ui/sections/react-nav-mega-menu): it stays where it is on
// screen while the popover slides over it, the previous menu's items leaving
// 6px away from where the popover goes (going to Edit from File, they leave
// to the left) while they fade out, the next menu's arriving 6px from there
// (from the right) and fading in behind them.
//
// - One popover on screen: the previous menu is hidden in the frame the next
//   one shows, with its open submenus. A copy of its items (aria-hidden,
//   inert) leaves inside the next menu's popover, clipped by it.
// - The popover that moves is the next menu itself, interactive from its
//   first frame: Web Animations move it (`translate`, added to its own) and
//   resize it (`width`/`height`, its margins making up the difference so the
//   library never sees its size change and places it once); it's never
//   scaled, so its items keep their size, and nothing is left on it once it
//   has landed. Its items and the copy are moved back by as much as it moves
//   (the same timing), so they stay where they are on screen.
// - Moving on again before it landed, the popover leaves from where it is,
//   with what it shows. A menu that opened and closed before it was shown
//   passes on the popover it was to take over.

/** A menu's popover, as its menubar knows it. */
class HandoffEntry {
  /** The popover, once mounted. */
  node: HTMLElement | null = null;
  /**
   * Open as of the last commit. Written in a passive effect: a menu opening
   * in the same commit as another one closes still sees it open.
   */
  open = false;
  /** When it last opened: the latest one open hands its popover over. */
  openedAt = 0;
  /**
   * It closed because the user moved on to another menu of the bar, which
   * opens next (Base UI closes one before it opens the other, on the arrow
   * keys or a tap): it hands its popover over while it's still leaving.
   */
  movedOn = false;
  /** Another menu took its popover over: it's hidden, and goes at once. */
  dropped = false;
  /**
   * The menu whose popover it takes over, until its handoff has run (the
   * next frame): until then, that one is the popover on screen.
   */
  pending: HandoffEntry | null = null;
  /** Its open submenus' popovers: they go with it. */
  readonly nested = new Set<HTMLElement>();
  private onDrop = () => {};

  attach(node: HTMLElement | null, onDrop: () => void) {
    this.node = node;
    this.onDrop = onDrop;
  }

  /** Hides it at once, with its submenus: the next menu shows instead. */
  drop() {
    this.dropped = true;
    this.pending = null;
    // Hidden in the frame the next popover shows: setting state would land
    // too late.
    for (const node of [this.node, ...this.nested]) hide(node);
    this.onDrop();
  }

  /** Opened again after it was dropped (a kept-mounted menu). */
  reopen() {
    if (!this.dropped) return;
    this.dropped = false;
    show(this.node);
  }

  /** It takes `source`'s popover over in the next frame (null: it did). */
  await(source: HandoffEntry | null) {
    this.pending = source;
  }

  /** A submenu's popover, while it's mounted. */
  addNested(node: HTMLElement) {
    show(node);
    this.nested.add(node);
    return () => {
      this.nested.delete(node);
    };
  }
}

/** Popovers a handoff hid (it shows them again when they open again). */
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

/** A menubar's menus. */
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

  /**
   * The menu whose popover `self`, opening, takes over: the one open, or the
   * one the user just moved on from, still leaving. Menus between them that
   * were never shown are passed (`skipped`): they go too.
   */
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

/** Still on screen (a popover leaving). */
function isShown(node: HTMLElement | null) {
  if (!node?.isConnected) return false;
  const style = getComputedStyle(node);
  return style.visibility !== 'hidden' && Number(style.opacity) > 0.02;
}

/** Web Animations: without them (a test DOM), menus open on their own. */
function canAnimate() {
  return (
    typeof Element !== 'undefined' &&
    typeof Element.prototype.animate === 'function' &&
    typeof Element.prototype.getAnimations === 'function'
  );
}

/** The menubar whose menus hand their popover over (null: none). */
const MenuHandoffContext = React.createContext<HandoffGroup | null>(null);

/** The menubar's menu whose submenus go with its popover (null: none). */
const HandoffNestedContext = React.createContext<HandoffEntry | null>(null);

/** For a menubar: its menus hand their popover over. */
function useHandoffGroup(): HandoffGroup {
  const [group] = React.useState(() => new HandoffGroup());
  return group;
}

/**
 * A submenu of a menubar's menu: hidden with it when the next menu takes
 * its popover over.
 */
function useHandoffNested(
  nodeRef: React.RefObject<HTMLElement | null>,
  nested: boolean,
) {
  const parent = React.use(HandoffNestedContext);
  React.useLayoutEffect(() => {
    const node = nodeRef.current;
    if (!nested || !parent || !node) return;
    return parent.addNested(node);
  }, [nested, parent, nodeRef]);
}

type Opening = {
  open: boolean;
  source: HandoffEntry | null;
  /** Never shown menus between it and the source: they go with it. */
  skipped: HandoffEntry[];
  /** The source popover's opacity when this one opened. */
  opacity: number;
};

/** Attributes a copy must not repeat (ids, test ids, focus, collections). */
const UNIQUE_ATTRIBUTES = [
  'id',
  'data-testid',
  'tabindex',
  'autofocus',
  'data-radix-collection-item',
];

/** What Web Animations may be moving on an element: frozen on its copy. */
const ANIMATED_PROPERTIES = [
  'opacity',
  'transform',
  'translate',
  'scale',
  'rotate',
  'filter',
  'clip-path',
] as const;

/** Marks a submenu inside the popover: its copy leaves it out. */
const SKIP = 'data-animate-ui-handoff-skip';

/**
 * A copy of the popover's content as it shows right now, laid out the way it
 * was: running animations (a check drawing itself, items still fading in)
 * frozen where they are, scrolled the way it was.
 */
type ContentCopy = {
  element: HTMLElement;
  /** Its offset in the popover: the popover's border. */
  left: number;
  top: number;
  /** Elements to scroll back, once it's in the page. */
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
  element.setAttribute('data-animate-ui-handoff', '');
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
  // Submenus rendered inside it (Radix's) go with it, not with the copy.
  const skipped: Element[] = [];
  for (const node of nested) {
    if (!popover.contains(node)) continue;
    const top = node.closest('[data-radix-popper-content-wrapper]') ?? node;
    if (popover.contains(top) && top !== popover) {
      top.setAttribute(SKIP, '');
      skipped.push(top);
    }
  }
  const scrolls: ContentCopy['scrolls'] = [];
  if (popover.scrollTop || popover.scrollLeft)
    scrolls.push([element, popover.scrollTop, popover.scrollLeft]);
  for (const node of Array.from(popover.childNodes)) {
    // A copy still leaving from an earlier handoff, once it's out of sight.
    if (
      node instanceof HTMLElement &&
      node.hasAttribute('data-animate-ui-handoff') &&
      Number(getComputedStyle(node).opacity) < 0.05
    )
      continue;
    if (node instanceof Element && node.hasAttribute(SKIP)) continue;
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
    left: popover.clientLeft,
    top: popover.clientTop,
    scrolls,
  } satisfies ContentCopy;
}

type HandoffTimings = {
  /** The popover moving and resizing: the menu's own transition. */
  move: Transition;
  /** The previous content leaving. */
  out: Transition;
  /** The next content fading in. */
  fadeIn: Transition;
  /** The next content sliding in. */
  slideIn: Transition;
};

/** The handoff's animations running on a popover, by popover. */
const running = new WeakMap<HTMLElement, Animation[]>();
/** Copies leaving inside a popover that made it `position: relative`. */
const positioned = new WeakMap<HTMLElement, number>();

/**
 * Moves the popover from `from` (the previous one, on screen) to where it
 * rests, resizing it on the way, and swaps the content in place on screen:
 * the previous one's copy leaves, the popover's own items come in.
 */
function handOver(
  popover: HTMLElement,
  from: DOMRect,
  previous: ContentCopy,
  timings: HandoffTimings,
) {
  // An earlier handoff to this popover (taken over again before it landed):
  // it starts over from where it is.
  for (const animation of running.get(popover) ?? []) animation.cancel();
  for (const copy of popover.querySelectorAll(
    ':scope > [data-animate-ui-handoff]',
  ))
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

  // Where it rests, at its size: without a transform Motion may still have on
  // it (a kept-mounted menu at its closed scale).
  const transform = popover.style.transform;
  popover.style.transform = 'none';
  const to = popover.getBoundingClientRect();
  popover.style.transform = transform;
  const computed = getComputedStyle(popover);

  const move = toCssTiming(timings.move);
  const shift = motionTokens.shift.handoff;
  // Where the popover goes (`way`): the next content arrives from that side,
  // the previous one leaves to the other.
  const x = from.left - to.left;
  const y = from.top - to.top;
  const horizontal = Math.abs(x) >= Math.abs(y);
  const way = -Math.sign(horizontal ? x : y);
  const offset = (distance: number) =>
    horizontal ? `${distance}px 0px` : `0px ${distance}px`;

  // Its size for the way. Its margins make up the difference, so the box the
  // library places stays at its rest size (it would place it again on every
  // frame, wherever its place depends on its size: above its trigger, aligned
  // to its end or center, shifted from an edge). Its items stay on one line
  // (they don't wrap while it's narrower than they need).
  const marginRight = parseFloat(computed.marginRight) || 0;
  const marginBottom = parseFloat(computed.marginBottom) || 0;
  const sizing = {
    boxSizing: 'border-box',
    minWidth: '0px',
    maxWidth: 'none',
    minHeight: '0px',
    maxHeight: 'none',
  };
  animate(
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
  const moves = Math.abs(x) >= 0.5 || Math.abs(y) >= 0.5;
  if (moves) {
    animate(
      popover,
      [{ translate: `${x}px ${y}px` }, { translate: '0px 0px' }],
      {
        ...move,
        composite: 'add',
      },
    );
  }
  // What it doesn't show yet is clipped, while either content moves.
  const fadeIn = toCssTiming(timings.fadeIn);
  const slideIn = toCssTiming(timings.slideIn);
  const out = toCssTiming(timings.out);
  const clip = { overflow: 'hidden', whiteSpace: 'nowrap' };
  animate(popover, [clip, clip], {
    duration: Math.max(move.duration, out.duration, fadeIn.duration),
  });

  // Its own items stay where they rest on screen while it moves over them
  // (moved back by as much as it moves), and come in from the way it goes.
  for (const item of Array.from(popover.children)) {
    if (item.hasAttribute('data-animate-ui-handoff')) continue;
    animate(
      item,
      [{ opacity: 0 }, { opacity: getComputedStyle(item).opacity }],
      fadeIn,
    );
    if (moves)
      animate(
        item,
        [{ translate: `${-x}px ${-y}px` }, { translate: '0px 0px' }],
        {
          ...move,
          composite: 'add',
        },
      );
    if (way)
      animate(
        item,
        [{ translate: offset(way * shift) }, { translate: '0px 0px' }],
        {
          ...slideIn,
          composite: 'add',
        },
      );
  }

  // The previous content leaves where it was on screen, the other way,
  // inside the popover (its containing block: it's clipped by it).
  if (computed.position === 'static' || positioned.has(popover)) {
    positioned.set(popover, (positioned.get(popover) ?? 0) + 1);
    popover.style.position = 'relative';
  }
  const copy = previous.element;
  copy.style.left = `${previous.left - popover.clientLeft}px`;
  copy.style.top = `${previous.top - popover.clientTop}px`;
  popover.appendChild(copy);
  for (const [element, top, left] of previous.scrolls) {
    element.scrollTop = top;
    element.scrollLeft = left;
  }
  if (moves)
    animate(copy, [{ translate: '0px 0px' }, { translate: `${x}px ${y}px` }], {
      ...move,
      composite: 'add',
      fill: 'forwards',
    });
  if (way)
    animate(
      copy,
      [{ translate: '0px 0px' }, { translate: offset(-way * shift) }],
      { ...out, composite: 'add', fill: 'forwards' },
    );
  const leave = animate(copy, [{ opacity: 1 }, { opacity: 0 }], {
    ...out,
    fill: 'forwards',
  });
  const remove = () => {
    copy.remove();
    const count = positioned.get(popover);
    if (count === undefined) return;
    if (count > 1) positioned.set(popover, count - 1);
    else {
      positioned.delete(popover);
      popover.style.position = '';
    }
  };
  leave.finished.then(remove, remove);
}

type HandoffOptions = {
  /** The menu's popover. */
  nodeRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  /**
   * It closed because the user moved on to another menu of the bar (Base
   * UI's reasons): the next one may open after it closed.
   */
  movedOn?: boolean;
  /** The menu's own transition: the popover moves and resizes on it. */
  transition: Transition;
  reduce: boolean;
  /**
   * Another menu took its popover over: make it leave at once (it's hidden
   * already).
   */
  onDrop?: () => void;
};

type Handoff = {
  /**
   * It opened by taking over another menu's popover, which showed at this
   * opacity: it starts from there, without its entrance.
   */
  from: { opacity: number } | null;
  /** Another menu took its popover over: it leaves at once, unseen. */
  dropped: boolean;
  /** For its submenus: they go with it (`HandoffNestedContext`). */
  entry: HandoffEntry;
};

/** The duration of a Motion transition (0: the menu moves at once). */
function isInstant(transition: Transition) {
  return toCssTiming(transition).duration === 0;
}

/**
 * A menu of a menubar (`group`, null for any other menu): it opens by taking
 * over the popover of the menu open before it, and hands its own over to the
 * next one.
 */
function useMenuHandoff(
  group: HandoffGroup | null,
  {
    nodeRef,
    open,
    movedOn = false,
    transition,
    reduce,
    onDrop,
  }: HandoffOptions,
): Handoff {
  const [entry] = React.useState(() => new HandoffEntry());
  // Under reduced motion each menu fades on its own, in place.
  const enabled = group !== null && !reduce && canAnimate();
  const take = (): Opening => {
    const found = open && enabled ? group.source(entry) : null;
    return {
      open,
      source: found?.entry ?? null,
      skipped: found?.skipped ?? [],
      opacity: found?.entry.node
        ? Number(getComputedStyle(found.entry.node).opacity)
        : 1,
    };
  };
  const [opening, setOpening] = React.useState(take);
  const [dropped, setDropped] = React.useState(false);
  if (opening.open !== open) {
    setOpening(take());
    if (open) setDropped(false);
  }

  const out = useTempoTransition(motionTokens.transition.handoffOut);
  const fadeIn = useTempoTransition(motionTokens.transition.handoffIn);
  const slideIn = useTempoTransition(motionTokens.spring.handoff);
  const timingsRef = React.useRef<HandoffTimings>({
    move: transition,
    out,
    fadeIn,
    slideIn,
  });
  const onDropRef = React.useRef(onDrop);
  React.useLayoutEffect(() => {
    timingsRef.current = { move: transition, out, fadeIn, slideIn };
    onDropRef.current = onDrop;
    entry.attach(nodeRef.current, () => {
      setDropped(true);
      onDropRef.current?.();
    });
  });

  React.useLayoutEffect(() => group?.add(entry), [group, entry]);

  // Read by the next menu opening: after this commit's layout effects.
  React.useEffect(() => {
    group?.setOpen(entry, open, movedOn);
  }, [entry, group, open, movedOn]);

  React.useLayoutEffect(() => {
    const node = nodeRef.current;
    if (!opening.open || !node) return;
    entry.reopen();
    const source = opening.source;
    if (!source?.node) return;
    entry.await(source);
    const skipped = opening.skipped;
    // Read now, before the source changes: where it is, what it shows.
    const from = source.node.getBoundingClientRect();
    const instant = isInstant(timingsRef.current.move);
    const previous = instant ? null : copyContent(source.node, source.nested);
    // Floating UI places the popover asynchronously, before the frame is
    // rendered: both popovers swap then, before it's painted. A resize
    // observer reports a new element in that frame's rendering, after layout,
    // even when it opened during the frame's own callbacks (Base UI opens a
    // pressed menu in an animation frame); the frame callback is the fallback.
    let swapped = false;
    const swap = () => {
      if (swapped) return;
      swapped = true;
      stop();
      entry.await(null);
      for (const other of skipped) other.drop();
      source.drop();
      if (node.isConnected && previous)
        handOver(node, from, previous, timingsRef.current);
    };
    const observer =
      typeof ResizeObserver === 'function' ? new ResizeObserver(swap) : null;
    observer?.observe(node);
    const frame = requestAnimationFrame(swap);
    const stop = () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
    // Not run (it closed before its frame): the popover on screen is still
    // the source's, passed on to the next menu opening (`pending`).
    return stop;
  }, [opening, entry, nodeRef]);

  return {
    from: opening.source ? { opacity: opening.opacity } : null,
    dropped,
    entry,
  };
}

/**
 * The opening of a menu that took another one's popover over: no entrance,
 * it shows at once as that one did (its opacity, unscaled), even when it was
 * still leaving itself, and becomes fully opaque on its transition.
 */
function takeOver(from: { opacity: number }, transition: Transition) {
  return {
    opacity: [from.opacity, 1],
    scale: 1,
    transition: { ...transition, scale: { duration: 0 } },
  };
}

export {
  HandoffNestedContext,
  MenuHandoffContext,
  takeOver,
  useHandoffGroup,
  useHandoffNested,
  useMenuHandoff,
  type HandoffGroup,
};
