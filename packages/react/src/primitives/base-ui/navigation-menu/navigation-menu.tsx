'use client';
/* eslint-disable @typescript-eslint/no-namespace -- each part keeps Base UI's `Part.Props`/`Part.State` type namespace */

import * as React from 'react';
import { NavigationMenu as NavigationMenuPrimitive } from '@base-ui/react/navigation-menu';
import { motion, type Transition } from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import {
  HIDDEN_SCALE,
  MENU_TRANSITION,
  MORPH_TRANSITION,
} from '../../../internal/anchored';
import {
  ContentSwapper,
  useContentSwapper,
  useMoveFollower,
  useSizeFollower,
  type Way,
} from '../../../internal/content-swap';
import {
  TriggerHighlightScope,
  useTriggerHighlight,
  withHighlight,
} from '../../../internal/item-highlight';

// Untouched parts: the import alias keeps both the component and its type
// namespace (`NavigationMenu.Item.Props`).
import Item = NavigationMenuPrimitive.Item;
import Portal = NavigationMenuPrimitive.Portal;
import Positioner = NavigationMenuPrimitive.Positioner;
import Viewport = NavigationMenuPrimitive.Viewport;
import Backdrop = NavigationMenuPrimitive.Backdrop;
import Arrow = NavigationMenuPrimitive.Arrow;
import Icon = NavigationMenuPrimitive.Icon;

// Same API as Base UI's Navigation Menu. It has no Animate UI v1
// counterpart: it moves like v1's Base UI Menu.
//
// - The Popup fades and scales from 0.9 in 220ms, both ways, from its
//   trigger. Base UI resizes it to the active content through
//   `--popup-width`/`--popup-height`: Animate UI transitions that size on a
//   spring that eases in without going past (`spring.morph`; Base UI drives
//   it with CSS transitions, which it waits for), each resize from the speed
//   the previous one had (internal/momentum).
// - Moving between items, the Popup moves to the next trigger on that spring
//   too (Web Animations, the Positioner's CSS transition is set aside), and
//   the content changes like a menubar's, like Motion's mega menu: it stays
//   where it is on screen while the Popup slides over it, the previous one
//   leaving 24px away from where the next one comes from while it fades out,
//   the next one coming in from 24px that way and fading in behind it
//   (internal/content-swap).
// - The triggers (and the links beside them) share one highlight, like a
//   menubar's, and so do the links of each Content (internal/item-highlight).
// - The Root asks Base UI to keep the popup mounted after it closes, and the
//   Popup unmounts it once its exit has played.

/** Animate UI's additions to the parts that appear and disappear. */
type PresenceAnimationProps = {
  /**
   * Transition of the entrance (and, for the Popup, of its moving and
   * resizing from item to item), and of the exit unless `exitTransition` is
   * set. Defaults to `{ duration: 0.22, ease: [0.215, 0.61, 0.355, 1] }`, and
   * the Popup moves and resizes on `{ type: 'spring', stiffness: 660,
   * damping: 52 }`.
   */
  transition?: Transition;
  /** Transition of the exit. Defaults to `transition`. */
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
  /**
   * The contents changing inside the Popup (they're rendered in its Viewport,
   * but declared in their items: they reach it from here).
   */
  swapper: ContentSwapper;
  /** The pointer has just switched the menu to the open item (see Trigger). */
  justSwitched: () => boolean;
  /** A click kept the open item open (see Trigger): it's pinned. */
  keptOpen: () => void;
};

const RootContext = React.createContext<RootContextValue | null>(null);

/**
 * How soon after a hover opened an item a click on its trigger keeps it
 * open: Base UI's "patient click" (its `PATIENT_CLICK_THRESHOLD`).
 */
const PATIENT_CLICK = 500;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Root<Value = any>({
  actionsRef,
  onValueChange,
  ...props
}: Root.Props<Value>) {
  const ownActionsRef = React.useRef<Root.Actions | null>(null);
  // The user's actionsRef still works: it forwards to Base UI's actions.
  React.useImperativeHandle(actionsRef, () => ({
    unmount: () => ownActionsRef.current?.unmount(),
  }));
  // Only once a Popup has mounted: a nested menu without its own Popup keeps
  // Base UI's automatic unmounting.
  const [manual, setManual] = React.useState(false);
  const [swapper] = React.useState(() => new ContentSwapper());
  // Its contents change in place even without a Popup (a submenu shown in
  // its parent's content), unless its Popup's settings come first.
  useContentSwapper(MORPH_TRANSITION, useShouldReduceMotion(), swapper, true);
  // Which item the pointer last switched the menu to (from another one), and
  // when: a click on its trigger right after keeps it open (see Trigger),
  // pinned, as Base UI pins an item after its own patient click (leaving it,
  // the pointer doesn't close it). The value is the one the menu shows (a
  // controlled one once its parent has applied it).
  const valueRef = React.useRef<unknown>(
    props.value ?? props.defaultValue ?? null,
  );
  const switchedRef = React.useRef<{ to: unknown; at: number }>({
    to: null,
    at: -Infinity,
  });
  const pinnedRef = React.useRef<unknown>(null);
  React.useLayoutEffect(() => {
    if (props.value === undefined || props.value === valueRef.current) return;
    valueRef.current = props.value;
    pinnedRef.current = null;
  });
  const handleValueChange: Root.Props<Value>['onValueChange'] = (
    value,
    details,
  ) => {
    if (
      value == null &&
      details.reason === 'trigger-hover' &&
      pinnedRef.current != null &&
      pinnedRef.current === valueRef.current
    ) {
      details.cancel();
      return;
    }
    onValueChange?.(value, details);
    if (details.isCanceled) return;
    const previous = valueRef.current;
    if (props.value === undefined) valueRef.current = value;
    pinnedRef.current = null;
    switchedRef.current =
      value != null &&
      previous != null &&
      value !== previous &&
      details.reason === 'trigger-hover'
        ? { to: value, at: performance.now() }
        : { to: null, at: -Infinity };
  };
  const context = React.useMemo<RootContextValue>(
    () => ({
      unmount: () => ownActionsRef.current?.unmount(),
      enableManualUnmount: () => setManual(true),
      swapper,
      justSwitched: () =>
        switchedRef.current.to === valueRef.current &&
        performance.now() - switchedRef.current.at < PATIENT_CLICK,
      keptOpen: () => {
        pinnedRef.current = valueRef.current;
        // Once: the next click toggles it.
        switchedRef.current = { to: null, at: -Infinity };
      },
    }),
    [swapper],
  );

  return (
    <RootContext value={context}>
      {/* Its triggers share one highlight. */}
      <TriggerHighlightScope>
        <NavigationMenuPrimitive.Root<Value>
          {...props}
          onValueChange={handleValueChange}
          // Providing actionsRef opts into manual unmounting in Base UI.
          actionsRef={manual || actionsRef ? ownActionsRef : undefined}
        />
      </TriggerHighlightScope>
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

function List({ style, ...props }: List.Props) {
  return (
    <NavigationMenuPrimitive.List
      {...props}
      // The triggers' highlight goes under their content, above what's
      // behind the list: the list is its own stacking context.
      style={
        typeof style === 'function'
          ? (state) => ({ isolation: 'isolate', ...style(state) })
          : { isolation: 'isolate', ...style }
      }
    />
  );
}

namespace List {
  export type Props = NavigationMenuPrimitive.List.Props;
  export type State = NavigationMenuPrimitive.List.State;
}

type HighlightedProps = {
  disabled?: boolean;
  children?: React.ReactNode;
  ref?: React.Ref<HTMLElement>;
  render?: unknown;
};

/**
 * A trigger, or a link: it takes part in the highlight of its list (the
 * triggers'), or of its Content (the links'). With `render`, Base UI puts the
 * children (and the highlight) in the user's element, unless that element has
 * children of its own, which win: the highlight goes among them. A `render`
 * function can't take one: the item keeps its own hover styles.
 */
function useHighlighted<P extends HighlightedProps>({
  disabled,
  children,
  ref,
  render,
  ...props
}: P) {
  const own = React.isValidElement<{ children?: React.ReactNode }>(render)
    ? render.props.children
    : undefined;
  const { ref: highlightRef, highlight } = useTriggerHighlight(
    disabled || typeof render === 'function',
  );
  const mergedRef = React.useMemo(
    () => mergeRefs(ref, highlightRef),
    [ref, highlightRef],
  );
  return {
    ...props,
    disabled,
    ref: mergedRef,
    render:
      own !== undefined && highlight && React.isValidElement(render)
        ? // eslint-disable-next-line @eslint-react/no-clone-element -- the highlight goes among the element's own children
          React.cloneElement(
            render,
            undefined,
            <>
              {own}
              {highlight}
            </>,
          )
        : render,
    children: own === undefined ? withHighlight(children, highlight) : children,
  };
}

function Trigger({ onClick, ...props }: Trigger.Props) {
  const root = React.use(RootContext);
  return (
    <NavigationMenuPrimitive.Trigger
      {...(useHighlighted(props) as Trigger.Props)}
      onClick={(event) => {
        onClick?.(event);
        // A click on the trigger the pointer has just switched the menu to
        // (from another item) keeps it open, pinned, as Base UI keeps it for
        // a click right after a hover opened it: Base UI forgets its
        // "patient click" on a switch, and the click closed the menu. Later,
        // a second time, or from the keyboard (no pointer), it toggles.
        if (
          root &&
          !event.baseUIHandlerPrevented &&
          event.detail > 0 &&
          event.currentTarget.getAttribute('aria-expanded') === 'true' &&
          root.justSwitched()
        ) {
          event.preventBaseUIHandler();
          root.keptOpen();
        }
      }}
    />
  );
}

namespace Trigger {
  export type Props = NavigationMenuPrimitive.Trigger.Props;
  export type State = NavigationMenuPrimitive.Trigger.State;
}

function Link(props: Link.Props) {
  return (
    <NavigationMenuPrimitive.Link {...(useHighlighted(props) as Link.Props)} />
  );
}

namespace Link {
  export type Props = NavigationMenuPrimitive.Link.Props;
  export type State = NavigationMenuPrimitive.Link.State;
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
            swapper={root.swapper}
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
  swapper,
  transition,
  exitTransition,
}: PresenceAnimationProps & {
  htmlProps: HTMLProps;
  state: Popup.State;
  unmount: () => void;
  swapper: ContentSwapper;
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
  // Moving and resizing from one item's content to the next.
  const morph = useTempoTransition(transition ?? MORPH_TRANSITION);
  // `scale` (like v1's menus): `transform: none` once settled.
  const hidden = { opacity: 0, scale: reduce ? 1 : HIDDEN_SCALE.menu };
  const nodeRef = React.useRef<HTMLElement | null>(null);
  // Only the size is left to CSS (Base UI waits for these transitions before
  // it sets the size back to auto), each resize timed from the speed the
  // previous one had; opacity and transform are Motion's.
  const sizing = useSizeFollower(nodeRef, morph, !reduce);
  const ref = useInlineTransition(htmlProps, {
    property: reduce ? 'none' : 'width, height',
    ...sizing,
  });
  // Moving between items, it moves to the next trigger, and the contents
  // change in place on screen.
  const mergedRef = React.useMemo(() => mergeRefs(ref, nodeRef), [ref]);
  useContentSwapper(morph, reduce, swapper);
  useMoveFollower(swapper, nodeRef, true);

  return (
    // Base UI renders the Popup as a <nav>.
    <motion.nav
      {...(htmlProps as React.ComponentProps<typeof motion.nav>)}
      ref={mergedRef}
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept in the API
  transition,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept in the API
  exitTransition,
  render,
  ...props
}: Content.Props) {
  const root = React.use(RootContext);
  // The same each time it opens: a content coming back finds its copy.
  const id = React.useId();
  if (!root)
    return <NavigationMenuPrimitive.Content {...props} render={render} />;

  return (
    <NavigationMenuPrimitive.Content
      {...props}
      render={(htmlProps, state) => (
        <ContentMotion
          htmlProps={htmlProps}
          state={state}
          swapper={root.swapper}
          id={id}
        />
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

/** Where the next content comes from, by Base UI's activation direction. */
function wayOf(direction: Content.State['activationDirection']): Way | null {
  switch (direction) {
    case 'right':
      return { axis: 'x', sign: 1 };
    case 'left':
      return { axis: 'x', sign: -1 };
    case 'down':
      return { axis: 'y', sign: 1 };
    case 'up':
      return { axis: 'y', sign: -1 };
    default:
      return null;
  }
}

/**
 * Moving between items, the one leaving is copied as it leaves (and hidden:
 * the copy leaves in its place), and the one coming in comes in from Base
 * UI's activation direction. The first opening has none: the Popup's
 * entrance is enough.
 */
function ContentMotion({
  htmlProps,
  state,
  swapper,
  id,
}: {
  htmlProps: HTMLProps;
  state: Content.State;
  swapper: ContentSwapper;
  id: string;
}) {
  // No CSS transition: Base UI doesn't wait for one to remove it.
  const ref = useInlineTransition(htmlProps, { property: 'none' });
  const nodeRef = React.useRef<HTMLElement | null>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, nodeRef), [ref]);
  // Shown as of the last commit. The same element may show again: kept
  // mounted (`keepMounted`), or shown again before Base UI removed it.
  const shownRef = React.useRef(false);

  React.useLayoutEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    if (state.open) {
      if (shownRef.current) return;
      shownRef.current = true;
      node.style.removeProperty('opacity');
      // Switching items gives a direction; the first opening has none: the
      // Popup's entrance is enough.
      swapper.enter(node, id, wayOf(state.activationDirection));
    } else if (shownRef.current) {
      shownRef.current = false;
      // Copied as it showed: its copy leaves in its place, for the next
      // item's content, or holds still while the Popup fades out (Base UI
      // removes the content before it). Its own animations stop (still
      // coming in, it would show again over the copy, and Base UI would wait
      // for them to remove it).
      swapper.leave(node, id);
      for (const animation of node.getAnimations()) animation.cancel();
      node.style.opacity = '0';
    }
  }, [state.open, state.activationDirection, swapper, id]);

  return (
    <div
      {...htmlProps}
      ref={mergedRef}
      style={{
        ...htmlProps.style,
        // Its links' highlight goes under their content, above the Popup's
        // background.
        isolation: 'isolate',
      }}
    >
      <TriggerHighlightScope>{htmlProps.children}</TriggerHighlightScope>
    </div>
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
