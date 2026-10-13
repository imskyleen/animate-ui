import * as React from 'react';
import type { Transition } from 'motion/react';

import {
  toCssTiming,
  type CssTiming,
  type MotionTokens,
} from '../utils/motion';
import { animateTo, forget, targetsOf, type Look } from './controls/indicator';

type Copy = {
  element: HTMLElement | SVGElement;
  rect: DOMRect;
  text: string;
  opacity: number;
  filter: string;
  color: string;
  time: number | null;
};

type Snapshot = {
  root: DOMRect;
  height: number;
  scale: number;
  icon: Copy | null;
  title: Copy | null;
  description: Copy | null;
};

const ICON = '[data-slot="toast-icon"]';

function iconOf(root: HTMLElement) {
  return (root.querySelector(ICON)?.firstElementChild ?? null) as
    HTMLElement | SVGElement | null;
}

function labelOf(root: HTMLElement, attribute: string) {
  const id = root.getAttribute(attribute);
  return id
    ? (root.ownerDocument.getElementById(id) as HTMLElement | null)
    : null;
}

const TEXT_STYLES = [
  'font',
  'letterSpacing',
  'lineHeight',
  'textAlign',
  'whiteSpace',
  'overflowWrap',
  'wordBreak',
] as const;

function copyOf(element: HTMLElement | SVGElement | null): Copy | null {
  if (!element || !element.isConnected) return null;
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  const cs = getComputedStyle(element);
  const clone = element.cloneNode(true) as HTMLElement | SVGElement;
  for (const el of [clone, ...clone.querySelectorAll('[id], [data-slot]')]) {
    el.removeAttribute('id');
    el.removeAttribute('data-slot');
  }
  if (clone instanceof HTMLElement)
    for (const property of TEXT_STYLES) clone.style[property] = cs[property];
  const spin = element
    .getAnimations()
    .find((animation) => animation instanceof CSSAnimation);
  const time = spin?.currentTime;
  return {
    element: clone,
    rect,
    text: element.textContent ?? '',
    opacity: Number(cs.opacity),
    filter: cs.filter,
    color: cs.color,
    time: typeof time === 'number' ? time : null,
  };
}

function takeSnapshot(root: HTMLElement | null): Snapshot | null {
  if (!root) return null;
  const box = root.getBoundingClientRect();
  return {
    root: box,
    height: root.offsetHeight,
    scale: root.offsetWidth ? box.width / root.offsetWidth : 1,
    icon: copyOf(iconOf(root)),
    title: copyOf(labelOf(root, 'aria-labelledby')),
    description: copyOf(labelOf(root, 'aria-describedby')),
  };
}

class UpdateSnapshot extends React.Component<{
  watch: readonly unknown[];
  take: () => Snapshot | null;
  onUpdate: (snapshot: Snapshot) => void;
  children: React.ReactNode;
}> {
  override getSnapshotBeforeUpdate(previous: { watch: readonly unknown[] }) {
    const changed = this.props.watch.some(
      (value, i) => !Object.is(value, previous.watch[i]),
    );
    return changed ? this.props.take() : null;
  }

  override componentDidUpdate(
    _props: unknown,
    _state: unknown,
    snapshot: Snapshot | null,
  ) {
    if (snapshot) this.props.onUpdate(snapshot);
  }

  override render() {
    return this.props.children;
  }
}

const DRAWN_TYPES = ['success', 'error'];

function showIcon(
  icon: Element,
  type: string | undefined,
  delay: number,
  tokens: MotionTokens,
  reduce: boolean,
) {
  forget([icon]);
  const drawn = DRAWN_TYPES.includes(type ?? '');
  const look: Look = { kind: 'check', animation: drawn ? 'draw' : 'pop' };
  const transition: Transition = drawn
    ? { ...tokens.transition.check, delay }
    : { ...tokens.spring.checkPop, delay };
  void animateTo(targetsOf([icon], look), look, true, transition, reduce);
  if (type === 'error' && !reduce) {
    const check = tokens.transition.check;
    shake(icon, (delay + check.duration / 2) * 1000, tokens);
  }
}

function shake(element: Element, delay: number, tokens: MotionTokens) {
  const { duration, ease } = tokens.transition.shake;
  const easing = `cubic-bezier(${ease.join(', ')})`;
  const swings = [0, -1, 1, -0.66, 0.66, -0.33, 0];
  element.animate(
    swings.map((swing) => ({
      transform: `translateX(${swing * tokens.shift.shake}px)`,
      easing,
    })),
    { duration: duration * 1000, delay },
  );
}

function place(root: HTMLElement, copy: Copy, snapshot: Snapshot) {
  const { element, rect } = copy;
  const s = snapshot.scale || 1;
  const holder = root.ownerDocument.createElement('div');
  holder.setAttribute('aria-hidden', 'true');
  holder.inert = true;
  Object.assign(holder.style, {
    position: 'absolute',
    left: `${(rect.left - snapshot.root.left) / s - root.clientLeft}px`,
    top: `${(rect.top - snapshot.root.top) / s - root.clientTop}px`,
    width: `${rect.width / s}px`,
    height: `${rect.height / s}px`,
    margin: '0',
    pointerEvents: 'none',
    color: copy.color,
    opacity: String(copy.opacity),
    filter: copy.filter,
  });
  if (element instanceof SVGElement) {
    element.setAttribute('width', '100%');
    element.setAttribute('height', '100%');
    element.style.display = 'block';
  }
  if (element instanceof HTMLElement) {
    element.style.margin = '0';
    element.style.width = '100%';
  }
  holder.append(element);
  root.append(holder);
  if (copy.time !== null)
    for (const animation of element.getAnimations())
      animation.currentTime = copy.time;
  return holder;
}

const css = (transition: Transition) => toCssTiming(transition);

function leave(
  holder: HTMLElement,
  shrink: boolean,
  tokens: MotionTokens,
  reduce: boolean,
) {
  const { duration, easing } = css(tokens.transition.swap);
  const from: Keyframe = { opacity: holder.style.opacity };
  const to: Keyframe = { opacity: 0 };
  if (!reduce) {
    from.filter =
      holder.style.filter === 'none' ? 'blur(0px)' : holder.style.filter;
    to.filter = tokens.blur.icon;
    if (shrink) {
      from.transform = 'scale(1)';
      to.transform = `scale(${tokens.scale.icon})`;
    }
  }
  const animation = holder.animate([from, to], {
    duration,
    easing,
    fill: 'forwards',
  });
  void animation.finished.then(
    () => holder.remove(),
    () => holder.remove(),
  );
}

function arrive(element: Element, tokens: MotionTokens, reduce: boolean) {
  const { duration, easing } = css(tokens.transition.swap);
  element.animate(
    reduce
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [
          { opacity: 0, filter: tokens.blur.icon },
          { opacity: 1, filter: 'blur(0px)' },
        ],
    { duration, easing },
  );
}

function glideHeight(root: HTMLElement, from: number, timing: CssTiming) {
  const inline = root.style.height;
  root.style.height = 'auto';
  const to = root.offsetHeight;
  root.style.height = inline;
  if (Math.abs(to - from) < 1) return;
  root.animate([{ height: `${from}px` }, { height: `${to}px` }], {
    duration: timing.duration,
    easing: timing.easing,
  });
}

function swapContent(
  root: HTMLElement | null,
  snapshot: Snapshot,
  typeChanged: boolean,
  type: string | undefined,
  tokens: MotionTokens,
  resize: CssTiming,
  reduce: boolean,
) {
  if (!root) return;
  if (!reduce) glideHeight(root, snapshot.height, resize);
  const positioned = getComputedStyle(root).position !== 'static';
  const parts = [
    [snapshot.title, labelOf(root, 'aria-labelledby')],
    [snapshot.description, labelOf(root, 'aria-describedby')],
  ] as const;
  for (const [before, now] of parts) {
    const text = now?.textContent ?? '';
    if (before && before.text === text && now) continue;
    if (before && positioned)
      leave(place(root, before, snapshot), false, tokens, reduce);
    if (now && text) arrive(now, tokens, reduce);
  }
  if (!typeChanged) return;
  if (snapshot.icon && positioned)
    leave(place(root, snapshot.icon, snapshot), true, tokens, reduce);
  const icon = iconOf(root);
  if (icon)
    showIcon(
      icon,
      type,
      snapshot.icon ? tokens.transition.swap.duration / 2 : 0,
      tokens,
      reduce,
    );
}

type Direction = 'up' | 'down' | 'left' | 'right';

const RUBBER_BAND_FACTOR = 0.5;
const RUBBER_BAND_LIMIT = 48;
const THROW_DURATION = 360;
const MIN_THROW_DURATION = 80;
const VELOCITY_WINDOW = 100;

function rubberBand(delta: number) {
  const pulled = RUBBER_BAND_FACTOR * Math.abs(delta);
  return (
    Math.sign(delta) *
    ((pulled * RUBBER_BAND_LIMIT) / (RUBBER_BAND_LIMIT + pulled))
  );
}

function displacement(direction: Direction, x: number, y: number) {
  if (direction === 'up') return -y;
  if (direction === 'down') return y;
  if (direction === 'left') return -x;
  return x;
}

type Point = { t: number; x: number; y: number };

type Drag = {
  pointerId: number;
  start: { x: number; y: number };
  first: boolean;
  axis: 'x' | 'y' | null;
  initial: { x: number; y: number; scale: number };
  width: number;
  height: number;
  points: Point[];
  releasedAt: number | null;
};

function startDrag(event: React.PointerEvent<HTMLElement>): Drag {
  const element = event.currentTarget;
  const m = new DOMMatrix(
    getComputedStyle(element).transform.replace('none', ''),
  );
  return {
    pointerId: event.pointerId,
    start: { x: event.clientX, y: event.clientY },
    first: true,
    axis: null,
    initial: { x: m.m41, y: m.m42, scale: Math.hypot(m.a, m.b) },
    width: element.offsetWidth,
    height: element.offsetHeight,
    points: [{ t: event.timeStamp, x: event.clientX, y: event.clientY }],
    releasedAt: null,
  };
}

function moveDrag(
  drag: Drag,
  event: React.PointerEvent<HTMLElement>,
  directions: Direction[],
) {
  if (event.pointerId !== drag.pointerId || drag.releasedAt !== null) return;
  if (drag.first) {
    drag.start = { x: event.clientX, y: event.clientY };
    drag.first = false;
  }
  const dx = event.clientX - drag.start.x;
  const dy = event.clientY - drag.start.y;
  const horizontal = directions.some((d) => d === 'left' || d === 'right');
  const vertical = directions.some((d) => d === 'up' || d === 'down');
  if (drag.axis === null && horizontal && vertical && Math.hypot(dx, dy) >= 1)
    drag.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
  drag.points.push({ t: event.timeStamp, x: event.clientX, y: event.clientY });
  if (drag.points.length > 32) drag.points.shift();
}

function dragOffset(drag: Drag, directions: Direction[]) {
  const last = drag.points.at(-1)!;
  const dx = drag.first ? 0 : last.x - drag.start.x;
  const dy = drag.first ? 0 : last.y - drag.start.y;
  const horizontal = directions.some((d) => d === 'left' || d === 'right');
  const vertical = directions.some((d) => d === 'up' || d === 'down');
  const follow = (delta: number, plus: Direction, minus: Direction) =>
    (delta > 0 && directions.includes(plus)) ||
    (delta < 0 && directions.includes(minus))
      ? delta
      : rubberBand(delta);
  const x = horizontal && drag.axis !== 'y' ? follow(dx, 'right', 'left') : 0;
  const y = vertical && drag.axis !== 'x' ? follow(dy, 'down', 'up') : 0;
  return { x, y };
}

function swipeStyle(drag: Drag, directions: Direction[]): React.CSSProperties {
  const { x, y } = dragOffset(drag, directions);
  const progress = Math.max(
    0,
    ...directions.map(
      (d) =>
        displacement(d, x, y) /
        ((d === 'left' || d === 'right' ? drag.width : drag.height) || 1),
    ),
  );
  const { initial } = drag;
  return {
    transform: `translateX(${initial.x + x}px) translateY(${initial.y + y}px) scale(${initial.scale})`,
    opacity: 1 - Math.min(1, progress),
  };
}

function throwTiming(drag: Drag, direction: Direction) {
  const end = drag.releasedAt ?? drag.points.at(-1)!.t;
  const recent = drag.points.filter((p) => end - p.t <= VELOCITY_WINDOW);
  const first = recent[0];
  const last = recent.at(-1);
  const speed =
    first && last && last !== first && end > first.t
      ? displacement(direction, last.x - first.x, last.y - first.y) /
        (end - first.t)
      : 0;
  const size =
    direction === 'left' || direction === 'right' ? drag.width : drag.height;
  const duration =
    speed > 0
      ? Math.min(THROW_DURATION, Math.max(MIN_THROW_DURATION, size / speed))
      : THROW_DURATION;
  return { duration: Math.round(duration), easing: 'linear' };
}

const PROGRESS = 'data-animate-ui-toast-progress';
const PROGRESS_BAR = 'data-animate-ui-toast-progress-bar';

const PROGRESS_CSS = `
:where([${PROGRESS}]) {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
  pointer-events: none;
  opacity: calc(1 - min(1, var(--toast-index, 0)));
  transition-property: opacity;
  transition-duration: var(--animate-ui-toast-fade-duration, 200ms);
  transition-timing-function: var(--animate-ui-toast-fade-ease, ease-out);
  transition-delay: var(--animate-ui-toast-cascade, 0ms);
}
:where([data-expanded] > [${PROGRESS}]) { opacity: 1; }
:where([${PROGRESS_BAR}]) {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: 2px;
  background-color: var(--animate-ui-toast-progress-color, currentColor);
  opacity: 0.25;
  transform-origin: left;
}
:where([${PROGRESS_BAR}][data-tinted]) { opacity: 0.8; }
:where([${PROGRESS_BAR}]:dir(rtl)) { transform-origin: right; }
`;

export {
  UpdateSnapshot,
  takeSnapshot,
  swapContent,
  showIcon,
  iconOf,
  startDrag,
  moveDrag,
  swipeStyle,
  throwTiming,
  PROGRESS,
  PROGRESS_BAR,
  PROGRESS_CSS,
  type Direction,
  type Drag,
  type Snapshot,
};
