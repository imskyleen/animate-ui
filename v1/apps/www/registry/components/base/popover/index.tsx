import * as React from 'react';

import {
  Popover as PopoverPrimitive,
  PopoverTrigger as PopoverTriggerPrimitive,
  PopoverPositioner as PopoverPositionerPrimitive,
  PopoverPopup as PopoverPopupPrimitive,
  PopoverPortal as PopoverPortalPrimitive,
  PopoverClose as PopoverClosePrimitive,
  PopoverBackdrop as PopoverBackdropPrimitive,
  PopoverTitle as PopoverTitlePrimitive,
  PopoverDescription as PopoverDescriptionPrimitive,
  type PopoverProps as PopoverPrimitiveProps,
  type PopoverTriggerProps as PopoverTriggerPrimitiveProps,
  type PopoverPositionerProps as PopoverPositionerPrimitiveProps,
  type PopoverPopupProps as PopoverPopupPrimitiveProps,
  type PopoverCloseProps as PopoverClosePrimitiveProps,
  type PopoverBackdropProps as PopoverBackdropPrimitiveProps,
  type PopoverTitleProps as PopoverTitlePrimitiveProps,
  type PopoverDescriptionProps as PopoverDescriptionPrimitiveProps,
} from '@/registry/primitives/base/popover';
import { cn } from '@workspace/ui/lib/utils';

type PopoverProps = PopoverPrimitiveProps;

function Popover(props: PopoverProps) {
  return <PopoverPrimitive {...props} />;
}

type PopoverTriggerProps = PopoverTriggerPrimitiveProps;

function PopoverTrigger(props: PopoverTriggerProps) {
  return <PopoverTriggerPrimitive {...props} />;
}

type PopoverPanelProps = PopoverPositionerPrimitiveProps &
  PopoverPopupPrimitiveProps;

function PopoverPanel({
  className,
  align = 'center',
  sideOffset = 4,
  initialFocus,
  finalFocus,
  style,
  children,
  ...props
}: PopoverPanelProps) {
  return (
    <PopoverPortalPrimitive>
      <PopoverPositionerPrimitive
        align={align}
        sideOffset={sideOffset}
        className="z-50"
        {...props}
      >
        <PopoverPopupPrimitive
          initialFocus={initialFocus}
          finalFocus={finalFocus}
          className={cn(
            'bg-popover text-popover-foreground w-72 rounded-md border p-4 shadow-md outline-hidden origin-(--transform-origin)',
            className,
          )}
          style={style}
        >
          {children}
        </PopoverPopupPrimitive>
      </PopoverPositionerPrimitive>
    </PopoverPortalPrimitive>
  );
}

type PopoverCloseProps = PopoverClosePrimitiveProps;

function PopoverClose(props: PopoverCloseProps) {
  return <PopoverClosePrimitive {...props} />;
}

type PopoverBackdropProps = PopoverBackdropPrimitiveProps;

function PopoverBackdrop(props: PopoverBackdropProps) {
  return <PopoverBackdropPrimitive {...props} />;
}

type PopoverTitleProps = PopoverTitlePrimitiveProps;

function PopoverTitle(props: PopoverTitleProps) {
  return <PopoverTitlePrimitive {...props} />;
}

type PopoverDescriptionProps = PopoverDescriptionPrimitiveProps;

function PopoverDescription(props: PopoverDescriptionProps) {
  return <PopoverDescriptionPrimitive {...props} />;
}

export {
  Popover,
  PopoverTrigger,
  PopoverPanel,
  PopoverClose,
  PopoverBackdrop,
  PopoverTitle,
  PopoverDescription,
  type PopoverProps,
  type PopoverTriggerProps,
  type PopoverPanelProps,
  type PopoverCloseProps,
  type PopoverBackdropProps,
  type PopoverTitleProps,
  type PopoverDescriptionProps,
};
