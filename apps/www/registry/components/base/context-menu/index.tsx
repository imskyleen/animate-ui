import * as React from 'react';

import {
  ContextMenu as ContextMenuPrimitive,
  ContextMenuTrigger as ContextMenuTriggerPrimitive,
  ContextMenuPortal as ContextMenuPortalPrimitive,
  ContextMenuPositioner as ContextMenuPositionerPrimitive,
  ContextMenuPopup as ContextMenuPopupPrimitive,
  ContextMenuHighlight as ContextMenuHighlightPrimitive,
  ContextMenuHighlightItem as ContextMenuHighlightItemPrimitive,
  ContextMenuItem as ContextMenuItemPrimitive,
  ContextMenuCheckboxItem as ContextMenuCheckboxItemPrimitive,
  ContextMenuCheckboxItemIndicator as ContextMenuCheckboxItemIndicatorPrimitive,
  ContextMenuRadioGroup as ContextMenuRadioGroupPrimitive,
  ContextMenuRadioItem as ContextMenuRadioItemPrimitive,
  ContextMenuRadioItemIndicator as ContextMenuRadioItemIndicatorPrimitive,
  ContextMenuGroup as ContextMenuGroupPrimitive,
  ContextMenuGroupLabel as ContextMenuGroupLabelPrimitive,
  ContextMenuSeparator as ContextMenuSeparatorPrimitive,
  ContextMenuShortcut as ContextMenuShortcutPrimitive,
  ContextMenuSubmenu as ContextMenuSubmenuPrimitive,
  ContextMenuSubmenuTrigger as ContextMenuSubmenuTriggerPrimitive,
  type ContextMenuProps as ContextMenuPrimitiveProps,
  type ContextMenuTriggerProps as ContextMenuTriggerPrimitiveProps,
  type ContextMenuPortalProps as ContextMenuPortalPrimitiveProps,
  type ContextMenuPositionerProps as ContextMenuPositionerPrimitiveProps,
  type ContextMenuPopupProps as ContextMenuPopupPrimitiveProps,
  type ContextMenuItemProps as ContextMenuItemPrimitiveProps,
  type ContextMenuCheckboxItemProps as ContextMenuCheckboxItemPrimitiveProps,
  type ContextMenuRadioGroupProps as ContextMenuRadioGroupPrimitiveProps,
  type ContextMenuRadioItemProps as ContextMenuRadioItemPrimitiveProps,
  type ContextMenuGroupProps as ContextMenuGroupPrimitiveProps,
  type ContextMenuGroupLabelProps as ContextMenuGroupLabelPrimitiveProps,
  type ContextMenuSeparatorProps as ContextMenuSeparatorPrimitiveProps,
  type ContextMenuShortcutProps as ContextMenuShortcutPrimitiveProps,
  type ContextMenuSubmenuProps as ContextMenuSubmenuPrimitiveProps,
  type ContextMenuSubmenuTriggerProps as ContextMenuSubmenuTriggerPrimitiveProps,
} from '@/registry/primitives/base/context-menu';
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

type ContextMenuPortalProps = ContextMenuPortalPrimitiveProps;

function ContextMenuPortal(props: ContextMenuPortalProps) {
  return <ContextMenuPortalPrimitive {...props} />;
}

type ContextMenuPanelProps = ContextMenuPopupPrimitiveProps &
  ContextMenuPositionerPrimitiveProps;

function ContextMenuPanel({
  className,
  finalFocus,
  id,
  transition,
  children,
  ...props
}: ContextMenuPanelProps) {
  return (
    <ContextMenuPortal>
      <ContextMenuPositionerPrimitive className="z-50" {...props}>
        <ContextMenuPopupPrimitive
          finalFocus={finalFocus}
          id={id}
          transition={transition}
          className={cn(
            'bg-popover text-popover-foreground max-h-(--available-height) min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md outline-none',
            className,
          )}
        >
          <ContextMenuHighlightPrimitive className="absolute inset-0 z-0 rounded-sm bg-accent">
            {children}
          </ContextMenuHighlightPrimitive>
        </ContextMenuPopupPrimitive>
      </ContextMenuPositionerPrimitive>
    </ContextMenuPortal>
  );
}

type ContextMenuGroupProps = ContextMenuGroupPrimitiveProps;

function ContextMenuGroup(props: ContextMenuGroupProps) {
  return <ContextMenuGroupPrimitive {...props} />;
}

type ContextMenuGroupLabelProps = ContextMenuGroupLabelPrimitiveProps & {
  inset?: boolean;
};

function ContextMenuGroupLabel({
  className,
  inset,
  ...props
}: ContextMenuGroupLabelProps) {
  return (
    <ContextMenuGroupLabelPrimitive
      data-inset={inset}
      className={cn(
        'text-foreground px-2 py-1.5 text-sm font-medium data-[inset]:pl-8',
        className,
      )}
      {...props}
    />
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
          "data-[highlighted]:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:data-[highlighted]:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
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
  disabled,
  ...props
}: ContextMenuCheckboxItemProps) {
  return (
    <ContextMenuHighlightItemPrimitive disabled={disabled}>
      <ContextMenuCheckboxItemPrimitive
        disabled={disabled}
        className={cn(
          "data-[highlighted]:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className,
        )}
        {...props}
      >
        <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
          <ContextMenuCheckboxItemIndicatorPrimitive>
            <CheckIcon className="size-4" />
          </ContextMenuCheckboxItemIndicatorPrimitive>
        </span>
        {children}
      </ContextMenuCheckboxItemPrimitive>
    </ContextMenuHighlightItemPrimitive>
  );
}

type ContextMenuRadioGroupProps = ContextMenuRadioGroupPrimitiveProps;

function ContextMenuRadioGroup(props: ContextMenuRadioGroupProps) {
  return <ContextMenuRadioGroupPrimitive {...props} />;
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
          "data-[highlighted]:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className,
        )}
        {...props}
      >
        <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
          <ContextMenuRadioItemIndicatorPrimitive>
            <CircleIcon className="size-2 fill-current" />
          </ContextMenuRadioItemIndicatorPrimitive>
        </span>
        {children}
      </ContextMenuRadioItemPrimitive>
    </ContextMenuHighlightItemPrimitive>
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

type ContextMenuSubmenuProps = ContextMenuSubmenuPrimitiveProps;

function ContextMenuSubmenu(props: ContextMenuSubmenuProps) {
  return <ContextMenuSubmenuPrimitive {...props} />;
}

type ContextMenuSubmenuTriggerProps =
  ContextMenuSubmenuTriggerPrimitiveProps & {
    inset?: boolean;
    children?: React.ReactNode;
  };

function ContextMenuSubmenuTrigger({
  className,
  inset,
  disabled,
  children,
  ...props
}: ContextMenuSubmenuTriggerProps) {
  return (
    <ContextMenuHighlightItemPrimitive disabled={disabled}>
      <ContextMenuSubmenuTriggerPrimitive
        disabled={disabled}
        data-inset={inset}
        className={cn(
          "data-[highlighted]:text-accent-foreground data-[popup-open]:bg-accent data-[popup-open]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronRightIcon className="ml-auto" />
      </ContextMenuSubmenuTriggerPrimitive>
    </ContextMenuHighlightItemPrimitive>
  );
}

type ContextMenuSubmenuPanelProps = ContextMenuPopupPrimitiveProps &
  ContextMenuPositionerPrimitiveProps;

function ContextMenuSubmenuPanel({
  className,
  finalFocus,
  id,
  transition,
  children,
  ...props
}: ContextMenuSubmenuPanelProps) {
  return (
    <ContextMenuPortal>
      <ContextMenuPositionerPrimitive className="z-50" {...props}>
        <ContextMenuPopupPrimitive
          finalFocus={finalFocus}
          id={id}
          transition={transition}
          className={cn(
            'bg-popover text-popover-foreground max-h-(--available-height) min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-lg outline-none',
            className,
          )}
        >
          <ContextMenuHighlightPrimitive className="absolute inset-0 z-0 rounded-sm bg-accent">
            {children}
          </ContextMenuHighlightPrimitive>
        </ContextMenuPopupPrimitive>
      </ContextMenuPositionerPrimitive>
    </ContextMenuPortal>
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuPortal,
  ContextMenuPanel,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSubmenu,
  ContextMenuSubmenuTrigger,
  ContextMenuSubmenuPanel,
  type ContextMenuProps,
  type ContextMenuTriggerProps,
  type ContextMenuPortalProps,
  type ContextMenuPanelProps,
  type ContextMenuGroupProps,
  type ContextMenuGroupLabelProps,
  type ContextMenuItemProps,
  type ContextMenuCheckboxItemProps,
  type ContextMenuRadioGroupProps,
  type ContextMenuRadioItemProps,
  type ContextMenuSeparatorProps,
  type ContextMenuShortcutProps,
  type ContextMenuSubmenuProps,
  type ContextMenuSubmenuTriggerProps,
  type ContextMenuSubmenuPanelProps,
};
