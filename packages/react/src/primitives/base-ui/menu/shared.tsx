'use client';

import * as React from 'react';
import type { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { motion, PresenceContext, type Transition } from 'motion/react';

import {
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { HIDDEN_SCALE, MENU_TRANSITION } from '../../../internal/anchored';
import { HighlightScope } from '../../../internal/item-highlight';
import {
  CheckRegistryContext,
  GLIDE_TRANSITION,
  PICK_HOLD,
  DrawnCheck,
  asTransformable,
  useCheckRegistry,
  useRegisterCheck,
} from '../../../internal/item-indicator';

// Shared by Base UI's Menu and Context Menu (which reuses the Menu's parts),
// animated like Animate UI v1's Base UI Menu:
//
// - the Popup (and each submenu's) fades and scales from 0.9 in 250ms, both
//   ways;
// - one highlight glides behind the highlighted item, into submenus too
//   (internal/item-highlight);
// - a checkbox item's check draws itself when it's checked (or the menu
//   opens), and erases itself when it's unchecked, like a checkbox's; a radio
//   item's check glides to the newly checked item, like a select's
//   (internal/item-indicator);
// - with `closeOnClick`, choosing an item whose check moves (a radio's glides
//   from the one shown, a checkbox's draws or erases itself) holds the menu
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

/** Animate UI's addition to the item indicators. */
type IndicatorAnimationProps = {
  /**
   * Transition of the check drawing and erasing itself (checkbox items), or
   * of the indicator gliding to the checked item (radio items). Defaults to
   * 0.3s on Motion's easeOut both ways (a checkbox's), and a spring
   * (stiffness 500, damping 40) for the glide.
   */
  transition?: Transition;
};

type Actions = { unmount: () => void; close: () => void };

type HTMLProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
};

/** How the closest Root or SubmenuRoot unmounts its popup. */
const UnmountContext = React.createContext<(() => void) | null>(null);

/**
 * The root menu closed because an item whose check moves was chosen: its
 * popups (submenus' too) hold still before they leave.
 */
const PickedContext = React.createContext(false);

type OpenChangeDetails = {
  isCanceled: boolean;
  reason?: string;
  event?: Event;
};

/**
 * Whether a press closing the menu chose an item whose check moves: a
 * checkbox item's pops in or out; another radio item than the checked one
 * gets the check shown glide there (the DOM still shows the old state).
 */
function checkMoves(details: OpenChangeDetails, hasCheck: () => boolean) {
  if (details.reason !== 'item-press') return false;
  const target = details.event?.target;
  const item =
    target instanceof Element
      ? target.closest('[role="menuitemcheckbox"], [role="menuitemradio"]')
      : null;
  if (!item) return false;
  if (item.getAttribute('role') === 'menuitemcheckbox') return true;
  return item.getAttribute('aria-checked') !== 'true' && hasCheck();
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
  // The radio items' shown checks register: a check to glide from.
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
  registerCheck: () => () => void;
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
  // Closing because an item was chosen whose check moves: the menu holds
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

/** The indicators of a radio group share it: the indicator glides. */
const RadioGroupLayoutContext = React.createContext<string | null>(null);

/**
 * A checkbox item's check draws itself whenever it appears (checking the
 * item, or opening the menu), and erases itself when it's unchecked (the
 * indicator is kept mounted for that). A radio item's indicator glides from
 * the previously checked item.
 */
function IndicatorMotion({
  kind,
  htmlProps,
  state,
  transition,
}: IndicatorAnimationProps & {
  kind: 'checkbox' | 'radio';
  htmlProps: HTMLProps;
  state: IndicatorState;
}) {
  const layoutId = React.use(RadioGroupLayoutContext);
  const glide = useTempoTransition(transition ?? GLIDE_TRANSITION);
  // A radio item's shown check: choosing another item glides it there.
  useRegisterCheck(kind === 'radio' && state.checked);
  // A box, so it can glide.
  const htmlRef = htmlProps.ref;
  const ref = React.useMemo(
    () => mergeRefs(htmlRef, asTransformable),
    [htmlRef],
  );
  const props = {
    ...(htmlProps as React.ComponentProps<typeof motion.span>),
    ref,
  };

  if (kind === 'radio') {
    return (
      // Out of the menu's exit: the menu doesn't wait for the glide to end
      // before it unmounts (it holds for the glide when an item is chosen).
      <PresenceContext value={null}>
        <motion.span
          {...props}
          layoutId={layoutId ?? undefined}
          // One indicator moving, not two crossfading.
          layoutCrossfade={false}
          transition={glide}
          style={{
            ...props.style,
            ...(state.checked ? null : { visibility: 'hidden' as const }),
          }}
        />
      </PresenceContext>
    );
  }
  return (
    <DrawnCheck
      {...(htmlProps as React.ComponentProps<'span'>)}
      checked={state.checked}
      transition={transition}
    />
  );
}

export {
  IndicatorMotion,
  PopupMotion,
  RadioGroupLayoutContext,
  RootPicks,
  UnmountContext,
  useManualUnmount,
  type IndicatorAnimationProps,
  type PresenceAnimationProps,
};
