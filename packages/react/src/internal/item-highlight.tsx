'use client';

import * as React from 'react';
import {
  animate,
  motion,
  useMotionValue,
  type MotionValue,
} from 'motion/react';

import {
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../utils/motion';

// Animate UI v1's menu highlight (DropdownMenuHighlight, MenuHighlight): one
// surface glides behind the highlighted item, on a spring (stiffness 500,
// damping 40, a little quicker than v1's 350/35), instead of each item
// lighting up on its own. It follows the
// pointer and the arrow keys, goes into submenus, and stays on the last item
// when the pointer leaves the menu.
//
// Drop-in, it reuses the styles already written for the items: when an item
// gets highlighted, its own highlighted background (`focus:bg-accent`,
// `data-highlighted:bg-accent`…) is read and painted on the surface, and the
// item's background is cleared while it's highlighted (or its submenu is
// open). Text colors stay on the item.
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
// The surface sits under every item's content: the menu becomes its own
// stacking context and the surface goes below its content (z-index -1), so
// gliding over another item never covers that item's text.

/** The highlight's spring: the glide. */
const HIGHLIGHT_TRANSITION = motionTokens.spring.highlight;
/** A highlight appearing from nothing: a short fade, in place. */
const FADE_TRANSITION = motionTokens.transition.fade;

type Surface = {
  backgroundColor: string;
  backgroundImage: string;
  borderRadius: string;
};

type SurfaceValues = {
  x: MotionValue<number>;
  y: MotionValue<number>;
  scaleX: MotionValue<number>;
  scaleY: MotionValue<number>;
  opacity: MotionValue<number>;
};

/** The surface on screen: where the next one starts from. */
type SurfaceHandle = {
  element: HTMLElement;
  item: HTMLElement;
  values: SurfaceValues;
};

type HighlightScopeValue = {
  activeId: string | null;
  activate: (id: string) => void;
  /** Where a surface entering `item` starts (see `handOff`). */
  handOff: (item: HTMLElement, reduce: boolean) => Start;
  /** The surface on screen registers itself; returns its unregistration. */
  register: (handle: SurfaceHandle) => () => void;
};

const HighlightScopeContext = React.createContext<HighlightScopeValue | null>(
  null,
);

type HighlightScopeProps = {
  /** The menu is open: reopening it starts without a highlight. */
  open: boolean;
  children?: React.ReactNode;
};

/**
 * One highlight for the items inside: render it in the root content of a
 * menu (its submenus share it, like v1), a select, a combobox or a listbox.
 */
function HighlightScope({ open, children }: HighlightScopeProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const surfaceRef = React.useRef<SurfaceHandle | null>(null);
  // A kept-mounted menu reopens without a highlight, like a new one. Closing
  // keeps it: the menu fades out as it was.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) setActiveId(null);
  }

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

  const value = React.useMemo(
    () => ({
      activeId,
      activate: setActiveId,
      handOff: handOffFrom,
      register,
    }),
    [activeId, handOffFrom, register],
  );

  return (
    <HighlightScopeContext value={value}>{children}</HighlightScopeContext>
  );
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
  const scope = React.use(HighlightScopeContext);
  const id = React.useId();
  const [node, setNode] = React.useState<HTMLElement | null>(null);
  const [surface, setSurface] = React.useState<Surface | null>(null);
  const activate = scope?.activate;
  // Stable, and only a new element counts: React calls a ref with null and
  // the element again whenever it's recreated.
  const ref = React.useCallback((element: HTMLElement | null) => {
    if (element)
      setNode((current) => (current === element ? current : element));
  }, []);

  React.useLayoutEffect(() => {
    if (!activate || !node) return;
    // The surface is positioned inside the item.
    if (getComputedStyle(node).position === 'static')
      node.style.setProperty('position', 'relative');

    const sync = () => {
      const highlighted = node.hasAttribute(attribute);
      if (highlighted) {
        setSurface(readSurface(node));
        activate(id);
      }
      clearOwnSurface(node, highlighted || isExpanded(node));
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(node, {
      attributes: true,
      attributeFilter: [attribute, 'aria-expanded'],
    });
    return () => {
      observer.disconnect();
      clearOwnSurface(node, false);
    };
  }, [activate, node, id, attribute]);

  const active = scope?.activeId === id && !disabled;

  return {
    ref,
    // Always an element inside a scope, so the item's children keep their
    // place in the tree whether it's active or not.
    highlight: scope ? (
      <HighlightSurface
        surface={active ? surface : null}
        item={node}
        scope={scope}
      />
    ) : null,
  };
}

type HighlightSurfaceProps = {
  /** The item's highlighted background, while it's the active item. */
  surface: Surface | null;
  item: HTMLElement | null;
  scope: HighlightScopeValue;
};

function HighlightSurface({ surface, item, scope }: HighlightSurfaceProps) {
  if (!surface || !item) return null;
  return <SurfaceCopy surface={surface} item={item} scope={scope} />;
}

type Motion = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
};

type Start = Motion & {
  opacity: number;
  /** Per second, in the new item's terms. */
  velocity: Motion;
};

const IN_PLACE: Motion = { x: 0, y: 0, scaleX: 1, scaleY: 1 };
const STILL: Motion = { x: 0, y: 0, scaleX: 0, scaleY: 0 };

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
    return { ...IN_PLACE, opacity: 0, velocity: STILL };
  const { values } = previous;
  const opacity = values.opacity.get();
  const own = item.getBoundingClientRect();
  if (reduce || !own.width || !own.height)
    return { ...IN_PLACE, opacity, velocity: STILL };

  const box = previous.element.getBoundingClientRect();
  const from = previous.item.getBoundingClientRect();
  // Screen pixels per CSS pixel: a menu still scaling in shrinks both boxes.
  const ratioX = own.width / (item.offsetWidth || own.width);
  const ratioY = own.height / (item.offsetHeight || own.height);
  return {
    // The transform lays the surface over `box` (origin top left).
    x: (box.left - own.left) / ratioX,
    y: (box.top - own.top) / ratioY,
    scaleX: box.width / own.width,
    scaleY: box.height / own.height,
    opacity,
    velocity: {
      x: values.x.getVelocity(),
      y: values.y.getVelocity(),
      // Scales are relative to the item: the new one may differ in size.
      scaleX: (values.scaleX.getVelocity() * from.width) / own.width,
      scaleY: (values.scaleY.getVelocity() * from.height) / own.height,
    },
  };
}

type SurfaceCopyProps = {
  surface: Surface;
  item: HTMLElement;
  scope: HighlightScopeValue;
};

function SurfaceCopy({ surface, item, scope }: SurfaceCopyProps) {
  const reduce = useShouldReduceMotion();
  const glide = useTempoTransition(HIGHLIGHT_TRANSITION);
  const fade = useTempoTransition(FADE_TRANSITION);
  // Read while rendering: the previous surface is still on screen (it goes
  // in this same commit).
  const [start] = React.useState(() => scope.handOff(item, reduce));
  const x = useMotionValue(start.x);
  const y = useMotionValue(start.y);
  const scaleX = useMotionValue(start.scaleX);
  const scaleY = useMotionValue(start.scaleY);
  const opacity = useMotionValue(start.opacity);
  const elementRef = React.useRef<HTMLSpanElement>(null);
  // Read when it mounts: a new transition object each render (a tempo)
  // mustn't restart the glide.
  const transitionsRef = React.useRef({ glide, fade });

  const { register } = scope;

  React.useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;
    const unregister = register({
      element,
      item,
      values: { x, y, scaleX, scaleY, opacity },
    });
    const { glide, fade } = transitionsRef.current;
    const { velocity } = start;
    const controls = [
      animate(x, 0, { ...glide, velocity: velocity.x }),
      animate(y, 0, { ...glide, velocity: velocity.y }),
      animate(scaleX, 1, { ...glide, velocity: velocity.scaleX }),
      animate(scaleY, 1, { ...glide, velocity: velocity.scaleY }),
      animate(opacity, 1, fade),
    ];
    return () => {
      for (const control of controls) control.stop();
      unregister();
    };
  }, [register, item, start, x, y, scaleX, scaleY, opacity]);

  return (
    <motion.span
      ref={elementRef}
      aria-hidden
      data-slot="item-highlight"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        transformOrigin: '0 0',
        borderRadius: surface.borderRadius,
        backgroundColor: surface.backgroundColor,
        backgroundImage: surface.backgroundImage,
        x,
        y,
        scaleX,
        scaleY,
        opacity,
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
  useItemHighlight,
  withHighlight,
  HIGHLIGHT_TRANSITION,
  type ItemHighlight,
};
