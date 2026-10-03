'use client';

import * as React from 'react';
import {
  Modal as ModalPrimitive,
  ModalOverlay as ModalOverlayPrimitive,
  OverlayTriggerStateContext,
  type ModalOverlayProps as ModalOverlayPrimitiveProps,
} from 'react-aria-components';
import { AnimatePresence, useIsPresent } from 'motion/react';

import { useControlledState } from '../../../utils/use-controlled-state';
import {
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
} from '../../../utils/motion';
import {
  getContentTargets,
  getModalSide,
  getOverlayTargets,
  ariaMotionRender,
  type ModalAnimationProps,
} from '../../../internal/modal-motion';

// Same API as React Aria's Modal and ModalOverlay. The overlay fades, the
// modal scales from 0.95 around its center, or slides from its edge when it
// has `data-side` (shadcn/ui's Sheet).
//
// React Aria keeps an exiting modal mounted while the animations it finds on
// it run, but it looks for them before Motion's exit has started. So the
// ModalOverlay resolves the open state like React Aria does (its own props,
// else the DialogTrigger's state), gates itself with AnimatePresence and
// passes `isExiting` while its exit plays: React Aria then keeps it mounted,
// marks it `data-exiting` and stops trapping focus. Both parts render a
// motion.div through React Aria's `render` prop (or the user's own `render`,
// made animatable), so their attributes, `className` and `style` (render
// props included) stay on that element.

/** Animate UI's additions to `ModalOverlay`. */
type OverlayAnimationProps = {
  /** Fade in. Defaults to `transition.modal` (600ms). */
  transition?: ModalAnimationProps['transition'];
  /** Fade out. Defaults to `transition.modalExit` (400ms). */
  exitTransition?: ModalAnimationProps['transition'];
};

/** Animate UI's additions to `Modal`. */
type ModalAnimationPropsDoc = {
  /**
   * Transition of the opening. Defaults to `transition.modal` (600ms), or
   * `transition.drawer` when the modal has `data-side`.
   */
  transition?: ModalAnimationProps['transition'];
  /**
   * Transition of the closing. Defaults to `transition.modalExit` (400ms), or
   * `transition.drawerExit` when the modal has `data-side`.
   */
  exitTransition?: ModalAnimationProps['transition'];
};

type ModalOverlayProps = ModalOverlayPrimitiveProps &
  OverlayAnimationProps &
  React.RefAttributes<HTMLDivElement>;
type ModalProps = ModalOverlayPrimitiveProps &
  ModalAnimationPropsDoc &
  React.RefAttributes<HTMLDivElement>;

type LiveState = {
  isOpen: boolean;
  local: boolean;
  setOpen: (open: boolean) => void;
};

// The live open state, read by the exiting overlay (AnimatePresence keeps the
// props of its last render, when it was still open).
const LiveStateContext = React.createContext<LiveState | null>(null);
// Set inside our ModalOverlay, so a Modal knows it isn't standalone.
const InOverlayContext = React.createContext(false);

function ModalOverlay({
  isOpen: isOpenProp,
  defaultOpen,
  onOpenChange,
  ...props
}: ModalOverlayProps) {
  const contextState = React.use(OverlayTriggerStateContext);
  // React Aria's rule: its own props when given (or without a trigger), else
  // the DialogTrigger's state.
  const local = isOpenProp != null || defaultOpen != null || !contextState;
  const [localOpen, setLocalOpen] = useControlledState<boolean>({
    value: isOpenProp,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const isOpen = local ? localOpen : Boolean(contextState?.isOpen);

  return (
    <LiveStateContext value={{ isOpen, local, setOpen: setLocalOpen }}>
      <ReducedMotionConfig>
        <AnimatePresence>
          {isOpen && <OverlayPresence key="modal-overlay" {...props} />}
        </AnimatePresence>
      </ReducedMotionConfig>
    </LiveStateContext>
  );
}

function OverlayPresence({
  transition,
  exitTransition,
  isExiting,
  render,
  animated = true,
  ...props
}: Omit<ModalOverlayProps, 'isOpen' | 'defaultOpen' | 'onOpenChange'> & {
  /** False for the invisible overlay of a standalone Modal. */
  animated?: boolean;
}) {
  const live = React.use(LiveStateContext)!;
  const isPresent = useIsPresent();
  // Once closed, clicks go through to the page while the exit plays.
  const exitingStyle = isPresent
    ? {}
    : { style: { pointerEvents: 'none' as const } };
  const tokens = useMotionTokens();
  const targets = getOverlayTargets({ tokens, transition, exitTransition });

  return (
    <InOverlayContext value>
      <ModalOverlayPrimitive
        {...props}
        {...(live.local
          ? { isOpen: live.isOpen, onOpenChange: live.setOpen }
          : {})}
        isExiting={!isPresent || isExiting}
        render={ariaMotionRender(
          render,
          animated
            ? {
                initial: targets.initial,
                animate: targets.animate,
                exit: targets.exit,
                ...exitingStyle,
              }
            : // Still a motion element, so the modal's exit is awaited.
              {
                exit: { transition: targets.exit.transition },
                ...exitingStyle,
              },
        )}
      />
    </InOverlayContext>
  );
}

// The props React Aria reads on the overlay a standalone Modal creates.
const OVERLAY_PROPS = [
  'isDismissable',
  'isKeyboardDismissDisabled',
  'isOpen',
  'defaultOpen',
  'onOpenChange',
  'isEntering',
  'isExiting',
  'UNSTABLE_portalContainer',
  'shouldCloseOnInteractOutside',
] as const;

function Modal(props: ModalProps) {
  const inOverlay = React.use(InOverlayContext);
  if (inOverlay) return <ModalContent {...props} />;

  // Standalone, like React Aria: it creates its own (invisible) overlay.
  const overlayProps: Record<string, unknown> = {};
  const contentProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if ((OVERLAY_PROPS as readonly string[]).includes(key))
      overlayProps[key] = value;
    else contentProps[key] = value;
  }
  return (
    <ModalOverlay {...overlayProps}>
      <ModalContent {...(contentProps as ModalProps)} />
    </ModalOverlay>
  );
}

function ModalContent({
  transition,
  exitTransition,
  render,
  ...props
}: ModalProps) {
  const tokens = useMotionTokens();
  const reduce = useShouldReduceMotion();
  const isPresent = useIsPresent();
  // shadcn/ui's Sheet passes `data-side`: it slides from that edge.
  const side = getModalSide((props as Record<string, unknown>)['data-side']);
  const targets = getContentTargets({
    side,
    tokens,
    reduce,
    transition,
    exitTransition,
  });

  return (
    <ModalPrimitive
      {...props}
      render={ariaMotionRender(render, {
        initial: targets.initial,
        animate: targets.animate,
        exit: targets.exit,
        ...(isPresent ? {} : { style: { pointerEvents: 'none' as const } }),
      })}
    />
  );
}

export { Modal, ModalOverlay, type ModalOverlayProps };
