'use client';

/* eslint-disable @typescript-eslint/no-namespace -- each part merges a
   namespace of types with its component, like Base UI's own parts
   (`Drawer.Popup.Props`, `Drawer.Root.SnapPoint`…). */

import * as React from 'react';
import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';
import type { Transition } from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { DRAWER_TRANSITION, toCssTiming } from '../../../internal/modal-motion';

// Same API as Base UI's Drawer, with Vaul's motion (Animate UI v1 had no
// drawer).
//
// CSS-driven, not Motion: Base UI drives the swipe itself through CSS
// variables (`--drawer-swipe-movement-*`, `--drawer-snap-point-offset`,
// `--drawer-swipe-progress`, `--drawer-swipe-strength`), data attributes
// (`data-starting-style`, `data-ending-style`, `data-swiping`) and an inline
// transform while dragging, and waits for CSS transitions before unmounting.
// A JavaScript animation layered on top would fight the finger. So the Popup
// and the Backdrop get a small stylesheet (zero specificity, hoisted once by
// React) and their timing as inline variables, springs as the `linear()`
// curve Motion itself would use, which `tempo` reaches:
//
// - Popup: Vaul's. It rests at the swipe offset, starts and ends one full
//   size off its edge, and slides opaque on Vaul's curve (0.5s of
//   cubic-bezier(0.32, 0.72, 0, 1), which answers at once and glides to
//   rest) both ways; a swipe dismissal's exit is scaled by the release
//   velocity, and nothing transitions while the finger (or a nested drawer)
//   drags it.
// - Backdrop: like the dialogs'. Its tint deepens while its backdrop blur
//   grows from 0, on the same curve, so the page behind blurs progressively
//   instead of cross-fading with an already blurred copy, and both follow
//   the swipe. Its classes' values are read once it mounts and held as
//   variables the stylesheet scales; over a background image, it fades its
//   opacity instead.
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
  --animate-ui-backdrop-level: max(var(--drawer-overlay-min-opacity, 0), calc(1 - var(--drawer-swipe-progress, 0)));
  opacity: var(--animate-ui-backdrop-level);
  transition-property: opacity;
  transition-duration: var(--animate-ui-drawer-duration);
  transition-timing-function: var(--animate-ui-drawer-ease);
}
${BACKDROP_IS(':is([data-starting-style], [data-ending-style])')} { --animate-ui-backdrop-level: 0; }
${BACKDROP_IS('[data-animate-ui-backdrop]')} {
  opacity: 1;
  background-color: color-mix(in srgb, var(--animate-ui-backdrop-color) calc(var(--animate-ui-backdrop-level) * 100%), transparent) !important;
  transition-property: background-color, backdrop-filter, -webkit-backdrop-filter;
}
${BACKDROP_IS('[data-animate-ui-backdrop-blur]')} {
  -webkit-backdrop-filter: blur(calc(var(--animate-ui-backdrop-blur) * var(--animate-ui-backdrop-level))) !important;
  backdrop-filter: blur(calc(var(--animate-ui-backdrop-blur) * var(--animate-ui-backdrop-level))) !important;
}
${BACKDROP_IS('[data-ending-style]')} {
  transition-duration: calc(var(--drawer-swipe-strength, 1) * var(--animate-ui-drawer-exit-duration));
  transition-timing-function: var(--animate-ui-drawer-exit-ease);
}
${BACKDROP_IS('[data-swiping]:not([data-ending-style])')} { transition-duration: 0ms; }
`;

/** Animate UI's additions to `Drawer.Popup`. */
type PopupAnimationProps = {
  /**
   * Opening (slide in), snapping and easing back after a swipe that does not
   * dismiss. CSS-driven: a spring becomes a `linear()` curve, a tween keeps
   * its `duration` and cubic-bezier or named `ease`.
   * @default { duration: 0.5, ease: [0.32, 0.72, 0, 1] }
   */
  transition?: Transition;
  /**
   * Closing (slide out), scaled by a swipe's release velocity. Defaults to
   * `transition`.
   */
  exitTransition?: Transition;
};

/** Animate UI's additions to `Drawer.Backdrop`. */
type BackdropAnimationProps = {
  /**
   * Its tint and backdrop blur coming in. CSS-driven, like the Popup's.
   * @default { duration: 0.5, ease: [0.32, 0.72, 0, 1] }
   */
  transition?: Transition;
  /** Its tint and backdrop blur clearing. Defaults to `transition`. */
  exitTransition?: Transition;
};

/** The timing variables of a part: `transition` both ways by default. */
function useTimingVariables(
  transition: Transition | undefined,
  exitTransition: Transition | undefined,
  fallback: Transition,
): React.CSSProperties {
  const enter = toCssTiming(useTempoTransition(transition ?? fallback));
  const exit = toCssTiming(
    useTempoTransition(exitTransition ?? transition ?? fallback),
  );
  return {
    '--animate-ui-drawer-duration': `${enter.duration}ms`,
    '--animate-ui-drawer-ease': enter.easing,
    '--animate-ui-drawer-exit-duration': `${exit.duration}ms`,
    '--animate-ui-drawer-exit-ease': exit.easing,
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
  export type Props = DrawerPrimitive.Popup.Props & PopupAnimationProps;
  export type State = DrawerPrimitive.Popup.State;
}

function PopupWithTiming({
  transition,
  exitTransition,
  style,
  ...props
}: Popup.Props) {
  const reduce = useShouldReduceMotion();
  const variables = useTimingVariables(
    transition,
    exitTransition,
    DRAWER_TRANSITION,
  );

  return (
    <>
      <DrawerStyle />
      <DrawerPrimitive.Popup
        {...props}
        data-animate-ui-drawer="popup"
        data-animate-ui-reduce={reduce ? '' : undefined}
        style={withVariables(variables, style)}
      />
    </>
  );
}

/**
 * Holds `node`'s tint and backdrop blur, from its classes, as the variables
 * the stylesheet scales by its level: read, then set, with nothing
 * transitioning (it mounts transparent, and only then comes in).
 */
function holdBackdrop(node: HTMLElement) {
  const { style } = node;
  const transition = style.getPropertyValue('transition');
  style.setProperty('transition', 'none');
  const computed = getComputedStyle(node);
  // Over a background image, there's no color to deepen: it fades.
  if (computed.backgroundImage === 'none') {
    style.setProperty('--animate-ui-backdrop-color', computed.backgroundColor);
    node.setAttribute('data-animate-ui-backdrop', '');
    const filter = computed.backdropFilter;
    const blur = /^blur\(([\d.]+px)\)$/.exec(filter)?.[1];
    // Other filters than a blur are left as they are.
    if (blur || filter === 'none') {
      style.setProperty('--animate-ui-backdrop-blur', blur ?? '0px');
      node.setAttribute('data-animate-ui-backdrop-blur', '');
    }
  }
  void getComputedStyle(node).backgroundColor;
  if (transition) style.setProperty('transition', transition);
  else style.removeProperty('transition');
}

function Backdrop({
  transition,
  exitTransition,
  style,
  ref,
  ...props
}: Backdrop.Props) {
  const variables = useTimingVariables(
    transition,
    exitTransition,
    DRAWER_TRANSITION,
  );
  const nodeRef = React.useRef<HTMLDivElement | null>(null);
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      nodeRef.current = node;
      if (typeof ref === 'function') return ref(node);
      if (ref) ref.current = node;
      return undefined;
    },
    [ref],
  );
  React.useLayoutEffect(() => {
    if (nodeRef.current) holdBackdrop(nodeRef.current);
  }, []);

  return (
    <>
      <DrawerStyle />
      <DrawerPrimitive.Backdrop
        {...props}
        ref={setRef}
        data-animate-ui-drawer="backdrop"
        style={withVariables(variables, style)}
      />
    </>
  );
}
namespace Backdrop {
  export type Props = DrawerPrimitive.Backdrop.Props &
    BackdropAnimationProps & { ref?: React.Ref<HTMLDivElement> };
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
