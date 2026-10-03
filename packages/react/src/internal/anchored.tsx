'use client';

import * as React from 'react';
import {
  motion,
  type TargetAndTransition,
  type Transition,
} from 'motion/react';

import { useMotionTokens, useShouldReduceMotion } from '../utils/motion';

// Shared by every anchored overlay of Animate UI (popovers, hover cards,
// tooltips, and React Aria's Popover under menus, selects and comboboxes):
// they scale up from `scale.enter` and fade in from the point of their
// trigger, and leave faster than they came.

/** Animate UI's additions to an anchored popup. */
type AnchoredAnimationProps = {
  /**
   * Transition of the opening. Defaults to `transition.dropdown` (600ms),
   * `transition.tooltip` (600ms) for tooltips.
   */
  transition?: Transition;
  /** Transition of the closing. Defaults to `transition.exit` (400ms). */
  exitTransition?: Transition;
};

type AnchoredMotionOptions = AnchoredAnimationProps & {
  /** Which entrance token applies. */
  kind: 'dropdown' | 'tooltip';
  /** Whether the overlay is open (a kept-mounted popup animates in place). */
  open: boolean;
  /** The popup stays mounted while closed (`forceMount`, `keepMounted`…). */
  keepMounted?: boolean;
  /** Fade without scaling (submenus, which open often). */
  fadeOnly?: boolean;
  /** Appear without an entrance (warm tooltips, swapped previews). */
  skipEnter?: boolean;
  /** Disappear without an exit (a tooltip replaced by its neighbour). */
  skipExit?: boolean;
};

type AnchoredMotionProps = {
  initial: false | TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
  onAnimationComplete?: (definition: unknown) => void;
};

/**
 * Motion props of an anchored popup. Call it inside `ReducedMotionConfig`:
 * under reduced motion the popup only fades.
 */
function useAnchoredMotion({
  kind,
  open,
  keepMounted,
  fadeOnly,
  skipEnter,
  skipExit,
  transition,
  exitTransition,
}: AnchoredMotionOptions): AnchoredMotionProps {
  const tokens = useMotionTokens();
  const reduce = useShouldReduceMotion();
  const from = reduce || fadeOnly ? 1 : tokens.scale.enter;
  // Full transform strings (hardware accelerated). Never from scale(0).
  const hidden = { opacity: 0, transform: `scale(${from})` };
  const shown = { opacity: 1, transform: 'scale(1)' };

  const enter = skipEnter
    ? tokens.transition.instant
    : (transition ??
      // Submenus open often: a short fade both ways.
      (fadeOnly ? tokens.transition.exit : tokens.transition[kind]));
  const leave = skipExit
    ? tokens.transition.instant
    : (exitTransition ?? tokens.transition.exit);

  // A kept-mounted popup is hidden once its exit has played (not with
  // `transitionEnd`: Motion drops it when the exit interrupts the entrance).
  const [settledClosed, setSettledClosed] = React.useState(
    Boolean(keepMounted) && !open,
  );
  if (open && settledClosed) setSettledClosed(false);

  return {
    initial: skipEnter ? false : hidden,
    // Transitions live in the targets: an exiting element keeps the props of
    // its last render, when it was still open.
    animate: open
      ? {
          ...shown,
          transition: enter,
          ...(keepMounted && { visibility: 'visible' }),
        }
      : {
          ...hidden,
          transition: leave,
          ...(keepMounted && settledClosed && { visibility: 'hidden' }),
        },
    exit: { ...hidden, transition: leave },
    onAnimationComplete: keepMounted
      ? (definition) => {
          const target = definition as { opacity?: number };
          if (!open && target.opacity === 0) setSettledClosed(true);
        }
      : undefined,
  };
}

// A tooltip opened while another one is still showing, or shortly after one
// closed, is "warm": it appears without an entrance, like moving along a
// toolbar. The window outlasts the previous tooltip's exit. Module-level, so
// it works across tooltips that each have their own provider (shadcn/ui's
// do), whatever order the library closes and opens them in.
const WARM_WINDOW_MS = 1000;
let lastTooltipCloseAt = Number.NEGATIVE_INFINITY;
let shownTooltips = 0;

const now = () =>
  typeof performance === 'undefined' ? Date.now() : performance.now();

const isWarmNow = () =>
  shownTooltips > 0 || now() - lastTooltipCloseAt < WARM_WINDOW_MS;

type TooltipWarmthOptions = {
  /** Only tooltips take part. */
  enabled: boolean;
  /** Open and present (false while it exits). */
  open: boolean;
  /** On screen: open, or playing its exit. */
  shown: boolean;
};

/**
 * Whether the tooltip appears warm. Re-evaluated each time it opens; records
 * when it closes and while it's on screen.
 */
function useTooltipWarmth({ enabled, open, shown }: TooltipWarmthOptions) {
  const [state, setState] = React.useState(() => ({
    open,
    warm: enabled && open && isWarmNow(),
  }));
  if (state.open !== open) {
    setState({ open, warm: enabled && open && isWarmNow() });
  }

  const wasOpenRef = React.useRef(open);
  React.useEffect(() => {
    if (enabled && wasOpenRef.current && !open) lastTooltipCloseAt = now();
    wasOpenRef.current = open;
  }, [enabled, open]);

  React.useLayoutEffect(() => {
    if (!enabled || !shown) return;
    shownTooltips += 1;
    return () => {
      shownTooltips -= 1;
    };
  }, [enabled, shown]);

  return state.warm;
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
  useTooltipWarmth,
  asMotion,
  mergeRefs,
  type AnchoredAnimationProps,
  type AnchoredMotionProps,
};
