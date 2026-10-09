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

// Animate UI v1's menu highlight (DropdownMenuHighlight, MenuHighlight): one
// surface glides behind the highlighted item, on a spring (stiffness 500,
// damping 40, a little quicker than v1's 350/35), instead of each item
// lighting up on its own. It follows the pointer and the arrow keys, goes into
// submenus, and stays on the last item when the pointer leaves the menu.
//
// Drop-in, it reuses the styles already written for the items: when an item
// gets highlighted, its own highlighted background (`focus:bg-accent`,
// `data-highlighted:bg-accent`…) is read and painted on the surface, and the
// item's background is cleared while it's highlighted (or its submenu is
// open, or it has the focus). Text colors stay on the item. Base UI and React
// Aria mark an item highlighted a moment before they focus it: a background
// on `:focus` (a submenu trigger's, often) is read again once the item has
// the focus.
//
// The active item renders the surface. When another item becomes active, the
// surface moves into it: the new element starts exactly where the previous
// one is on screen, at its opacity and with its velocity, and the previous one
// goes in the same frame. However fast the pointer or the arrow keys go,
// there's one highlight on screen, and a glide retargeted on the way keeps its
// momentum instead of starting over from rest. (v1 got the glide from a shared
// layoutId; Motion now crossfades shared layouts, so the hand-off is explicit
// here.) Only a highlight appearing from nothing fades in.
//
// Into a submenu (or back out of it), each menu clips its own surfaces, as
// v1's did: the previous surface doesn't go at once but glides along with the
// new one, the same way at the same time, so the two make one highlight
// crossing from one menu into the other, the part still in the menu it leaves
// and the part already in the one it enters. The entering one fades in as it
// glides; the leaving one goes once it has left its menu.
//
// The glide runs on the compositor: a Web Animation of `transform`, eased by
// the spring itself (a `linear()` curve, with the velocity it was handed). A
// busy main thread, a submenu mounting as the pointer reaches its trigger,
// doesn't stall it.
//
// The surface sits under every item's content: the menu becomes its own
// stacking context and the surface goes below its content (z-index -1), so
// gliding over another item never covers that item's text.
//
// A menubar's triggers share one the same way (`TriggerHighlightScope`):
// a trigger is lit while its own styles paint it, hovered, focused or with
// its menu open (`hover:bg-muted`, `aria-expanded:bg-muted`…). The surface
// glides from trigger to trigger, goes back to a trigger still lit when the
// one it's on goes dark, and fades out where it is once none is lit.

/** The highlight's spring: the glide. */
const HIGHLIGHT_TRANSITION = motionTokens.spring.highlight;
/** A highlight appearing from nothing: a short fade, in place. */
const FADE_TRANSITION = motionTokens.transition.fade;

type Surface = {
  backgroundColor: string;
  backgroundImage: string;
  borderRadius: string;
};

/** A surface's offset from its item: a translation, and a scale. */
type Offset = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
};

/** A running glide, enough to know how fast it moves at any time. */
type Glide = {
  animation: Animation;
  /** The spring's curve: the share of the time elapsed to the share of the way. */
  ease: (progress: number) => number;
  /** Milliseconds. */
  duration: number;
  /** Where it started, in its item's terms. */
  from: Offset;
};

/** The surface on screen: where the next one starts from. */
type SurfaceHandle = {
  /** Its item's id in the scope. */
  id: string;
  element: HTMLElement;
  item: HTMLElement;
  glide: Glide | null;
};

/**
 * An item whose surface glides along with the new one into another menu
 * (see `crossesClip`), toward `to`, the item the highlight went to. When the
 * highlight moves on, `to` follows it, under a new `key`: the surface starts
 * again from where the highlight is, on its way. With `to` null, no item is
 * lit anymore (a menubar's triggers): it fades out where it is.
 */
type Leaving = { id: string; to: HTMLElement | null; key: number };

type HighlightScopeValue = {
  activeId: string | null;
  leaving: readonly Leaving[];
  /** The surfaces' `data-slot`. */
  slot: string;
  activate: (id: string, item: HTMLElement) => void;
  /** A trigger is lit: the highlight goes to it. */
  light: (id: string, item: HTMLElement) => void;
  /**
   * A trigger went dark: the highlight goes back to the latest one still lit,
   * or fades out.
   */
  unlight: (id: string) => void;
  /** A leaving surface is gone. */
  left: (id: string) => void;
  /** Where a surface entering `item` starts (see `handOff`). */
  handOff: (item: HTMLElement, reduce: boolean) => Start;
  /** The surface on screen registers itself; returns its unregistration. */
  register: (handle: SurfaceHandle) => () => void;
  /**
   * The paint for an item's surface: what its styles give it, or, when
   * they give it nothing yet, the last highlight's (see `paint`).
   */
  paint: (surface: Surface) => Surface;
};

const HighlightScopeContext = React.createContext<HighlightScopeValue | null>(
  null,
);

/** A menubar's triggers' highlight (apart from its menus' items'). */
const TriggerScopeContext = React.createContext<HighlightScopeValue | null>(
  null,
);

type HighlightScopeProps = {
  /** The menu is open: reopening it starts without a highlight. */
  open: boolean;
  /**
   * Inside another scope (a submenu inside its menu), use that one: the
   * highlight goes into the submenu, like v1's.
   */
  shared?: boolean;
  children?: React.ReactNode;
};

/**
 * One highlight for the items inside: render it in the root content of a
 * menu (its submenus share it, like v1), a select, a combobox or a listbox.
 */
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

/**
 * One highlight for a menubar's triggers (`useTriggerHighlight`): render it
 * in the menubar. Its menus' items keep their own.
 */
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
  // Triggers lit, the latest last, and the active item as of the last event.
  const litRef = React.useRef(new Map<string, HTMLElement>());
  const activeRef = React.useRef<string | null>(null);
  React.useLayoutEffect(() => {
    activeRef.current = activeId;
  }, [activeId]);
  // A kept-mounted menu reopens without a highlight, like a new one. Closing
  // keeps it: the menu fades out as it was.
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
      // Coming back to an item while its surface leaves: it's the active one
      // again. A surface fading out gives way to the new one, which starts
      // from it.
      const rest = without(list, id).filter((other) => other.to !== null);
      if (!moves || (!cross && rest.length === 0)) return rest;
      // The highlight moves on: the surfaces leaving for it follow.
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
  const handOffFrom = React.useCallback(
    (item: HTMLElement, reduce: boolean) =>
      handOff(surfaceRef.current, item, reduce),
    [],
  );
  const register = React.useCallback((handle: SurfaceHandle) => {
    surfaceRef.current = handle;
    return () => {
      if (surfaceRef.current === handle) surfaceRef.current = null;
    };
  }, []);
  // An item highlighted before it's focused, whose highlighted background is
  // on `:focus` (shadcn/ui's React Aria submenu trigger), reads nothing; the
  // focus reads it again, unless the pointer has already moved on, on a busy
  // main thread. Meanwhile it wears the last highlight's paint: the menu's
  // items share one, and a transparent surface would be no highlight at all.
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
      paint,
    ],
  );

  return <Context value={value}>{children}</Context>;
}

const SURFACE_PROPERTIES = ['background-color', 'background-image'] as const;
type SavedStyle = [property: string, value: string, priority: string][];
/** Inline styles an item had before its background was cleared. */
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

/**
 * Clears (or gives back) the item's own background. Inline and important,
 * so it wins over any class, `!important` utilities included.
 */
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

/** No background at all: nothing to paint. */
const isBare = ({ backgroundColor, backgroundImage }: Surface) =>
  backgroundImage === 'none' &&
  (backgroundColor === 'transparent' ||
    /^rgba\(.*,\s*0\)$/.test(backgroundColor));

/** The background the item's own styles give it right now. */
function readSurface(node: HTMLElement): Surface {
  const cleared = savedStyles.get(node);
  const transition = save(node, ['transition']);
  // No transition: read the final color, and clear it again at once.
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
  // Applied before the transition comes back, so nothing fades.
  void getComputedStyle(node).backgroundColor;
  restore(node, transition);
  return surface;
}

// A submenu trigger whose submenu is open keeps its highlighted style in most
// themes: in v1, the highlight leaves it for the submenu.
const isExpanded = (node: HTMLElement) =>
  node.getAttribute('aria-expanded') === 'true';

const without = (list: readonly Leaving[], id: string) =>
  list.some((other) => other.id === id)
    ? list.filter((other) => other.id !== id)
    : list;

/** The closest element clipping the item (its menu or list scrolls). */
function clipperOf(item: HTMLElement) {
  const body = item.ownerDocument.body;
  for (let el = item.parentElement; el && el !== body; el = el.parentElement) {
    const { overflowX, overflowY } = getComputedStyle(el);
    if (overflowX !== 'visible' || overflowY !== 'visible') return el;
  }
  return null;
}

/**
 * Whether the highlight goes from one menu into another (into a submenu, or
 * back): menus clip their content (`overflow`), so a surface gliding in from
 * the menu beside would be cut at the menu's edge.
 */
const crossesClip = (from: HTMLElement, to: HTMLElement) =>
  clipperOf(from) !== clipperOf(to);

type ItemHighlight = {
  /** The item's element (merge it with the user's ref). */
  ref: (node: HTMLElement | null) => void;
  /** Render it inside the item. Null outside a HighlightScope. */
  highlight: React.ReactNode;
};

type ItemHighlightOptions = {
  /**
   * The attribute the library sets on the highlighted item: Radix UI and
   * Base UI's `data-highlighted`, React Aria's `data-focused`.
   */
  attribute?: string;
};

/**
 * Makes an item take part in its scope's highlight: it becomes the active
 * item when the library marks it highlighted, and stays active until another
 * one is.
 */
function useItemHighlight(
  disabled?: boolean,
  { attribute = 'data-highlighted' }: ItemHighlightOptions = {},
): ItemHighlight {
  return useHighlightIn(React.use(HighlightScopeContext), disabled, attribute);
}

/**
 * Makes a menubar's trigger take part in its triggers' highlight (see
 * `TriggerHighlightScope`): the highlight is on it while it's lit.
 */
function useTriggerHighlight(disabled?: boolean): ItemHighlight {
  return useHighlightIn(React.use(TriggerScopeContext), disabled, null);
}

/** Painted alike (no new surface to render). */
const samePaint = (a: Surface | null, b: Surface) =>
  a !== null &&
  a.backgroundColor === b.backgroundColor &&
  a.backgroundImage === b.backgroundImage &&
  a.borderRadius === b.borderRadius;

/** The attributes a trigger's styles may depend on. */
const TRIGGER_ATTRIBUTES = [
  'aria-expanded',
  'data-state',
  'data-highlighted',
  'data-popup-open',
  'data-pressed',
  'data-disabled',
];

/**
 * `attribute`: the item is active while it has it (menus' items). Null: a
 * trigger, active while it's lit (see `TriggerHighlightScope`).
 */
function useHighlightIn(
  scope: HighlightScopeValue | null,
  disabled: boolean | undefined,
  attribute: string | null,
): ItemHighlight {
  const id = React.useId();
  const [node, setNode] = React.useState<HTMLElement | null>(null);
  const [surface, setSurface] = React.useState<Surface | null>(null);
  const activate = scope?.activate;
  const paint = scope?.paint;
  const light = scope?.light;
  const unlight = scope?.unlight;
  // Stable, and only a new element counts: React calls a ref with null and
  // the element again whenever it's recreated.
  const ref = React.useCallback((element: HTMLElement | null) => {
    if (element)
      setNode((current) => (current === element ? current : element));
  }, []);

  // A trigger: lit while its own styles paint it as it's hovered, focused or
  // its menu is open; its own background is cleared while it's lit.
  React.useLayoutEffect(() => {
    if (attribute !== null || !light || !unlight || !node) return;
    if (getComputedStyle(node).position === 'static')
      node.style.setProperty('position', 'relative');
    // Hover states are read from the pointer: `:hover` can lag behind it.
    let hovered = false;
    let lit = false;
    let frame = 0;
    const sync = () => {
      const surface =
        !disabled && (hovered || isExpanded(node) || node.matches(':focus'))
          ? readSurface(node)
          : null;
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
      // Read again once the hover styles surely apply.
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
  }, [attribute, light, unlight, node, id, disabled]);

  React.useLayoutEffect(() => {
    if (attribute === null || !activate || !paint || !node) return;
    // The surface is positioned inside the item.
    if (getComputedStyle(node).position === 'static')
      node.style.setProperty('position', 'relative');

    // The item's own background is cleared while the surface stands for it
    // (highlighted, or its submenu open), and while it has the focus: React
    // Aria moves the highlight a moment before the focus, and the item it
    // leaves would show its `focus:` background meanwhile, a second highlight.
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
        activate(id, node);
      }
      clear();
    };
    // Highlighted before it's focused (Base UI, React Aria): read before the
    // focus, a `focus:` background is missing, and the surface would glide in
    // transparent. The focus comes before the surface is rendered.
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
  }, [activate, paint, node, id, attribute]);

  const active = scope?.activeId === id && !disabled;
  const leaving =
    (!disabled && scope?.leaving.find((other) => other.id === id)) || null;

  return {
    ref,
    // Always an element inside a scope, so the item's children keep their
    // place in the tree whether it's active or not.
    highlight: scope ? (
      <HighlightSurface
        id={id}
        surface={surface}
        active={active}
        leaving={leaving}
        item={node}
        scope={scope}
      />
    ) : null,
  };
}

type HighlightSurfaceProps = {
  id: string;
  /** The item's highlighted background. */
  surface: Surface | null;
  /** It's the active item: its surface is the highlight. */
  active: boolean;
  /** The highlight went into another menu: its surface goes along. */
  leaving: Leaving | null;
  item: HTMLElement | null;
  scope: HighlightScopeValue;
};

function HighlightSurface({
  id,
  surface,
  active,
  leaving,
  item,
  scope,
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
        />
      )}
      {leaving && !active && (
        <SurfaceCopy
          // A new way: it starts again from the highlight on screen.
          key={`leaving-${leaving.key}`}
          id={id}
          surface={surface}
          item={item}
          scope={scope}
          leavingTo={leaving.to}
          fadeOut={leaving.to === null}
        />
      )}
    </>
  );
}

type Start = {
  offset: Offset;
  opacity: number;
  /** Per millisecond, in the new item's terms. */
  velocity: Offset;
  /** It comes from another menu (see `crossesClip`). */
  cross: boolean;
};

const IN_PLACE: Offset = { x: 0, y: 0, scaleX: 1, scaleY: 1 };
const STILL: Offset = { x: 0, y: 0, scaleX: 0, scaleY: 0 };

/** How fast a glide moves right now, in its item's terms (per ms). */
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

/**
 * Where a surface entering `item` starts: on the previous surface, as it is
 * on screen, with its opacity and velocity. With nothing on screen, it fades
 * in, in place. Under reduced motion, it doesn't glide.
 */
function handOff(
  previous: SurfaceHandle | null,
  item: HTMLElement,
  reduce: boolean,
): Start {
  if (!previous?.element.isConnected)
    return { offset: IN_PLACE, opacity: 0, velocity: STILL, cross: false };
  const opacity = Number(getComputedStyle(previous.element).opacity);
  const cross = crossesClip(previous.item, item);
  // Its box on screen, mid-glide included.
  const offset = offsetOn(previous.element.getBoundingClientRect(), item);
  if (reduce || !offset)
    return { offset: IN_PLACE, opacity, velocity: STILL, cross };

  const own = item.getBoundingClientRect();
  const from = previous.item.getBoundingClientRect();
  const velocity = previous.glide ? velocityOf(previous.glide) : STILL;
  return {
    offset,
    opacity,
    velocity: {
      x: velocity.x,
      y: velocity.y,
      // Scales are relative to the item: the new one may differ in size.
      scaleX: (velocity.scaleX * from.width) / own.width,
      scaleY: (velocity.scaleY * from.height) / own.height,
    },
    cross,
  };
}

/**
 * The offset that lays a surface of `item` over `box` on screen (origin top
 * left). Null for an item without a box.
 */
function offsetOn(box: DOMRect, item: HTMLElement): Offset | null {
  const own = item.getBoundingClientRect();
  if (!own.width || !own.height) return null;
  // Screen pixels per CSS pixel: a menu still scaling in shrinks both boxes.
  const ratioX = own.width / (item.offsetWidth || own.width);
  const ratioY = own.height / (item.offsetHeight || own.height);
  return {
    x: (box.left - own.left) / ratioX,
    y: (box.top - own.top) / ratioY,
    scaleX: box.width / own.width,
    scaleY: box.height / own.height,
  };
}

/**
 * The glide from `offset` to `to`, as a share of the way: its initial
 * velocity is the handed velocity along the way (per ms).
 */
function initialRate(
  { offset, velocity }: Start,
  to: Offset,
  width: number,
  height: number,
) {
  // The way to go, and the velocity, in pixels (scales on the item's size).
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
  /** Its item's id in the scope. */
  id: string;
  surface: Surface;
  item: HTMLElement;
  scope: HighlightScopeValue;
  /**
   * The highlight went into another menu, to this item: this surface glides
   * along with the new one, then goes.
   */
  leavingTo?: HTMLElement | null;
  /** No item is lit anymore: it fades out where it is. */
  fadeOut?: boolean;
};

function SurfaceCopy({
  id,
  surface,
  item,
  scope,
  leavingTo = null,
  fadeOut = false,
}: SurfaceCopyProps) {
  const reduce = useShouldReduceMotion();
  const glide = useTempoTransition<Transition>(HIGHLIGHT_TRANSITION);
  const fade = useTempoTransition<Transition>(FADE_TRANSITION);
  // Read while rendering: the previous surface is still on screen (it goes
  // in this same commit).
  const [start] = React.useState(() => scope.handOff(item, reduce));
  // Leaving: where the highlight went, in this item's terms.
  const [target] = React.useState(() =>
    leavingTo && !reduce
      ? offsetOn(leavingTo.getBoundingClientRect(), item)
      : null,
  );
  const elementRef = React.useRef<HTMLSpanElement>(null);
  // Read when it mounts: a new transition object each render (a tempo)
  // mustn't restart the glide.
  const transitionsRef = React.useRef({ glide, fade });
  const { register, left } = scope;

  // Before paint: the first frame already shows the surface where it starts.
  React.useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;
    const animations: Animation[] = [];
    let running: Glide | null = null;
    // Leaving without a way to go (reduced motion): it goes at once.
    if (leavingTo && !target) {
      left(id);
      return undefined;
    }

    const to = target ?? IN_PLACE;
    const rate = initialRate(start, to, item.offsetWidth, item.offsetHeight);
    let timing: { duration: number; easing: string } | null = null;
    if (rate !== null) {
      // The spring as a curve, with the velocity it was handed (Motion's
      // velocity is per second, on a 0-100 way).
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
        // A leaving surface stays where it went until it goes.
        { ...timing, fill: target ? 'forwards' : 'auto' },
      );
      animations.push(animation);
      running = { animation, ease, duration: ms, from: start.offset };
    }

    if (target) {
      // Gone once there: out of its menu, under the one it went into.
      if (running)
        running.animation.finished.then(
          () => left(id),
          // Cancelled: it unmounted first.
          () => {},
        );
      else left(id);
      return () => {
        for (const animation of animations) animation.cancel();
      };
    }

    if (fadeOut) {
      // Gliding on to its item if it was on its way, it fades out. It's the
      // surface on screen until it's gone: lit again meanwhile, the highlight
      // starts from it.
      const { duration, easing } = toCssTiming(transitionsRef.current.fade);
      const fading = element.animate(
        [{ opacity: start.opacity }, { opacity: 0 }],
        { duration, easing, fill: 'forwards' },
      );
      animations.push(fading);
      fading.finished.then(
        () => left(id),
        // Cancelled: it unmounted first.
        () => {},
      );
    } else if (start.cross && timing) {
      // Into another menu: it shows as it glides in, as v1's did.
      animations.push(
        element.animate([{ opacity: 0 }, { opacity: 1 }], timing),
      );
    } else if (start.opacity < 1) {
      const { duration, easing } = toCssTiming(transitionsRef.current.fade);
      animations.push(
        element.animate([{ opacity: start.opacity }, { opacity: 1 }], {
          duration,
          easing,
        }),
      );
    }

    const unregister = register({ id, element, item, glide: running });
    return () => {
      for (const animation of animations) animation.cancel();
      unregister();
    };
  }, [register, left, id, item, start, target, leavingTo, fadeOut]);

  return (
    <span
      ref={elementRef}
      aria-hidden
      data-slot={scope.slot}
      data-leaving={leavingTo || fadeOut ? '' : undefined}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        transformOrigin: '0 0',
        borderRadius: surface.borderRadius,
        backgroundColor: surface.backgroundColor,
        backgroundImage: surface.backgroundImage,
      }}
    />
  );
}

/**
 * Adds the highlight to an item's children. With `asChild`, it goes inside
 * the element the user renders.
 */
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
};
