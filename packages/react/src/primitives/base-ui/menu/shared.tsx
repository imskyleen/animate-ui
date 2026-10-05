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

// Shared by Base UI's Menu and Context Menu (which reuses the Menu's parts),
// animated like Animate UI v1's Base UI Menu:
//
// - the Popup (and each submenu's) fades and scales from 0.9 in 250ms, both
//   ways;
// - one highlight glides behind the highlighted item, into submenus too
//   (internal/item-highlight);
// - a checkbox item's check pops in from half its size when it appears; a
//   radio item's indicator glides to the newly checked item.

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
   * Transition of the check popping in (checkbox items), or of the indicator
   * moving to the checked item (radio items). Defaults to Motion's defaults,
   * as in v1.
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
 * Wraps a Base UI menu root: every close keeps the popup mounted (Base UI
 * would otherwise unmount it as soon as its CSS animations end, and it can't
 * reliably see Motion's), and the Popup unmounts it after its exit.
 */
function useManualUnmount<Details extends { isCanceled: boolean }>(
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
  const handleOpenChange = (open: boolean, details: Details) => {
    onOpenChange?.(open, details);
    if (open || details.isCanceled) return;
    // Typed on Menu.Root's details only, but every menu root passes it.
    (
      details as { preventUnmountOnClose?: () => void }
    ).preventUnmountOnClose?.();
  };
  return { ownActionsRef, unmount, handleOpenChange };
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
  const exit = useTempoTransition(
    exitTransition ?? transition ?? MENU_TRANSITION,
  );
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

/** Motion's defaults, which v1's check used: written out for the tempo. */
const CHECK_TRANSITION = {
  scale: { type: 'spring', stiffness: 550, damping: 30, restSpeed: 10 },
  opacity: { duration: 0.3, ease: [0.25, 0.1, 0.35, 1] },
} as const satisfies Transition;
/** Motion's default layout transition, which v1's radio indicator used. */
const RADIO_TRANSITION = {
  duration: 0.45,
  ease: [0.4, 0, 0.1, 1],
} as const satisfies Transition;

/**
 * A checkbox item's check pops in from half its size and fades in whenever
 * it appears (checking the item, or opening the menu); unchecking removes it
 * at once. A radio item's indicator glides from the previously checked item.
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
  const reduce = useShouldReduceMotion();
  const layoutId = React.use(RadioGroupLayoutContext);
  const check = useTempoTransition(transition ?? CHECK_TRANSITION);
  const glide = useTempoTransition(transition ?? RADIO_TRANSITION);
  const props = htmlProps as React.ComponentProps<typeof motion.span>;

  if (kind === 'radio') {
    return (
      // Out of the menu's exit: the menu doesn't wait for the glide to end
      // before it unmounts (v1 cut it short the same way).
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
    <motion.span
      {...props}
      initial={{ opacity: 0, scale: reduce ? 1 : 0.5 }}
      animate={
        state.checked
          ? { opacity: 1, scale: 1, transition: check }
          : // Unchecked: gone at once (kept mounted, or while Base UI unmounts it).
            { opacity: 0, transition: { duration: 0 } }
      }
    />
  );
}

export {
  IndicatorMotion,
  PopupMotion,
  RadioGroupLayoutContext,
  UnmountContext,
  useManualUnmount,
  type IndicatorAnimationProps,
  type PresenceAnimationProps,
};
