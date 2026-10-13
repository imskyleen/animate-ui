'use client';

/* eslint-disable @typescript-eslint/no-namespace */

import * as React from 'react';
import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';
import type { Transition } from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '../../../utils/motion';
import {
  DRAWER_EXIT_TRANSITION,
  DRAWER_TRANSITION,
  OVERLAY_TRANSITION,
  toCssTiming,
  useModalTransitions,
} from '../../../internal/modal-motion';

const STYLE_HREF = 'animate-ui-base-ui-drawer';

const THROW_DURATION = 360;

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
${BACKDROP_IS('[data-ending-style]')} {
  transition-duration: var(--animate-ui-drawer-exit-duration);
  transition-timing-function: var(--animate-ui-drawer-exit-ease);
}
${BACKDROP_IS('[data-swiping]:not([data-ending-style])')} { transition-duration: 0ms; }
`;

type PopupAnimationProps = {
  transition?: Transition;
  exitTransition?: Transition;
};

type BackdropAnimationProps = {
  transition?: Transition;
  exitTransition?: Transition;
};

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
  const variables = useTimingVariables(
    transition,
    exitTransition,
    DRAWER_TRANSITION,
    DRAWER_EXIT_TRANSITION,
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

function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') return ref(node);
  if (ref) (ref as React.RefObject<T | null>).current = node;
  return undefined;
}

function findBackdrop(popup: HTMLElement) {
  return popup
    .closest('[data-base-ui-portal]')
    ?.querySelector<HTMLElement>(
      ':scope > [data-animate-ui-drawer="backdrop"]',
    );
}

function timeLeft(element: HTMLElement) {
  let left = 0;
  for (const animation of element.getAnimations()) {
    const { endTime, localTime } = animation.effect?.getComputedTiming() ?? {};
    if (typeof endTime === 'number' && typeof localTime === 'number')
      left = Math.max(left, endTime - localTime);
  }
  return left;
}

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

function holdBackdrop(node: HTMLElement) {
  const { style } = node;
  const transition = style.getPropertyValue('transition');
  style.setProperty('transition', 'none');
  const computed = getComputedStyle(node);
  if (computed.backgroundImage === 'none') {
    style.setProperty('--animate-ui-backdrop-color', computed.backgroundColor);
    node.setAttribute('data-animate-ui-backdrop', '');
    const filter = computed.backdropFilter;
    const blur = /^blur\(([\d.]+)px\)$/.exec(filter)?.[1];
    if (blur || filter === 'none') {
      style.setProperty('--animate-ui-backdrop-blur', `${blur ?? 0}px`);
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
    OVERLAY_TRANSITION,
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
