'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { motionTokens, useTempoTransition } from '../utils/motion';

// Animate UI v1's menu highlight (DropdownMenuHighlight, MenuHighlight): one
// surface glides behind the highlighted item, on a spring (stiffness 350,
// damping 35), instead of each item lighting up on its own. It follows the
// pointer and the arrow keys, goes into submenus, and stays on the last item
// when the pointer leaves the menu.
//
// Drop-in, it reuses the styles already written for the items: when an item
// gets highlighted, its own highlighted background (`focus:bg-accent`,
// `data-highlighted:bg-accent`…) is read and painted on the surface, and the
// item's background is cleared while it's highlighted (or its submenu is
// open). Text colors stay on the item.
//
// As in v1, each item renders its own copy of the surface while it's the
// active one. The new copy starts from the previous copy's box and glides to
// its item while it fades in; the previous copy glides along, stays opaque
// for 200ms, then fades out. (v1 got this from a shared layoutId; Motion now
// crossfades shared layouts differently, so the glide is explicit here.)
//
// The copies sit under every item's content: the menu becomes its own
// stacking context and the copies go below its content (z-index -1), so one
// gliding over another item never covers that item's text.

/** v1's highlight spring: the move, and the fade in and out. */
const HIGHLIGHT_TRANSITION = motionTokens.spring.highlight;
/** v1's highlight exit delay (seconds). */
const EXIT_DELAY = 0.2;

type Surface = {
  backgroundColor: string;
  backgroundImage: string;
  borderRadius: string;
};

type Rect = { left: number; top: number; width: number; height: number };

type HighlightScopeValue = {
  activeId: string | null;
  /** The visual box of the previous highlight, when the active one changed. */
  from: Rect | null;
  /** The box of the active item: where a leaving highlight goes. */
  to: Rect | null;
  activate: (id: string, item: HTMLElement) => void;
  /** The element of the highlight on screen, to start the next one from. */
  registerSurface: (element: HTMLElement | null) => void;
};

const HighlightScopeContext = React.createContext<HighlightScopeValue | null>(
  null,
);

type HighlightScopeProps = {
  /** The menu is open: closing it lets the highlight go. */
  open: boolean;
  children?: React.ReactNode;
};

type ScopeState = Pick<HighlightScopeValue, 'activeId' | 'from' | 'to'>;

const NO_HIGHLIGHT: ScopeState = { activeId: null, from: null, to: null };

const rectOf = (element: Element): Rect => {
  const { left, top, width, height } = element.getBoundingClientRect();
  return { left, top, width, height };
};

/**
 * One highlight for the items inside: render it in the root content of a
 * menu (its submenus share it, like v1), a select or a combobox.
 */
function HighlightScope({ open, children }: HighlightScopeProps) {
  const [state, setState] = React.useState<ScopeState>(NO_HIGHLIGHT);
  const surfaceRef = React.useRef<HTMLElement | null>(null);
  // A kept-mounted menu reopens without a highlight, like a new one.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) setState(NO_HIGHLIGHT);
  }

  const activate = React.useCallback((id: string, item: HTMLElement) => {
    setState((current) => {
      if (current.activeId === id) return current;
      const previous = surfaceRef.current;
      return {
        activeId: id,
        from:
          current.activeId && previous?.isConnected ? rectOf(previous) : null,
        to: rectOf(item),
      };
    });
  }, []);
  const registerSurface = React.useCallback((element: HTMLElement | null) => {
    if (element) surfaceRef.current = element;
  }, []);

  const value = React.useMemo(
    () => ({ ...state, activate, registerSurface }),
    [state, activate, registerSurface],
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

const isHighlighted = (node: HTMLElement) =>
  node.hasAttribute('data-highlighted');
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

/**
 * Makes an item take part in its scope's highlight: it becomes the active
 * item when the library marks it `data-highlighted`, and stays active until
 * another one is.
 */
function useItemHighlight(disabled?: boolean): ItemHighlight {
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
      const highlighted = isHighlighted(node);
      if (highlighted) {
        setSurface(readSurface(node));
        activate(id, node);
      }
      clearOwnSurface(node, highlighted || isExpanded(node));
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(node, {
      attributes: true,
      attributeFilter: ['data-highlighted', 'aria-expanded'],
    });
    return () => {
      observer.disconnect();
      clearOwnSurface(node, false);
    };
  }, [activate, node, id]);

  const active = scope?.activeId === id && !disabled && surface !== null;

  return {
    ref,
    highlight: scope ? (
      <HighlightSurface
        active={active}
        surface={surface}
        scope={scope}
        item={node}
      />
    ) : null,
  };
}

type HighlightSurfaceProps = {
  active: boolean;
  surface: Surface | null;
  scope: HighlightScopeValue;
  item: HTMLElement | null;
};

function HighlightSurface({
  active,
  surface,
  scope,
  item,
}: HighlightSurfaceProps) {
  return (
    // `custom`: where a leaving copy glides to, read when it leaves.
    <AnimatePresence initial={false} custom={scope.to}>
      {active && surface && item && (
        <SurfaceCopy
          key="highlight"
          surface={surface}
          from={scope.from}
          item={item}
          registerSurface={scope.registerSurface}
        />
      )}
    </AnimatePresence>
  );
}

const IN_PLACE = { x: 0, y: 0, scaleX: 1, scaleY: 1 };

/** The transform that lays a copy of `item` over `box` (origin top left). */
function transformTo(box: Rect | null, item: HTMLElement) {
  const own = rectOf(item);
  if (!box || !own.width || !own.height) return IN_PLACE;
  return {
    x: box.left - own.left,
    y: box.top - own.top,
    scaleX: box.width / own.width,
    scaleY: box.height / own.height,
  };
}

type SurfaceCopyProps = {
  surface: Surface;
  from: Rect | null;
  item: HTMLElement;
  registerSurface: (element: HTMLElement | null) => void;
};

function SurfaceCopy({
  surface,
  from,
  item,
  registerSurface,
}: SurfaceCopyProps) {
  const transition = useTempoTransition(HIGHLIGHT_TRANSITION);
  const fadeOut = useTempoTransition({
    ...HIGHLIGHT_TRANSITION,
    delay: EXIT_DELAY,
  });
  // Starts where the previous highlight is (measured once, as it mounts).
  const [initial] = React.useState(() => transformTo(from, item));
  const variants = React.useMemo(
    () => ({
      // Glides along with the next highlight (same spring, from rest).
      leave: (to: Rect | null) =>
        to
          ? {
              ...transformTo(to, item),
              transition: { ...transition, velocity: 0 },
            }
          : {},
    }),
    [item, transition],
  );

  return (
    <motion.span
      ref={registerSurface}
      aria-hidden
      data-slot="item-highlight"
      initial={initial}
      animate={IN_PLACE}
      exit="leave"
      variants={variants}
      transition={transition}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        transformOrigin: '0 0',
        borderRadius: surface.borderRadius,
      }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: fadeOut }}
        transition={transition}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          backgroundColor: surface.backgroundColor,
          backgroundImage: surface.backgroundImage,
        }}
      />
    </motion.span>
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
