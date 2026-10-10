'use client';

import * as React from 'react';
import type { Transition } from 'motion/react';

import { motionTokens, toCssTiming, useTempoTransition } from '../utils/motion';
import {
  freeze,
  layers,
  positioned,
  release,
  LAYER,
  UNIQUE_ATTRIBUTES,
  type Layer,
} from './menu-handoff';

// A navigation menu's content changing, like a menubar's (internal/
// menu-handoff), like Motion's mega menu: its viewport (or popup) stays, and
// moving from one item to another, the content it shows changes in place on
// screen. The previous content leaves 24px away from where the next one
// comes from (moving to an item on the right, it leaves to the left) while it
// fades out; the next one comes in from 24px that way and fades in behind it
// (`shift.navigation`, four times a menubar's: its content is wider).
//
// - The previous content is copied as it leaves (aria-hidden, inert), and the
//   copy leaves inside the viewport, which clips it. Each content is one
//   layer: going back and forth faster than it settles, what's still leaving
//   goes on from where it is, and coming back to a content still leaving
//   takes it back from where its copy is, as it shows.
// - A popup that moves from item to item (Base UI's, placed under each
//   trigger) moves on Web Animations (`translate`, added to its own) on its
//   own transition, from where it was: the content stays where it is on
//   screen while the popup slides over it (`MoveFollower`).

type Way = {
  /** The axis the items lie along. */
  axis: 'x' | 'y';
  /** Where the next content comes from on it: 1 the end, -1 the start. */
  sign: number;
};

type SwapTimings = {
  /** The popup moving: its own transition. */
  move: Transition;
  /** The previous content leaving. */
  out: Transition;
  /** The next content fading in. */
  fadeIn: Transition;
  /** The next content sliding in. */
  slideIn: Transition;
};

/** A content's copy, made as it left, as it showed. */
type ContentCopy = {
  element: HTMLElement;
  /** Its viewport. */
  host: HTMLElement | null;
  menu: string | null;
  /** On screen, as it showed. */
  box: DOMRect;
  opacity: number;
  /** Elements to scroll back, once it's in the page. */
  scrolls: [Element, number, number][];
};

/** Copies a content as it shows right now: running animations frozen. */
function copyNode(node: HTMLElement, menu: string | null): ContentCopy {
  const element = node.cloneNode(true) as HTMLElement;
  const scrolls: ContentCopy['scrolls'] = [];
  freeze(node, element, scrolls);
  if (node.scrollTop || node.scrollLeft)
    scrolls.push([element, node.scrollTop, node.scrollLeft]);
  for (const el of [element, ...element.querySelectorAll('*')])
    for (const name of UNIQUE_ATTRIBUTES) el.removeAttribute(name);
  // Not a content anymore (styles and tests reading the slot leave it be).
  element.removeAttribute('data-slot');
  element.setAttribute('aria-hidden', 'true');
  element.setAttribute('inert', '');
  element.setAttribute(LAYER, '');
  const opacity = Number(
    element.style.opacity || getComputedStyle(node).opacity,
  );
  Object.assign(element.style, {
    position: 'absolute',
    margin: '0px',
    boxSizing: 'border-box',
    width: `${node.offsetWidth}px`,
    height: `${node.offsetHeight}px`,
    pointerEvents: 'none',
    // Placed by its box on screen, which counts them.
    translate: 'none',
    transform: 'none',
    opacity: '',
  });
  return {
    element,
    host: node.parentElement,
    menu,
    box: node.getBoundingClientRect(),
    opacity,
    scrolls,
  };
}

/** The `translate` an element shows (none: 0, 0). */
function translateOf(element: Element): [number, number] {
  const value = getComputedStyle(element).translate;
  if (!value || value === 'none') return [0, 0];
  const [x = '0', y = '0'] = value.split(' ');
  return [parseFloat(x) || 0, parseFloat(y) || 0];
}

const isZero = ([x, y]: [number, number]) =>
  Math.abs(x) < 0.5 && Math.abs(y) < 0.5;

const toTranslate = ([x, y]: [number, number]) => `${x}px ${y}px`;

/**
 * Moves a popup from where it was each time its anchor (the element that
 * places it) jumps to another place while it switches items, and keeps what's
 * pinned inside it where it should be on screen: a content leaving where it
 * was, the content coming in where it rests. Each jump, and each element
 * pinned on the way, starts every move over from where things are, all in
 * one go. They're added (`composite: 'add'`), so the browser runs them all on
 * the main thread, and they're given one start time: created in one task, the
 * browser may still start some of them (an element just added's) a frame
 * before the others, and a copy would jump aside by a frame of the move.
 */
class MoveFollower {
  /** The popup's move (its offset from its layout, to none). */
  private move: Animation | null = null;
  /**
   * Pinned elements, and their own move: `rest` follows the layout (it makes
   * up for the popup's offset), `screen` stays where it is on screen.
   */
  private pinned = new Map<
    HTMLElement,
    { kind: 'rest' | 'screen'; animation: Animation | null }
  >();
  private observer: MutationObserver | null = null;
  private rest: DOMRect | null = null;
  /** Until when a jump of the anchor is an item switch (animated). */
  private switching = 0;
  private waiting: (() => void)[] = [];
  private previousTransition = '';
  /** The popup's own `translate` (its styles'), under its moves. */
  private base: [number, number] = [0, 0];

  constructor(
    private mover: HTMLElement,
    private anchor: HTMLElement,
    private timing: () => { move: Transition; reduce: boolean },
  ) {}

  start() {
    // The popup moves on its own animations: none on the anchor's CSS.
    this.previousTransition = this.anchor.style.getPropertyValue(
      'transition-property',
    );
    this.anchor.style.setProperty('transition-property', 'none');
    this.rest = this.anchor.getBoundingClientRect();
    this.base = translateOf(this.mover);
    this.observer = new MutationObserver(() =>
      // After the swap that may be due in this same commit (a microtask
      // queued before this one): it marks the switch.
      queueMicrotask(() => this.check()),
    );
    this.observer.observe(this.anchor, {
      attributes: true,
      attributeFilter: ['style'],
    });
  }

  stop() {
    this.observer?.disconnect();
    this.observer = null;
    if (this.previousTransition)
      this.anchor.style.setProperty(
        'transition-property',
        this.previousTransition,
      );
    else this.anchor.style.removeProperty('transition-property');
    for (const run of this.waiting.splice(0)) run();
  }

  /** The popup's offset from its layout right now (its move). */
  offset(): [number, number] {
    const [x, y] = translateOf(this.mover);
    return [x - this.base[0], y - this.base[1]];
  }

  /**
   * Items are switching: a jump of the anchor in the next 300ms moves the
   * popup, and `run` runs once it has (or after two frames, if it doesn't).
   */
  expect(run: () => void) {
    this.switching = performance.now() + 300;
    this.waiting.push(run);
    this.check();
    let frames = 0;
    const fallback = () => {
      frames += 1;
      if (frames < 2) requestAnimationFrame(fallback);
      else this.release(run);
    };
    requestAnimationFrame(fallback);
  }

  private release(run: () => void) {
    const index = this.waiting.indexOf(run);
    if (index === -1) return;
    this.waiting.splice(index, 1);
    run();
  }

  /** An element inside the popup, kept where it should be on screen. */
  pin(element: HTMLElement, kind: 'rest' | 'screen') {
    this.pinned.set(element, { kind, animation: null });
    // A popup still moving: everything starts over from where it is, with
    // this one.
    if (this.move) this.restart([0, 0]);
  }

  /** Not kept anymore (a content leaving: it stops moving at once). */
  unpin(element: HTMLElement) {
    this.pinned.get(element)?.animation?.cancel();
    this.pinned.delete(element);
  }

  private check() {
    if (!this.observer) return;
    // Re-applied: a render may have written the anchor's style again.
    this.anchor.style.setProperty('transition-property', 'none');
    const now = this.anchor.getBoundingClientRect();
    const before = this.rest;
    this.rest = now;
    if (!before) return;
    const jump: [number, number] = [
      before.left - now.left,
      before.top - now.top,
    ];
    if (isZero(jump)) return;
    // Not a switch (the page resized): everything goes with it.
    if (performance.now() < this.switching) this.restart(jump);
    for (const run of this.waiting.splice(0)) run();
  }

  /**
   * Starts every move over from where things are on screen, the popup's
   * layout having jumped by `jump`: the popup from where it shows to its
   * layout, what rests making up for its offset, what stays put making up
   * for its layout's jump too, once it has moved.
   */
  private restart(jump: [number, number]) {
    const { move, reduce } = this.timing();
    // Reduced motion: at once.
    const timing = reduce
      ? { duration: 0, easing: 'linear' }
      : toCssTiming(move);
    const [ox, oy] = this.offset();
    const total: [number, number] = [ox + jump[0], oy + jump[1]];
    // Read before anything is cancelled: where each one is now.
    const offsets = new Map<HTMLElement, [number, number]>();
    for (const [element, { kind }] of this.pinned) {
      if (!element.isConnected) this.pinned.delete(element);
      else if (kind === 'screen') offsets.set(element, translateOf(element));
    }
    this.move?.cancel();
    this.move = null;
    const created: Animation[] = [];
    if (!isZero(total)) {
      const animation = this.mover.animate(
        [{ translate: toTranslate(total) }, { translate: '0px 0px' }],
        { ...timing, composite: 'add' },
      );
      created.push(animation);
      this.move = animation;
      const done = () => {
        if (this.move === animation) this.move = null;
      };
      animation.finished.then(done, done);
    }
    for (const [element, pin] of this.pinned) {
      pin.animation?.cancel();
      const from = offsets.get(element) ?? [0, 0];
      pin.animation = element.animate(
        pin.kind === 'rest'
          ? [
              { translate: toTranslate([-total[0], -total[1]]) },
              { translate: '0px 0px' },
            ]
          : [
              { translate: toTranslate(from) },
              {
                translate: toTranslate([
                  from[0] + total[0],
                  from[1] + total[1],
                ]),
              },
            ],
        {
          ...timing,
          composite: 'add',
          fill: pin.kind === 'rest' ? 'auto' : 'forwards',
        },
      );
      created.push(pin.animation);
    }
    // Held at their first keyframe until the next frame starts them all at
    // once.
    for (const animation of created) animation.pause();
    requestAnimationFrame(() => {
      const now = document.timeline.currentTime;
      for (const animation of created)
        if (animation.playState === 'paused') animation.startTime = now;
    });
  }
}

/** The layers leaving inside a viewport. */
const layersIn = (host: HTMLElement) =>
  Array.from(host.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && child.hasAttribute(LAYER),
  );

type Entering = { node: HTMLElement; menu: string | null; way: Way | null };

/** The layers leave inside their viewport: it's their containing block. */
function hostFor(host: HTMLElement) {
  if (getComputedStyle(host).position === 'static' || positioned.has(host)) {
    positioned.add(host);
    host.style.position = 'relative';
  }
}

/** Puts a copy where its content was on screen, in its viewport. */
function place(copy: ContentCopy, host: HTMLElement) {
  const { element, box } = copy;
  const origin = host.getBoundingClientRect();
  element.style.left = `${box.left - (origin.left + host.clientLeft)}px`;
  element.style.top = `${box.top - (origin.top + host.clientTop)}px`;
  if (element.parentElement !== host) {
    host.appendChild(element);
    for (const [scrolled, top, left] of copy.scrolls) {
      scrolled.scrollTop = top;
      scrolled.scrollLeft = left;
    }
  }
}

/** A copy that won't be seen. */
function drop(copy: ContentCopy) {
  if (!copy.element.isConnected) return;
  layers.delete(copy.element);
  copy.element.remove();
  if (copy.host) release(copy.host);
}

/**
 * A copy holding still where its content was (the menu closing): it fades
 * out with its viewport. Gone after a second, if the viewport didn't.
 */
function holdStill(copy: ContentCopy) {
  const host = copy.host;
  if (!host?.isConnected || copy.element.isConnected) return;
  hostFor(host);
  place(copy, host);
  copy.element.style.opacity = String(copy.opacity);
  const layer: Layer = { menu: copy.menu, to: [0, 0], fade: null };
  layers.set(copy.element, layer);
  setTimeout(() => {
    if (layers.get(copy.element) === layer) drop(copy);
  }, 1000);
}

/**
 * A viewport's content changes (one per navigation menu viewport or popup):
 * the content leaving is copied (`leave`), the one coming in announced
 * (`enter`), in the same commit or the next frame, and both run then.
 */
class ContentSwapper {
  follower: MoveFollower | null = null;
  /** Its popup's (or viewport's) timings, as of its last render. */
  private own: { timings: SwapTimings; reduce: boolean } | null = null;
  /** Its menu's, when it has no popup (a submenu in the content). */
  private fallback: { timings: SwapTimings; reduce: boolean } | null = null;
  /**
   * The contents leaving, copied as they showed. By element: one coming
   * back in the meantime (React's StrictMode remounting it, or the library
   * showing it again) never left.
   */
  private leaving = new Map<HTMLElement, ContentCopy>();

  /** Its timings and reduced motion, as of the last render. */
  configure(timings: SwapTimings, reduce: boolean, fallback = false) {
    if (fallback) this.fallback = { timings, reduce };
    else this.own = { timings, reduce };
  }

  private get settings() {
    return this.own ?? this.fallback;
  }

  /** Under reduced motion, contents fade in place, without a copy leaving. */
  get reduce() {
    return this.settings?.reduce ?? false;
  }

  /** The popup's move (its transition). */
  get move() {
    return this.settings?.timings.move ?? null;
  }

  /** Its popup moves from item to item: `follower` follows it. */
  follow(follower: MoveFollower) {
    this.follower = follower;
    return () => {
      if (this.follower === follower) this.follower = null;
    };
  }

  private entering: Entering | null = null;
  /**
   * A content that came in by a switch before the one leaving (a submenu's:
   * the library may close it a commit later): hidden a frame, waiting.
   */
  private awaiting: { entering: Entering; hold: Animation } | null = null;
  private scheduled = false;

  /** A content leaves: copied now, as it shows. */
  leave(node: HTMLElement, menu: string | null) {
    // Copied where it shows, then let go of (its pin stops at once).
    if (node.isConnected) this.leaving.set(node, copyNode(node, menu));
    this.follower?.unpin(node);
    if (node.isConnected) this.schedule();
  }

  /** A content comes in (`way` null: the viewport just opened). */
  enter(node: HTMLElement, menu: string | null, way: Way | null) {
    this.leaving.delete(node);
    this.entering = { node, menu, way };
    this.schedule();
  }

  private schedule() {
    if (this.scheduled) return;
    this.scheduled = true;
    // Once the commit is done: the content leaving and the one coming in may
    // run their effects in any order.
    queueMicrotask(() => {
      this.scheduled = false;
      this.flush();
    });
  }

  private flush() {
    let entering = this.entering;
    this.entering = null;
    const copies = [...this.leaving];
    if (!entering && this.awaiting && copies.length) {
      entering = this.awaiting.entering;
      this.awaiting.hold.cancel();
      this.awaiting = null;
    }
    if (!entering) {
      // Left alone: the menu closing (the library may remove a content
      // before its popup has faded out), or the next content coming in the
      // next frame. Each copy holds still where it was, fading out with its
      // viewport, and is kept a frame for a content coming in.
      for (const [, copy] of copies) holdStill(copy);
      if (copies.length)
        requestAnimationFrame(() => {
          for (const [node, copy] of copies)
            if (this.leaving.get(node) === copy) this.leaving.delete(node);
        });
      return;
    }
    this.leaving.clear();
    // The latest one to leave; any other one goes at once.
    const left = copies.at(-1)?.[1] ?? null;
    for (const [, copy] of copies.slice(0, -1)) drop(copy);
    const { node, way } = entering;
    const host = node.parentElement;
    const settings = this.settings;
    // Under reduced motion, nothing leaves: the next content fades in place.
    if (!host || !node.isConnected || !way || !settings || settings.reduce) {
      if (left) drop(left);
      if (!host || !node.isConnected || !way || !settings) return;
    }
    // Nothing left yet: wait a frame, hidden, for the content leaving (or,
    // the menu opening again, a content showing again: no change to make).
    if (!left && !settings.reduce) {
      const hold = node.animate([{ opacity: 0 }, { opacity: 0 }], {
        duration: 1000,
      });
      const awaiting = { entering, hold };
      this.awaiting = awaiting;
      requestAnimationFrame(() => {
        if (this.awaiting !== awaiting) return;
        this.awaiting = null;
        hold.cancel();
      });
      return;
    }
    swap(
      host,
      { ...entering, way },
      settings.reduce ? null : left,
      settings.timings,
      settings.reduce,
      this.follower,
    );
  }
}

/**
 * The content `entering` comes in inside `host`, from `way`, while the copy
 * of the one that left (`left`) leaves the other way.
 */
function swap(
  host: HTMLElement,
  entering: Entering & { way: Way },
  left: ContentCopy | null,
  timings: SwapTimings,
  reduce: boolean,
  follower: MoveFollower | null,
) {
  const { node, menu, way } = entering;
  const shift = reduce ? 0 : motionTokens.shift.navigation;
  const along = (distance: number): [number, number] =>
    way.axis === 'x' ? [distance, 0] : [0, distance];
  const out = toCssTiming(timings.out);
  const fadeIn = toCssTiming(timings.fadeIn);
  const slideIn = toCssTiming(timings.slideIn);
  const move = toCssTiming(timings.move);

  // The layers leave inside the viewport (their containing block): it clips
  // them while either content moves.
  hostFor(host);
  host.animate([{ overflow: 'hidden' }, { overflow: 'hidden' }], {
    duration: Math.max(out.duration, fadeIn.duration, move.duration),
  });

  // The content that left leaves where it was on screen, the other way.
  if (left) {
    const element = left.element;
    // Placed where it was, against where the viewport is on screen now (its
    // pin then makes up for the popup's move, the rest of it included).
    place(left, host);
    element.style.opacity = '';
    follower?.pin(element, 'screen');
    const to = along(-way.sign * shift);
    if (!isZero(to))
      element.animate(
        [
          { transform: 'translate(0px, 0px)' },
          { transform: `translate(${to[0]}px, ${to[1]}px)` },
        ],
        { ...out, composite: 'add', fill: 'forwards' },
      );
    const fade = element.animate([{ opacity: left.opacity }, { opacity: 0 }], {
      ...out,
      fill: 'forwards',
    });
    const layer: Layer = { menu: left.menu, to, fade };
    layers.set(element, layer);
    const remove = () => {
      if (layers.get(element)?.fade !== fade) return;
      follower?.unpin(element);
      element.remove();
      release(host);
    };
    fade.finished.then(remove, remove);
  }

  // The content coming in: hidden until the popup has its place (it moves a
  // frame or two later), then in from the way it goes, or from its own copy
  // still leaving.
  const hold = node.animate([{ opacity: 0 }, { opacity: 0 }], {
    duration: 1000,
  });
  follower?.pin(node, 'rest');
  const start = () => {
    hold.cancel();
    if (!node.isConnected) return;
    const back = menu
      ? layersIn(host).find(
          (layer) =>
            layers.get(layer)?.menu === menu &&
            Number(getComputedStyle(layer).opacity) > 0.02,
        )
      : undefined;
    const rest = Number(getComputedStyle(node).opacity) || 1;
    let from = 0;
    let slide = along(way.sign * shift);
    if (back) {
      const theirs = back.getBoundingClientRect();
      const own = node.getBoundingClientRect();
      from = Math.min(1, Number(getComputedStyle(back).opacity) / rest);
      slide = reduce ? [0, 0] : [theirs.left - own.left, theirs.top - own.top];
      layers.delete(back);
      follower?.unpin(back);
      back.remove();
    }
    node.animate([{ opacity: rest * from }, { opacity: rest }], fadeIn);
    if (!isZero(slide))
      node.animate(
        [{ translate: toTranslate(slide) }, { translate: '0px 0px' }],
        { ...slideIn, composite: 'add' },
      );
  };
  if (follower) follower.expect(start);
  else start();
}

const SwapContext = React.createContext<ContentSwapper | null>(null);

/**
 * For a navigation menu's viewport (or popup): its contents change in place.
 * `move` is its own transition (the popup moving, for Base UI's). `existing`:
 * a swapper made higher up (where its contents can reach it).
 */
function useContentSwapper(
  move: Transition,
  reduce: boolean,
  existing?: ContentSwapper | null,
  /** The menu's own settings: its popup's, if it has one, come first. */
  fallback = false,
) {
  const [own] = React.useState(() => new ContentSwapper());
  const swapper = existing ?? own;
  const out = useTempoTransition(motionTokens.transition.handoffOut);
  const fadeIn = useTempoTransition(motionTokens.transition.handoffIn);
  const slideIn = useTempoTransition(motionTokens.spring.handoff);
  React.useLayoutEffect(() => {
    swapper.configure({ move, out, fadeIn, slideIn }, reduce, fallback);
  });
  return swapper;
}

/**
 * A popup that moves from item to item (its `anchor` places it): it moves
 * from where it was, and keeps its contents where they are on screen.
 */
function useMoveFollower(
  swapper: ContentSwapper,
  mover: React.RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  React.useLayoutEffect(() => {
    const node = mover.current;
    const anchor = node?.parentElement;
    if (!enabled || !node || !anchor || typeof node.animate !== 'function')
      return;
    const follower = new MoveFollower(node, anchor, () => ({
      move: swapper.move ?? { duration: 0 },
      reduce: swapper.reduce,
    }));
    follower.start();
    const unfollow = swapper.follow(follower);
    return () => {
      follower.stop();
      unfollow();
    };
  }, [swapper, mover, enabled]);
}

export {
  ContentSwapper,
  SwapContext,
  useContentSwapper,
  useMoveFollower,
  type Way,
};
