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
  HandoffNestedContext,
  takeOver,
  useHandoffNested,
  useMenuHandoff,
  type HandoffGroup,
} from '../../../internal/menu-handoff';
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
   * Transition of the entrance (and, in a menubar, of the popover moving to
   * the next menu), and of the exit unless `exitTransition` is set. Defaults
   * to `{ duration: 0.25, ease: [0.215, 0.61, 0.355, 1] }`.
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
 * The menubar of the closest Root, if it's one of its menus: its popup takes
 * over the popover of the menu open before it (internal/menu-handoff).
 */
const PopupHandoffContext = React.createContext<HandoffGroup | null>(null);

/**
 * The root menu closed because the user moved on to another menu of its
 * menubar: the next one takes its popover over, even once it has closed.
 */
const MovedOnContext = React.createContext(false);

/** Base UI's reasons for closing a menubar's menu as another one opens. */
const MOVE_REASONS = new Set([
  'trigger-hover',
  'trigger-focus',
  'focus-out',
  'list-navigation',
  'sibling-open',
]);

/**
 * Whether the menu closes because the user moved on to another menu of its
 * menubar: hovering, focusing or arrowing to it, or pressing it (a tap, or a
 * click without hover-open: Base UI closes this one as pressed outside, then
 * opens that one a frame later).
 */
function movesOn(details: OpenChangeDetails) {
  const reason = details.reason ?? '';
  if (MOVE_REASONS.has(reason)) return true;
  if (reason !== 'outside-press') return false;
  const target = details.event?.target;
  const menubar = (details as { trigger?: Element | null }).trigger?.closest(
    '[role="menubar"]',
  );
  return Boolean(menubar && target instanceof Node && menubar.contains(target));
}

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
  const [movedOn, setMovedOn] = React.useState(false);
  const handleOpenChange = (open: boolean, details: Details) => {
    onOpenChange?.(open, details);
    if (details.isCanceled) return;
    setPicked(!open && checkMoves(details, hasCheck));
    setMovedOn(!open && movesOn(details));
    if (open) return;
    // Typed on Menu.Root's details only, but every menu root passes it.
    (
      details as { preventUnmountOnClose?: () => void }
    ).preventUnmountOnClose?.();
  };
  return {
    ownActionsRef,
    unmount,
    handleOpenChange,
    picked,
    movedOn,
    registerCheck,
  };
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
  // The user moved on to another menu of its menubar.
  const movedOn = React.use(MovedOnContext);

  // A layout effect runs before Base UI moves focus into the popup.
  React.useLayoutEffect(() => {
    if (state.open) {
      previousFocusRef.current =
        nodeRef.current?.ownerDocument.activeElement ?? null;
    }
  }, [state.open]);

  // Base UI gives focus back when the popup unmounts, after the exit. Keyboard
  // users must not keep acting on a menu that is leaving: give it back now.
  // Not when moving on to another menu of a menubar: that one takes focus (its
  // trigger, focused, would open this one again).
  React.useEffect(() => {
    const node = nodeRef.current;
    if (state.open || !node || state.nested || movedOn) return;
    const doc = node.ownerDocument;
    if (!node.contains(doc.activeElement)) return;
    const target =
      doc.getElementById(node.getAttribute('aria-labelledby') ?? '') ??
      previousFocusRef.current;
    if (target instanceof HTMLElement) target.focus({ preventScroll: true });
  }, [state.open, state.nested, movedOn]);

  const enter = useTempoTransition(transition ?? MENU_TRANSITION);
  const leave = useTempoTransition(
    exitTransition ?? transition ?? MENU_TRANSITION,
  );
  const picked = React.use(PickedContext);
  const { delay: hold = 0 } = useTempoTransition({ delay: PICK_HOLD });
  // A menubar's next menu takes its popover over: it starts from where this
  // one is, which leaves at once, unseen (unmounted as soon as it's closed:
  // Base UI doesn't open a menu again on hover while it's still mounted).
  const handoffGroup = React.use(PopupHandoffContext);
  const handoff = useMenuHandoff(state.nested ? null : handoffGroup, {
    nodeRef,
    open: state.open,
    movedOn,
    transition: enter,
    reduce,
    onDrop: () => {
      if (!openRef.current) unmount();
    },
  });
  React.useEffect(() => {
    if (handoff.dropped && !state.open) unmount();
  }, [handoff.dropped, state.open, unmount]);
  // A submenu goes with its menu when the next one takes its popover over.
  useHandoffNested(nodeRef, Boolean(state.nested));
  // Closing because an item was chosen whose check changes: the menu holds
  // still while it does (nothing moves under reduced motion).
  const exit: Transition = handoff.dropped
    ? { duration: 0 }
    : picked && !reduce
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
      initial={
        handoff.from
          ? { opacity: handoff.from.opacity, scale: 1 }
          : entering
            ? hidden
            : false
      }
      // Transitions live in the targets: each direction keeps its own.
      animate={
        state.open
          ? handoff.from
            ? takeOver(handoff.from, enter)
            : { opacity: 1, scale: 1, transition: enter }
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
      {/* Submenus share their root menu's highlight, like v1, and go with it
          in a menubar's handoff. */}
      {state.nested ? (
        children
      ) : (
        <HandoffNestedContext value={handoffGroup ? handoff.entry : null}>
          <HighlightScope open={state.open}>{children}</HighlightScope>
        </HandoffNestedContext>
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
  MovedOnContext,
  PopupHandoffContext,
  PopupMotion,
  RadioGroupCheckContext,
  RootPicks,
  UnmountContext,
  useManualUnmount,
  type IndicatorAnimationProps,
  type PresenceAnimationProps,
};
