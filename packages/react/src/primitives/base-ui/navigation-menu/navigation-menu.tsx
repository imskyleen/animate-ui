'use client';
/* eslint-disable @typescript-eslint/no-namespace -- each part keeps Base UI's `Part.Props`/`Part.State` type namespace */

import * as React from 'react';
import { NavigationMenu as NavigationMenuPrimitive } from '@base-ui/react/navigation-menu';
import { motion, type Transition } from 'motion/react';

import {
  motionTokens,
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { HIDDEN_SCALE, MENU_TRANSITION } from '../../../internal/anchored';

// Untouched parts: the import alias keeps both the component and its type
// namespace (`NavigationMenu.Trigger.Props`).
import List = NavigationMenuPrimitive.List;
import Item = NavigationMenuPrimitive.Item;
import Trigger = NavigationMenuPrimitive.Trigger;
import Portal = NavigationMenuPrimitive.Portal;
import Positioner = NavigationMenuPrimitive.Positioner;
import Viewport = NavigationMenuPrimitive.Viewport;
import Backdrop = NavigationMenuPrimitive.Backdrop;
import Arrow = NavigationMenuPrimitive.Arrow;
import Link = NavigationMenuPrimitive.Link;
import Icon = NavigationMenuPrimitive.Icon;

// Same API as Base UI's Navigation Menu. It has no Animate UI v1
// counterpart: it moves like v1's Base UI Menu.
//
// - The Popup fades and scales from 0.9 in 200ms, both ways, from its
//   trigger. Base UI resizes it to the active content through
//   `--popup-width`/`--popup-height`: Animate UI transitions that size in
//   200ms too (Base UI drives it with CSS transitions, which it waits for).
// - Moving between items, the new Content fades in from a 4px blur while the
//   previous one fades out into it, in 200ms.
// - The Root asks Base UI to keep the popup mounted after it closes, and the
//   Popup unmounts it once its exit has played.

/** Animate UI's additions to the parts that appear and disappear. */
type PresenceAnimationProps = {
  /**
   * Transition of the entrance (and of the resizing, for the Popup), and of
   * the exit unless `exitTransition` is set. Defaults to `{ duration: 0.2,
   * ease: [0.23, 1, 0.32, 1] }`.
   */
  transition?: Transition;
  /** Transition of the exit. Defaults to `transition`. */
  exitTransition?: Transition;
};

/** Motion's `easeOut` (the ease of a tween without one), for CSS. */
const EASE_OUT_CSS = 'cubic-bezier(0, 0, 0.58, 1)';

type HTMLProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
};

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    }
  };
}

/**
 * Sets the element's CSS transition inline (Motion drops `transition*` keys
 * from its `style` prop). Inline, it wins over classes that would transition
 * what Motion animates.
 */
function useInlineTransition(
  htmlProps: HTMLProps,
  transition: { property: string; duration?: string; easing?: string },
) {
  const nodeRef = React.useRef<HTMLElement | null>(null);
  // Stable while Base UI's ref is: a new callback would detach and reattach
  // the element on every render.
  const htmlRef = htmlProps.ref;
  const ref = React.useCallback(
    (node: HTMLElement | null) => mergeRefs(htmlRef, nodeRef)(node),
    [htmlRef],
  );
  // Base UI sets `transition: none` on the first frame of an opening, then
  // removes it, which clears these too: apply them after every render.
  const baseUITransition = htmlProps.style?.transition;
  const { property, duration = '', easing = '' } = transition;
  React.useLayoutEffect(() => {
    const style = nodeRef.current?.style;
    if (!style || baseUITransition !== undefined) return;
    style.setProperty('transition-property', property);
    style.setProperty('transition-duration', duration);
    style.setProperty('transition-timing-function', easing);
  });
  return ref;
}

type RootContextValue = {
  unmount: () => void;
  /** The Popup is there to unmount the menu: hand it over. */
  enableManualUnmount: () => void;
};

const RootContext = React.createContext<RootContextValue | null>(null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Root<Value = any>({ actionsRef, ...props }: Root.Props<Value>) {
  const ownActionsRef = React.useRef<Root.Actions | null>(null);
  // The user's actionsRef still works: it forwards to Base UI's actions.
  React.useImperativeHandle(actionsRef, () => ({
    unmount: () => ownActionsRef.current?.unmount(),
  }));
  // Only once a Popup has mounted: a nested menu without its own Popup keeps
  // Base UI's automatic unmounting.
  const [manual, setManual] = React.useState(false);
  const context = React.useMemo<RootContextValue>(
    () => ({
      unmount: () => ownActionsRef.current?.unmount(),
      enableManualUnmount: () => setManual(true),
    }),
    [],
  );

  return (
    <RootContext value={context}>
      <NavigationMenuPrimitive.Root<Value>
        {...props}
        // Providing actionsRef opts into manual unmounting in Base UI.
        actionsRef={manual || actionsRef ? ownActionsRef : undefined}
      />
    </RootContext>
  );
}

namespace Root {
  export type State = NavigationMenuPrimitive.Root.State;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type Props<TValue = any> = NavigationMenuPrimitive.Root.Props<TValue>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type Value<TValue = any> = NavigationMenuPrimitive.Root.Value<TValue>;
  export type Actions = NavigationMenuPrimitive.Root.Actions;
  export type ChangeEventReason =
    NavigationMenuPrimitive.Root.ChangeEventReason;
  export type ChangeEventDetails =
    NavigationMenuPrimitive.Root.ChangeEventDetails;
}

function Popup({ transition, exitTransition, render, ...props }: Popup.Props) {
  const root = React.use(RootContext);
  const enableManualUnmount = root?.enableManualUnmount;
  React.useLayoutEffect(() => enableManualUnmount?.(), [enableManualUnmount]);
  if (!root)
    return <NavigationMenuPrimitive.Popup {...props} render={render} />;

  return (
    <NavigationMenuPrimitive.Popup
      {...props}
      // The motion element is Base UI's element: its props, data attributes
      // and children land on it.
      render={(htmlProps, state) => (
        <ReducedMotionConfig>
          <PopupMotion
            htmlProps={htmlProps}
            state={state}
            unmount={root.unmount}
            transition={transition}
            exitTransition={exitTransition}
          />
        </ReducedMotionConfig>
      )}
    />
  );
}

namespace Popup {
  /** Base UI's props, plus Animate UI's `transition` and `exitTransition`. */
  export type Props = NavigationMenuPrimitive.Popup.Props &
    PresenceAnimationProps;
  export type State = NavigationMenuPrimitive.Popup.State;
}

// Rendered inside ReducedMotionConfig, so useShouldReduceMotion() sees it.
function PopupMotion({
  htmlProps,
  state,
  unmount,
  transition,
  exitTransition,
}: PresenceAnimationProps & {
  htmlProps: HTMLProps;
  state: Popup.State;
  unmount: () => void;
}) {
  const reduce = useShouldReduceMotion();
  // A popup that mounts open plays its entrance: when it opens, and when an
  // item is open from the start (defaultValue), on page load. One that mounts
  // closed starts hidden, in place.
  const [entering] = React.useState(state.open);
  const openRef = React.useRef(state.open);
  React.useLayoutEffect(() => {
    openRef.current = state.open;
  });

  const enter = useTempoTransition(transition ?? MENU_TRANSITION);
  const exit = useTempoTransition(
    exitTransition ?? transition ?? MENU_TRANSITION,
  );
  // `scale` (like v1's menus): `transform: none` once settled.
  const hidden = { opacity: 0, scale: reduce ? 1 : HIDDEN_SCALE.menu };
  // Only the size is left to CSS (Base UI waits for these transitions before
  // it sets the size back to auto); opacity and transform are Motion's.
  const { duration, ease } = enter as { duration?: unknown; ease?: unknown };
  const sizeDuration =
    typeof duration === 'number' ? duration : MENU_TRANSITION.duration;
  const sizeEase = Array.isArray(ease)
    ? `cubic-bezier(${ease.join(', ')})`
    : EASE_OUT_CSS;
  const ref = useInlineTransition(htmlProps, {
    property: reduce ? 'none' : 'width, height',
    duration: `${sizeDuration}s`,
    easing: sizeEase,
  });

  return (
    // Base UI renders the Popup as a <nav>.
    <motion.nav
      {...(htmlProps as React.ComponentProps<typeof motion.nav>)}
      ref={ref}
      initial={entering ? hidden : false}
      // Transitions live in the targets: each direction keeps its own.
      animate={
        state.open
          ? { opacity: 1, scale: 1, transition: enter }
          : { ...hidden, transition: exit }
      }
      onAnimationComplete={() => {
        if (!openRef.current) unmount();
      }}
      style={{
        transformOrigin: 'var(--transform-origin)',
        ...htmlProps.style,
      }}
    />
  );
}

function Content({
  transition,
  exitTransition,
  render,
  ...props
}: Content.Props) {
  const root = React.use(RootContext);
  if (!root)
    return <NavigationMenuPrimitive.Content {...props} render={render} />;

  return (
    <NavigationMenuPrimitive.Content
      {...props}
      render={(htmlProps, state) => (
        <ReducedMotionConfig>
          <ContentMotion
            htmlProps={htmlProps}
            state={state}
            transition={transition}
            exitTransition={exitTransition}
          />
        </ReducedMotionConfig>
      )}
    />
  );
}

namespace Content {
  /** Base UI's props, plus Animate UI's `transition` and `exitTransition`. */
  export type Props = NavigationMenuPrimitive.Content.Props &
    PresenceAnimationProps;
  export type State = NavigationMenuPrimitive.Content.State;
}

// Rendered inside ReducedMotionConfig, so useShouldReduceMotion() sees it.
function ContentMotion({
  htmlProps,
  state,
  transition,
  exitTransition,
}: PresenceAnimationProps & { htmlProps: HTMLProps; state: Content.State }) {
  const fadeIn = useTempoTransition(transition ?? MENU_TRANSITION);
  const fadeOut = useTempoTransition(
    exitTransition ?? transition ?? MENU_TRANSITION,
  );
  // Switching items gives a direction. The first opening has none: the
  // Popup's entrance is enough.
  const [swapped] = React.useState(
    () =>
      state.transitionStatus === 'starting' &&
      Boolean(state.activationDirection),
  );
  // Leaving for another item. Closing the whole menu has no direction: the
  // content stays put while the Popup leaves.
  const leaving = !state.open && Boolean(state.activationDirection);
  // Motion owns opacity: no CSS transition on top.
  const ref = useInlineTransition(htmlProps, { property: 'none' });

  return (
    <motion.div
      {...(htmlProps as React.ComponentProps<typeof motion.div>)}
      ref={ref}
      // A light blur bridges the crossfade: the swap reads as one surface
      // changing. Dropped at rest (a `filter` would make it the containing
      // block of fixed descendants).
      initial={
        swapped ? { opacity: 0, filter: motionTokens.blur.surface } : false
      }
      animate={
        leaving
          ? {
              opacity: 0,
              filter: motionTokens.blur.surface,
              transition: fadeOut,
            }
          : {
              opacity: 1,
              filter: 'blur(0px)',
              transition: fadeIn,
              transitionEnd: { filter: 'none' },
            }
      }
      style={htmlProps.style}
    />
  );
}

export {
  Root,
  List,
  Item,
  Content,
  Trigger,
  Portal,
  Positioner,
  Viewport,
  Backdrop,
  Popup,
  Arrow,
  Link,
  Icon,
};
