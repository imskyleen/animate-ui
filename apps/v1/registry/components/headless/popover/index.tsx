import * as React from 'react';

import {
  Popover as PopoverPrimitive,
  PopoverButton as PopoverButtonPrimitive,
  PopoverPanel as PopoverPanelPrimitive,
  PopoverBackdrop as PopoverBackdropPrimitive,
  PopoverGroup as PopoverGroupPrimitive,
  type PopoverProps as PopoverPrimitiveProps,
  type PopoverButtonProps as PopoverButtonPrimitiveProps,
  type PopoverPanelProps as PopoverPanelPrimitiveProps,
  type PopoverBackdropProps as PopoverBackdropPrimitiveProps,
  type PopoverGroupProps as PopoverGroupPrimitiveProps,
} from '@/registry/primitives/headless/popover';
import { cn } from '@workspace/ui/lib/utils';

type PopoverProps<TTag extends React.ElementType = 'div'> =
  PopoverPrimitiveProps<TTag>;

function Popover<TTag extends React.ElementType = 'div'>(
  props: PopoverProps<TTag>,
) {
  return <PopoverPrimitive {...props} />;
}

type PopoverButtonProps<TTag extends React.ElementType = 'button'> =
  PopoverButtonPrimitiveProps<TTag>;

function PopoverButton<TTag extends React.ElementType = 'button'>(
  props: PopoverButtonProps<TTag>,
) {
  return <PopoverButtonPrimitive {...props} />;
}

type PopoverPanelProps<TTag extends React.ElementType = 'div'> =
  PopoverPanelPrimitiveProps<TTag>;

function PopoverPanel<TTag extends React.ElementType = 'div'>({
  className,
  anchor = { to: 'bottom', gap: 4 },
  ...props
}: PopoverPanelProps<TTag>) {
  return (
    <PopoverPanelPrimitive
      anchor={anchor}
      className={cn(
        'bg-popover text-popover-foreground z-50 w-72 rounded-md border p-4 shadow-md outline-hidden',
        'data-[anchor=top_center]:origin-bottom data-[anchor=top_start]:origin-bottom-left data-[anchor=top_end]:origin-bottom-right',
        'data-[anchor=bottom_center]:origin-top data-[anchor=bottom_start]:origin-top-left data-[anchor=bottom_end]:origin-top-right',
        'data-[anchor=left_center]:origin-right data-[anchor=left_start]:origin-top-right data-[anchor=left_end]:origin-bottom-right',
        'data-[anchor=right_center]:origin-left data-[anchor=right_start]:origin-top-left data-[anchor=right_end]:origin-bottom-left',
        className,
      )}
      {...props}
    />
  );
}

type PopoverBackdropProps<TTag extends React.ElementType = 'div'> =
  PopoverBackdropPrimitiveProps<TTag>;

function PopoverBackdrop<TTag extends React.ElementType = 'div'>(
  props: PopoverBackdropProps<TTag>,
) {
  return <PopoverBackdropPrimitive {...props} />;
}

type PopoverGroupProps<TTag extends React.ElementType = 'div'> =
  PopoverGroupPrimitiveProps<TTag>;

function PopoverGroup<TTag extends React.ElementType = 'div'>(
  props: PopoverGroupProps<TTag>,
) {
  return <PopoverGroupPrimitive {...props} />;
}

export {
  Popover,
  PopoverButton,
  PopoverPanel,
  PopoverBackdrop,
  PopoverGroup,
  type PopoverProps,
  type PopoverButtonProps,
  type PopoverPanelProps,
  type PopoverBackdropProps,
  type PopoverGroupProps,
};
