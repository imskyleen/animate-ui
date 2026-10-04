'use client';

import * as React from 'react';
import {
  motion,
  type TargetAndTransition,
  type Transition,
} from 'motion/react';

import { useShouldReduceMotion, useTempoTransition } from '../utils/motion';

// Shared by every anchored overlay of Animate UI (popovers, hover cards,
// tooltips, and React Aria's Popover under menus, selects and comboboxes).
// The motion is Animate UI v1's, value for value:
//
// - popovers, hover cards and tooltips (v1 Popover, HoverCard, Tooltip): they
//   grow from half their size and fade in from the point of their trigger, on
//   a spring (stiffness 300, damping 25) that overshoots a little, and shrink
//   back to half their size on the same spring when they close;
// - menus (v1 DropdownMenu content and sub content): a short 200ms fade and
//   scale from 0.95, both ways.
//
// A popup open from the start (`defaultOpen`, or `open` on the first render)
// plays its entrance on page load, like v1.

/** v1's Popover, HoverCard and Tooltip spring, both ways. */
const POPOVER_TRANSITION = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
} as const satisfies Transition;
/** v1's DropdownMenu content and sub content timing, both ways. */
const MENU_TRANSITION = { duration: 0.2 } as const satisfies Transition;

/** Where each kind of overlay starts from (v1 values). */
const HIDDEN_SCALE = { popover: 0.5, menu: 0.95 } as const;
const DEFAULT_TRANSITION = {
  popover: POPOVER_TRANSITION,
  menu: MENU_TRANSITION,
} as const;

/** Animate UI's additions to an anchored popup. */
type AnchoredAnimationProps = {
  /**
   * Transition of the opening, and of the closing unless `exitTransition` is
   * set. Defaults to v1's spring (stiffness 300, damping 25); `{ duration:
   * 0.2 }` for menus.
   */
  transition?: Transition;
  /** Transition of the closing. Defaults to `transition`. */
  exitTransition?: Transition;
};

type AnchoredMotionOptions = AnchoredAnimationProps & {
  /** Popovers, hover cards and tooltips, or menus (v1 DropdownMenu). */
  kind?: 'popover' | 'menu';
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
  onAnimationComplete?: (definition: unknown) => void;
};

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

  return {
    // A popup that mounts open plays its entrance, even on page load (v1). A
    // kept-mounted popup that mounts closed starts hidden, in place.
    initial: instant || !open ? false : hidden,
    // Transitions live in the targets: an exiting element keeps the props of
    // its last render, when it was still open.
    animate: open
      ? {
          ...shown,
          transition: instant ? none : enter,
          ...(keepMounted && { visibility: 'visible' }),
        }
      : {
          ...hidden,
          transition: instant ? none : leave,
          ...(keepMounted && settledClosed && { visibility: 'hidden' }),
        },
    exit: { ...hidden, transition: instant ? none : leave },
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
  type AnchoredAnimationProps,
  type AnchoredMotionProps,
};
