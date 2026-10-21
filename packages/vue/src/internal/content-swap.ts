import { watchEffect } from 'vue';
import type { Transition } from 'motion-v';

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
  velocityOf,
  INSTANT,
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
  private rest: { left: number; top: number } | null = null;
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
    this.rest = this.where();
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

  // A popup that moves itself is measured without the translate it moves by.
  private where() {
    if (this.anchor !== this.mover) return this.anchor.getBoundingClientRect();
    return { left: this.anchor.offsetLeft, top: this.anchor.offsetTop };
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
    const now = this.where();
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
  private awaiting: { entering: Entering; hold: Animation | null } | null =
    null;
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
      const { hold } = this.awaiting;
      entering = this.awaiting.entering;
      this.awaiting = null;
      if (!hold) {
        this.leaving.clear();
        for (const [, copy] of copies) drop(copy);
        return;
      }
      hold.cancel();
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
    // reka-ui unmounts the content left a tick after the next one mounts.
    if (!left) {
      const awaiting = { entering, hold: null };
      this.awaiting = awaiting;
      requestAnimationFrame(() => {
        if (this.awaiting === awaiting) this.awaiting = null;
      });
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

/** Paces a content swapper: the move, and the contents' fades and slides. */
function useSwapTimings(
  swapper: ContentSwapper,
  move: () => Transition,
  reduce: () => boolean,
) {
  const out = useTempoTransition(() => motionTokens.transition.handoffOut);
  const fadeIn = useTempoTransition(() => motionTokens.transition.handoffIn);
  const slideIn = useTempoTransition(() => motionTokens.spring.handoff);
  watchEffect(
    () =>
      swapper.configure(
        {
          move: move(),
          out: out.value,
          fadeIn: fadeIn.value,
          slideIn: slideIn.value,
        },
        reduce(),
      ),
    { flush: 'sync' },
  );
}

export { ContentSwapper, MoveFollower, useSwapTimings, type Way };
