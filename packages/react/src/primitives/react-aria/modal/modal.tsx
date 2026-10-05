'use client';

import * as React from 'react';
import {
  Modal as ModalPrimitive,
  ModalOverlay as ModalOverlayPrimitive,
  OverlayTriggerStateContext,
  type ModalOverlayProps as ModalOverlayPrimitiveProps,
} from 'react-aria-components';
import {
  AnimatePresence,
  useIsPresent,
  usePresence,
  type Transition,
} from 'motion/react';

import { useControlledState } from '../../../utils/use-controlled-state';
import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '../../../utils/motion';
import {
  DIALOG_TRANSITION,
  OVERLAY_TRANSITION,
  SHEET_TRANSITION,
  getContentTargets,
  getModalSide,
  ariaMotionRender,
  toCssTiming,
  useModalTransitions,
  type ContentFlipProps,
  type FlipDirection,
  type ModalAnimationProps,
} from '../../../internal/modal-motion';

// Same API as React Aria's Modal and ModalOverlay, animated like Animate UI
// v1's Dialog (Radix, Base UI and Headless UI shipped the same motion): the
// overlay fades in 200ms (ease-out), the modal tips forward from
// `perspective(500px) rotateX(-20deg) scale(0.8)` with a fade and a blur on a
// spring, or slides and fades in from its edge when it has `data-side`
// (shadcn/ui's Sheet, v1's Sheet). See ../../../internal/modal-motion.ts.
//
// React Aria renders the Modal inside the ModalOverlay, where v1's overlay and
// content were siblings: fading the overlay's opacity (and filter) would fade
// and blur the modal with it, cutting its exit short. So the overlay fades its
// own background color and backdrop filter instead (from the values its
// classes give it), and the modal moves exactly like v1's content.
//
// React Aria keeps an exiting modal mounted while the animations it finds on
// it run, but it looks for them before Motion's exit has started. So the
// ModalOverlay resolves the open state like React Aria does (its own props,
// else the DialogTrigger's state), gates itself with AnimatePresence and
// passes `isExiting` while its exit plays: React Aria then keeps it mounted,
// marks it `data-exiting` and stops trapping focus. The modal renders a
// motion.div through React Aria's `render` prop (or the user's own `render`,
// made animatable), so its attributes, `className` and `style` (render props
// included) stay on that element.

/** Animate UI's additions to `ModalOverlay`. */
type OverlayAnimationProps = {
  /**
   * Fade in (of its background color and backdrop filter).
   * @default { duration: 0.2, ease: [0.23, 1, 0.32, 1] }
   */
  transition?: ModalAnimationProps['transition'];
  /** Fade out. Defaults to `transition`. */
  exitTransition?: ModalAnimationProps['transition'];
};

/** Animate UI's additions to `Modal`. */
type ModalAnimationPropsDoc = {
  /**
   * Transition of the opening, a sheet's slide from its `data-side` edge
   * included.
   * @default { type: 'spring', stiffness: 150, damping: 25 } (damping 22 for a
   * sheet, with `data-side`)
   */
  transition?: ModalAnimationProps['transition'];
  /** Transition of the closing. Defaults to `transition`. */
  exitTransition?: ModalAnimationProps['transition'];
};

type ModalOverlayProps = ModalOverlayPrimitiveProps &
  OverlayAnimationProps &
  React.RefAttributes<HTMLDivElement>;
type ModalProps = ModalOverlayPrimitiveProps &
  ModalAnimationPropsDoc &
  ContentFlipProps &
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
  ref,
  ...props
}: Omit<ModalOverlayProps, 'isOpen' | 'defaultOpen' | 'onOpenChange'> & {
  /** False for the invisible overlay of a standalone Modal. */
  animated?: boolean;
}) {
  const live = React.use(LiveStateContext)!;
  const [isPresent, safeToRemove] = usePresence();
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      overlayRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref)
        (ref as React.RefObject<HTMLDivElement | null>).current = node;
    },
    [ref],
  );
  useBackdropFade(overlayRef, {
    isPresent,
    safeToRemove,
    animated,
    ...useModalTransitions(transition, exitTransition, OVERLAY_TRANSITION),
  });

  return (
    <InOverlayContext value>
      <ModalOverlayPrimitive
        {...props}
        {...(live.local
          ? { isOpen: live.isOpen, onOpenChange: live.setOpen }
          : {})}
        ref={setRef}
        isExiting={!isPresent || isExiting}
        render={ariaMotionRender(
          render,
          // Once closed, clicks go through to the page while the exit plays.
          isPresent ? {} : { style: { pointerEvents: 'none' } },
        )}
      />
    </InOverlayContext>
  );
}

type BackdropValues = Record<'backgroundColor' | 'backdropFilter', string>;

const CLEAR: BackdropValues = {
  backgroundColor: 'transparent',
  backdropFilter: 'none',
};

function readBackdrop(element: HTMLElement): BackdropValues {
  const style = getComputedStyle(element);
  return {
    backgroundColor: style.backgroundColor,
    backdropFilter: style.backdropFilter,
  };
}

/**
 * Fades the overlay's background color and backdrop filter in from nothing to
 * what its classes set, and back out before it unmounts (`safeToRemove`). A
 * Web Animation, so any color syntax interpolates and the classes take over
 * again once it has played.
 */
function useBackdropFade(
  ref: React.RefObject<HTMLDivElement | null>,
  options: {
    isPresent: boolean;
    safeToRemove: (() => void) | null | undefined;
    animated: boolean;
    enter: Transition;
    exit: Transition;
  },
) {
  const { isPresent } = options;
  const latestRef = React.useRef(options);
  React.useLayoutEffect(() => {
    latestRef.current = options;
  });
  const runningRef = React.useRef<Animation | null>(null);

  React.useLayoutEffect(() => {
    const { animated, enter, exit, safeToRemove } = latestRef.current;
    const element = ref.current;
    if (!element || !animated || typeof element.animate !== 'function') {
      if (!isPresent) safeToRemove?.();
      return;
    }
    // From where it is: mid-fade when interrupted.
    const current = runningRef.current;
    const from = current
      ? readBackdrop(element)
      : isPresent
        ? CLEAR
        : readBackdrop(element);
    current?.cancel();
    // Its classes' values, now that nothing animates them.
    const to = isPresent ? readBackdrop(element) : CLEAR;
    const { duration, easing } = toCssTiming(isPresent ? enter : exit);
    const animation = element.animate([from, to], {
      duration,
      easing,
      fill: isPresent ? 'backwards' : 'forwards',
    });
    runningRef.current = animation;
    animation.finished
      .then(() => {
        if (runningRef.current !== animation) return;
        if (isPresent) runningRef.current = null;
        else latestRef.current.safeToRemove?.();
      })
      // Cancelled: a newer fade took over.
      .catch(() => {});
  }, [isPresent, ref]);
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
  from,
  transition,
  exitTransition,
  render,
  ...props
}: ModalProps) {
  const reduce = useShouldReduceMotion();
  const isPresent = useIsPresent();
  // shadcn/ui's Sheet passes `data-side`: it slides from that edge.
  const side = getModalSide((props as Record<string, unknown>)['data-side']);
  const { enter, exit } = useModalTransitions(
    transition,
    exitTransition,
    side ? SHEET_TRANSITION : DIALOG_TRANSITION,
  );
  const targets = getContentTargets({ side, from, reduce, enter, exit });

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

export {
  Modal,
  ModalOverlay,
  type ModalOverlayProps,
  type FlipDirection as ModalFlipDirection,
};
