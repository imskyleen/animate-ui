'use client';
/* eslint-disable @typescript-eslint/no-namespace */

import * as React from 'react';
import { NavigationMenu as NavigationMenuPrimitive } from '@base-ui/react/navigation-menu';
import { type Transition } from 'motion/react';

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

import Item = NavigationMenuPrimitive.Item;
import Portal = NavigationMenuPrimitive.Portal;
import Positioner = NavigationMenuPrimitive.Positioner;
import Viewport = NavigationMenuPrimitive.Viewport;
import Backdrop = NavigationMenuPrimitive.Backdrop;
import Arrow = NavigationMenuPrimitive.Arrow;
import Icon = NavigationMenuPrimitive.Icon;
import { MotionSlot, renderedElement } from '../../../internal/modal-motion';

type PresenceAnimationProps = {
  transition?: Transition;
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

function useInlineTransition(
  htmlProps: HTMLProps,
  transition: { property: string; duration?: string; easing?: string },
) {
  const nodeRef = React.useRef<HTMLElement | null>(null);
  const htmlRef = htmlProps.ref;
  const ref = React.useCallback(
    (node: HTMLElement | null) => mergeRefs(htmlRef, nodeRef)(node),
    [htmlRef],
  );
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
  enableManualUnmount: () => void;
  swapper: ContentSwapper;
  justSwitched: () => boolean;
  keptOpen: () => void;
  closing: () => boolean;
};

const RootContext = React.createContext<RootContextValue | null>(null);

const PATIENT_CLICK = 500;
const HOVER_SWAP_GRACE = 60;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Root<Value = any>({
  actionsRef,
  onValueChange,
  ...props
}: Root.Props<Value>) {
  const ownActionsRef = React.useRef<Root.Actions | null>(null);
  React.useImperativeHandle(actionsRef, () => ({
    unmount: () => ownActionsRef.current?.unmount(),
  }));
  const [manual, setManual] = React.useState(false);
  const [swapper] = React.useState(() => new ContentSwapper());
  useContentSwapper(MORPH_TRANSITION, useShouldReduceMotion(), swapper, true);
  const valueRef = React.useRef<unknown>(
    props.value ?? props.defaultValue ?? null,
  );
  const switchedRef = React.useRef<{ to: unknown; at: number }>({
    to: null,
    at: -Infinity,
  });
  const pinnedRef = React.useRef<unknown>(null);
  const hoverClosedAtRef = React.useRef(-Infinity);
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
    hoverClosedAtRef.current =
      value == null && details.reason === 'trigger-hover'
        ? performance.now()
        : -Infinity;
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
        switchedRef.current = { to: null, at: -Infinity };
      },
      closing: () =>
        valueRef.current == null &&
        performance.now() - hoverClosedAtRef.current >= HOVER_SWAP_GRACE,
    }),
    [swapper],
  );

  return (
    <RootContext value={context}>
      <TriggerHighlightScope>
        <NavigationMenuPrimitive.Root<Value>
          {...props}
          onValueChange={handleValueChange}
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
        ? // eslint-disable-next-line @eslint-react/no-clone-element
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
      render={(htmlProps, state) => (
        <ReducedMotionConfig>
          <PopupMotion
            htmlProps={htmlProps}
            state={state}
            unmount={root.unmount}
            swapper={root.swapper}
            closing={root.closing}
            transition={transition}
            exitTransition={exitTransition}
            render={render}
          />
        </ReducedMotionConfig>
      )}
    />
  );
}

namespace Popup {
  export type Props = NavigationMenuPrimitive.Popup.Props &
    PresenceAnimationProps;
  export type State = NavigationMenuPrimitive.Popup.State;
}

function PopupMotion({
  htmlProps,
  state,
  unmount,
  closing,
  swapper,
  transition,
  exitTransition,
  render,
}: PresenceAnimationProps & {
  htmlProps: HTMLProps;
  state: Popup.State;
  unmount: () => void;
  closing: () => boolean;
  swapper: ContentSwapper;
  render?: Popup.Props['render'];
}) {
  const reduce = useShouldReduceMotion();
  const [entering] = React.useState(state.open);
  const openRef = React.useRef(state.open);
  const held = !state.open && !closing();
  const shown = state.open || held;
  const [, recheck] = React.useReducer((n: number) => n + 1, 0);
  React.useLayoutEffect(() => {
    openRef.current = shown;
    if (!held) return;
    const id = requestAnimationFrame(recheck);
    return () => cancelAnimationFrame(id);
  });

  const enter = useTempoTransition(transition ?? MENU_TRANSITION);
  const exit = useTempoTransition(
    exitTransition ?? transition ?? MENU_TRANSITION,
  );
  const morph = useTempoTransition(transition ?? MORPH_TRANSITION);
  const hidden = { opacity: 0, scale: reduce ? 1 : HIDDEN_SCALE.menu };
  const nodeRef = React.useRef<HTMLElement | null>(null);
  const sizing = useSizeFollower(nodeRef, morph, !reduce);
  const ref = useInlineTransition(htmlProps, {
    property: reduce ? 'none' : 'width, height',
    ...sizing,
  });
  const mergedRef = React.useMemo(() => mergeRefs(ref, nodeRef), [ref]);
  useContentSwapper(morph, reduce, swapper);
  useMoveFollower(swapper, nodeRef, true);

  return (
    <MotionSlot
      element={renderedElement(render, htmlProps, state)}
      as="nav"
      {...htmlProps}
      ref={mergedRef}
      variants={{
        hidden: { ...hidden, transition: exit },
        shown: { opacity: 1, scale: 1, transition: enter },
      }}
      initial={entering ? 'hidden' : false}
      animate={shown ? 'shown' : 'hidden'}
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transition,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  exitTransition,
  render,
  ...props
}: Content.Props) {
  const root = React.use(RootContext);
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
          render={render}
        />
      )}
    />
  );
}

namespace Content {
  export type Props = NavigationMenuPrimitive.Content.Props &
    PresenceAnimationProps;
  export type State = NavigationMenuPrimitive.Content.State;
}

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

function ContentMotion({
  htmlProps,
  state,
  swapper,
  id,
  render,
}: {
  htmlProps: HTMLProps;
  state: Content.State;
  swapper: ContentSwapper;
  id: string;
  render?: Content.Props['render'];
}) {
  const ref = useInlineTransition(htmlProps, { property: 'none' });
  const nodeRef = React.useRef<HTMLElement | null>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, nodeRef), [ref]);
  const shownRef = React.useRef(false);

  React.useLayoutEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    if (state.open) {
      if (shownRef.current) return;
      shownRef.current = true;
      node.style.removeProperty('opacity');
      swapper.enter(node, id, wayOf(state.activationDirection));
    } else if (shownRef.current) {
      shownRef.current = false;
      swapper.leave(node, id);
      for (const animation of node.getAnimations()) animation.cancel();
      node.style.opacity = '0';
    }
  }, [state.open, state.activationDirection, swapper, id]);

  return (
    <MotionSlot
      element={renderedElement(render, htmlProps, state)}
      {...htmlProps}
      ref={mergedRef}
      style={{
        ...htmlProps.style,
        isolation: 'isolate',
      }}
    >
      <TriggerHighlightScope>{htmlProps.children}</TriggerHighlightScope>
    </MotionSlot>
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
