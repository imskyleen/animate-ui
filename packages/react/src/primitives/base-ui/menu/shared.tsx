'use client';

import * as React from 'react';
import type { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { motion, type Transition } from 'motion/react';

import {
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { HIDDEN_SCALE, MENU_TRANSITION } from '../../../internal/anchored';
import { HighlightScope } from '../../../internal/item-highlight';
import {
  CheckRegistryContext,
  ItemCheck,
  PICK_HOLD,
  useCheckRegistry,
  type CheckGroup,
  type ItemCheckAnimationProps,
} from '../../../internal/item-indicator';

// Shared by Base UI's Menu and Context Menu (which reuses the Menu's parts),
// animated like Animate UI v1's Base UI Menu:
//
// - the Popup (and each submenu's) fades and scales from 0.9 in 250ms, both
//   ways;
// - one highlight glides behind the highlighted item, into submenus too
//   (internal/item-highlight);
// - an item's check draws itself when it's checked (or the menu opens), and
//   erases itself when it's unchecked, like a checkbox's; with `pop`, it pops
//   in and out, and a radio item's check glides to the newly checked item,
//   like a select's (internal/item-indicator);
// - with `closeOnClick`, choosing an item whose check changes holds the menu
//   still for 150ms before it closes, so the change is seen.

/** Animate UI's additions to the parts that appear and disappear. */
type PresenceAnimationProps = {
  /**
   * Transition of the entrance, and of the exit unless `exitTransition` is
   * set. Defaults to `{ duration: 0.25, ease: [0.215, 0.61, 0.355, 1] }`.
   */
  transition?: Transition;
  /** Transition of the exit. Defaults to `transition`. */
  exitTransition?: Transition;
};

/** Animate UI's additions to the item indicators. */
type IndicatorAnimationProps = ItemCheckAnimationProps;

type Actions = { unmount: () => void; close: () => void };

type HTMLProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
};

/** How the closest Root or SubmenuRoot unmounts its popup. */
const UnmountContext = React.createContext<(() => void) | null>(null);

/**
 * The root menu closed because an item whose check changes was chosen: its
 * popups (submenus' too) hold still before they leave.
 */
const PickedContext = React.createContext(false);

type OpenChangeDetails = {
  isCanceled: boolean;
  reason?: string;
  event?: Event;
};

/**
 * Whether a press closing the menu chose an item whose check changes: a
 * checkbox item's, or another radio item's than the checked one (the DOM
 * still shows the old state).
 */
function checkMoves(
  details: OpenChangeDetails,
  hasCheck: (item: Element) => boolean,
) {
  if (details.reason !== 'item-press') return false;
  const target = details.event?.target;
  const item =
    target instanceof Element
      ? target.closest('[role="menuitemcheckbox"], [role="menuitemradio"]')
      : null;
  if (!item || !hasCheck(item)) return false;
  return (
    item.getAttribute('role') === 'menuitemcheckbox' ||
    item.getAttribute('aria-checked') !== 'true'
  );
}

/**
 * Wraps a Base UI menu root: every close keeps the popup mounted (Base UI
 * would otherwise unmount it as soon as its CSS animations end, and it can't
 * reliably see Motion's), and the Popup unmounts it after its exit.
 */
function useManualUnmount<Details extends OpenChangeDetails>(
  actionsRef: React.RefObject<Actions | null> | undefined,
  onOpenChange: ((open: boolean, details: Details) => void) | undefined,
) {
  const ownActionsRef = React.useRef<Actions | null>(null);
  // The user's actionsRef still works: it forwards to Base UI's actions.
  React.useImperativeHandle(actionsRef, () => ({
    unmount: () => ownActionsRef.current?.unmount(),
    close: () => ownActionsRef.current?.close(),
  }));
  const unmount = React.useCallback(() => ownActionsRef.current?.unmount(), []);
  // The items' checks register: which items have one.
  const { registerCheck, hasCheck } = useCheckRegistry();
  const [picked, setPicked] = React.useState(false);
  const handleOpenChange = (open: boolean, details: Details) => {
    onOpenChange?.(open, details);
    if (details.isCanceled) return;
    setPicked(!open && checkMoves(details, hasCheck));
    if (open) return;
    // Typed on Menu.Root's details only, but every menu root passes it.
    (
      details as { preventUnmountOnClose?: () => void }
    ).preventUnmountOnClose?.();
  };
  return { ownActionsRef, unmount, handleOpenChange, picked, registerCheck };
}

/** A root menu's picks, for its popups and the checks inside. */
function RootPicks({
  picked,
  registerCheck,
  children,
}: {
  picked: boolean;
  registerCheck: (element: Element) => () => void;
  children?: React.ReactNode;
}) {
  return (
    <PickedContext value={picked}>
      <CheckRegistryContext value={registerCheck}>
        {children}
      </CheckRegistryContext>
    </PickedContext>
  );
}

type PopupState = MenuPrimitive.Popup.State;

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    }
  };
}

/** Rendered inside ReducedMotionConfig, so useShouldReduceMotion() sees it. */
function PopupMotion({
  htmlProps,
  state,
  unmount,
  transition,
  exitTransition,
}: PresenceAnimationProps & {
  htmlProps: HTMLProps;
  state: PopupState;
  unmount: () => void;
}) {
  const reduce = useShouldReduceMotion();
  // A popup that mounts open plays its entrance: when it opens, and when it's
  // open from the start (defaultOpen), on page load, like v1. One that mounts
  // closed (keepMounted) starts hidden, in place.
  const [entering] = React.useState(state.open);
  const openRef = React.useRef(state.open);
  React.useLayoutEffect(() => {
    openRef.current = state.open;
  });
  const nodeRef = React.useRef<HTMLElement | null>(null);
  // Stable while Base UI's ref is: a new callback would detach and reattach
  // the element on every render.
  const htmlRef = htmlProps.ref;
  const ref = React.useCallback(
    (node: HTMLElement | null) => mergeRefs(htmlRef, nodeRef)(node),
    [htmlRef],
  );
  const previousFocusRef = React.useRef<Element | null>(null);

  // A layout effect runs before Base UI moves focus into the popup.
  React.useLayoutEffect(() => {
    if (state.open) {
      previousFocusRef.current =
        nodeRef.current?.ownerDocument.activeElement ?? null;
    }
  }, [state.open]);

  // Base UI gives focus back when the popup unmounts, after the exit. Keyboard
  // users must not keep acting on a menu that is leaving: give it back now.
  React.useEffect(() => {
    const node = nodeRef.current;
    if (state.open || !node || state.nested) return;
    const doc = node.ownerDocument;
    if (!node.contains(doc.activeElement)) return;
    const target =
      doc.getElementById(node.getAttribute('aria-labelledby') ?? '') ??
      previousFocusRef.current;
    if (target instanceof HTMLElement) target.focus({ preventScroll: true });
  }, [state.open, state.nested]);

  const enter = useTempoTransition(transition ?? MENU_TRANSITION);
  const leave = useTempoTransition(
    exitTransition ?? transition ?? MENU_TRANSITION,
  );
  const picked = React.use(PickedContext);
  const { delay: hold = 0 } = useTempoTransition({ delay: PICK_HOLD });
  // Closing because an item was chosen whose check changes: the menu holds
  // still while it does (nothing moves under reduced motion).
  const exit: Transition =
    picked && !reduce
      ? {
          ...leave,
          delay: ((leave as { delay?: number }).delay ?? 0) + hold,
        }
      : leave;
  // `scale`, like v1: Motion writes `transform: none` once it's back to 1.
  const hidden = { opacity: 0, scale: reduce ? 1 : HIDDEN_SCALE.menu };
  const { children, ...props } = htmlProps;

  return (
    <motion.div
      {...(props as React.ComponentProps<typeof motion.div>)}
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
        // The highlight goes under the items' content, above the menu's
        // background: the menu is its own stacking context.
        isolation: 'isolate',
        // A leaving menu doesn't react to the pointer.
        ...(state.open ? null : { pointerEvents: 'none' as const }),
        ...htmlProps.style,
      }}
    >
      {/* Submenus share their root menu's highlight, like v1. */}
      {state.nested ? (
        children
      ) : (
        <HighlightScope open={state.open}>{children}</HighlightScope>
      )}
    </motion.div>
  );
}

type IndicatorState = { checked: boolean; transitionStatus?: string };

/** The checks of a radio group share it: a check glides between them (`pop`). */
const RadioGroupCheckContext = React.createContext<CheckGroup | null>(null);

/**
 * An item's check shows itself whenever it appears (checking the item, or
 * opening the menu), and hides itself when it's unchecked (the indicator is
 * kept mounted for that). With `pop`, a radio item's check glides from the
 * previously checked item.
 */
function IndicatorMotion({
  kind,
  htmlProps,
  state,
  animation,
  transition,
}: IndicatorAnimationProps & {
  kind: 'checkbox' | 'radio';
  htmlProps: HTMLProps;
  state: IndicatorState;
}) {
  const group = React.use(RadioGroupCheckContext);
  return (
    <ItemCheck
      {...(htmlProps as React.ComponentProps<'span'>)}
      multiple={kind === 'checkbox'}
      group={kind === 'radio' ? group : null}
      checked={state.checked}
      animation={animation}
      transition={transition}
    />
  );
}

export {
  IndicatorMotion,
  PopupMotion,
  RadioGroupCheckContext,
  RootPicks,
  UnmountContext,
  useManualUnmount,
  type IndicatorAnimationProps,
  type PresenceAnimationProps,
};
