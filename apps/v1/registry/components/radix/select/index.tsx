import * as React from 'react';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import {
  Select as SelectPrimitive,
  SelectTrigger as SelectTriggerPrimitive,
  SelectValue as SelectValuePrimitive,
  SelectIcon as SelectIconPrimitive,
  SelectPortal as SelectPortalPrimitive,
  SelectContent as SelectContentPrimitive,
  SelectViewport as SelectViewportPrimitive,
  SelectGroup as SelectGroupPrimitive,
  SelectLabel as SelectLabelPrimitive,
  SelectItem as SelectItemPrimitive,
  SelectItemText as SelectItemTextPrimitive,
  SelectItemIndicator as SelectItemIndicatorPrimitive,
  SelectSeparator as SelectSeparatorPrimitive,
  SelectScrollUpButton as SelectScrollUpButtonPrimitive,
  SelectScrollDownButton as SelectScrollDownButtonPrimitive,
  type SelectProps as SelectPrimitiveProps,
  type SelectTriggerProps as SelectTriggerPrimitiveProps,
  type SelectValueProps as SelectValuePrimitiveProps,
  type SelectContentProps as SelectContentPrimitiveProps,
  type SelectGroupProps as SelectGroupPrimitiveProps,
  type SelectLabelProps as SelectLabelPrimitiveProps,
  type SelectItemProps as SelectItemPrimitiveProps,
  type SelectSeparatorProps as SelectSeparatorPrimitiveProps,
  type SelectScrollUpButtonProps as SelectScrollUpButtonPrimitiveProps,
  type SelectScrollDownButtonProps as SelectScrollDownButtonPrimitiveProps,
} from '@/registry/primitives/radix/select';
import { cn } from '@workspace/ui/lib/utils';

type SelectProps = SelectPrimitiveProps;

function Select(props: SelectProps) {
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
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <SelectIconPrimitive asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectIconPrimitive>
    </SelectTriggerPrimitive>
  );
}

type SelectContentProps = SelectContentPrimitiveProps;

function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: SelectContentProps) {
  return (
    <SelectPortalPrimitive>
      <SelectContentPrimitive
        className={cn(
          'bg-popover text-popover-foreground relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border shadow-md',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectViewportPrimitive
          className={cn(
            'p-1',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1',
          )}
        >
          {children}
        </SelectViewportPrimitive>
        <SelectScrollDownButton />
      </SelectContentPrimitive>
    </SelectPortalPrimitive>
  );
}

type SelectLabelProps = SelectLabelPrimitiveProps;

function SelectLabel({ className, ...props }: SelectLabelProps) {
  return (
    <SelectLabelPrimitive
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
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectItemIndicatorPrimitive>
          <CheckIcon className="size-4" />
        </SelectItemIndicatorPrimitive>
      </span>
      <SelectItemTextPrimitive>{children}</SelectItemTextPrimitive>
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

type SelectScrollUpButtonProps = SelectScrollUpButtonPrimitiveProps;

function SelectScrollUpButton({
  className,
  ...props
}: SelectScrollUpButtonProps) {
  return (
    <SelectScrollUpButtonPrimitive
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectScrollUpButtonPrimitive>
  );
}

type SelectScrollDownButtonProps = SelectScrollDownButtonPrimitiveProps;

function SelectScrollDownButton({
  className,
  ...props
}: SelectScrollDownButtonProps) {
  return (
    <SelectScrollDownButtonPrimitive
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectScrollDownButtonPrimitive>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type SelectProps,
  type SelectContentProps,
  type SelectGroupProps,
  type SelectItemProps,
  type SelectLabelProps,
  type SelectScrollDownButtonProps,
  type SelectScrollUpButtonProps,
  type SelectSeparatorProps,
  type SelectTriggerProps,
  type SelectValueProps,
};
