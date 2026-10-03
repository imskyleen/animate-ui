import * as React from 'react';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import {
  Select as SelectPrimitive,
  SelectTrigger as SelectTriggerPrimitive,
  SelectValue as SelectValuePrimitive,
  SelectIcon as SelectIconPrimitive,
  SelectPortal as SelectPortalPrimitive,
  SelectPositioner as SelectPositionerPrimitive,
  SelectPopup as SelectPopupPrimitive,
  SelectList as SelectListPrimitive,
  SelectItem as SelectItemPrimitive,
  SelectItemText as SelectItemTextPrimitive,
  SelectItemIndicator as SelectItemIndicatorPrimitive,
  SelectScrollUpArrow as SelectScrollUpArrowPrimitive,
  SelectScrollDownArrow as SelectScrollDownArrowPrimitive,
  SelectGroup as SelectGroupPrimitive,
  SelectGroupLabel as SelectGroupLabelPrimitive,
  SelectSeparator as SelectSeparatorPrimitive,
  type SelectProps as SelectPrimitiveProps,
  type SelectTriggerProps as SelectTriggerPrimitiveProps,
  type SelectValueProps as SelectValuePrimitiveProps,
  type SelectPositionerProps as SelectPositionerPrimitiveProps,
  type SelectPopupProps as SelectPopupPrimitiveProps,
  type SelectItemProps as SelectItemPrimitiveProps,
  type SelectScrollUpArrowProps as SelectScrollUpArrowPrimitiveProps,
  type SelectScrollDownArrowProps as SelectScrollDownArrowPrimitiveProps,
  type SelectGroupProps as SelectGroupPrimitiveProps,
  type SelectGroupLabelProps as SelectGroupLabelPrimitiveProps,
  type SelectSeparatorProps as SelectSeparatorPrimitiveProps,
} from '@/registry/primitives/base/select';
import { cn } from '@workspace/ui/lib/utils';

type SelectProps<
  Value = unknown,
  Multiple extends boolean | undefined = false,
> = SelectPrimitiveProps<Value, Multiple>;

function Select<Value, Multiple extends boolean | undefined = false>(
  props: SelectProps<Value, Multiple>,
) {
  return <SelectPrimitive {...props} />;
}

type SelectGroupProps = SelectGroupPrimitiveProps;

function SelectGroup(props: SelectGroupProps) {
  return <SelectGroupPrimitive {...props} />;
}

type SelectValueProps = SelectValuePrimitiveProps;

function SelectValue(props: SelectValueProps) {
  return <SelectValuePrimitive {...props} />;
}

type SelectTriggerProps = SelectTriggerPrimitiveProps & {
  size?: 'sm' | 'default';
};

function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: SelectTriggerProps) {
  return (
    <SelectTriggerPrimitive
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <SelectIconPrimitive
        render={<ChevronDownIcon className="size-4 opacity-50" />}
      />
    </SelectTriggerPrimitive>
  );
}

type SelectPanelProps = SelectPositionerPrimitiveProps &
  SelectPopupPrimitiveProps;

function SelectPanel({
  className,
  children,
  side = 'bottom',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  alignItemWithTrigger = true,
  finalFocus,
  transition,
  style,
  ...props
}: SelectPanelProps) {
  return (
    <SelectPortalPrimitive>
      <SelectPositionerPrimitive
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="z-50"
        {...props}
      >
        <SelectPopupPrimitive
          finalFocus={finalFocus}
          transition={transition}
          className={cn(
            'bg-popover text-popover-foreground relative max-h-(--available-height) min-w-[max(8rem,var(--anchor-width))] overflow-hidden rounded-md border shadow-md outline-none',
            className,
          )}
          style={style}
        >
          <SelectScrollUpArrow />
          <SelectListPrimitive className="max-h-(--available-height) scroll-py-6 overflow-y-auto p-1">
            {children}
          </SelectListPrimitive>
          <SelectScrollDownArrow />
        </SelectPopupPrimitive>
      </SelectPositionerPrimitive>
    </SelectPortalPrimitive>
  );
}

type SelectGroupLabelProps = SelectGroupLabelPrimitiveProps;

function SelectGroupLabel({ className, ...props }: SelectGroupLabelProps) {
  return (
    <SelectGroupLabelPrimitive
      className={cn('text-muted-foreground px-2 py-1.5 text-xs', className)}
      {...props}
    />
  );
}

type SelectItemProps = SelectItemPrimitiveProps;

function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <SelectItemPrimitive
      className={cn(
        "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectItemIndicatorPrimitive>
          <CheckIcon className="size-4" />
        </SelectItemIndicatorPrimitive>
      </span>
      <SelectItemTextPrimitive className="flex items-center gap-2">
        {children}
      </SelectItemTextPrimitive>
    </SelectItemPrimitive>
  );
}

type SelectSeparatorProps = SelectSeparatorPrimitiveProps;

function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <SelectSeparatorPrimitive
      className={cn('bg-border pointer-events-none -mx-1 my-1 h-px', className)}
      {...props}
    />
  );
}

type SelectScrollUpArrowProps = SelectScrollUpArrowPrimitiveProps;

function SelectScrollUpArrow({
  className,
  ...props
}: SelectScrollUpArrowProps) {
  return (
    <SelectScrollUpArrowPrimitive
      className={cn(
        'bg-popover top-0 z-10 flex w-full cursor-default items-center justify-center py-1',
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectScrollUpArrowPrimitive>
  );
}

type SelectScrollDownArrowProps = SelectScrollDownArrowPrimitiveProps;

function SelectScrollDownArrow({
  className,
  ...props
}: SelectScrollDownArrowProps) {
  return (
    <SelectScrollDownArrowPrimitive
      className={cn(
        'bg-popover bottom-0 z-10 flex w-full cursor-default items-center justify-center py-1',
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectScrollDownArrowPrimitive>
  );
}

export {
  Select,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectPanel,
  SelectScrollDownArrow,
  SelectScrollUpArrow,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type SelectProps,
  type SelectGroupProps,
  type SelectGroupLabelProps,
  type SelectItemProps,
  type SelectPanelProps,
  type SelectScrollDownArrowProps,
  type SelectScrollUpArrowProps,
  type SelectSeparatorProps,
  type SelectTriggerProps,
  type SelectValueProps,
};
