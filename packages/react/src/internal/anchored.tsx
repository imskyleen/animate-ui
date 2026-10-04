'use client';

import * as React from 'react';
import {
  motion,
  type TargetAndTransition,
  type Transition,
} from 'motion/react';

import {
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../utils/motion';

// Shared by every anchored overlay of Animate UI (popovers, hover cards,
// tooltips, and React Aria's Popover under menus, selects and comboboxes).
// Each grows from the point of its trigger (the transform origin the library
// gives it) and fades in, from a scale that depends on its size and on how
// often it opens:
//
// - tooltips, small and textual: from 0.7, on the pop spring (stiffness 300,
//   damping 25) that overshoots a little, both ways;
// - popovers, hover cards and preview cards: from 0.8, on the same spring;
// - menus, opened all day long: from 0.9, in 200ms on a strong ease-out,
//   both ways.
//
// The values are the motion tokens' (utils/motion).
//
// A popup open from the start (`defaultOpen`, or `open` on the first render)
// plays its entrance on page load, like v1.
//
// Tooltips warm up (Emil Kowalski's "don't delay subsequent tooltips"): once
// one is open, the next one shows at once, without its entrance, and the one
// it replaces goes at once too; 300ms after the last one closed, they play
// their entrance again. shadcn/ui gives each tooltip its own Provider, so the
// libraries' own grouping never sees it: Animate UI tracks it for all of its
// Radix UI and Base UI tooltips. React Aria warms up by itself (`instant`).

/** The spring of tooltips, popovers and hover cards, both ways. */
const POPOVER_TRANSITION = motionTokens.spring.pop;
/** Menus (dropdown, context menu, menubar, select…): short, ease-out. */
const MENU_TRANSITION = motionTokens.transition.menu;

/** Where each kind of overlay grows from. */
const HIDDEN_SCALE = {
  tooltip: motionTokens.scale.tooltip,
  popover: motionTokens.scale.popover,
  menu: motionTokens.scale.menu,
} as const;
const DEFAULT_TRANSITION = {
  tooltip: POPOVER_TRANSITION,
  popover: POPOVER_TRANSITION,
  menu: MENU_TRANSITION,
} as const;

type AnchoredKind = keyof typeof HIDDEN_SCALE;

/** Animate UI's additions to an anchored popup. */
type AnchoredAnimationProps = {
  /**
   * Transition of the opening, and of the closing unless `exitTransition` is
   * set. Defaults to a spring (stiffness 300, damping 25); `{ duration: 0.2,
   * ease: [0.23, 1, 0.32, 1] }` for menus.
   */
  transition?: Transition;
  /** Transition of the closing. Defaults to `transition`. */
  exitTransition?: Transition;
};

type AnchoredMotionOptions = AnchoredAnimationProps & {
  /** Tooltips, popovers (hover cards, preview cards) or menus. */
  kind?: AnchoredKind;
  /** Whether the overlay is open (a kept-mounted popup animates in place). */
  open: boolean;
  /** The popup stays mounted while closed (`forceMount`, `keepMounted`…). */
  keepMounted?: boolean;
  /**
   * Appear and disappear without animation: React Aria asks for it when it
   * swaps two previews or tooltips during its warmup.
   */
  instant?: boolean;
};

type AnchoredMotionProps = {
  initial: false | TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
  /** Set when a warm tooltip replaced this one: merge it into the style. */
  style?: React.CSSProperties;
  onAnimationComplete?: (definition: unknown) => void;
};

/** How long after the last tooltip closed the next one still shows at once. */
const WARM_WINDOW = 300;

/** The tooltips' warm-up, shared by every Radix UI and Base UI tooltip. */
const tooltipGroup = {
  /** Tooltips open right now. */
  open: new Set<symbol>(),
  /** A tooltip is open, or the last one closed less than WARM_WINDOW ago. */
  warm: false,
  coolDown: undefined as ReturnType<typeof setTimeout> | undefined,
  /** Tooltips playing their exit, hidden at once when a warm one opens. */
  leaving: new Map<symbol, () => void>(),
};

/**
 * Whether a tooltip shows or goes at once: opening while another tooltip is
 * open or has just closed, or closing while another one has taken over.
 */
function useWarmTooltip(open: boolean, enabled: boolean) {
  const [id] = React.useState(() => Symbol('tooltip'));
  // Decided on each change of `open` (the motion props depend on it): warm
  // when opening, replaced when closing.
  const [change, setChange] = React.useState(() => ({
    open,
    atOnce: enabled && open && tooltipGroup.warm,
  }));
  if (change.open !== open) {
    setChange({
      open,
      atOnce:
        enabled &&
        (open
          ? tooltipGroup.warm
          : [...tooltipGroup.open].some((other) => other !== id)),
    });
  }
  // A warm tooltip opened while this one was leaving.
  const [cut, setCut] = React.useState(false);
  if (open && cut) setCut(false);
  const atOnceRef = React.useRef(change.atOnce);
  React.useLayoutEffect(() => {
    atOnceRef.current = change.atOnce;
  });

  React.useEffect(() => {
    if (!enabled || !open) return;
    tooltipGroup.open.add(id);
    tooltipGroup.warm = true;
    clearTimeout(tooltipGroup.coolDown);
    // Shown at once, it replaces the tooltips still leaving.
    if (atOnceRef.current)
      for (const hide of tooltipGroup.leaving.values()) hide();
    return () => {
      tooltipGroup.open.delete(id);
      if (tooltipGroup.open.size > 0) return;
      clearTimeout(tooltipGroup.coolDown);
      tooltipGroup.coolDown = setTimeout(() => {
        tooltipGroup.warm = false;
      }, WARM_WINDOW);
    };
  }, [enabled, open, id]);

  React.useEffect(() => {
    if (!enabled || open) return;
    tooltipGroup.leaving.set(id, () => setCut(true));
    return () => {
      tooltipGroup.leaving.delete(id);
    };
  }, [enabled, open, id]);

  return {
    /** Opening warm: no entrance. */
    appearAtOnce: open && change.atOnce,
    /** Closing replaced by another tooltip: hidden at once. */
    hideAtOnce: !open && (change.atOnce || cut),
  };
}

/**
 * Motion props of an anchored popup. Call it inside `ReducedMotionConfig`:
 * under reduced motion the popup only fades.
 */
function useAnchoredMotion({
  kind = 'popover',
  open,
  keepMounted,
  instant,
  transition,
  exitTransition,
}: AnchoredMotionOptions): AnchoredMotionProps {
  const reduce = useShouldReduceMotion();
  // React Aria tooltips pass `instant` (their own warm-up); the others use
  // Animate UI's.
  const warmsUp = kind === 'tooltip' && instant === undefined;
  const warm = useWarmTooltip(open, warmsUp);
  const enter = useTempoTransition(transition ?? DEFAULT_TRANSITION[kind]);
  const leave = useTempoTransition(
    exitTransition ?? transition ?? DEFAULT_TRANSITION[kind],
  );
  // `scale` (not a transform string), like v1: Motion writes `transform:
  // none` once it's back to 1, so a settled popup never becomes the
  // containing block of fixed descendants.
  const hidden = { opacity: 0, scale: reduce ? 1 : HIDDEN_SCALE[kind] };
  const shown = { opacity: 1, scale: 1 };
  const none = { duration: 0 };

  // A kept-mounted popup is hidden once its exit has played (not with
  // `transitionEnd`: Motion drops it when the exit interrupts the entrance).
  const [settledClosed, setSettledClosed] = React.useState(
    Boolean(keepMounted) && !open,
  );
  if (open && settledClosed) setSettledClosed(false);

  const appearAtOnce = instant || warm.appearAtOnce;

  return {
    // A popup that mounts open plays its entrance, even on page load (v1). A
    // kept-mounted popup that mounts closed starts hidden, in place.
    initial: appearAtOnce || !open ? false : hidden,
    // Transitions live in the targets: an exiting element keeps the props of
    // its last render, when it was still open.
    animate: open
      ? {
          ...shown,
          transition: appearAtOnce ? none : enter,
          ...(keepMounted && { visibility: 'visible' }),
        }
      : {
          ...hidden,
          transition: instant ? none : leave,
          ...(keepMounted && settledClosed && { visibility: 'hidden' }),
        },
    exit: { ...hidden, transition: instant ? none : leave },
    // Replaced by a warm tooltip, it disappears at once while its exit plays
    // out unseen. A style, not a target: a leaving element keeps the targets
    // of its last render, but its style still follows.
    style: warm.hideAtOnce ? { visibility: 'hidden' } : undefined,
    onAnimationComplete: keepMounted
      ? (definition) => {
          const target = definition as { opacity?: number };
          if (!open && target.opacity === 0) setSettledClosed(true);
        }
      : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = string | React.ComponentType<any>;
const motionComponents = new Map<AnyComponent, AnyComponent>();

function motionFor(type: AnyComponent): AnyComponent {
  let component = motionComponents.get(type);
  if (!component) {
    component =
      typeof type === 'string'
        ? (motion as unknown as Record<string, AnyComponent>)[type]!
        : (motion.create(type) as AnyComponent);
    motionComponents.set(type, component);
  }
  return component;
}

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.RefObject<T | null>).current = node;
    }
  };
}

type ElementProps = {
  ref?: React.Ref<HTMLElement>;
  style?: React.CSSProperties;
} & Record<string, unknown>;

/**
 * Makes an element the user rendered themselves (`asChild`, `render`)
 * animatable: the same element, as a motion component.
 */
function asMotion(element: React.ReactElement, props: ElementProps) {
  const own = element.props as ElementProps;
  const Component = motionFor(
    element.type as AnyComponent,
  ) as React.ElementType;
  return (
    <Component
      {...own}
      {...props}
      ref={mergeRefs(own.ref, props.ref)}
      style={{ ...own.style, ...props.style }}
    />
  );
}

export {
  useAnchoredMotion,
  asMotion,
  mergeRefs,
  POPOVER_TRANSITION,
  MENU_TRANSITION,
  HIDDEN_SCALE,
  type AnchoredKind,
  type AnchoredAnimationProps,
  type AnchoredMotionProps,
};
