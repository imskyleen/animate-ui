'use client';

import * as React from 'react';
import {
  animate,
  cancelFrame,
  frame,
  motionValue,
  type AnimationPlaybackControls,
  type MotionValue,
  type Transition,
} from 'motion/react';

import {
  motionTokens,
  toCssTiming,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';
import { startOf } from '../momentum';

const ITEM_ATTRIBUTE = 'data-animate-ui-toggle-item';
const READY_ATTRIBUTE = 'data-animate-ui-surfaces';
const READING_ATTRIBUTE = 'data-animate-ui-reading';
const GROUP_ATTRIBUTE = 'data-animate-ui-toggle-group';

const SELECTION_TRANSITION: Transition = motionTokens.spring.selection;

const SELECTED = {
  radix: '[data-state="on"]',
  base: '[aria-pressed="true"]',
  aria: '[data-selected]',
} as const;

type HighlightLibrary = keyof typeof SELECTED;

const SURFACES_CSS = `[${READY_ATTRIBUTE}] [${ITEM_ATTRIBUTE}]:not([${READING_ATTRIBUTE}]){background-color:transparent!important;background-image:none!important}`;

type Radii = [number, number, number, number];
type Rect = { x: number; y: number; w: number; h: number };
type Side = 'top' | 'right' | 'bottom' | 'left';

type Look = {
  color: string;
  image: string;
  radii: Radii;
  opacity: number;
  framed: Record<Side, boolean>;
};

type Shape = Rect & { radii: Radii };

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

function alphaOf(color: string) {
  if (color === 'transparent') return 0;
  const slash = color.match(/\/\s*([\d.]+)(%?)\s*\)$/);
  if (slash) return Number(slash[1]) / (slash[2] ? 100 : 1);
  const rgba = color.match(/^rgba\((?:[^,]+,){3}\s*([\d.]+)\s*\)$/);
  return rgba ? Number(rgba[1]) : 1;
}

const isBare = (look: Look) => look.image === 'none' && !alphaOf(look.color);

const samePaint = (a: Look, b: Look) =>
  a.color === b.color &&
  a.image === b.image &&
  a.radii.every((r, i) => Math.abs(r - b.radii[i]!) < 0.5);

function radiusOf(value: string, size: number) {
  const first = value.split(' ')[0] ?? '0';
  const number = parseFloat(first) || 0;
  return first.endsWith('%') ? (number / 100) * size : number;
}

function readLook(item: HTMLElement): Look {
  const transition = item.style.getPropertyValue('transition');
  const priority = item.style.getPropertyPriority('transition');
  item.style.setProperty('transition', 'none', 'important');
  item.setAttribute(READING_ATTRIBUTE, '');
  const style = getComputedStyle(item);
  const size = Math.min(item.offsetWidth, item.offsetHeight);
  const radius = (value: string) => Math.min(radiusOf(value, size), size / 2);
  const framed = (side: string) =>
    parseFloat(style.getPropertyValue(`border-${side}-width`)) > 0 &&
    alphaOf(style.getPropertyValue(`border-${side}-color`)) > 0;
  const look: Look = {
    color: style.backgroundColor,
    image: style.backgroundImage,
    radii: [
      radius(style.borderTopLeftRadius),
      radius(style.borderTopRightRadius),
      radius(style.borderBottomRightRadius),
      radius(style.borderBottomLeftRadius),
    ],
    opacity: Number(style.opacity) || 0,
    framed: {
      top: framed('top'),
      right: framed('right'),
      bottom: framed('bottom'),
      left: framed('left'),
    },
  };
  item.removeAttribute(READING_ATTRIBUTE);
  void getComputedStyle(item).backgroundColor;
  if (transition) item.style.setProperty('transition', transition, priority);
  else item.style.removeProperty('transition');
  return look;
}

function placer(root: HTMLElement) {
  const origin = root.getBoundingClientRect();
  const scaleX = root.offsetWidth ? origin.width / root.offsetWidth : 1;
  const scaleY = root.offsetHeight ? origin.height / root.offsetHeight : 1;
  return (el: Element): Rect => {
    const rect = el.getBoundingClientRect();
    return {
      x: (rect.left - origin.left) / scaleX - root.clientLeft,
      y: (rect.top - origin.top) / scaleY - root.clientTop,
      w: rect.width / scaleX,
      h: rect.height / scaleY,
    };
  };
}

type Link = {
  sides: [Side, Side];
  middle: number;
};

const OPPOSITE: Record<Side, Side> = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
};

function linkOf(a: Rect, b: Rect, lookA: Look, lookB: Look): Link | null {
  const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  let side: Side;
  let gap: number;
  let cross: number;
  if (overlapY >= Math.min(a.h, b.h) / 2) {
    cross = Math.min(a.h, b.h);
    if (b.x >= a.x + a.w - 1) {
      side = 'right';
      gap = b.x - (a.x + a.w);
    } else if (a.x >= b.x + b.w - 1) {
      side = 'left';
      gap = a.x - (b.x + b.w);
    } else return null;
  } else if (overlapX >= Math.min(a.w, b.w) / 2) {
    cross = Math.min(a.w, b.w);
    if (b.y >= a.y + a.h - 1) {
      side = 'bottom';
      gap = b.y - (a.y + a.h);
    } else if (a.y >= b.y + b.h - 1) {
      side = 'top';
      gap = a.y - (b.y + b.h);
    } else return null;
  } else return null;
  const facing = OPPOSITE[side];
  const touching = gap <= 1.5;
  if (
    !touching &&
    (gap > cross / 2 || lookA.framed[side] || lookB.framed[facing])
  )
    return null;
  const edge = { right: a.x + a.w, left: a.x, bottom: a.y + a.h, top: a.y }[
    side
  ];
  const middle =
    side === 'right' || side === 'bottom' ? edge + gap / 2 : edge - gap / 2;
  return { sides: [side, facing], middle };
}

const CORNERS: Record<Side, [number, number]> = {
  top: [0, 1],
  right: [1, 2],
  bottom: [2, 3],
  left: [3, 0],
};

function setSide(shape: Shape, side: Side, to: number) {
  if (side === 'left') {
    shape.w += shape.x - to;
    shape.x = to;
  } else if (side === 'right') shape.w = to - shape.x;
  else if (side === 'top') {
    shape.h += shape.y - to;
    shape.y = to;
  } else shape.h = to - shape.y;
}

function sideOf(shape: Rect, side: Side) {
  return {
    left: shape.x,
    right: shape.x + shape.w,
    top: shape.y,
    bottom: shape.y + shape.h,
  }[side];
}

const outward = (side: Side) =>
  side === 'right' || side === 'bottom' ? 1 : -1;

const OVERLAP = 0.5;

function scaled(rect: Rect, radii: Radii, scale: number): Shape {
  return {
    x: rect.x + (rect.w * (1 - scale)) / 2,
    y: rect.y + (rect.h * (1 - scale)) / 2,
    w: rect.w * scale,
    h: rect.h * scale,
    radii: radii.map((r) => r * scale) as Radii,
  };
}

function paint(el: HTMLElement, shape: Shape, look: Look, opacity: number) {
  const style = el.style;
  const visible = opacity > 0.001 && shape.w > 0 && shape.h > 0;
  style.visibility = visible ? '' : 'hidden';
  if (!visible) return;
  style.transform = `translate(${shape.x}px, ${shape.y}px)`;
  style.width = `${shape.w}px`;
  style.height = `${shape.h}px`;
  style.borderRadius = shape.radii.map((r) => `${Math.max(0, r)}px`).join(' ');
  style.backgroundColor = look.color;
  style.backgroundImage = look.image;
  style.opacity = String(Math.min(1, opacity) * look.opacity);
}

class Glider {
  progress = motionValue(1);
  from: Shape | null = null;
  to: Element | null = null;
  controls: AnimationPlaybackControls | null = null;
  onSettled: (() => void) | null = null;

  drawnAt = 0;

  constructor(private shapeOf: (item: Element) => Shape | null) {
    this.progress.on('change', () => {
      this.drawnAt = performance.now();
    });
  }

  current(): Shape | null {
    const to = this.to && this.shapeOf(this.to);
    if (!to) return this.from;
    const from = this.from;
    const p = this.progress.get();
    if (!from || p >= 1) return to;
    return {
      x: lerp(from.x, to.x, p),
      y: lerp(from.y, to.y, p),
      w: lerp(from.w, to.w, p),
      h: lerp(from.h, to.h, p),
      radii: from.radii.map((r, i) => lerp(r, to.radii[i]!, p)) as Radii,
    };
  }

  jump(item: Element) {
    this.stop();
    this.from = null;
    this.to = item;
    this.progress.jump(1);
  }

  glide(item: Element, transition: Transition) {
    if (item === this.to) return;
    const from = this.current();
    const previous = this.to && this.shapeOf(this.to);
    const next = this.shapeOf(item);
    if (!from || !next) return this.jump(item);
    const rate = this.controls ? this.progress.getVelocity() / 1000 : 0;
    const base = this.from;
    const velocity =
      base && previous
        ? [
            (previous.x - base.x) * rate,
            (previous.y - base.y) * rate,
            (previous.w - base.w) * rate,
            (previous.h - base.h) * rate,
          ]
        : [0, 0, 0, 0];
    const offset = [
      from.x - next.x,
      from.y - next.y,
      from.w - next.w,
      from.h - next.h,
    ];
    const speed = startOf(transition, offset, velocity);
    const lag = this.controls
      ? Math.min(50, Math.max(0, performance.now() - this.drawnAt))
      : 0;
    this.stop();
    this.from = from;
    this.to = item;
    this.progress.jump(0);
    const controls = animate(this.progress, 1, {
      ...transition,
      velocity: speed * 1000,
      delay: -lag / 1000,
    } as Transition);
    this.controls = controls;
    void controls.then(() => {
      if (this.controls !== controls) return;
      this.controls = null;
      this.onSettled?.();
    });
  }

  stop() {
    this.controls?.stop();
    this.controls = null;
  }
}

type ItemState = {
  presence: MotionValue<number>;
  target: number;
  controls: AnimationPlaybackControls | null;
  look: Look | null;
  element: HTMLElement | null;
};

type ToggleGroupHighlightOptions = {
  library: HighlightLibrary;
  multiple: boolean;
  transition?: Transition;
};

function useToggleGroupHighlight(
  root: HTMLElement | null,
  { library, multiple, transition }: ToggleGroupHighlightOptions,
) {
  const slide = useTempoTransition(transition ?? SELECTION_TRANSITION);
  const fill = useTempoTransition(motionTokens.transition.fill);
  const glide = useTempoTransition(motionTokens.spring.highlight);
  const color = useTempoTransition(motionTokens.transition.color);
  const resume = useTempoTransition(motionTokens.transition.fade);
  const reduce = useShouldReduceMotion();
  const latestRef = React.useRef({ slide, fill, glide, color, resume });
  React.useLayoutEffect(() => {
    latestRef.current = { slide, fill, glide, color, resume };
  });

  React.useLayoutEffect(() => {
    if (!root || typeof root.attachShadow !== 'function') return;
    let shadow = root.shadowRoot;
    if (!shadow) {
      try {
        shadow = root.attachShadow({ mode: 'open' });
        shadow.append(document.createElement('slot'));
      } catch {
        return;
      }
    }
    if (!shadow.querySelector('slot')) return;
    if (getComputedStyle(root).position === 'static')
      root.style.setProperty('position', 'relative');
    root.style.setProperty('isolation', 'isolate');

    const layer = document.createElement('div');
    layer.setAttribute('data-slot', 'toggle-group-surfaces');
    layer.setAttribute('aria-hidden', 'true');
    layer.style.cssText =
      'position:absolute;inset:0;z-index:-1;pointer-events:none';
    shadow.prepend(layer);
    const surface = (slot: string) => {
      const el = document.createElement('div');
      el.setAttribute('data-slot', slot);
      el.style.cssText =
        'position:absolute;left:0;top:0;visibility:hidden;margin:0';
      return el;
    };
    const highlightEl = surface('toggle-group-highlight');
    const colorTiming = toCssTiming(latestRef.current.color);
    highlightEl.style.transition = `background-color ${colorTiming.duration}ms ${colorTiming.easing}`;
    layer.append(highlightEl);

    const selector = `[${ITEM_ATTRIBUTE}]`;
    const ownItems = () =>
      Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => el.parentElement?.closest(`[${GROUP_ATTRIBUTE}]`) === root,
      );
    const isSelected = (el: Element) => el.matches(SELECTED[library]);
    const isDisabled = (el: Element) =>
      el.matches(':disabled,[data-disabled],[aria-disabled="true"]');

    let items = ownItems();
    const states = new Map<Element, ItemState>();
    const links = new Map<
      string,
      {
        value: MotionValue<number>;
        target: number;
        controls: AnimationPlaybackControls | null;
      }
    >();
    const keyOf = (a: Element, b: Element) =>
      `${items.indexOf(a as HTMLElement)}:${items.indexOf(b as HTMLElement)}`;

    let place = placer(root);
    const boxes = new Map<Element, Rect>();
    const boxOf = (el: Element) => {
      let box = boxes.get(el);
      if (!box) {
        box = place(el);
        boxes.set(el, box);
      }
      return box;
    };

    const single = {
      element: surface('toggle-group-selection'),
      presence: motionValue(0),
      controls: null as AnimationPlaybackControls | null,
      target: 0,
      look: null as Look | null,
    };
    single.element.setAttribute('data-single', '');
    const singleGlider = new Glider((item) => {
      const look = states.get(item)?.look;
      if (!item.isConnected || !look) return null;
      return { ...boxOf(item), radii: look.radii };
    });
    const highlight = {
      opacity: motionValue(0),
      controls: null as AnimationPlaybackControls | null,
      look: null as Look | null,
      lit: null as HTMLElement | null,
    };
    const hoverLooks = new WeakMap<Element, Look>();
    const highlightGlider = new Glider((item) => {
      const look = hoverLooks.get(item);
      return item.isConnected && look
        ? { ...boxOf(item), radii: look.radii }
        : null;
    });

    const perItem = multiple || reduce;
    if (!perItem) layer.prepend(single.element);

    const stateOf = (el: Element) => {
      let state = states.get(el);
      if (!state) {
        state = {
          presence: motionValue(0),
          target: 0,
          controls: null,
          look: null,
          element: null,
        };
        state.presence.on('change', request);
        states.set(el, state);
      }
      return state;
    };

    let scheduled = false;
    let followUntil = 0;
    function request() {
      if (scheduled) return;
      scheduled = true;
      frame.postRender(draw);
    }

    function draw() {
      scheduled = false;
      place = placer(root!);
      boxes.clear();
      const shapes = new Map<Element, Shape>();

      if (perItem) {
        for (const item of items) {
          const state = states.get(item);
          if (!state?.look) continue;
          const p = state.presence.get();
          if (p <= 0 && !state.element) continue;
          const scale = reduce ? 1 : lerp(motionTokens.scale.fill, 1, p);
          shapes.set(item, scaled(boxOf(item), state.look.radii, scale));
        }
        for (let i = 0; i < items.length - 1; i++) {
          const a = items[i]!;
          const b = items[i + 1]!;
          const sa = states.get(a);
          const sb = states.get(b);
          const shapeA = shapes.get(a);
          const shapeB = shapes.get(b);
          if (!sa?.look || !sb?.look || !shapeA || !shapeB) continue;
          const link = linkOf(boxOf(a), boxOf(b), sa.look, sb.look);
          if (!link) continue;
          const [sideA, sideB] = link.sides;
          const pa = sa.presence.get();
          const pb = sb.presence.get();
          if (reduce) {
            if (pa <= 0 || pb <= 0) continue;
            const aSettled = pa >= 1;
            const bSettled = pb >= 1;
            if (aSettled !== bSettled) {
              const [shape, side, other, otherSide, otherLook] = aSettled
                ? [shapeB, sideB, boxOf(a), sideA, sa.look]
                : [shapeA, sideA, boxOf(b), sideB, sb.look];
              const [c1, c2] = CORNERS[otherSide];
              const cover = Math.max(
                otherLook.radii[c1]!,
                otherLook.radii[c2]!,
              );
              setSide(
                shape,
                side,
                sideOf(other, otherSide) - outward(otherSide) * cover,
              );
              for (const c of CORNERS[side]) shape.radii[c] = 0;
            } else {
              setSide(shapeA, sideA, link.middle + outward(sideA) * OVERLAP);
              setSide(shapeB, sideB, link.middle + outward(sideB) * OVERLAP);
              for (const c of CORNERS[sideA]) shapeA.radii[c] = 0;
              for (const c of CORNERS[sideB]) shapeB.radii[c] = 0;
            }
            continue;
          }
          const joined = links.get(keyOf(a, b))?.value.get() ?? 0;
          if (joined <= 0) continue;
          const amount = Math.min(1, joined);
          for (const [shape, side] of [
            [shapeA, sideA],
            [shapeB, sideB],
          ] as const) {
            const edge = sideOf(shape, side);
            setSide(
              shape,
              side,
              lerp(edge, link.middle + outward(side) * OVERLAP, amount),
            );
            for (const c of CORNERS[side])
              shape.radii[c] = shape.radii[c]! * (1 - amount);
          }
        }
        for (const item of items) {
          const state = states.get(item)!;
          const shape = shapes.get(item);
          if (!shape || !state.look) continue;
          if (!state.element) {
            state.element = surface('toggle-group-selection');
            state.element.setAttribute(
              'data-index',
              String(items.indexOf(item)),
            );
            highlightEl.before(state.element);
          }
          paint(state.element, shape, state.look, state.presence.get());
        }
      } else {
        const shape = singleGlider.current();
        const p = single.presence.get();
        if (shape && single.look) {
          const scale = reduce ? 1 : lerp(motionTokens.scale.fill, 1, p);
          paint(
            single.element,
            scaled(shape, shape.radii, scale),
            single.look,
            p,
          );
        } else single.element.style.visibility = 'hidden';
      }

      const shape = highlightGlider.current();
      if (shape && highlight.look)
        paint(highlightEl, shape, highlight.look, highlight.opacity.get());
      else highlightEl.style.visibility = 'hidden';

      if (performance.now() < followUntil) request();
    }

    const run = (
      value: MotionValue<number>,
      to: number,
      transition: Transition,
      jump: boolean,
    ) => {
      if (jump) {
        value.jump(to);
        return null;
      }
      const controls = animate(value, to, transition);
      void controls.then(() => {
        if (!disposed) syncHover();
      });
      return controls;
    };

    let mounted = false;
    let disposed = false;
    function update() {
      items = ownItems();
      const jump = !mounted;
      const { fill, slide } = latestRef.current;
      const selected = items.filter(isSelected);

      for (const [el, state] of states)
        if (!items.includes(el as HTMLElement)) {
          state.controls?.stop();
          state.element?.remove();
          states.delete(el);
        }

      for (const item of items) {
        const on = selected.includes(item);
        const state = stateOf(item);
        if (on || !state.look) state.look = readLook(item);
        if (!perItem) continue;
        const target = on ? 1 : 0;
        if (target === state.target && (mounted || !on)) continue;
        state.target = target;
        state.controls?.stop();
        state.controls = run(state.presence, target, fill, jump);
      }

      if (perItem && !reduce)
        for (let i = 0; i < items.length - 1; i++) {
          const a = items[i]!;
          const b = items[i + 1]!;
          const key = keyOf(a, b);
          let link = links.get(key);
          if (!link) {
            link = { value: motionValue(0), target: 0, controls: null };
            link.value.on('change', request);
            links.set(key, link);
          }
          const target = selected.includes(a) && selected.includes(b) ? 1 : 0;
          if (target === link.target && mounted) continue;
          link.target = target;
          link.controls?.stop();
          link.controls = run(link.value, target, fill, jump);
        }

      if (!perItem) {
        const chosen = selected[0] ?? null;
        if (chosen) {
          single.look = stateOf(chosen).look;
          if (jump || single.presence.get() <= 0) singleGlider.jump(chosen);
          else singleGlider.glide(chosen, slide);
        }
        const target = chosen ? 1 : 0;
        if (target !== single.target || jump) {
          single.target = target;
          single.controls?.stop();
          single.controls = run(single.presence, target, fill, jump);
        }
      }

      syncHover();
      mounted = true;
      request();
    }

    single.presence.on('change', request);
    singleGlider.onSettled = () => {
      if (!disposed) syncHover();
    };
    singleGlider.progress.on('change', request);
    highlight.opacity.on('change', request);
    highlightGlider.progress.on('change', request);

    let hovered: HTMLElement | null = null;
    function settling(item: Element) {
      if (perItem) {
        const p = states.get(item)?.presence.get() ?? 1;
        return p < 1;
      }
      return (
        single.presence.get() < 1 ||
        (singleGlider.to === item && singleGlider.progress.get() < 1)
      );
    }
    function covered(item: Element) {
      if (perItem) return (states.get(item)?.presence.get() ?? 0) > 0;
      return singleGlider.to === item && single.presence.get() > 0;
    }

    function syncHover() {
      const item = hovered && hovered.isConnected ? hovered : null;
      let look: Look | null = null;
      let same = false;
      if (item && !isDisabled(item)) {
        look = readLook(item);
        const own = states.get(item)?.look;
        same = own !== undefined && own !== null && samePaint(look, own);
        if (isBare(look) || (isSelected(item) && same && !settling(item)))
          look = null;
      }
      const { glide, color, resume } = latestRef.current;
      if (item && look) {
        const showing = highlight.opacity.get() > 0;
        highlight.look = look;
        hoverLooks.set(item, look);
        if (highlight.lit === item) return request();
        if (!showing || reduce) highlightGlider.jump(item);
        else highlightGlider.glide(item, glide);
        highlight.lit = item;
        highlight.controls?.stop();
        highlight.controls = null;
        if (same && covered(item)) highlight.opacity.jump(1);
        else
          highlight.controls = animate(
            highlight.opacity,
            1,
            showing ? resume : color,
          );
      } else if (highlight.lit) {
        highlight.lit = null;
        highlight.controls?.stop();
        highlight.controls = animate(highlight.opacity, 0, color);
      }
      request();
    }

    let hoverFrame = 0;
    const setHovered = (item: HTMLElement | null) => {
      if (item === hovered) return;
      hovered = item;
      syncHover();
      cancelAnimationFrame(hoverFrame);
      hoverFrame = requestAnimationFrame(syncHover);
    };
    const itemOf = (target: EventTarget | null) => {
      const item =
        target instanceof Element
          ? target.closest<HTMLElement>(selector)
          : null;
      return item && items.includes(item) ? item : null;
    };
    const onOver = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      setHovered(itemOf(event.target));
    };
    const onLeave = () => setHovered(null);
    const follow = () => {
      followUntil = performance.now() + 600;
      request();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') follow();
    };
    root.addEventListener('pointerover', onOver);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointerdown', follow);
    root.addEventListener('pointerup', follow);
    root.addEventListener('pointercancel', follow);
    root.addEventListener('keydown', onKey);
    root.addEventListener('keyup', onKey);

    const resize = new ResizeObserver(request);
    const observeItems = () => {
      resize.observe(root);
      for (const item of ownItems()) resize.observe(item);
    };
    const mutations = new MutationObserver(() => {
      observeItems();
      update();
    });
    mutations.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        'class',
        'data-state',
        'aria-pressed',
        'data-selected',
        'data-disabled',
        'disabled',
        'data-orientation',
        'dir',
      ],
    });
    observeItems();
    root.setAttribute(READY_ATTRIBUTE, '');
    update();
    cancelFrame(draw);
    draw();

    return () => {
      disposed = true;
      mutations.disconnect();
      resize.disconnect();
      cancelFrame(draw);
      cancelAnimationFrame(hoverFrame);
      root.removeEventListener('pointerover', onOver);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointerdown', follow);
      root.removeEventListener('pointerup', follow);
      root.removeEventListener('pointercancel', follow);
      root.removeEventListener('keydown', onKey);
      root.removeEventListener('keyup', onKey);
      for (const state of states.values()) state.controls?.stop();
      for (const link of links.values()) link.controls?.stop();
      single.controls?.stop();
      highlight.controls?.stop();
      singleGlider.stop();
      highlightGlider.stop();
      layer.remove();
      root.removeAttribute(READY_ATTRIBUTE);
    };
  }, [root, library, multiple, reduce]);

  return {
    style: (
      <style href="animate-ui-toggle-group-surfaces" precedence="animate-ui">
        {SURFACES_CSS}
      </style>
    ),
    rootProps: { [GROUP_ATTRIBUTE]: '' } as Record<string, string>,
  };
}

const toggleGroupItemProps = { [ITEM_ATTRIBUTE]: '' } as Record<string, string>;

export {
  SELECTION_TRANSITION,
  useToggleGroupHighlight,
  toggleGroupItemProps,
  type HighlightLibrary,
};
