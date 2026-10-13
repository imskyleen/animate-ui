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
import {
  carries,
  curveFrom,
  curveOf,
  velocityOf,
  INSTANT,
  type Curve,
  type Run,
} from './momentum';

type Way = {
  axis: 'x' | 'y';
  sign: number;
};

type SwapTimings = {
  move: Transition;
  out: Transition;
  fadeIn: Transition;
  slideIn: Transition;
};

type ContentCopy = {
  element: HTMLElement;
  host: HTMLElement | null;
  menu: string | null;
  box: DOMRect;
  opacity: number;
  scrolls: [Element, number, number][];
};

function copyNode(node: HTMLElement, menu: string | null): ContentCopy {
  const element = node.cloneNode(true) as HTMLElement;
  const scrolls: ContentCopy['scrolls'] = [];
  freeze(node, element, scrolls);
  if (node.scrollTop || node.scrollLeft)
    scrolls.push([element, node.scrollTop, node.scrollLeft]);
  for (const el of [element, ...element.querySelectorAll('*')])
    for (const name of UNIQUE_ATTRIBUTES) el.removeAttribute(name);
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

function translateOf(element: Element): [number, number] {
  const value = getComputedStyle(element).translate;
  if (!value || value === 'none') return [0, 0];
  const [x = '0', y = '0'] = value.split(' ');
  return [parseFloat(x) || 0, parseFloat(y) || 0];
}

const isZero = ([x, y]: [number, number]) =>
  Math.abs(x) < 0.5 && Math.abs(y) < 0.5;

const toTranslate = ([x, y]: [number, number]) => `${x}px ${y}px`;

class MoveFollower {
  private move: Animation | null = null;
  private run: Run | null = null;
  private pinned = new Map<
    HTMLElement,
    { kind: 'rest' | 'screen'; animation: Animation | null }
  >();
  private observer: MutationObserver | null = null;
  private rest: DOMRect | null = null;
  private switching = 0;
  private waiting: (() => void)[] = [];
  private previousTransition = '';
  private base: [number, number] = [0, 0];

  constructor(
    private mover: HTMLElement,
    private anchor: HTMLElement,
    private timing: () => { move: Transition; reduce: boolean },
  ) {}

  start() {
    this.previousTransition = this.anchor.style.getPropertyValue(
      'transition-property',
    );
    this.anchor.style.setProperty('transition-property', 'none');
    this.rest = this.anchor.getBoundingClientRect();
    this.base = translateOf(this.mover);
    this.observer = new MutationObserver(() =>
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

  offset(): [number, number] {
    const [x, y] = translateOf(this.mover);
    return [x - this.base[0], y - this.base[1]];
  }

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

  pin(element: HTMLElement, kind: 'rest' | 'screen') {
    this.pinned.set(element, { kind, animation: null });
    if (this.move) this.restart([0, 0]);
  }

  unpin(element: HTMLElement) {
    this.pinned.get(element)?.animation?.cancel();
    this.pinned.delete(element);
  }

  private check() {
    if (!this.observer) return;
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
    if (performance.now() < this.switching) this.restart(jump);
    for (const run of this.waiting.splice(0)) run();
  }

  private restart(jump: [number, number]) {
    const { move, reduce } = this.timing();
    const [ox, oy] = this.offset();
    const total: [number, number] = [ox + jump[0], oy + jump[1]];
    const velocity =
      this.move && this.run
        ? velocityOf(this.run, Number(this.move.currentTime) || 0)
        : [0, 0];
    const curve = reduce ? INSTANT : curveFrom(move, total, velocity);
    const timing = { duration: curve.duration, easing: curve.easing };
    const timeline = this.mover.ownerDocument.timeline;
    const sampled = carries(curve, total) ? timeline.currentTime : null;
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
      this.run = { offset: total, curve };
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
    if (sampled !== null) {
      for (const animation of created) animation.startTime = sampled;
      return;
    }
    for (const animation of created) animation.pause();
    requestAnimationFrame(() => {
      const start = timeline.currentTime;
      for (const animation of created)
        if (animation.playState === 'paused') animation.startTime = start;
    });
  }
}

function sizeIn(style: CSSStyleDeclaration, width: string, height: string) {
  const w = style.getPropertyValue(width).trim();
  const h = style.getPropertyValue(height).trim();
  if (!w.endsWith('px') || !h.endsWith('px')) return null;
  const size: [number, number] = [parseFloat(w), parseFloat(h)];
  return size.every(Number.isFinite) ? size : null;
}

const sameSize = (a: [number, number], b: [number, number]) =>
  Math.abs(a[0] - b[0]) < 0.01 && Math.abs(a[1] - b[1]) < 0.01;

class SizeFollower {
  private observer: MutationObserver | null = null;
  private written: [number, number] | null = null;
  private next: {
    from: [number, number];
    to: [number, number];
    velocity: number[];
    curves: [Curve, Curve];
    at: number | null;
  } | null = null;
  private runs: [Run, Run] | null = null;
  private target: [number, number] = [0, 0];
  private since = 0;

  constructor(
    private popup: HTMLElement,
    private transition: () => Transition,
  ) {}

  start() {
    this.observer = new MutationObserver(() => this.check());
    this.observer.observe(this.popup, {
      attributes: true,
      attributeFilter: ['style'],
    });
  }

  stop() {
    this.observer?.disconnect();
    this.observer = null;
  }

  timing() {
    const plain = curveOf(this.transition());
    const [width, height] = this.next?.curves ?? [plain, plain];
    return {
      duration: `${width.duration}ms, ${height.duration}ms`,
      easing: `${width.easing}, ${height.easing}`,
    };
  }

  private apply() {
    const { duration, easing } = this.timing();
    this.popup.style.setProperty('transition-duration', duration);
    this.popup.style.setProperty('transition-timing-function', easing);
  }

  private clock() {
    const time = this.popup.ownerDocument.timeline.currentTime;
    return typeof time === 'number' ? time : performance.now();
  }

  private now(): { shown: [number, number] | null; velocity: number[] } {
    const runs = this.runs;
    if (!runs) return { shown: null, velocity: [0, 0] };
    const elapsed = this.clock() - this.since;
    return {
      shown: [0, 1].map(
        (axis) =>
          this.target[axis]! +
          runs[axis]!.offset[0]! * (1 - runs[axis]!.curve.at(elapsed)),
      ) as [number, number],
      velocity: runs.map((run) => velocityOf(run, elapsed)[0]!),
    };
  }

  private check() {
    const size = sizeIn(this.popup.style, '--popup-width', '--popup-height');
    if (!size) {
      if (this.runs || this.next) {
        this.runs = null;
        this.next = null;
        this.apply();
      }
      return;
    }
    const positioner = this.popup.parentElement;
    const target =
      positioner &&
      sizeIn(positioner.style, '--positioner-width', '--positioner-height');
    if (!target) return;
    const before = this.written;
    const held = !sameSize(size, target);
    if (
      before &&
      sameSize(size, before) &&
      (!held || (this.next !== null && sameSize(this.next.to, target)))
    )
      return;
    this.written = size;
    if (held) {
      const again = this.next && sameSize(this.next.from, size);
      const velocity = again ? this.next!.velocity : this.now().velocity;
      const transition = this.transition();
      const curves = [0, 1].map((axis) =>
        curveFrom(transition, [size[axis]! - target[axis]!], [velocity[axis]!]),
      ) as [Curve, Curve];
      const carried = [0, 1].some((axis) =>
        carries(curves[axis]!, [size[axis]! - target[axis]!]),
      );
      this.next = {
        from: size,
        to: target,
        velocity,
        curves,
        at: carried ? (again ? this.next!.at : this.clock()) : null,
      };
      this.apply();
      if (this.next.at !== null) {
        this.popup.getAnimations();
        this.popup.style.setProperty('--popup-width', `${target[0]}px`);
        this.popup.style.setProperty('--popup-height', `${target[1]}px`);
      }
      return;
    }
    const transitions = this.popup.getAnimations();
    const next = this.next && sameSize(this.next.to, size) ? this.next : null;
    const plain = curveOf(this.transition());
    const from = next?.from ?? this.now().shown ?? before ?? size;
    const curves = next?.curves ?? [plain, plain];
    const at = next?.at ?? null;
    if (at !== null)
      for (const animation of transitions)
        if (
          'transitionProperty' in animation &&
          (animation.transitionProperty === 'width' ||
            animation.transitionProperty === 'height')
        )
          animation.startTime = at;
    this.runs = [
      { offset: [from[0] - size[0]], curve: curves[0] },
      { offset: [from[1] - size[1]], curve: curves[1] },
    ];
    this.target = size;
    this.since = at ?? this.clock();
    this.next = null;
    this.apply();
  }
}

const layersIn = (host: HTMLElement) =>
  Array.from(host.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && child.hasAttribute(LAYER),
  );

type Entering = { node: HTMLElement; menu: string | null; way: Way | null };

function hostFor(host: HTMLElement) {
  if (getComputedStyle(host).position === 'static' || positioned.has(host)) {
    positioned.add(host);
    host.style.position = 'relative';
  }
}

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

function drop(copy: ContentCopy) {
  if (!copy.element.isConnected) return;
  layers.delete(copy.element);
  copy.element.remove();
  if (copy.host) release(copy.host);
}

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

class ContentSwapper {
  follower: MoveFollower | null = null;
  private own: { timings: SwapTimings; reduce: boolean } | null = null;
  private fallback: { timings: SwapTimings; reduce: boolean } | null = null;
  private leaving = new Map<HTMLElement, ContentCopy>();

  configure(timings: SwapTimings, reduce: boolean, fallback = false) {
    if (fallback) this.fallback = { timings, reduce };
    else this.own = { timings, reduce };
  }

  private get settings() {
    return this.own ?? this.fallback;
  }

  get reduce() {
    return this.settings?.reduce ?? false;
  }

  get move() {
    return this.settings?.timings.move ?? null;
  }

  follow(follower: MoveFollower) {
    this.follower = follower;
    return () => {
      if (this.follower === follower) this.follower = null;
    };
  }

  private entering: Entering | null = null;
  private awaiting: { entering: Entering; hold: Animation } | null = null;
  private scheduled = false;

  leave(node: HTMLElement, menu: string | null) {
    if (node.isConnected) this.leaving.set(node, copyNode(node, menu));
    this.follower?.unpin(node);
    if (node.isConnected) this.schedule();
  }

  enter(node: HTMLElement, menu: string | null, way: Way | null) {
    this.leaving.delete(node);
    this.entering = { node, menu, way };
    this.schedule();
  }

  private schedule() {
    if (this.scheduled) return;
    this.scheduled = true;
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
      for (const [, copy] of copies) holdStill(copy);
      if (copies.length)
        requestAnimationFrame(() => {
          for (const [node, copy] of copies)
            if (this.leaving.get(node) === copy) this.leaving.delete(node);
        });
      return;
    }
    this.leaving.clear();
    const left = copies.at(-1)?.[1] ?? null;
    for (const [, copy] of copies.slice(0, -1)) drop(copy);
    const { node, way } = entering;
    const host = node.parentElement;
    const settings = this.settings;
    if (!host || !node.isConnected || !way || !settings || settings.reduce) {
      if (left) drop(left);
      if (!host || !node.isConnected || !way || !settings) return;
    }
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

  hostFor(host);
  host.animate([{ overflow: 'hidden' }, { overflow: 'hidden' }], {
    duration: Math.max(out.duration, fadeIn.duration, move.duration),
  });

  if (left) {
    const element = left.element;
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

function useContentSwapper(
  move: Transition,
  reduce: boolean,
  existing?: ContentSwapper | null,
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

function useSizeFollower(
  popup: React.RefObject<HTMLElement | null>,
  transition: Transition,
  enabled: boolean,
) {
  const transitionRef = React.useRef(transition);
  React.useLayoutEffect(() => {
    transitionRef.current = transition;
  });
  const [follower, setFollower] = React.useState<SizeFollower | null>(null);
  React.useLayoutEffect(() => {
    const node = popup.current;
    if (!enabled || !node) return;
    const own = new SizeFollower(node, () => transitionRef.current);
    own.start();
    setFollower(own);
    return () => {
      own.stop();
      setFollower(null);
    };
  }, [popup, enabled]);
  if (follower) return follower.timing();
  const { duration, easing } = curveOf(transition);
  return { duration: `${duration}ms`, easing };
}

export {
  ContentSwapper,
  SwapContext,
  useContentSwapper,
  useMoveFollower,
  useSizeFollower,
  type Way,
};
