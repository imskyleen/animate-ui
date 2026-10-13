'use client';

import * as React from 'react';
import type { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { motion, type Transition } from 'motion/react';

import {
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import {
  HIDDEN_SCALE,
  MENU_TRANSITION,
  MORPH_TRANSITION,
} from '../../../internal/anchored';
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
  usePickHold,
  useCheckRegistry,
  type CheckGroup,
  type ItemCheckAnimationProps,
  type Picked,
  type RegisterCheck,
} from '../../../internal/item-indicator';

type PresenceAnimationProps = {
  transition?: Transition;
  exitTransition?: Transition;
};

type IndicatorAnimationProps = ItemCheckAnimationProps;

type Actions = { unmount: () => void; close: () => void };

type HTMLProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
};

const UnmountContext = React.createContext<(() => void) | null>(null);

const PopupHandoffContext = React.createContext<HandoffGroup | null>(null);

const MovedOnContext = React.createContext(false);

const MOVE_REASONS = new Set([
  'trigger-hover',
  'trigger-focus',
  'focus-out',
  'list-navigation',
  'sibling-open',
]);

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

const PickedContext = React.createContext<Picked>(false);

type OpenChangeDetails = {
  isCanceled: boolean;
  reason?: string;
  event?: Event;
};

function checkMoves(
  details: OpenChangeDetails,
  checkOf: (item: Element) => Picked,
): Picked {
  if (details.reason !== 'item-press') return false;
  const target = details.event?.target;
  const item =
    target instanceof Element
      ? target.closest('[role="menuitemcheckbox"], [role="menuitemradio"]')
      : null;
  if (!item) return false;
  const moves =
    item.getAttribute('role') === 'menuitemcheckbox' ||
    item.getAttribute('aria-checked') !== 'true';
  return moves && checkOf(item);
}

function useManualUnmount<Details extends OpenChangeDetails>(
  actionsRef: React.RefObject<Actions | null> | undefined,
  onOpenChange: ((open: boolean, details: Details) => void) | undefined,
) {
  const ownActionsRef = React.useRef<Actions | null>(null);
  React.useImperativeHandle(actionsRef, () => ({
    unmount: () => ownActionsRef.current?.unmount(),
    close: () => ownActionsRef.current?.close(),
  }));
  const unmount = React.useCallback(() => ownActionsRef.current?.unmount(), []);
  const { registerCheck, checkOf } = useCheckRegistry();
  const [picked, setPicked] = React.useState<Picked>(false);
  const [movedOn, setMovedOn] = React.useState(false);
  const handleOpenChange = (open: boolean, details: Details) => {
    onOpenChange?.(open, details);
    if (details.isCanceled) return;
    setPicked(!open && checkMoves(details, checkOf));
    setMovedOn(!open && movesOn(details));
    if (open) return;
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

function RootPicks({
  picked,
  registerCheck,
  children,
}: {
  picked: Picked;
  registerCheck: RegisterCheck;
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
  const [entering] = React.useState(state.open);
  const openRef = React.useRef(state.open);
  React.useLayoutEffect(() => {
    openRef.current = state.open;
  });
  const nodeRef = React.useRef<HTMLElement | null>(null);
  const htmlRef = htmlProps.ref;
  const ref = React.useCallback(
    (node: HTMLElement | null) => mergeRefs(htmlRef, nodeRef)(node),
    [htmlRef],
  );
  const previousFocusRef = React.useRef<Element | null>(null);
  const movedOn = React.use(MovedOnContext);

  React.useLayoutEffect(() => {
    if (state.open) {
      previousFocusRef.current =
        nodeRef.current?.ownerDocument.activeElement ?? null;
    }
  }, [state.open]);

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
  const morph = useTempoTransition(transition ?? MORPH_TRANSITION);
  const picked = React.use(PickedContext);
  const hold = usePickHold();
  const handoffGroup = React.use(PopupHandoffContext);
  const handoff = useMenuHandoff(state.nested ? null : handoffGroup, {
    nodeRef,
    open: state.open,
    movedOn,
    transition: morph,
    reduce,
    onDrop: () => {
      if (!openRef.current) unmount();
    },
  });
  React.useEffect(() => {
    if (handoff.dropped && !state.open) unmount();
  }, [handoff.dropped, state.open, unmount]);
  useHandoffNested(nodeRef, Boolean(state.nested));
  const exit: Transition = handoff.dropped
    ? { duration: 0 }
    : picked && !reduce
      ? {
          ...leave,
          delay: ((leave as { delay?: number }).delay ?? 0) + hold(picked),
        }
      : leave;
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
        isolation: 'isolate',
        ...(state.open ? null : { pointerEvents: 'none' as const }),
        ...htmlProps.style,
      }}
    >
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

const RadioGroupCheckContext = React.createContext<CheckGroup | null>(null);

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
