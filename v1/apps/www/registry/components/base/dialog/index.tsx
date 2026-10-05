import * as React from 'react';
import { XIcon } from 'lucide-react';

import {
  Dialog as DialogPrimitive,
  DialogPopup as DialogPopupPrimitive,
  DialogDescription as DialogDescriptionPrimitive,
  DialogFooter as DialogFooterPrimitive,
  DialogHeader as DialogHeaderPrimitive,
  DialogTitle as DialogTitlePrimitive,
  DialogTrigger as DialogTriggerPrimitive,
  DialogPortal as DialogPortalPrimitive,
  DialogBackdrop as DialogBackdropPrimitive,
  DialogClose as DialogClosePrimitive,
  type DialogProps as DialogPrimitiveProps,
  type DialogPopupProps as DialogPopupPrimitiveProps,
  type DialogDescriptionProps as DialogDescriptionPrimitiveProps,
  type DialogFooterProps as DialogFooterPrimitiveProps,
  type DialogHeaderProps as DialogHeaderPrimitiveProps,
  type DialogTitleProps as DialogTitlePrimitiveProps,
  type DialogTriggerProps as DialogTriggerPrimitiveProps,
  type DialogBackdropProps as DialogBackdropPrimitiveProps,
  type DialogCloseProps as DialogClosePrimitiveProps,
} from '@/registry/primitives/base/dialog';
import { cn } from '@workspace/ui/lib/utils';

type DialogProps = DialogPrimitiveProps;

function Dialog(props: DialogProps) {
  return <DialogPrimitive {...props} />;
}

type DialogTriggerProps = DialogTriggerPrimitiveProps;

function DialogTrigger(props: DialogTriggerProps) {
  return <DialogTriggerPrimitive {...props} />;
}

type DialogCloseProps = DialogClosePrimitiveProps;

function DialogClose(props: DialogCloseProps) {
  return <DialogClosePrimitive {...props} />;
}

type DialogBackdropProps = DialogBackdropPrimitiveProps;

function DialogBackdrop({ className, ...props }: DialogBackdropProps) {
  return (
    <DialogBackdropPrimitive
      className={cn('fixed inset-0 z-50 bg-black/50', className)}
      {...props}
    />
  );
}

type DialogPopupProps = DialogPopupPrimitiveProps & {
  showCloseButton?: boolean;
};

function DialogPopup({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPopupProps) {
  return (
    <DialogPortalPrimitive>
      <DialogBackdrop />
      <DialogPopupPrimitive
        className={cn(
          'bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg sm:max-w-lg',
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogClosePrimitive className="ring-offset-background focus:ring-ring data-[open]:bg-accent data-[open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogClosePrimitive>
        )}
      </DialogPopupPrimitive>
    </DialogPortalPrimitive>
  );
}

type DialogHeaderProps = DialogHeaderPrimitiveProps;

function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <DialogHeaderPrimitive
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  );
}

type DialogFooterProps = DialogFooterPrimitiveProps;

function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <DialogFooterPrimitive
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  );
}

type DialogTitleProps = DialogTitlePrimitiveProps;

function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <DialogTitlePrimitive
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  );
}

type DialogDescriptionProps = DialogDescriptionPrimitiveProps;

function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <DialogDescriptionPrimitive
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogPopup,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  type DialogProps,
  type DialogTriggerProps,
  type DialogCloseProps,
  type DialogPopupProps,
  type DialogHeaderProps,
  type DialogFooterProps,
  type DialogTitleProps,
  type DialogDescriptionProps,
};
