import * as React from 'react';

import {
  Drawer as DrawerPrimitive,
  DrawerTrigger as DrawerTriggerPrimitive,
  DrawerPortal as DrawerPortalPrimitive,
  DrawerBackdrop as DrawerBackdropPrimitive,
  DrawerViewport as DrawerViewportPrimitive,
  DrawerPopup as DrawerPopupPrimitive,
  DrawerContent as DrawerContentPrimitive,
  DrawerClose as DrawerClosePrimitive,
  DrawerHeader as DrawerHeaderPrimitive,
  DrawerFooter as DrawerFooterPrimitive,
  DrawerTitle as DrawerTitlePrimitive,
  DrawerDescription as DrawerDescriptionPrimitive,
  type DrawerProps as DrawerPrimitiveProps,
  type DrawerTriggerProps as DrawerTriggerPrimitiveProps,
  type DrawerBackdropProps as DrawerBackdropPrimitiveProps,
  type DrawerPopupProps as DrawerPopupPrimitiveProps,
  type DrawerCloseProps as DrawerClosePrimitiveProps,
  type DrawerHeaderProps as DrawerHeaderPrimitiveProps,
  type DrawerFooterProps as DrawerFooterPrimitiveProps,
  type DrawerTitleProps as DrawerTitlePrimitiveProps,
  type DrawerDescriptionProps as DrawerDescriptionPrimitiveProps,
} from '@/registry/primitives/base/drawer';
import { cn } from '@workspace/ui/lib/utils';

type DrawerProps = DrawerPrimitiveProps;

function Drawer(props: DrawerProps) {
  return <DrawerPrimitive {...props} />;
}

type DrawerTriggerProps = DrawerTriggerPrimitiveProps;

function DrawerTrigger(props: DrawerTriggerProps) {
  return <DrawerTriggerPrimitive {...props} />;
}

type DrawerCloseProps = DrawerClosePrimitiveProps;

function DrawerClose(props: DrawerCloseProps) {
  return <DrawerClosePrimitive {...props} />;
}

type DrawerBackdropProps = DrawerBackdropPrimitiveProps;

function DrawerBackdrop({ className, ...props }: DrawerBackdropProps) {
  return (
    <DrawerBackdropPrimitive
      className={cn('fixed inset-0 z-50 bg-black/50', className)}
      {...props}
    />
  );
}

type DrawerPopupProps = DrawerPopupPrimitiveProps;

function DrawerPopup({ className, children, ...props }: DrawerPopupProps) {
  return (
    <DrawerPortalPrimitive>
      <DrawerBackdrop />
      <DrawerViewportPrimitive className="fixed inset-0 z-50">
        <DrawerPopupPrimitive
          className={cn(
            'group/drawer-popup bg-background fixed z-50 flex h-auto flex-col overflow-y-auto overscroll-contain outline-none',
            'data-[swipe-direction=down]:inset-x-0 data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:mt-24 data-[swipe-direction=down]:max-h-[80vh] data-[swipe-direction=down]:rounded-t-lg data-[swipe-direction=down]:border-t',
            'data-[swipe-direction=up]:inset-x-0 data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:mb-24 data-[swipe-direction=up]:max-h-[80vh] data-[swipe-direction=up]:rounded-b-lg data-[swipe-direction=up]:border-b',
            'data-[swipe-direction=right]:inset-y-0 data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:w-3/4 data-[swipe-direction=right]:border-l data-[swipe-direction=right]:sm:max-w-sm',
            'data-[swipe-direction=left]:inset-y-0 data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:w-3/4 data-[swipe-direction=left]:border-r data-[swipe-direction=left]:sm:max-w-sm',
            className,
          )}
          {...props}
        >
          <div
            aria-hidden
            className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[swipe-direction=down]/drawer-popup:block"
          />
          <DrawerContentPrimitive className="flex min-h-0 flex-1 flex-col">
            {children}
          </DrawerContentPrimitive>
        </DrawerPopupPrimitive>
      </DrawerViewportPrimitive>
    </DrawerPortalPrimitive>
  );
}

type DrawerHeaderProps = DrawerHeaderPrimitiveProps;

function DrawerHeader({ className, ...props }: DrawerHeaderProps) {
  return (
    <DrawerHeaderPrimitive
      className={cn(
        'flex flex-col gap-0.5 p-4 group-data-[swipe-direction=down]/drawer-popup:text-center group-data-[swipe-direction=up]/drawer-popup:text-center md:gap-1.5 md:text-left',
        className,
      )}
      {...props}
    />
  );
}

type DrawerFooterProps = DrawerFooterPrimitiveProps;

function DrawerFooter({ className, ...props }: DrawerFooterProps) {
  return (
    <DrawerFooterPrimitive
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
}

type DrawerTitleProps = DrawerTitlePrimitiveProps;

function DrawerTitle({ className, ...props }: DrawerTitleProps) {
  return (
    <DrawerTitlePrimitive
      className={cn('text-foreground font-semibold', className)}
      {...props}
    />
  );
}

type DrawerDescriptionProps = DrawerDescriptionPrimitiveProps;

function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  return (
    <DrawerDescriptionPrimitive
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerPopup,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  type DrawerProps,
  type DrawerTriggerProps,
  type DrawerCloseProps,
  type DrawerPopupProps,
  type DrawerHeaderProps,
  type DrawerFooterProps,
  type DrawerTitleProps,
  type DrawerDescriptionProps,
};
