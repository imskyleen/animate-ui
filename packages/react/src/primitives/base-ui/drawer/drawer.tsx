'use client';

/* eslint-disable @typescript-eslint/no-namespace -- each part merges a
   namespace of types with its component, like Base UI's own parts
   (`Drawer.Popup.Props`, `Drawer.Root.SnapPoint`…). */

import * as React from 'react';
import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';
import type { Transition } from 'motion/react';

import {
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
  type MotionTokens,
} from '../../../utils/motion';

// Same API as Base UI's Drawer.
//
// CSS-driven, not Motion: Base UI drives the swipe itself through CSS
// variables (`--drawer-swipe-movement-*`, `--drawer-snap-point-offset`,
// `--drawer-swipe-progress`, `--drawer-swipe-strength`), data attributes
// (`data-starting-style`, `data-ending-style`, `data-swiping`) and an inline
// transform while dragging, and waits for CSS transitions before unmounting.
// A JavaScript animation layered on top would fight the finger. So the Popup
// and the Backdrop get a small stylesheet (zero specificity, hoisted once by
// React) and the timing as inline variables, which `tempo` reaches:
//
// - Popup: rests at the swipe offset, starts and ends one full size off its
//   edge. 600ms on the drawer curve in, 400ms out scaled by the release
//   velocity, 0ms while the finger (or a nested drawer) drags it.
// - Backdrop: fades with the swipe progress, same timing.
// - Reduced motion: it fades in place; a swipe dismissal still leaves along
//   the swipe.
//
// It reads shadcn/ui's `--translate-x`, `--translate-y`, `--stack-scale` and
// `--closed-transform` when they're set, so nested-drawer stacking and the
// drawer's inset keep working.

const STYLE_HREF = 'animate-ui-base-ui-drawer';

const POPUP = ':where([data-animate-ui-drawer="popup"])';
const POPUP_IS = (selector: string) =>
  `:where([data-animate-ui-drawer="popup"]${selector})`;
const BACKDROP_IS = (selector: string) =>
  `:where([data-animate-ui-drawer="backdrop"]${selector})`;

const CSS = `
${POPUP} {
  --animate-ui-drawer-dx: var(--drawer-swipe-movement-x, 0px);
  --animate-ui-drawer-dy: calc(var(--drawer-snap-point-offset, 0px) + var(--drawer-swipe-movement-y, 0px));
  --animate-ui-drawer-rest: translate3d(var(--translate-x, var(--animate-ui-drawer-dx)), var(--translate-y, var(--animate-ui-drawer-dy)), 0) scale(var(--stack-scale, 1));
  transform: var(--animate-ui-drawer-rest);
  transition-property: transform, opacity, height, filter;
  transition-duration: var(--animate-ui-drawer-duration);
  transition-timing-function: var(--animate-ui-drawer-ease);
}
${POPUP_IS(':is([data-swipe-direction="down"], [data-swipe-direction="up"])')} { --animate-ui-drawer-dx: 0px; }
${POPUP_IS(':is([data-swipe-direction="left"], [data-swipe-direction="right"])')} { --animate-ui-drawer-dy: 0px; }
${POPUP_IS('[data-swipe-direction="down"]')} { --animate-ui-drawer-closed: translate3d(0, 100%, 0); }
${POPUP_IS('[data-swipe-direction="up"]')} { --animate-ui-drawer-closed: translate3d(0, -100%, 0); }
${POPUP_IS('[data-swipe-direction="right"]')} { --animate-ui-drawer-closed: translate3d(100%, 0, 0); }
${POPUP_IS('[data-swipe-direction="left"]')} { --animate-ui-drawer-closed: translate3d(-100%, 0, 0); }
${POPUP_IS(':is([data-starting-style], [data-ending-style])')} {
  transform: var(--closed-transform, var(--animate-ui-drawer-closed));
}
${POPUP_IS('[data-ending-style]')} {
  transition-duration: calc(var(--drawer-swipe-strength, 1) * var(--animate-ui-drawer-exit-duration));
  transition-timing-function: var(--animate-ui-drawer-exit-ease);
}
${POPUP_IS(':is([data-swiping], [data-nested-drawer-swiping]):not([data-ending-style])')} {
  transition-duration: 0ms;
}
${POPUP_IS('[data-animate-ui-reduce]:not([data-swipe-dismiss]):is([data-starting-style], [data-ending-style])')} {
  transform: var(--animate-ui-drawer-rest);
  opacity: 0;
}
${BACKDROP_IS('')} {
  opacity: max(var(--drawer-overlay-min-opacity, 0), calc(1 - var(--drawer-swipe-progress, 0)));
  transition-property: opacity;
  transition-duration: var(--animate-ui-drawer-duration);
  transition-timing-function: var(--animate-ui-drawer-ease);
}
${BACKDROP_IS(':is([data-starting-style], [data-ending-style])')} { opacity: 0; }
${BACKDROP_IS('[data-ending-style]')} {
  transition-duration: calc(var(--drawer-swipe-strength, 1) * var(--animate-ui-drawer-exit-duration));
  transition-timing-function: var(--animate-ui-drawer-exit-ease);
}
${BACKDROP_IS('[data-swiping]:not([data-ending-style])')} { transition-duration: 0ms; }
`;

/** Animate UI's additions to `Drawer.Popup` and `Drawer.Backdrop`. */
type DrawerAnimationProps = {
  /**
   * Opening and snapping back. Defaults to `transition.drawer` (600ms, drawer
   * curve). CSS-driven: only `duration` and a cubic-bezier `ease` apply.
   */
  transition?: Transition;
  /**
   * Closing, scaled by the swipe's release velocity. Defaults to
   * `transition.drawerExit` (400ms). Only `duration` and `ease` apply.
   */
  exitTransition?: Transition;
};

const NAMED_EASINGS: Record<string, string> = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
};

function toCssEase(ease: unknown): string | undefined {
  if (Array.isArray(ease) && ease.length === 4 && ease.every(Number.isFinite))
    return `cubic-bezier(${ease.join(', ')})`;
  if (typeof ease === 'string') return NAMED_EASINGS[ease];
  return undefined;
}

/** A Motion transition as CSS timing: `duration` (s → ms) and `ease`. */
function toCssTiming(transition: Transition | undefined, fallback: Transition) {
  const value = { ...fallback, ...transition } as {
    duration?: number;
    ease?: unknown;
  };
  const backup = fallback as { duration: number; ease: unknown };
  return {
    duration: `${(value.duration ?? backup.duration) * 1000}ms`,
    ease: toCssEase(value.ease) ?? toCssEase(backup.ease) ?? 'ease-out',
  };
}

function timingVariables(
  tokens: MotionTokens,
  transition: Transition | undefined,
  exitTransition: Transition | undefined,
): React.CSSProperties {
  const enter = toCssTiming(transition, tokens.transition.drawer);
  const exit = toCssTiming(exitTransition, tokens.transition.drawerExit);
  return {
    '--animate-ui-drawer-duration': enter.duration,
    '--animate-ui-drawer-ease': enter.ease,
    '--animate-ui-drawer-exit-duration': exit.duration,
    '--animate-ui-drawer-exit-ease': exit.ease,
  } as React.CSSProperties;
}

type StyleProp<State> =
  | React.CSSProperties
  | ((state: State) => React.CSSProperties | undefined)
  | undefined;

/** The variables first, so the user's own style still wins. */
function withVariables<State>(
  variables: React.CSSProperties,
  style: StyleProp<State>,
): StyleProp<State> {
  if (typeof style === 'function')
    return (state: State) => ({ ...variables, ...style(state) });
  return { ...variables, ...style };
}

function DrawerStyle() {
  return (
    <style href={STYLE_HREF} precedence="animate-ui">
      {CSS}
    </style>
  );
}

function Popup(props: Popup.Props) {
  return (
    <ReducedMotionConfig>
      <PopupWithTiming {...props} />
    </ReducedMotionConfig>
  );
}
namespace Popup {
  export type Props = DrawerPrimitive.Popup.Props & DrawerAnimationProps;
  export type State = DrawerPrimitive.Popup.State;
}

function PopupWithTiming({
  transition,
  exitTransition,
  style,
  ...props
}: Popup.Props) {
  const tokens = useMotionTokens();
  const reduce = useShouldReduceMotion();

  return (
    <>
      <DrawerStyle />
      <DrawerPrimitive.Popup
        {...props}
        data-animate-ui-drawer="popup"
        data-animate-ui-reduce={reduce ? '' : undefined}
        style={withVariables(
          timingVariables(tokens, transition, exitTransition),
          style,
        )}
      />
    </>
  );
}

function Backdrop({
  transition,
  exitTransition,
  style,
  ...props
}: Backdrop.Props) {
  const tokens = useMotionTokens();

  return (
    <>
      <DrawerStyle />
      <DrawerPrimitive.Backdrop
        {...props}
        data-animate-ui-drawer="backdrop"
        style={withVariables(
          timingVariables(tokens, transition, exitTransition),
          style,
        )}
      />
    </>
  );
}
namespace Backdrop {
  export type Props = DrawerPrimitive.Backdrop.Props & DrawerAnimationProps;
  export type State = DrawerPrimitive.Backdrop.State;
}

const Root = DrawerPrimitive.Root;
namespace Root {
  export type State = DrawerPrimitive.Root.State;
  export type Props<Payload = unknown> = DrawerPrimitive.Root.Props<Payload>;
  export type Actions = DrawerPrimitive.Root.Actions;
  export type ChangeEventReason = DrawerPrimitive.Root.ChangeEventReason;
  export type ChangeEventDetails = DrawerPrimitive.Root.ChangeEventDetails;
  export type SnapPointChangeEventReason =
    DrawerPrimitive.Root.SnapPointChangeEventReason;
  export type SnapPointChangeEventDetails =
    DrawerPrimitive.Root.SnapPointChangeEventDetails;
  export type SnapPoint = DrawerPrimitive.Root.SnapPoint;
}

const Provider = DrawerPrimitive.Provider;
namespace Provider {
  export type State = DrawerPrimitive.Provider.State;
  export type Props = DrawerPrimitive.Provider.Props;
}

const Indent = DrawerPrimitive.Indent;
namespace Indent {
  export type State = DrawerPrimitive.Indent.State;
  export type Props = DrawerPrimitive.Indent.Props;
}

const IndentBackground = DrawerPrimitive.IndentBackground;
namespace IndentBackground {
  export type State = DrawerPrimitive.IndentBackground.State;
  export type Props = DrawerPrimitive.IndentBackground.Props;
}

const Trigger = DrawerPrimitive.Trigger;
namespace Trigger {
  export type Props<Payload = unknown> = DrawerPrimitive.Trigger.Props<Payload>;
  export type State = DrawerPrimitive.Trigger.State;
}

const Portal = DrawerPrimitive.Portal;
namespace Portal {
  export type Props = DrawerPrimitive.Portal.Props;
  export type State = DrawerPrimitive.Portal.State;
}

const SwipeArea = DrawerPrimitive.SwipeArea;
namespace SwipeArea {
  export type Props = DrawerPrimitive.SwipeArea.Props;
  export type State = DrawerPrimitive.SwipeArea.State;
}

const Content = DrawerPrimitive.Content;
namespace Content {
  export type Props = DrawerPrimitive.Content.Props;
  export type State = DrawerPrimitive.Content.State;
}

const Viewport = DrawerPrimitive.Viewport;
namespace Viewport {
  export type Props = DrawerPrimitive.Viewport.Props;
  export type State = DrawerPrimitive.Viewport.State;
}

const Title = DrawerPrimitive.Title;
namespace Title {
  export type Props = DrawerPrimitive.Title.Props;
  export type State = DrawerPrimitive.Title.State;
}

const Description = DrawerPrimitive.Description;
namespace Description {
  export type Props = DrawerPrimitive.Description.Props;
  export type State = DrawerPrimitive.Description.State;
}

const Close = DrawerPrimitive.Close;
namespace Close {
  export type Props = DrawerPrimitive.Close.Props;
  export type State = DrawerPrimitive.Close.State;
}

const VirtualKeyboardProvider = DrawerPrimitive.VirtualKeyboardProvider;
namespace VirtualKeyboardProvider {
  export type State = DrawerPrimitive.VirtualKeyboardProvider.State;
  export type Props = DrawerPrimitive.VirtualKeyboardProvider.Props;
}

const Handle = DrawerPrimitive.Handle;
type Handle<Payload> = DrawerPrimitive.Handle<Payload>;
const createHandle = DrawerPrimitive.createHandle;

export {
  Root,
  Provider,
  Indent,
  IndentBackground,
  Trigger,
  Portal,
  Backdrop,
  Viewport,
  Popup,
  SwipeArea,
  Content,
  Title,
  Description,
  Close,
  VirtualKeyboardProvider,
  Handle,
  createHandle,
};
