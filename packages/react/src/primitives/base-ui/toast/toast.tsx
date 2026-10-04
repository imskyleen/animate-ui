'use client';
/* eslint-disable @typescript-eslint/no-namespace -- each part keeps Base UI's `Part.Props`/`Part.State` type namespace */

import * as React from 'react';
import { Toast as ToastPrimitive } from '@base-ui/react/toast';
import type { Transition } from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import {
  OVERLAY_TRANSITION,
  SHEET_TRANSITION,
  toCssTiming,
  type CssTiming,
} from '../../../internal/modal-motion';
import { HIDDEN_SCALE, POPOVER_TRANSITION } from '../../../internal/anchored';

// Same API as Base UI's Toast. Animate UI v1 had no toast: its motion comes
// from v1's Sheet (it enters and leaves through its edge, by its own size,
// with a fade, on the sheet spring: stiffness 150, damping 22). A toast
// anchored to an element is a small bubble, like a tooltip: it grows from
// 0.7 and fades in from its anchor, on the tooltips' spring (stiffness 300,
// damping 25). The content behind the front toast fades in 200ms,
// ease-out, like a modal's overlay.
//
// Base UI drives the stack, swipe-to-dismiss and enter/exit itself, through
// CSS variables (`--toast-index`, `--toast-offset-y`, `--toast-height`,
// `--toast-swipe-movement-*`, the viewport's `--toast-frontmost-height`) and
// its transition status, and waits for CSS transitions before removing a
// toast. So the Root animates with CSS transitions too (a JS animation would
// fight the swipe), springs written as the `linear()` curve Motion itself
// would use, and sets them itself from its state (`tempo` applies):
//
// - It enters from its edge (a full toast height away) and fades in.
// - Collapsed, each toast behind the front one scales down by 0.05 per step
//   (never below 0.9) and peeks out by 0.75rem; hovering or focusing the
//   viewport expands the stack with a 0.75rem gap. The stack moves on the
//   same spring.
// - While swiped it follows the finger (Base UI sets the transform), then
//   springs back, or leaves the way it was swiped.
// - It leaves through the edge it came from, on the same spring.
// - Under reduced motion it fades in place and the stack changes at once.

/** Animate UI's additions to `Toast.Root`. */
type RootAnimationProps = {
  /**
   * Transition of the entrance and the stack (a CSS transition: a spring
   * becomes a `linear()` curve, a tween keeps its `duration` and cubic-bezier
   * or named `ease`). `{ type: 'spring', stiffness: 150, damping: 22 }` by
   * default, or `{ type: 'spring', stiffness: 300, damping: 25 }` for a toast
   * anchored to an element.
   */
  transition?: Transition;
  /** Transition of the exit (a CSS transition). Defaults to `transition`. */
  exitTransition?: Transition;
};

/** Animate UI's additions to `Toast.Content`. */
type ContentAnimationProps = {
  /**
   * Transition of the content fading behind the front toast (a CSS
   * transition).
   * @default { duration: 0.2, ease: [0.23, 1, 0.32, 1] }
   */
  transition?: Transition;
};

const GAP = '0.75rem';
const PEEK = '0.75rem';
/** An anchored toast grows from 0.7, like a tooltip. */
const ANCHORED_SCALE = HIDDEN_SCALE.tooltip;

type SwipeDirection = 'up' | 'down' | 'left' | 'right';

function transitionStyle(
  properties: string[],
  timing: CssTiming,
): React.CSSProperties {
  return {
    transitionProperty: properties.join(', '),
    transitionDuration: `${timing.duration}ms`,
    transitionTimingFunction: timing.easing,
  };
}

// Toasts swiped down (Base UI's default) live at the bottom edge.
function getSide(swipeDirection: Root.Props['swipeDirection']) {
  const directions = Array.isArray(swipeDirection)
    ? swipeDirection
    : swipeDirection
      ? [swipeDirection]
      : ['down'];
  return directions.includes('up') && !directions.includes('down')
    ? 'top'
    : 'bottom';
}

type StackOptions = {
  side: 'top' | 'bottom';
  reduce: boolean;
  anchored: boolean;
  enter: CssTiming;
  exit: CssTiming;
};

function stackStyle(
  state: ToastPrimitive.Root.State,
  { side, reduce, anchored, enter, exit }: StackOptions,
): React.CSSProperties {
  const ending = state.transitionStatus === 'ending';
  const hidden =
    state.transitionStatus === 'starting' || ending || state.limited;
  const properties = reduce ? ['opacity'] : ['transform', 'opacity', 'height'];

  // While swiped, Base UI sets the transform (and no transition) itself:
  // the toast follows the finger.
  if (state.swiping) return { opacity: hidden ? 0 : 1 };

  const style: React.CSSProperties = {
    opacity: hidden ? 0 : 1,
    ...transitionStyle(properties, ending ? exit : enter),
  };

  // A toast anchored to an element (Toast.Positioner) isn't stacked: it
  // grows from its anchor, like a tooltip.
  if (anchored) {
    style.transform = `scale(${hidden && !reduce ? ANCHORED_SCALE : 1})`;
    style.transformOrigin = 'var(--transform-origin)';
    return style;
  }

  const dir = side === 'top' ? -1 : 1;
  // Scale of a toast behind the front one, never below 0.9.
  const behindScale = 'max(0.9, calc(1 - var(--toast-index) * 0.05))';
  const scale = state.expanded ? '1' : behindScale;
  // Collapsed toasts take the front toast's height (shadcn/ui sizes them
  // so); scaled down, they are pulled back by what they lost.
  const clamp = 'var(--toast-frontmost-height, var(--toast-height, 0px))';
  const restY = state.expanded
    ? `calc(var(--toast-swipe-movement-y, 0px) - ${dir} * (var(--toast-offset-y, 0px) + var(--toast-index, 0) * ${GAP}))`
    : `calc(var(--toast-swipe-movement-y, 0px) - ${dir} * (var(--toast-index, 0) * ${PEEK} + (1 - ${behindScale}) * ${clamp}))`;

  // Off-screen offset: from and back to its edge, or onward in the swipe
  // direction. None under reduced motion: it fades in place.
  const travel = reduce ? '0%' : '100%';
  let exitX = '0px';
  let exitY = '0px';
  if (state.transitionStatus === 'starting' || ending) {
    exitY = `${dir * (reduce ? 0 : 100)}%`;
    const swiped = ending
      ? (state.swipeDirection as SwipeDirection | undefined)
      : undefined;
    if (swiped === 'down') exitY = travel;
    if (swiped === 'up') exitY = `-${travel}`;
    if (swiped === 'left' || swiped === 'right') {
      exitY = '0px';
      exitX = swiped === 'right' ? travel : `-${travel}`;
    }
  }

  style.transform = `translateX(calc(var(--toast-swipe-movement-x, 0px) + ${exitX})) translateY(calc(${restY} + ${exitY})) scale(${scale})`;
  style.transformOrigin = side === 'top' ? 'top' : 'bottom';
  return style;
}

function resolveStyle<State>(
  style:
    | React.CSSProperties
    | ((state: State) => React.CSSProperties | undefined)
    | undefined,
  state: State,
) {
  return typeof style === 'function' ? style(state) : style;
}

const Provider = ToastPrimitive.Provider;

namespace Provider {
  export type Props = ToastPrimitive.Provider.Props;
  export type State = ToastPrimitive.Provider.State;
}

const Viewport = ToastPrimitive.Viewport;

namespace Viewport {
  export type Props = ToastPrimitive.Viewport.Props;
  export type State = ToastPrimitive.Viewport.State;
}

function Root(props: Root.Props) {
  return (
    <ReducedMotionConfig>
      <RootMotion {...props} />
    </ReducedMotionConfig>
  );
}

function RootMotion({
  style,
  transition,
  exitTransition,
  ...props
}: Root.Props) {
  const reduce = useShouldReduceMotion();
  const anchored = props.toast.positionerProps != null;
  const fallback = anchored ? POPOVER_TRANSITION : SHEET_TRANSITION;
  const enter = toCssTiming(useTempoTransition(transition ?? fallback));
  const exit = toCssTiming(
    useTempoTransition(exitTransition ?? transition ?? fallback),
  );
  const options: StackOptions = {
    side: getSide(props.swipeDirection),
    reduce,
    anchored,
    enter,
    exit,
  };

  return (
    <ToastPrimitive.Root
      {...props}
      // Base UI calls it with the toast's state on every change; the user's
      // style still applies on top.
      style={(state) => ({
        ...stackStyle(state, options),
        ...resolveStyle(style, state),
      })}
    />
  );
}

namespace Root {
  /** Base UI's props, plus Animate UI's `transition` and `exitTransition`. */
  export type Props = ToastPrimitive.Root.Props &
    RootAnimationProps &
    React.RefAttributes<HTMLDivElement>;
  export type State = ToastPrimitive.Root.State;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type ToastObject<Data extends object = any> =
    ToastPrimitive.Root.ToastObject<Data>;
}

function Content({ style, transition, ...props }: Content.Props) {
  // Fades behind the front toast while collapsed (shadcn/ui's
  // data-behind:opacity-0), back in when the stack expands: v1's fade.
  const fade = transitionStyle(
    ['opacity'],
    toCssTiming(useTempoTransition(transition ?? OVERLAY_TRANSITION)),
  );

  return (
    <ToastPrimitive.Content
      {...props}
      style={(state) => ({
        ...fade,
        ...resolveStyle(style, state),
      })}
    />
  );
}

namespace Content {
  /** Base UI's props, plus Animate UI's `transition`. */
  export type Props = ToastPrimitive.Content.Props &
    ContentAnimationProps &
    React.RefAttributes<HTMLDivElement>;
  export type State = ToastPrimitive.Content.State;
}

const Description = ToastPrimitive.Description;

namespace Description {
  export type Props = ToastPrimitive.Description.Props;
  export type State = ToastPrimitive.Description.State;
}

const Title = ToastPrimitive.Title;

namespace Title {
  export type Props = ToastPrimitive.Title.Props;
  export type State = ToastPrimitive.Title.State;
}

const Close = ToastPrimitive.Close;

namespace Close {
  export type Props = ToastPrimitive.Close.Props;
  export type State = ToastPrimitive.Close.State;
}

const Action = ToastPrimitive.Action;

namespace Action {
  export type Props = ToastPrimitive.Action.Props;
  export type State = ToastPrimitive.Action.State;
}

const Portal = ToastPrimitive.Portal;

namespace Portal {
  export type Props = ToastPrimitive.Portal.Props;
  export type State = ToastPrimitive.Portal.State;
}

const Positioner = ToastPrimitive.Positioner;

namespace Positioner {
  export type Props = ToastPrimitive.Positioner.Props;
  export type State = ToastPrimitive.Positioner.State;
}

const Arrow = ToastPrimitive.Arrow;

namespace Arrow {
  export type Props = ToastPrimitive.Arrow.Props;
  export type State = ToastPrimitive.Arrow.State;
}

const useToastManager: typeof ToastPrimitive.useToastManager =
  ToastPrimitive.useToastManager;
const createToastManager: typeof ToastPrimitive.createToastManager =
  ToastPrimitive.createToastManager;

export {
  Provider,
  Viewport,
  Root,
  Content,
  Description,
  Title,
  Close,
  Action,
  Portal,
  Positioner,
  Arrow,
  useToastManager,
  createToastManager,
};
