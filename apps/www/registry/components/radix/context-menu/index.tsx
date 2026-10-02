import * as React from 'react';

import {
  ContextMenu as ContextMenuPrimitive,
  ContextMenuTrigger as ContextMenuTriggerPrimitive,
  ContextMenuPortal as ContextMenuPortalPrimitive,
  ContextMenuContent as ContextMenuContentPrimitive,
  ContextMenuHighlight as ContextMenuHighlightPrimitive,
  ContextMenuHighlightItem as ContextMenuHighlightItemPrimitive,
  ContextMenuItem as ContextMenuItemPrimitive,
  ContextMenuCheckboxItem as ContextMenuCheckboxItemPrimitive,
  ContextMenuRadioGroup as ContextMenuRadioGroupPrimitive,
  ContextMenuRadioItem as ContextMenuRadioItemPrimitive,
  ContextMenuItemIndicator as ContextMenuItemIndicatorPrimitive,
  ContextMenuLabel as ContextMenuLabelPrimitive,
  ContextMenuSeparator as ContextMenuSeparatorPrimitive,
  ContextMenuShortcut as ContextMenuShortcutPrimitive,
  ContextMenuGroup as ContextMenuGroupPrimitive,
  ContextMenuSub as ContextMenuSubPrimitive,
  ContextMenuSubTrigger as ContextMenuSubTriggerPrimitive,
  ContextMenuSubContent as ContextMenuSubContentPrimitive,
  type ContextMenuProps as ContextMenuPrimitiveProps,
  type ContextMenuTriggerProps as ContextMenuTriggerPrimitiveProps,
  type ContextMenuPortalProps as ContextMenuPortalPrimitiveProps,
  type ContextMenuContentProps as ContextMenuContentPrimitiveProps,
  type ContextMenuItemProps as ContextMenuItemPrimitiveProps,
  type ContextMenuCheckboxItemProps as ContextMenuCheckboxItemPrimitiveProps,
  type ContextMenuRadioGroupProps as ContextMenuRadioGroupPrimitiveProps,
  type ContextMenuRadioItemProps as ContextMenuRadioItemPrimitiveProps,
  type ContextMenuLabelProps as ContextMenuLabelPrimitiveProps,
  type ContextMenuSeparatorProps as ContextMenuSeparatorPrimitiveProps,
  type ContextMenuShortcutProps as ContextMenuShortcutPrimitiveProps,
  type ContextMenuGroupProps as ContextMenuGroupPrimitiveProps,
  type ContextMenuSubProps as ContextMenuSubPrimitiveProps,
  type ContextMenuSubTriggerProps as ContextMenuSubTriggerPrimitiveProps,
  type ContextMenuSubContentProps as ContextMenuSubContentPrimitiveProps,
} from '@/registry/primitives/radix/context-menu';
import { cn } from '@workspace/ui/lib/utils';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';

type ContextMenuProps = ContextMenuPrimitiveProps;

function ContextMenu(props: ContextMenuProps) {
  return <ContextMenuPrimitive {...props} />;
}

type ContextMenuTriggerProps = ContextMenuTriggerPrimitiveProps;

function ContextMenuTrigger(props: ContextMenuTriggerProps) {
  return <ContextMenuTriggerPrimitive {...props} />;
}

type ContextMenuGroupProps = ContextMenuGroupPrimitiveProps;

function ContextMenuGroup(props: ContextMenuGroupProps) {
  return <ContextMenuGroupPrimitive {...props} />;
}

type ContextMenuPortalProps = ContextMenuPortalPrimitiveProps;

function ContextMenuPortal(props: ContextMenuPortalProps) {
  return <ContextMenuPortalPrimitive {...props} />;
}

type ContextMenuSubProps = ContextMenuSubPrimitiveProps;

function ContextMenuSub(props: ContextMenuSubProps) {
  return <ContextMenuSubPrimitive {...props} />;
}

type ContextMenuRadioGroupProps = ContextMenuRadioGroupPrimitiveProps;

function ContextMenuRadioGroup(props: ContextMenuRadioGroupProps) {
  return <ContextMenuRadioGroupPrimitive {...props} />;
}

type ContextMenuSubTriggerProps = ContextMenuSubTriggerPrimitiveProps & {
  inset?: boolean;
};

function ContextMenuSubTrigger({
  className,
  inset,
  disabled,
  children,
  ...props
}: ContextMenuSubTriggerProps) {
  return (
    <ContextMenuHighlightItemPrimitive disabled={disabled}>
      <ContextMenuSubTriggerPrimitive
        disabled={disabled}
        data-inset={inset}
        className={cn(
          "focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronRightIcon className="ml-auto" />
      </ContextMenuSubTriggerPrimitive>
    </ContextMenuHighlightItemPrimitive>
  );
}

type ContextMenuSubContentProps = ContextMenuSubContentPrimitiveProps;

function ContextMenuSubContent({
  className,
  children,
  ...props
}: ContextMenuSubContentProps) {
  return (
    <ContextMenuSubContentPrimitive
      className={cn(
        'bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg outline-none',
        className,
      )}
      {...props}
    >
      <ContextMenuHighlightPrimitive className="absolute inset-0 z-0 rounded-sm bg-accent">
        {children}
      </ContextMenuHighlightPrimitive>
    </ContextMenuSubContentPrimitive>
  );
}

type ContextMenuContentProps = ContextMenuContentPrimitiveProps;

function ContextMenuContent({
  className,
  children,
  ...props
}: ContextMenuContentProps) {
  return (
    <ContextMenuContentPrimitive
      className={cn(
        'bg-popover text-popover-foreground z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md outline-none',
        className,
      )}
      {...props}
    >
      <ContextMenuHighlightPrimitive className="absolute inset-0 z-0 rounded-sm bg-accent">
        {children}
      </ContextMenuHighlightPrimitive>
    </ContextMenuContentPrimitive>
  );
}

type ContextMenuItemProps = ContextMenuItemPrimitiveProps & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
};

function ContextMenuItem({
  className,
  inset,
  variant = 'default',
  disabled,
  ...props
}: ContextMenuItemProps) {
  return (
    <ContextMenuHighlightItemPrimitive
      activeClassName={
        variant === 'destructive'
          ? 'bg-destructive/10 dark:bg-destructive/20'
          : ''
      }
      disabled={disabled}
    >
      <ContextMenuItemPrimitive
        disabled={disabled}
        data-inset={inset}
        data-variant={variant}
        className={cn(
          "focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className,
        )}
        {...props}
      />
    </ContextMenuHighlightItemPrimitive>
  );
}

type ContextMenuCheckboxItemProps = ContextMenuCheckboxItemPrimitiveProps;

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  disabled,
  ...props
}: ContextMenuCheckboxItemProps) {
  return (
    <ContextMenuHighlightItemPrimitive disabled={disabled}>
      <ContextMenuCheckboxItemPrimitive
        disabled={disabled}
        checked={checked}
        className={cn(
          "focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className,
        )}
        {...props}
      >
        <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
          <ContextMenuItemIndicatorPrimitive>
            <CheckIcon className="size-4" />
          </ContextMenuItemIndicatorPrimitive>
        </span>
        {children}
      </ContextMenuCheckboxItemPrimitive>
    </ContextMenuHighlightItemPrimitive>
  );
}

type ContextMenuRadioItemProps = ContextMenuRadioItemPrimitiveProps;

function ContextMenuRadioItem({
  className,
  children,
  disabled,
  ...props
}: ContextMenuRadioItemProps) {
  return (
    <ContextMenuHighlightItemPrimitive disabled={disabled}>
      <ContextMenuRadioItemPrimitive
        disabled={disabled}
        className={cn(
          "focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className,
        )}
        {...props}
      >
        <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
          <ContextMenuItemIndicatorPrimitive>
            <CircleIcon className="size-2 fill-current" />
          </ContextMenuItemIndicatorPrimitive>
        </span>
        {children}
      </ContextMenuRadioItemPrimitive>
    </ContextMenuHighlightItemPrimitive>
  );
}

type ContextMenuLabelProps = ContextMenuLabelPrimitiveProps & {
  inset?: boolean;
};

function ContextMenuLabel({
  className,
  inset,
  ...props
}: ContextMenuLabelProps) {
  return (
    <ContextMenuLabelPrimitive
      data-inset={inset}
      className={cn(
        'text-foreground px-2 py-1.5 text-sm font-medium data-[inset]:pl-8',
        className,
      )}
      {...props}
    />
  );
}

type ContextMenuSeparatorProps = ContextMenuSeparatorPrimitiveProps;

function ContextMenuSeparator({
  className,
  ...props
}: ContextMenuSeparatorProps) {
  return (
    <ContextMenuSeparatorPrimitive
      className={cn('bg-border -mx-1 my-1 h-px', className)}
      {...props}
    />
  );
}

type ContextMenuShortcutProps = ContextMenuShortcutPrimitiveProps;

function ContextMenuShortcut({
  className,
  ...props
}: ContextMenuShortcutProps) {
  return (
    <ContextMenuShortcutPrimitive
      className={cn(
        'text-muted-foreground ml-auto text-xs tracking-widest',
        className,
      )}
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
  type ContextMenuProps,
  type ContextMenuTriggerProps,
  type ContextMenuContentProps,
  type ContextMenuItemProps,
  type ContextMenuCheckboxItemProps,
  type ContextMenuRadioItemProps,
  type ContextMenuLabelProps,
  type ContextMenuSeparatorProps,
  type ContextMenuShortcutProps,
  type ContextMenuGroupProps,
  type ContextMenuPortalProps,
  type ContextMenuSubProps,
  type ContextMenuSubContentProps,
  type ContextMenuSubTriggerProps,
  type ContextMenuRadioGroupProps,
};
