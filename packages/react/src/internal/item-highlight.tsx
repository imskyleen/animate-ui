'use client';

import * as React from 'react';
import {
  createGeneratorEasing,
  generateLinearEasing,
  spring as springGenerator,
  type Transition,
} from 'motion/react';

import {
  motionTokens,
  toCssTiming,
  useShouldReduceMotion,
  useTempoTransition,
} from '../utils/motion';

const HIGHLIGHT_TRANSITION = motionTokens.spring.highlight;
const FADE_TRANSITION = motionTokens.transition.color;
const RESUME_TRANSITION = motionTokens.transition.fade;

type Surface = {
  backgroundColor: string;
  backgroundImage: string;
  borderRadius: string;
};

type Offset = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
};

type Glide = {
  animation: Animation;
  ease: (progress: number) => number;
  duration: number;
  from: Offset;
};

type SurfaceHandle = {
  id: string;
  element: HTMLElement;
  item: HTMLElement;
  glide: Glide | null;
};

type Leaving = { id: string; to: HTMLElement | null; key: number };

type HighlightScopeValue = {
  activeId: string | null;
  leaving: readonly Leaving[];
  slot: string;
  activate: (id: string, item: HTMLElement) => void;
  light: (id: string, item: HTMLElement) => void;
  unlight: (id: string) => void;
  left: (id: string) => void;
  handOff: (item: HTMLElement, reduce: boolean) => Start;
  register: (handle: SurfaceHandle) => () => void;
  gone: (opacity: number) => void;
  paint: (surface: Surface) => Surface;
};

const HighlightScopeContext = React.createContext<HighlightScopeValue | null>(
  null,
);

const TriggerScopeContext = React.createContext<HighlightScopeValue | null>(
  null,
);

type HighlightScopeProps = {
  open: boolean;
  shared?: boolean;
  children?: React.ReactNode;
};

function HighlightScope({ shared, ...props }: HighlightScopeProps) {
  const parent = React.use(HighlightScopeContext);
  if (shared && parent) return props.children;
  return (
    <OwnHighlightScope
      {...props}
      context={HighlightScopeContext}
      slot="item-highlight"
    />
  );
}

function TriggerHighlightScope({ children }: { children?: React.ReactNode }) {
  return (
    <OwnHighlightScope
      open
      context={TriggerScopeContext}
      slot="trigger-highlight"
    >
      {children}
    </OwnHighlightScope>
  );
}

function OwnHighlightScope({
  open,
  context: Context,
  slot,
  children,
}: Omit<HighlightScopeProps, 'shared'> & {
  context: React.Context<HighlightScopeValue | null>;
  slot: string;
}) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [leaving, setLeaving] = React.useState<readonly Leaving[]>([]);
  const surfaceRef = React.useRef<SurfaceHandle | null>(null);
  const keyRef = React.useRef(0);
  const paintRef = React.useRef<Surface | null>(null);
  const litRef = React.useRef(new Map<string, HTMLElement>());
  const activeRef = React.useRef<string | null>(null);
  React.useLayoutEffect(() => {
    activeRef.current = activeId;
  }, [activeId]);
  const [wasOpen, setWasOpen] = React.useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setActiveId(null);
      setLeaving([]);
    }
  }

  const activate = React.useCallback((id: string, item: HTMLElement) => {
    const previous = surfaceRef.current;
    activeRef.current = id;
    setActiveId(id);
    const moves =
      previous && previous.id !== id && previous.element.isConnected
        ? previous
        : null;
    const cross = moves !== null && crossesClip(moves.item, item);
    const key = (keyRef.current += 1);
    setLeaving((list) => {
      const rest = without(list, id).filter((other) => other.to !== null);
      if (!moves || (!cross && rest.length === 0)) return rest;
      const along = rest.map((other) => ({ ...other, to: item, key }));
      return cross
        ? [...without(along, moves.id), { id: moves.id, to: item, key }]
        : along;
    });
  }, []);
  const left = React.useCallback(
    (id: string) => setLeaving((list) => without(list, id)),
    [],
  );
  const light = React.useCallback(
    (id: string, item: HTMLElement) => {
      litRef.current.delete(id);
      litRef.current.set(id, item);
      activate(id, item);
    },
    [activate],
  );
  const unlight = React.useCallback(
    (id: string) => {
      const lit = litRef.current;
      if (!lit.delete(id) || activeRef.current !== id) return;
      const next = [...lit].at(-1);
      if (next) {
        activate(...next);
        return;
      }
      activeRef.current = null;
      setActiveId(null);
      const key = (keyRef.current += 1);
      setLeaving((list) => [...without(list, id), { id, to: null, key }]);
    },
    [activate],
  );
  const goneRef = React.useRef<{ opacity: number; at: number } | null>(null);
  const handOffFrom = React.useCallback(
    (item: HTMLElement, reduce: boolean) => {
      const start = handOff(surfaceRef.current, item, reduce);
      const gone = goneRef.current;
      if (
        !surfaceRef.current?.element.isConnected &&
        gone &&
        performance.now() - gone.at < 120
      )
        return { ...start, opacity: gone.opacity, fresh: false };
      return start;
    },
    [],
  );
  const gone = React.useCallback((opacity: number) => {
    goneRef.current = { opacity, at: performance.now() };
  }, []);
  const register = React.useCallback((handle: SurfaceHandle) => {
    surfaceRef.current = handle;
    return () => {
      if (surfaceRef.current === handle) surfaceRef.current = null;
    };
  }, []);
  const paint = React.useCallback((surface: Surface) => {
    if (isBare(surface)) return paintRef.current ?? surface;
    paintRef.current = surface;
    return surface;
  }, []);

  const value = React.useMemo(
    () => ({
      activeId,
      leaving,
      slot,
      activate,
      light,
      unlight,
      left,
      handOff: handOffFrom,
      register,
      gone,
      paint,
    }),
    [
      activeId,
      leaving,
      slot,
      activate,
      light,
      unlight,
      left,
      handOffFrom,
      register,
      gone,
      paint,
    ],
  );

  return <Context value={value}>{children}</Context>;
}

const SURFACE_PROPERTIES = ['background-color', 'background-image'] as const;
type SavedStyle = [property: string, value: string, priority: string][];
const savedStyles = new WeakMap<HTMLElement, SavedStyle>();

function save(node: HTMLElement, properties: readonly string[]): SavedStyle {
  return properties.map((property) => [
    property,
    node.style.getPropertyValue(property),
    node.style.getPropertyPriority(property),
  ]);
}

function restore(node: HTMLElement, saved: SavedStyle) {
  for (const [property, value, priority] of saved) {
    if (value) node.style.setProperty(property, value, priority);
    else node.style.removeProperty(property);
  }
}

function clearOwnSurface(node: HTMLElement, clear: boolean) {
  const saved = savedStyles.get(node);
  if (clear && !saved) {
    savedStyles.set(node, save(node, SURFACE_PROPERTIES));
    node.style.setProperty('background-color', 'transparent', 'important');
    node.style.setProperty('background-image', 'none', 'important');
  } else if (!clear && saved) {
    savedStyles.delete(node);
    restore(node, saved);
  }
}

const isBare = ({ backgroundColor, backgroundImage }: Surface) =>
  backgroundImage === 'none' &&
  (backgroundColor === 'transparent' ||
    /^rgba\(.*,\s*0\)$/.test(backgroundColor));

function readSurface(node: HTMLElement): Surface {
  const cleared = savedStyles.get(node);
  const transition = save(node, ['transition']);
  node.style.setProperty('transition', 'none', 'important');
  if (cleared) restore(node, cleared);
  const style = getComputedStyle(node);
  const surface = {
    backgroundColor: style.backgroundColor,
    backgroundImage: style.backgroundImage,
    borderRadius: style.borderRadius,
  };
  if (cleared) {
    node.style.setProperty('background-color', 'transparent', 'important');
    node.style.setProperty('background-image', 'none', 'important');
  }
  void getComputedStyle(node).backgroundColor;
  restore(node, transition);
  return surface;
}

const isExpanded = (node: HTMLElement) =>
  node.getAttribute('aria-expanded') === 'true';

const without = (list: readonly Leaving[], id: string) =>
  list.some((other) => other.id === id)
    ? list.filter((other) => other.id !== id)
    : list;

function clipperOf(item: HTMLElement) {
  const body = item.ownerDocument.body;
  for (let el = item.parentElement; el && el !== body; el = el.parentElement) {
    const { overflowX, overflowY } = getComputedStyle(el);
    if (overflowX !== 'visible' || overflowY !== 'visible') return el;
  }
  return null;
}

const crossesClip = (from: HTMLElement, to: HTMLElement) =>
  clipperOf(from) !== clipperOf(to);

type ItemHighlight = {
  ref: (node: HTMLElement | null) => void;
  highlight: React.ReactNode;
};

type ItemHighlightOptions = {
  attribute?: string;
  followFocus?: boolean;
};

type TriggerHighlightOptions = {
  beside?: boolean;
};

function useItemHighlight(
  disabled?: boolean,
  {
    attribute = 'data-highlighted',
    followFocus = false,
  }: ItemHighlightOptions = {},
): ItemHighlight {
  return useHighlightIn(
    React.use(HighlightScopeContext),
    disabled,
    attribute,
    false,
    followFocus,
  );
}

function useTriggerHighlight(
  disabled?: boolean,
  { beside = false }: TriggerHighlightOptions = {},
): ItemHighlight {
  return useHighlightIn(React.use(TriggerScopeContext), disabled, null, beside);
}

const samePaint = (a: Surface | null, b: Surface) =>
  a !== null &&
  a.backgroundColor === b.backgroundColor &&
  a.backgroundImage === b.backgroundImage &&
  a.borderRadius === b.borderRadius;

const TRIGGER_ATTRIBUTES = [
  'aria-expanded',
  'data-state',
  'data-highlighted',
  'data-popup-open',
  'data-pressed',
  'data-disabled',
];

function useHighlightIn(
  scope: HighlightScopeValue | null,
  disabled: boolean | undefined,
  attribute: string | null,
  beside = false,
  followFocus = false,
): ItemHighlight {
  const id = React.useId();
  const [node, setNode] = React.useState<HTMLElement | null>(null);
  const [surface, setSurface] = React.useState<Surface | null>(null);
  const paint = scope?.paint;
  const light = scope?.light;
  const unlight = scope?.unlight;
  const ref = React.useCallback((element: HTMLElement | null) => {
    if (element)
      setNode((current) => (current === element ? current : element));
  }, []);

  React.useLayoutEffect(() => {
    if (attribute !== null || !light || !unlight || !node) return;
    if (!beside && getComputedStyle(node).position === 'static')
      node.style.setProperty('position', 'relative');
    let hovered = false;
    let lit = false;
    let frame = 0;
    const sync = () => {
      const interactive =
        !disabled && (hovered || isExpanded(node) || node.matches(':focus'));
      if (interactive) clearOwnSurface(node, true);
      const surface = interactive ? readSurface(node) : null;
      const now = surface !== null && !isBare(surface);
      if (surface && now)
        setSurface((current) =>
          samePaint(current, surface) ? current : surface,
        );
      clearOwnSurface(node, now);
      if (now === lit) return;
      lit = now;
      if (now) light(id, node);
      else unlight(id);
    };
    const enter = () => {
      hovered = true;
      sync();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };
    const leave = () => {
      hovered = false;
      cancelAnimationFrame(frame);
      sync();
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(node, {
      attributes: true,
      attributeFilter: TRIGGER_ATTRIBUTES,
    });
    node.addEventListener('pointerenter', enter);
    node.addEventListener('pointerleave', leave);
    node.addEventListener('focus', sync);
    node.addEventListener('blur', sync);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      node.removeEventListener('pointerenter', enter);
      node.removeEventListener('pointerleave', leave);
      node.removeEventListener('focus', sync);
      node.removeEventListener('blur', sync);
      clearOwnSurface(node, false);
      if (lit) unlight(id);
    };
  }, [attribute, light, unlight, node, id, disabled, beside]);

  React.useLayoutEffect(() => {
    if (attribute === null || !light || !unlight || !paint || !node) return;
    if (getComputedStyle(node).position === 'static')
      node.style.setProperty('position', 'relative');

    const clear = () =>
      clearOwnSurface(
        node,
        node.hasAttribute(attribute) ||
          isExpanded(node) ||
          node.matches(':focus'),
      );
    const sync = () => {
      if (node.hasAttribute(attribute)) {
        setSurface(paint(readSurface(node)));
        light(id, node);
      } else if (followFocus) unlight(id);
      clear();
    };
    const focus = () => {
      if (node.hasAttribute(attribute)) setSurface(paint(readSurface(node)));
      clear();
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(node, {
      attributes: true,
      attributeFilter: [attribute, 'aria-expanded'],
    });
    node.addEventListener('focus', focus);
    node.addEventListener('blur', clear);
    return () => {
      observer.disconnect();
      node.removeEventListener('focus', focus);
      node.removeEventListener('blur', clear);
      clearOwnSurface(node, false);
    };
  }, [light, unlight, paint, node, id, attribute, followFocus]);

  const active = scope?.activeId === id && !disabled;
  const leaving =
    (!disabled && scope?.leaving.find((other) => other.id === id)) || null;

  return {
    ref,
    highlight: scope ? (
      <HighlightSurface
        id={id}
        surface={surface}
        active={active}
        leaving={leaving}
        item={node}
        scope={scope}
        beside={beside}
      />
    ) : null,
  };
}

type HighlightSurfaceProps = {
  id: string;
  surface: Surface | null;
  active: boolean;
  leaving: Leaving | null;
  item: HTMLElement | null;
  scope: HighlightScopeValue;
  beside: boolean;
};

function HighlightSurface({
  id,
  surface,
  active,
  leaving,
  item,
  scope,
  beside,
}: HighlightSurfaceProps) {
  if (!surface || !item) return null;
  return (
    <>
      {active && (
        <SurfaceCopy
          key="active"
          id={id}
          surface={surface}
          item={item}
          scope={scope}
          beside={beside}
        />
      )}
      {leaving && !active && (
        <SurfaceCopy
          key={`leaving-${leaving.key}`}
          id={id}
          surface={surface}
          item={item}
          scope={scope}
          beside={beside}
          leavingTo={leaving.to}
          fadeOut={leaving.to === null}
        />
      )}
    </>
  );
}

function placeOver(element: HTMLElement, item: HTMLElement) {
  const host = element.offsetParent as HTMLElement | null;
  const box = item.getBoundingClientRect();
  const origin = host?.getBoundingClientRect();
  const ratioX =
    origin && host?.offsetWidth ? origin.width / host.offsetWidth : 1;
  const ratioY =
    origin && host?.offsetHeight ? origin.height / host.offsetHeight : 1;
  const left = origin
    ? (box.left - origin.left) / ratioX - host!.clientLeft + host!.scrollLeft
    : box.left + window.scrollX;
  const top = origin
    ? (box.top - origin.top) / ratioY - host!.clientTop + host!.scrollTop
    : box.top + window.scrollY;
  element.style.left = `${left}px`;
  element.style.top = `${top}px`;
  element.style.width = `${box.width / ratioX}px`;
  element.style.height = `${box.height / ratioY}px`;
}

function useBesideBox(
  elementRef: React.RefObject<HTMLElement | null>,
  item: HTMLElement,
  beside: boolean,
) {
  React.useLayoutEffect(() => {
    const element = elementRef.current;
    if (!beside || !element) return;
    const place = () => placeOver(element, item);
    place();
    const observer = new ResizeObserver(place);
    observer.observe(item);
    if (element.offsetParent) observer.observe(element.offsetParent);
    return () => observer.disconnect();
  }, [elementRef, item, beside]);
}

type Start = {
  offset: Offset;
  opacity: number;
  color: string | null;
  fresh: boolean;
  velocity: Offset;
  cross: boolean;
};

const IN_PLACE: Offset = { x: 0, y: 0, scaleX: 1, scaleY: 1 };
const STILL: Offset = { x: 0, y: 0, scaleX: 0, scaleY: 0 };

function velocityOf({ animation, ease, duration, from }: Glide): Offset {
  const time = Number(animation.currentTime ?? duration);
  if (!(time < duration)) return STILL;
  const step = 4;
  const before = Math.max(0, time - step);
  const rate =
    (ease(Math.min(1, (before + step) / duration)) - ease(before / duration)) /
    step;
  return {
    x: -from.x * rate,
    y: -from.y * rate,
    scaleX: (1 - from.scaleX) * rate,
    scaleY: (1 - from.scaleY) * rate,
  };
}

function handOff(
  previous: SurfaceHandle | null,
  item: HTMLElement,
  reduce: boolean,
): Start {
  if (!previous?.element.isConnected)
    return {
      offset: IN_PLACE,
      opacity: 0,
      color: null,
      fresh: true,
      velocity: STILL,
      cross: false,
    };
  const style = getComputedStyle(previous.element);
  const opacity = Number(style.opacity);
  const color = style.backgroundColor;
  const cross = crossesClip(previous.item, item);
  const offset = offsetOn(previous.element.getBoundingClientRect(), item);
  if (reduce || !offset)
    return {
      offset: IN_PLACE,
      opacity,
      color,
      fresh: false,
      velocity: STILL,
      cross,
    };

  const own = item.getBoundingClientRect();
  const from = previous.item.getBoundingClientRect();
  const velocity = previous.glide ? velocityOf(previous.glide) : STILL;
  return {
    offset,
    opacity,
    color,
    fresh: false,
    velocity: {
      x: velocity.x,
      y: velocity.y,
      scaleX: (velocity.scaleX * from.width) / own.width,
      scaleY: (velocity.scaleY * from.height) / own.height,
    },
    cross,
  };
}

function offsetOn(box: DOMRect, item: HTMLElement): Offset | null {
  const own = item.getBoundingClientRect();
  if (!own.width || !own.height) return null;
  const ratioX = own.width / (item.offsetWidth || own.width);
  const ratioY = own.height / (item.offsetHeight || own.height);
  return {
    x: (box.left - own.left) / ratioX,
    y: (box.top - own.top) / ratioY,
    scaleX: box.width / own.width,
    scaleY: box.height / own.height,
  };
}

function initialRate(
  { offset, velocity }: Start,
  to: Offset,
  width: number,
  height: number,
) {
  const way = [
    to.x - offset.x,
    to.y - offset.y,
    (to.scaleX - offset.scaleX) * width,
    (to.scaleY - offset.scaleY) * height,
  ];
  const speed = [
    velocity.x,
    velocity.y,
    velocity.scaleX * width,
    velocity.scaleY * height,
  ];
  const length = way.reduce((sum, d) => sum + d * d, 0);
  if (length < 0.25) return null;
  return way.reduce((sum, d, i) => sum + d * speed[i]!, 0) / length;
}

const toTransform = ({ x, y, scaleX, scaleY }: Offset) =>
  `translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY})`;

type SurfaceCopyProps = {
  id: string;
  surface: Surface;
  item: HTMLElement;
  scope: HighlightScopeValue;
  leavingTo?: HTMLElement | null;
  fadeOut?: boolean;
  beside?: boolean;
};

function SurfaceCopy({
  id,
  surface,
  item,
  scope,
  leavingTo = null,
  fadeOut = false,
  beside = false,
}: SurfaceCopyProps) {
  const reduce = useShouldReduceMotion();
  const glide = useTempoTransition<Transition>(HIGHLIGHT_TRANSITION);
  const fade = useTempoTransition<Transition>(FADE_TRANSITION);
  const resume = useTempoTransition<Transition>(RESUME_TRANSITION);
  const [start] = React.useState(() => scope.handOff(item, reduce));
  const [target] = React.useState(() =>
    leavingTo && !reduce
      ? offsetOn(leavingTo.getBoundingClientRect(), item)
      : null,
  );
  const elementRef = React.useRef<HTMLSpanElement>(null);
  const transitionsRef = React.useRef({ glide, fade, resume });
  const { register, gone, left } = scope;
  useBesideBox(elementRef, item, beside);

  React.useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;
    const animations: Animation[] = [];
    let running: Glide | null = null;
    if (leavingTo && !target) {
      left(id);
      return undefined;
    }

    const to = target ?? IN_PLACE;
    const rate = initialRate(start, to, item.offsetWidth, item.offsetHeight);
    let timing: { duration: number; easing: string } | null = null;
    if (rate !== null) {
      const { ease, duration } = createGeneratorEasing(
        { ...transitionsRef.current.glide, velocity: rate * 1000 * 100 },
        100,
        springGenerator,
      );
      const ms = duration * 1000;
      timing = { duration: ms, easing: generateLinearEasing(ease, ms) };
      const animation = element.animate(
        [
          { transform: toTransform(start.offset) },
          { transform: target ? toTransform(target) : 'none' },
        ],
        { ...timing, fill: target ? 'forwards' : 'auto' },
      );
      animations.push(animation);
      running = { animation, ease, duration: ms, from: start.offset };
    }

    if (target) {
      if (running)
        running.animation.finished.then(
          () => left(id),
          () => {},
        );
      else left(id);
      return () => {
        for (const animation of animations) animation.cancel();
      };
    }

    if (fadeOut) {
      const { duration, easing } = toCssTiming(transitionsRef.current.fade);
      const fading = element.animate(
        [{ opacity: start.opacity }, { opacity: 0 }],
        { duration, easing, fill: 'forwards' },
      );
      animations.push(fading);
      fading.finished.then(
        () => left(id),
        () => {},
      );
    } else if (start.cross && timing) {
      animations.push(
        element.animate([{ opacity: 0 }, { opacity: 1 }], timing),
      );
    } else if (start.opacity < 1) {
      const { duration, easing } = toCssTiming(
        start.fresh
          ? transitionsRef.current.fade
          : transitionsRef.current.resume,
      );
      animations.push(
        element.animate([{ opacity: start.opacity }, { opacity: 1 }], {
          duration,
          easing,
        }),
      );
    }

    const color = getComputedStyle(element).backgroundColor;
    if (start.color && start.color !== color && !target) {
      const { duration, easing } = toCssTiming(transitionsRef.current.fade);
      animations.push(
        element.animate(
          [{ backgroundColor: start.color }, { backgroundColor: color }],
          { duration, easing },
        ),
      );
    }

    const unregister = register({ id, element, item, glide: running });
    return () => {
      const opacity = element.isConnected
        ? Number(getComputedStyle(element).opacity)
        : 0;
      for (const animation of animations) animation.cancel();
      unregister();
      gone(opacity);
    };
  }, [register, gone, left, id, item, start, target, leavingTo, fadeOut]);

  const { duration: colorDuration, easing: colorEasing } = toCssTiming(fade);

  return (
    <span
      ref={elementRef}
      aria-hidden
      data-slot={scope.slot}
      data-leaving={leavingTo || fadeOut ? '' : undefined}
      style={{
        position: 'absolute',
        ...(!beside && { inset: 0 }),
        zIndex: -1,
        pointerEvents: 'none',
        transformOrigin: '0 0',
        borderRadius: surface.borderRadius,
        backgroundColor: surface.backgroundColor,
        backgroundImage: surface.backgroundImage,
        transition: `background-color ${colorDuration}ms ${colorEasing}`,
      }}
    />
  );
}

function withHighlight(
  children: React.ReactNode,
  highlight: React.ReactNode,
  asChild?: boolean,
): React.ReactNode {
  if (!highlight) return children;
  if (asChild && React.isValidElement<{ children?: React.ReactNode }>(children))
    return React.cloneElement(
      children,
      undefined,
      <>
        {children.props.children}
        {highlight}
      </>,
    );
  return (
    <>
      {children}
      {highlight}
    </>
  );
}

export {
  HighlightScope,
  TriggerHighlightScope,
  useItemHighlight,
  useTriggerHighlight,
  withHighlight,
  HIGHLIGHT_TRANSITION,
  type ItemHighlight,
  type TriggerHighlightOptions,
};
