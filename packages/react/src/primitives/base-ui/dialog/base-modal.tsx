'use client';

import * as React from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { AnimatePresence, useIsPresent, usePresence } from 'motion/react';

import { getStrictContext } from '../../../utils/strict-context';
import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '../../../utils/motion';
import {
  getAnimateTarget,
  getContentTargets,
  getModalSide,
  motionRender,
  useBackdropFade,
  useOverlayTransitions,
  useHiddenWhenClosed,
  useContentTransitions,
  type ContentFlipProps,
  type ModalAnimationProps,
  type ModalTargets,
} from '../../../internal/modal-motion';

// Animated Root, Portal, Backdrop and Popup shared by Base UI's Dialog and
// Alert Dialog (Base UI's Alert Dialog reuses the Dialog's parts).
//
// Base UI unmounts a closed popup once the animations it can see have
// finished, which it checks before Motion's exit has started. So the Root
// mirrors `open`, the Portal gates itself with AnimatePresence and passes
// `keepMounted`, and the Backdrop and Popup render a motion.div through
// `render` (or the user's own `render`, made animatable): Base UI's attributes
// (data-open, data-starting-style, role, data-side…) stay on the element
// shadcn styles.

type OpenState = { open: boolean };

const [OpenProvider, useOpen] = getStrictContext<OpenState>('Dialog.Root');
// Set inside our Portal, with the user's own `keepMounted`.
const PortalContext = React.createContext<{ keepMounted: boolean }>({
  keepMounted: false,
});

type RootLikeProps = {
  open?: boolean;
  defaultOpen?: boolean;
  // Each root has its own event details type; all have `isCanceled`.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onOpenChange?: (open: boolean, eventDetails: any) => void;
};

/** Wraps a Base UI root so its open state is known to the Portal. */
function createRoot<Props extends RootLikeProps>(
  RootPrimitive: React.ComponentType<Props>,
) {
  return function Root({ defaultOpen, ...props }: Props) {
    const controlled = props.open !== undefined;
    const [uncontrolled, setUncontrolled] = React.useState(
      defaultOpen ?? false,
    );
    const open = controlled ? Boolean(props.open) : uncontrolled;

    const onOpenChange: RootLikeProps['onOpenChange'] = (next, details) => {
      props.onOpenChange?.(next, details);
      // `eventDetails.cancel()` keeps the dialog as it is.
      if ((details as { isCanceled?: boolean } | undefined)?.isCanceled) return;
      if (!controlled) setUncontrolled(next);
    };

    return (
      <OpenProvider value={{ open }}>
        <RootPrimitive
          {...(props as Props)}
          open={open}
          onOpenChange={onOpenChange}
        />
      </OpenProvider>
    );
  };
}

type PortalProps = DialogPrimitive.Portal.Props;

function Portal({ keepMounted, children, ...props }: PortalProps) {
  const { open } = useOpen();

  return (
    <AnimatePresence>
      {(open || keepMounted) && (
        <DialogPrimitive.Portal key="portal" {...props} keepMounted>
          <PortalContext value={{ keepMounted: Boolean(keepMounted) }}>
            <ReducedMotionConfig>{children}</ReducedMotionConfig>
          </PortalContext>
        </DialogPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

/**
 * Props for the motion.div a part renders. While its exit plays, Base UI may
 * already consider the popup closed and mark it `hidden`: keep it visible
 * until the exit has finished.
 */
function useMotionElementProps(targets: ModalTargets) {
  const { open } = useOpen();
  const { keepMounted } = React.use(PortalContext);
  const isPresent = useIsPresent();
  const { hidden, onAnimationComplete } = useHiddenWhenClosed(
    open,
    keepMounted,
  );
  const exiting = !isPresent || (keepMounted && !open && !hidden);

  return {
    initial: targets.initial,
    // Transitions live in the targets: an exiting element keeps the props of
    // its last render, when it was still open.
    animate: getAnimateTarget(targets, open, keepMounted),
    exit: targets.exit,
    onAnimationComplete,
    ...(exiting ? { hidden: false } : {}),
    // Once closed, clicks go through to the page while the exit plays.
    ...(open ? {} : { style: { pointerEvents: 'none' as const } }),
  };
}

type BackdropProps = DialogPrimitive.Backdrop.Props & ModalAnimationProps;

function Backdrop({
  transition,
  exitTransition,
  render,
  ...props
}: BackdropProps) {
  const { open } = useOpen();
  const { keepMounted } = React.use(PortalContext);
  // The Portal waits for its fade out before unmounting.
  const [isPresent, safeToRemove] = usePresence();
  const { hidden, onAnimationComplete } = useHiddenWhenClosed(
    open,
    keepMounted,
  );
  const ref = useBackdropFade({
    visible: open && isPresent,
    ...useOverlayTransitions(transition, exitTransition),
    onFadedOut: () => {
      onAnimationComplete();
      safeToRemove?.();
    },
  });
  const exiting = !isPresent || (keepMounted && !open && !hidden);

  return (
    <DialogPrimitive.Backdrop
      {...props}
      render={motionRender(render, {
        ref,
        // Base UI may mark it `hidden` before its fade out has played.
        ...(exiting ? { hidden: false } : {}),
        // Once closed, clicks go through to the page while it fades out.
        ...(open ? {} : { style: { pointerEvents: 'none' as const } }),
      })}
    />
  );
}

type PopupProps = DialogPrimitive.Popup.Props &
  ModalAnimationProps &
  ContentFlipProps;

function Popup({
  from,
  transition,
  exitTransition,
  render,
  ...props
}: PopupProps) {
  const reduce = useShouldReduceMotion();
  // shadcn/ui's Sheet passes `data-side`: it slides from that edge.
  const side = getModalSide((props as Record<string, unknown>)['data-side']);
  const { enter, exit } = useContentTransitions(
    side,
    transition,
    exitTransition,
  );
  const motionProps = useMotionElementProps(
    getContentTargets({ side, from, reduce, enter, exit }),
  );

  return (
    <DialogPrimitive.Popup
      {...props}
      render={motionRender(render, motionProps)}
    />
  );
}

export {
  createRoot,
  Portal,
  Backdrop,
  Popup,
  type PortalProps,
  type BackdropProps,
  type PopupProps,
};
