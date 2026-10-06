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
} from '../../../utils/motion';
import {
  BLUR_HALF,
  BLUR_STEEPNESS,
  DISMISS_TRANSITION,
  DRAWER_TRANSITION,
  OVERLAY_EXIT_TRANSITION,
  OVERLAY_TRANSITION,
  seenBlur,
  toCssTiming,
  useModalTransitions,
} from '../../../internal/modal-motion';

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
// - Popup: it rests at the swipe offset, starts and ends one full size off
//   its edge, and slides opaque. It comes in (and snaps, and eases back
//   after a swipe) in 0.4s of cubic-bezier(0.34, 1.2, 0.64, 1): it answers
//   at once, goes a hair past its rest (~1%, which shadcn/ui's bleed below
//   it covers), then settles back, a hint of bounce where Vaul's curve zips
//   in, then stops. Closed, it leaves like a dismissed dialog, at once,
//   speeding off its edge (0.2s, a steady push), so its last pixels don't
//   crawl out. Thrown by a swipe (`data-swipe-dismiss`), it keeps the
//   finger's speed: linear, over Base UI's `--drawer-swipe-strength` share
//   of 360ms, the time the rest of the way takes at that speed. Nothing
//   transitions while the finger (or a nested drawer) drags it. Its shadow
//   lifts off the page with it, from none off screen. On its way out, it
//   waits for its Backdrop to clear: Base UI unmounts the drawer once the
//   Popup's transitions have played, which cut a slower Backdrop short and
//   snapped the page back sharp.
// - Backdrop: like a dialog's overlay. One level (a registered `<number>`)
//   transitions, in 400ms on CSS's `ease` (250ms clearing) or following the
//   swipe; its tint deepens with it, and its backdrop blur grows from 0 as
//   it's seen, so the page behind blurs progressively instead of
//   cross-fading with an already blurred copy, and never all at once. Its
//   classes' values are read once it mounts and held as variables the
//   stylesheet scales; over a background image, it fades its opacity
//   instead.
// - Reduced motion: it fades in place; a swipe dismissal still leaves along
//   the swipe.
//
// It reads shadcn/ui's `--translate-x`, `--translate-y`, `--stack-scale` and
// `--closed-transform` when they're set, so nested-drawer stacking and the
// drawer's inset keep working.

const STYLE_HREF = 'animate-ui-base-ui-drawer';

/**
 * ms: Base UI's longest swipe release, which `--drawer-swipe-strength`
 * scales down to the time the rest of the way takes at the finger's speed.
 */
const THROW_DURATION = 360;

/** The backdrop blur's radius at its level, as seen (`blurAtLevel`). */
const SEEN =
  'calc(var(--animate-ui-backdrop-level) * var(--animate-ui-backdrop-blur-seen))';
const BLUR_AS_SEEN = `calc(${BLUR_HALF}px * pow(calc(${SEEN} / (1 - ${SEEN})), ${1 / BLUR_STEEPNESS}))`;

const POPUP = ':where([data-animate-ui-drawer="popup"])';
const POPUP_IS = (selector: string) =>
  `:where([data-animate-ui-drawer="popup"]${selector})`;
const BACKDROP_IS = (selector: string) =>
  `:where([data-animate-ui-drawer="backdrop"]${selector})`;

const CSS = `
@property --animate-ui-backdrop-level {
  syntax: '<number>';
  inherits: false;
  initial-value: 0;
}
${POPUP} {
  --animate-ui-drawer-dx: var(--drawer-swipe-movement-x, 0px);
  --animate-ui-drawer-dy: calc(var(--drawer-snap-point-offset, 0px) + var(--drawer-swipe-movement-y, 0px));
  --animate-ui-drawer-rest: translate3d(var(--translate-x, var(--animate-ui-drawer-dx)), var(--translate-y, var(--animate-ui-drawer-dy)), 0) scale(var(--stack-scale, 1));
  transform: var(--animate-ui-drawer-rest);
  transition-property: transform, opacity, height, filter, box-shadow;
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
  box-shadow: none;
}
${POPUP_IS('[data-ending-style]')} {
  transition-duration: var(--animate-ui-drawer-exit-duration);
  transition-timing-function: var(--animate-ui-drawer-exit-ease);
}
${POPUP_IS('[data-ending-style][data-swipe-dismiss]')} {
  transition-duration: calc(var(--drawer-swipe-strength, 1) * ${THROW_DURATION}ms);
  transition-timing-function: linear;
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
  transition-property: --animate-ui-backdrop-level;
  transition-duration: var(--animate-ui-drawer-duration);
  transition-timing-function: var(--animate-ui-drawer-ease);
}
${BACKDROP_IS(':is([data-starting-style], [data-ending-style])')} { --animate-ui-backdrop-level: 0; }
${BACKDROP_IS('[data-animate-ui-backdrop]')} {
  opacity: 1;
  background-color: color-mix(in srgb, var(--animate-ui-backdrop-color) calc(var(--animate-ui-backdrop-level) * 100%), transparent) !important;
}
${BACKDROP_IS('[data-animate-ui-backdrop-blur]')} {
  -webkit-backdrop-filter: blur(calc(var(--animate-ui-backdrop-blur) * var(--animate-ui-backdrop-level))) !important;
  backdrop-filter: blur(calc(var(--animate-ui-backdrop-blur) * var(--animate-ui-backdrop-level))) !important;
}
@supports (width: calc(1px * pow(2, 0.5))) {
  ${BACKDROP_IS('[data-animate-ui-backdrop-blur]')} {
    -webkit-backdrop-filter: blur(${BLUR_AS_SEEN}) !important;
    backdrop-filter: blur(${BLUR_AS_SEEN}) !important;
  }
}
${BACKDROP_IS('[data-ending-style]')} {
  transition-duration: var(--animate-ui-drawer-exit-duration);
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
   * @default { duration: 0.4, ease: [0.34, 1.2, 0.64, 1] }
   */
  transition?: Transition;
  /**
   * Closing (slide out) by a button, Escape or a click outside: at once,
   * quicker than it came, speeding off its edge. A swipe dismissal is thrown
   * instead: it keeps the finger's speed.
   * @default { duration: 0.2, ease: [0.33, 0.17, 0.67, 0.5] }
   */
  exitTransition?: Transition;
};

/** Animate UI's additions to `Drawer.Backdrop`. */
type BackdropAnimationProps = {
  /**
   * Its tint and backdrop blur coming in, like a dialog's overlay.
   * CSS-driven, like the Popup's.
   * @default { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
   */
  transition?: Transition;
  /**
   * Its tint and backdrop blur clearing, like a dialog's overlay.
   * @default { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }
   */
  exitTransition?: Transition;
};

/**
 * The timing variables of a part, as the modals pick them: `exitTransition`,
 * or the part's own exit (`exitFallback`), or `transition` both ways.
 */
function useTimingVariables(
  transition: Transition | undefined,
  exitTransition: Transition | undefined,
  fallback: Transition,
  exitFallback?: Transition,
): React.CSSProperties {
  const timings = useModalTransitions(
    transition,
    exitTransition,
    fallback,
    exitFallback,
  );
  const enter = toCssTiming(timings.enter);
  const exit = toCssTiming(timings.exit);
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
  export type Props = DrawerPrimitive.Popup.Props &
    PopupAnimationProps & { ref?: React.Ref<HTMLDivElement> };
  export type State = DrawerPrimitive.Popup.State;
}

function PopupWithTiming({
  transition,
  exitTransition,
  style,
  ref,
  ...props
}: Popup.Props) {
  const reduce = useShouldReduceMotion();
  // In with a hint of bounce; closed, out at once, speeding away.
  const variables = useTimingVariables(
    transition,
    exitTransition,
    DRAWER_TRANSITION,
    DISMISS_TRANSITION,
  );
  const setRef = useHoldForBackdrop(ref);

  return (
    <>
      <DrawerStyle />
      <DrawerPrimitive.Popup
        {...props}
        ref={setRef}
        data-animate-ui-drawer="popup"
        data-animate-ui-reduce={reduce ? '' : undefined}
        style={withVariables(variables, style)}
      />
    </>
  );
}

/** Sets `ref` to `node`; a callback ref may return its cleanup. */
function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') return ref(node);
  if (ref) (ref as React.RefObject<T | null>).current = node;
  return undefined;
}

/** The Backdrop beside a Popup: in the same Base UI portal. */
function findBackdrop(popup: HTMLElement) {
  return popup
    .closest('[data-base-ui-portal]')
    ?.querySelector<HTMLElement>(
      ':scope > [data-animate-ui-drawer="backdrop"]',
    );
}

/** ms left to the longest of `element`'s animations. */
function timeLeft(element: HTMLElement) {
  let left = 0;
  for (const animation of element.getAnimations()) {
    const { endTime, localTime } = animation.effect?.getComputedTiming() ?? {};
    if (typeof endTime === 'number' && typeof localTime === 'number')
      left = Math.max(left, endTime - localTime);
  }
  return left;
}

/**
 * Base UI unmounts a closed drawer once its Popup's own animations have
 * played, its Backdrop's or not: a Backdrop still clearing was cut short, the
 * page snapping back sharp from a half-cleared blur. On its way out, the
 * Popup holds (an empty Web Animation, which Base UI waits for too) until its
 * Backdrop has cleared. Returns the Popup's ref.
 */
function useHoldForBackdrop(ref: React.Ref<HTMLDivElement> | undefined) {
  return React.useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return undefined;
      let hold: Animation | null = null;
      const observer = new MutationObserver(() => {
        if (!node.hasAttribute('data-ending-style')) {
          hold?.cancel();
          hold = null;
          return;
        }
        const backdrop = findBackdrop(node);
        if (hold || !backdrop || typeof node.animate !== 'function') return;
        // Its clearing started with the Popup's way out (reading its
        // animations starts their transitions).
        const left = timeLeft(backdrop);
        if (left > 0) hold = node.animate([], { duration: left });
      });
      observer.observe(node, {
        attributes: true,
        attributeFilter: ['data-ending-style'],
      });
      const cleanup = assignRef(ref, node);
      return () => {
        observer.disconnect();
        hold?.cancel();
        if (typeof cleanup === 'function') cleanup();
        else assignRef(ref, null);
      };
    },
    [ref],
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
    const blur = /^blur\(([\d.]+)px\)$/.exec(filter)?.[1];
    // Other filters than a blur are left as they are.
    if (blur || filter === 'none') {
      const radius = Number(blur ?? 0);
      style.setProperty('--animate-ui-backdrop-blur', `${radius}px`);
      style.setProperty(
        '--animate-ui-backdrop-blur-seen',
        String(seenBlur(radius)),
      );
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
  // A dialog's overlay: in over 400ms, cleared over 250ms, on CSS's `ease`.
  const variables = useTimingVariables(
    transition,
    exitTransition,
    OVERLAY_TRANSITION,
    OVERLAY_EXIT_TRANSITION,
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
