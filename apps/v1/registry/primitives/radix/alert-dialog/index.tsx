'use client';

import * as React from 'react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';
import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react';

import { useControlledState } from '@/registry/hooks/use-controlled-state';
import { getStrictContext } from '@/registry/lib/get-strict-context';
import {
  ReducedMotionConfig,
  scale,
  transition as motionTransition,
  useShouldReduceMotion,
} from '@/registry/lib/motion';

type AlertDialogContextType = {
  isOpen: boolean;
  setIsOpen: AlertDialogProps['onOpenChange'];
};

const [AlertDialogProvider, useAlertDialog] =
  getStrictContext<AlertDialogContextType>('AlertDialogContext');

type AlertDialogProps = React.ComponentProps<typeof AlertDialogPrimitive.Root>;

function AlertDialog(props: AlertDialogProps) {
  const [isOpen, setIsOpen] = useControlledState({
    value: props?.open,
    defaultValue: props?.defaultOpen,
    onChange: props?.onOpenChange,
  });

  return (
    <AlertDialogProvider value={{ isOpen, setIsOpen }}>
      <AlertDialogPrimitive.Root
        data-slot="alert-dialog"
        {...props}
        onOpenChange={setIsOpen}
      />
    </AlertDialogProvider>
  );
}

type AlertDialogTriggerProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Trigger
>;

function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
}

type AlertDialogPortalProps = Omit<
  React.ComponentProps<typeof AlertDialogPrimitive.Portal>,
  'forceMount'
>;

function AlertDialogPortal({ children, ...props }: AlertDialogPortalProps) {
  const { isOpen } = useAlertDialog();

  return (
    <AnimatePresence>
      {isOpen && (
        <AlertDialogPrimitive.Portal
          data-slot="alert-dialog-portal"
          forceMount
          {...props}
        >
          <ReducedMotionConfig>{children}</ReducedMotionConfig>
        </AlertDialogPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

type AlertDialogOverlayProps = Omit<
  React.ComponentProps<typeof AlertDialogPrimitive.Overlay>,
  'forceMount' | 'asChild'
> &
  HTMLMotionProps<'div'>;

function AlertDialogOverlay({ transition, ...props }: AlertDialogOverlayProps) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      asChild
      forceMount
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: transition ?? motionTransition.modal,
        }}
        exit={{
          opacity: 0,
          transition: transition ?? motionTransition.modalExit,
        }}
        {...props}
      />
    </AlertDialogPrimitive.Overlay>
  );
}

type AlertDialogFlipDirection = 'top' | 'bottom' | 'left' | 'right';

type AlertDialogContentProps = Omit<
  React.ComponentProps<typeof AlertDialogPrimitive.Content>,
  'forceMount' | 'asChild'
> &
  HTMLMotionProps<'div'> & {
    /** Opt-in 3D flip from this edge. Default: a subtle scale. */
    from?: AlertDialogFlipDirection;
  };

function getContentTransform(
  from: AlertDialogFlipDirection | undefined,
  progress: 'hidden' | 'visible',
) {
  const scaleValue = progress === 'hidden' ? scale.enter : 1;
  if (!from) return `scale(${scaleValue})`;

  const axis = from === 'top' || from === 'bottom' ? 'rotateX' : 'rotateY';
  const angle =
    progress === 'hidden'
      ? from === 'bottom' || from === 'left'
        ? '20deg'
        : '-20deg'
      : '0deg';
  return `perspective(500px) ${axis}(${angle}) scale(${scaleValue})`;
}

function AlertDialogContent({
  from,
  onOpenAutoFocus,
  onCloseAutoFocus,
  onEscapeKeyDown,
  transition,
  ...props
}: AlertDialogContentProps) {
  const reduce = useShouldReduceMotion();
  const hiddenTransform = reduce
    ? getContentTransform(from, 'visible')
    : getContentTransform(from, 'hidden');

  return (
    <AlertDialogPrimitive.Content
      asChild
      forceMount
      onOpenAutoFocus={onOpenAutoFocus}
      onCloseAutoFocus={onCloseAutoFocus}
      onEscapeKeyDown={onEscapeKeyDown}
    >
      <motion.div
        data-slot="alert-dialog-content"
        initial={{ opacity: 0, transform: hiddenTransform }}
        animate={{
          opacity: 1,
          transform: getContentTransform(from, 'visible'),
          transition: transition ?? motionTransition.modal,
        }}
        exit={{
          opacity: 0,
          transform: hiddenTransform,
          transition: transition ?? motionTransition.modalExit,
        }}
        {...props}
      />
    </AlertDialogPrimitive.Content>
  );
}

type AlertDialogCancelProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Cancel
>;

function AlertDialogCancel(props: AlertDialogCancelProps) {
  return (
    <AlertDialogPrimitive.Cancel data-slot="alert-dialog-cancel" {...props} />
  );
}

type AlertDialogActionProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Action
>;

function AlertDialogAction(props: AlertDialogActionProps) {
  return (
    <AlertDialogPrimitive.Action data-slot="alert-dialog-action" {...props} />
  );
}

type AlertDialogHeaderProps = React.ComponentProps<'div'>;

function AlertDialogHeader(props: AlertDialogHeaderProps) {
  return <div data-slot="alert-dialog-header" {...props} />;
}

type AlertDialogFooterProps = React.ComponentProps<'div'>;

function AlertDialogFooter(props: AlertDialogFooterProps) {
  return <div data-slot="alert-dialog-footer" {...props} />;
}

type AlertDialogTitleProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Title
>;

function AlertDialogTitle(props: AlertDialogTitleProps) {
  return (
    <AlertDialogPrimitive.Title data-slot="alert-dialog-title" {...props} />
  );
}

type AlertDialogDescriptionProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Description
>;

function AlertDialogDescription(props: AlertDialogDescriptionProps) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  useAlertDialog,
  type AlertDialogProps,
  type AlertDialogTriggerProps,
  type AlertDialogPortalProps,
  type AlertDialogCancelProps,
  type AlertDialogActionProps,
  type AlertDialogOverlayProps,
  type AlertDialogContentProps,
  type AlertDialogHeaderProps,
  type AlertDialogFooterProps,
  type AlertDialogTitleProps,
  type AlertDialogDescriptionProps,
  type AlertDialogContextType,
  type AlertDialogFlipDirection,
};
