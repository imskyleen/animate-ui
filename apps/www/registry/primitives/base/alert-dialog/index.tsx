'use client';

import * as React from 'react';
import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';
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
  'keepMounted'
>;

function AlertDialogPortal({ children, ...props }: AlertDialogPortalProps) {
  const { isOpen } = useAlertDialog();

  return (
    <AnimatePresence>
      {isOpen && (
        <AlertDialogPrimitive.Portal
          data-slot="alert-dialog-portal"
          keepMounted
          {...props}
        >
          <ReducedMotionConfig>{children}</ReducedMotionConfig>
        </AlertDialogPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

type AlertDialogBackdropProps = Omit<
  React.ComponentProps<typeof AlertDialogPrimitive.Backdrop>,
  'render'
> &
  HTMLMotionProps<'div'>;

function AlertDialogBackdrop({
  transition,
  ...props
}: AlertDialogBackdropProps) {
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot="alert-dialog-backdrop"
      render={
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
      }
    />
  );
}

type AlertDialogFlipDirection = 'top' | 'bottom' | 'left' | 'right';

type AlertDialogPopupProps = Omit<
  React.ComponentProps<typeof AlertDialogPrimitive.Popup>,
  'render'
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

function AlertDialogPopup({
  from,
  initialFocus,
  finalFocus,
  transition,
  ...props
}: AlertDialogPopupProps) {
  const reduce = useShouldReduceMotion();
  const hiddenTransform = reduce
    ? getContentTransform(from, 'visible')
    : getContentTransform(from, 'hidden');

  return (
    <AlertDialogPrimitive.Popup
      initialFocus={initialFocus}
      finalFocus={finalFocus}
      render={
        <motion.div
          data-slot="alert-dialog-popup"
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
      }
    />
  );
}

type AlertDialogCloseProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Close
>;

function AlertDialogClose(props: AlertDialogCloseProps) {
  return (
    <AlertDialogPrimitive.Close data-slot="alert-dialog-close" {...props} />
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
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogTrigger,
  AlertDialogPopup,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  useAlertDialog,
  type AlertDialogProps,
  type AlertDialogTriggerProps,
  type AlertDialogPortalProps,
  type AlertDialogCloseProps,
  type AlertDialogBackdropProps,
  type AlertDialogPopupProps,
  type AlertDialogHeaderProps,
  type AlertDialogFooterProps,
  type AlertDialogTitleProps,
  type AlertDialogDescriptionProps,
  type AlertDialogContextType,
  type AlertDialogFlipDirection,
};
