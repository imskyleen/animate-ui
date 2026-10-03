'use client';

import * as React from 'react';
import type { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { motion, type Transition } from 'motion/react';

import { useMotionTokens, useShouldReduceMotion } from '../../../utils/motion';

// Shared by Base UI's Menu and Context Menu (which reuses the Menu's parts).

/** Animate UI's additions to the parts that appear and disappear. */
type PresenceAnimationProps = {
  /** Transition of the entrance. */
  transition?: Transition;
  /** Transition of the exit. */
  exitTransition?: Transition;
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
  const unmount = React.useCallback(
    () => ownActionsRef.current?.unmount(),
    [],
  );
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
  const tokens = useMotionTokens();
  const reduce = useShouldReduceMotion();
  // Base UI marks the first frame of an opening `starting`. A popup already
  // open on the first render (defaultOpen) appears without an entrance.
  const [entering] = React.useState(state.transitionStatus === 'starting');
  // Moving from one menu of a menubar to another: no animation either way.
  const instant = state.instant === 'group';
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
      previousFocusRef.current = nodeRef.current?.ownerDocument.activeElement ?? null;
    }
  }, [state.open]);

  // Base UI gives focus back when the popup unmounts, after the exit. Keyboard
  // users must not keep acting on a menu that is leaving: give it back now.
  React.useEffect(() => {
    const node = nodeRef.current;
    if (state.open || !node || instant || state.nested) return;
    const doc = node.ownerDocument;
    if (!node.contains(doc.activeElement)) return;
    const target =
      doc.getElementById(node.getAttribute('aria-labelledby') ?? '') ??
      previousFocusRef.current;
    if (target instanceof HTMLElement) target.focus({ preventScroll: true });
  }, [state.open, instant, state.nested]);

  const enter = instant
    ? tokens.transition.instant
    : (transition ??
      // Submenus open often: a shorter entrance, from their side.
      (state.nested ? tokens.transition.exit : tokens.transition.dropdown));
  const exit = instant
    ? tokens.transition.instant
    : (exitTransition ?? tokens.transition.exit);
  const hidden = {
    opacity: 0,
    transform: reduce ? 'scale(1)' : `scale(${tokens.scale.enter})`,
  };

  return (
    <motion.div
      {...(htmlProps as React.ComponentProps<typeof motion.div>)}
      ref={ref}
      initial={entering && !instant ? hidden : false}
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
        // A leaving menu doesn't react to the pointer.
        ...(state.open ? null : { pointerEvents: 'none' as const }),
        ...htmlProps.style,
      }}
    />
  );
}

type IndicatorState = { checked: boolean; transitionStatus?: string };

/** The check and the radio dot fade in and out, no scale. */
function IndicatorMotion({
  htmlProps,
  state,
  transition,
  exitTransition,
}: PresenceAnimationProps & { htmlProps: HTMLProps; state: IndicatorState }) {
  const tokens = useMotionTokens();
  // Checked when the menu opens: shown at once.
  const [entering] = React.useState(state.transitionStatus === 'starting');
  return (
    <motion.span
      {...(htmlProps as React.ComponentProps<typeof motion.span>)}
      initial={entering ? { opacity: 0 } : false}
      animate={
        state.checked
          ? { opacity: 1, transition: transition ?? tokens.transition.change }
          : {
              opacity: 0,
              transition: exitTransition ?? tokens.transition.exit,
            }
      }
    />
  );
}

export {
  IndicatorMotion,
  PopupMotion,
  UnmountContext,
  useManualUnmount,
  type PresenceAnimationProps,
};
