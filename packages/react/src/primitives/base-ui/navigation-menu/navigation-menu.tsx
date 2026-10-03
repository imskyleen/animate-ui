'use client';
/* eslint-disable @typescript-eslint/no-namespace -- each part keeps Base UI's `Part.Props`/`Part.State` type namespace */

import * as React from 'react';
import { NavigationMenu as NavigationMenuPrimitive } from '@base-ui/react/navigation-menu';
import { motion, type Transition } from 'motion/react';

import {
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
} from '../../../utils/motion';

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

// Same API as Base UI's Navigation Menu.
//
// - The Popup scales and fades in from its trigger. Base UI resizes it to the
//   active content through `--popup-width`/`--popup-height`: Animate UI
//   transitions that size with its own timing (Base UI drives it with CSS
//   transitions, which it waits for).
// - Moving between items, the new Content fades in from the side of its
//   trigger while the previous one fades out towards the other side.
// - The Root asks Base UI to keep the popup mounted after it closes, and the
//   Popup unmounts it once its exit has played.

/** Animate UI's additions to the parts that appear and disappear. */
type PresenceAnimationProps = {
  /** Transition of the entrance (and of the resizing, for the Popup). */
  transition?: Transition;
  /** Transition of the exit. */
  exitTransition?: Transition;
};

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
  if (!root) return <NavigationMenuPrimitive.Popup {...props} render={render} />;

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
  const tokens = useMotionTokens();
  const reduce = useShouldReduceMotion();
  // Base UI marks the first frame of an opening `starting`.
  const [entering] = React.useState(state.transitionStatus === 'starting');
  const openRef = React.useRef(state.open);
  React.useLayoutEffect(() => {
    openRef.current = state.open;
  });

  const enter = transition ?? tokens.transition.dropdown;
  const exit = exitTransition ?? tokens.transition.exit;
  const hidden = {
    opacity: 0,
    transform: reduce ? 'scale(1)' : `scale(${tokens.scale.enter})`,
  };
  // Only the size is left to CSS (Base UI waits for these transitions before
  // it sets the size back to auto); opacity and transform are Motion's.
  const sizeDuration =
    typeof enter.duration === 'number' ? enter.duration : tokens.duration.dropdown;
  const sizeEase = Array.isArray(enter.ease) ? enter.ease : tokens.ease.out;
  const ref = useInlineTransition(htmlProps, {
    property: reduce ? 'none' : 'width, height',
    duration: `${sizeDuration}s`,
    easing: `cubic-bezier(${sizeEase.join(', ')})`,
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
          ? { opacity: 1, transform: 'scale(1)', transition: enter }
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
  if (!root) return <NavigationMenuPrimitive.Content {...props} render={render} />;

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

const SLIDE = 16;

/** Where content sits on the side of an item: `right` means after it. */
function offset(direction: Content.State['activationDirection'], sign: 1 | -1) {
  switch (direction) {
    case 'right':
      return `translateX(${SLIDE * sign}px)`;
    case 'left':
      return `translateX(${-SLIDE * sign}px)`;
    case 'down':
      return `translateY(${SLIDE * sign}px)`;
    case 'up':
      return `translateY(${-SLIDE * sign}px)`;
    default:
      return undefined;
  }
}

// Rendered inside ReducedMotionConfig, so useShouldReduceMotion() sees it.
function ContentMotion({
  htmlProps,
  state,
  transition,
  exitTransition,
}: PresenceAnimationProps & { htmlProps: HTMLProps; state: Content.State }) {
  const tokens = useMotionTokens();
  const reduce = useShouldReduceMotion();
  const direction = state.activationDirection;
  const vertical = direction === 'up' || direction === 'down';
  const shown = vertical ? 'translateY(0px)' : 'translateX(0px)';
  // Switching items: in from the side of the new item. The first opening
  // has no direction; the Popup's entrance is enough.
  const [from] = React.useState(() =>
    state.transitionStatus === 'starting' ? offset(direction, 1) : undefined,
  );
  // Leaving towards the other side. Closing the whole menu has no direction:
  // the content stays put while the Popup leaves.
  const to = !state.open ? offset(direction, -1) : undefined;
  // Motion owns opacity and transform: no CSS transition on top.
  const ref = useInlineTransition(htmlProps, { property: 'none' });

  return (
    <motion.div
      {...(htmlProps as React.ComponentProps<typeof motion.div>)}
      ref={ref}
      initial={
        from ? { opacity: 0, transform: reduce ? shown : from } : false
      }
      animate={
        to
          ? {
              opacity: 0,
              transform: reduce ? shown : to,
              transition: exitTransition ?? tokens.transition.exit,
            }
          : {
              opacity: 1,
              transform: shown,
              transition: transition ?? tokens.transition.fade,
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
