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

type OpenState = { open: boolean };

const [OpenProvider, useOpen] = getStrictContext<OpenState>('Dialog.Root');
const PortalContext = React.createContext<{ keepMounted: boolean }>({
  keepMounted: false,
});

type RootLikeProps = {
  open?: boolean;
  defaultOpen?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onOpenChange?: (open: boolean, eventDetails: any) => void;
};

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
    animate: getAnimateTarget(targets, open, keepMounted),
    exit: targets.exit,
    onAnimationComplete,
    ...(exiting ? { hidden: false } : {}),
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
        ...(exiting ? { hidden: false } : {}),
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
