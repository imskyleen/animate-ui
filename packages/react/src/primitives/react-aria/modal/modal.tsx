'use client';

import * as React from 'react';
import {
  Modal as ModalPrimitive,
  ModalOverlay as ModalOverlayPrimitive,
  OverlayTriggerStateContext,
  type ModalOverlayProps as ModalOverlayPrimitiveProps,
} from 'react-aria-components';
import { AnimatePresence, useIsPresent, usePresence } from 'motion/react';

import { useControlledState } from '../../../utils/use-controlled-state';
import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '../../../utils/motion';
import {
  getContentTargets,
  useEnterAfterPaint,
  getModalSide,
  ariaMotionRender,
  useBackdropFade,
  useOverlayTransitions,
  useContentTransitions,
  type ContentFlipProps,
  type FlipDirection,
  type ModalAnimationProps,
} from '../../../internal/modal-motion';

type OverlayAnimationProps = {
  transition?: ModalAnimationProps['transition'];
  exitTransition?: ModalAnimationProps['transition'];
};

type ModalAnimationPropsDoc = {
  transition?: ModalAnimationProps['transition'];
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

const LiveStateContext = React.createContext<LiveState | null>(null);
const InOverlayContext = React.createContext(false);

function ModalOverlay({
  isOpen: isOpenProp,
  defaultOpen,
  onOpenChange,
  ...props
}: ModalOverlayProps) {
  const contextState = React.use(OverlayTriggerStateContext);
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
  animated?: boolean;
}) {
  const live = React.use(LiveStateContext)!;
  const [isPresent, safeToRemove] = usePresence();
  const fadeRef = useBackdropFade({
    visible: isPresent,
    animated,
    ...useOverlayTransitions(transition, exitTransition),
    onFadedOut: () => safeToRemove?.(),
  });
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      fadeRef(node);
      if (typeof ref === 'function') ref(node);
      else if (ref)
        (ref as React.RefObject<HTMLDivElement | null>).current = node;
    },
    [ref, fadeRef],
  );

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
          isPresent ? {} : { style: { pointerEvents: 'none' } },
        )}
      />
    </InOverlayContext>
  );
}

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
  const side = getModalSide((props as Record<string, unknown>)['data-side']);
  const { enter, exit } = useContentTransitions(
    side,
    transition,
    exitTransition,
  );
  const targets = getContentTargets({ side, from, reduce, enter, exit });
  const entered = useEnterAfterPaint();

  return (
    <ModalPrimitive
      {...props}
      render={ariaMotionRender(render, {
        initial: targets.initial,
        animate: entered ? targets.animate : targets.initial,
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
