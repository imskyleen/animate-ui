'use client';

import * as React from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react';

import { useControlledState } from '@/registry/hooks/use-controlled-state';
import { getStrictContext } from '@/registry/lib/get-strict-context';
import {
  ReducedMotionConfig,
  scale,
  transition as motionTransition,
  useShouldReduceMotion,
} from '@/registry/lib/motion';

type DialogContextType = {
  isOpen: boolean;
  setIsOpen: DialogProps['onOpenChange'];
};

const [DialogProvider, useDialog] =
  getStrictContext<DialogContextType>('DialogContext');

type DialogProps = React.ComponentProps<typeof DialogPrimitive.Root>;

function Dialog(props: DialogProps) {
  const [isOpen, setIsOpen] = useControlledState({
    value: props?.open,
    defaultValue: props?.defaultOpen,
    onChange: props?.onOpenChange,
  });

  return (
    <DialogProvider value={{ isOpen, setIsOpen }}>
      <DialogPrimitive.Root
        data-slot="dialog"
        {...props}
        onOpenChange={setIsOpen}
      />
    </DialogProvider>
  );
}

type DialogTriggerProps = React.ComponentProps<typeof DialogPrimitive.Trigger>;

function DialogTrigger(props: DialogTriggerProps) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

type DialogPortalProps = Omit<
  React.ComponentProps<typeof DialogPrimitive.Portal>,
  'keepMounted'
>;

function DialogPortal({ children, ...props }: DialogPortalProps) {
  const { isOpen } = useDialog();

  return (
    <AnimatePresence>
      {isOpen && (
        <DialogPrimitive.Portal
          data-slot="dialog-portal"
          keepMounted
          {...props}
        >
          <ReducedMotionConfig>{children}</ReducedMotionConfig>
        </DialogPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

type DialogBackdropProps = Omit<
  React.ComponentProps<typeof DialogPrimitive.Backdrop>,
  'render'
> &
  HTMLMotionProps<'div'>;

function DialogBackdrop({ transition, ...props }: DialogBackdropProps) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-backdrop"
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

type DialogFlipDirection = 'top' | 'bottom' | 'left' | 'right';

type DialogPopupProps = Omit<
  React.ComponentProps<typeof DialogPrimitive.Popup>,
  'render'
> &
  HTMLMotionProps<'div'> & {
    /** Opt-in 3D flip from this edge. Default: a subtle scale. */
    from?: DialogFlipDirection;
  };

function getContentTransform(
  from: DialogFlipDirection | undefined,
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

function DialogPopup({
  from,
  initialFocus,
  finalFocus,
  transition,
  ...props
}: DialogPopupProps) {
  const reduce = useShouldReduceMotion();
  const hiddenTransform = reduce
    ? getContentTransform(from, 'visible')
    : getContentTransform(from, 'hidden');

  return (
    <DialogPrimitive.Popup
      initialFocus={initialFocus}
      finalFocus={finalFocus}
      render={
        <motion.div
          data-slot="dialog-popup"
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

type DialogCloseProps = React.ComponentProps<typeof DialogPrimitive.Close>;

function DialogClose(props: DialogCloseProps) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

type DialogHeaderProps = React.ComponentProps<'div'>;

function DialogHeader(props: DialogHeaderProps) {
  return <div data-slot="dialog-header" {...props} />;
}

type DialogFooterProps = React.ComponentProps<'div'>;

function DialogFooter(props: DialogFooterProps) {
  return <div data-slot="dialog-footer" {...props} />;
}

type DialogTitleProps = React.ComponentProps<typeof DialogPrimitive.Title>;

function DialogTitle(props: DialogTitleProps) {
  return <DialogPrimitive.Title data-slot="dialog-title" {...props} />;
}

type DialogDescriptionProps = React.ComponentProps<
  typeof DialogPrimitive.Description
>;

function DialogDescription(props: DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description data-slot="dialog-description" {...props} />
  );
}

export {
  Dialog,
  DialogPortal,
  DialogBackdrop,
  DialogClose,
  DialogTrigger,
  DialogPopup,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  useDialog,
  type DialogProps,
  type DialogTriggerProps,
  type DialogPortalProps,
  type DialogCloseProps,
  type DialogBackdropProps,
  type DialogPopupProps,
  type DialogHeaderProps,
  type DialogFooterProps,
  type DialogTitleProps,
  type DialogDescriptionProps,
  type DialogContextType,
  type DialogFlipDirection,
};
