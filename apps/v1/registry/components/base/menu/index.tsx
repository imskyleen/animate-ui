import * as React from 'react';

import {
  Menu as MenuPrimitive,
  MenuTrigger as MenuTriggerPrimitive,
  MenuPortal as MenuPortalPrimitive,
  MenuPopup as MenuPopupPrimitive,
  MenuPositioner as MenuPositionerPrimitive,
  MenuGroup as MenuGroupPrimitive,
  MenuGroupLabel as MenuGroupLabelPrimitive,
  MenuArrow as MenuArrowPrimitive,
  MenuItem as MenuItemPrimitive,
  MenuCheckboxItem as MenuCheckboxItemPrimitive,
  MenuCheckboxItemIndicator as MenuCheckboxItemIndicatorPrimitive,
  MenuRadioGroup as MenuRadioGroupPrimitive,
  MenuRadioItem as MenuRadioItemPrimitive,
  MenuRadioItemIndicator as MenuRadioItemIndicatorPrimitive,
  MenuHighlightItem as MenuHighlightItemPrimitive,
  MenuHighlight as MenuHighlightPrimitive,
  MenuSeparator as MenuSeparatorPrimitive,
  MenuShortcut as MenuShortcutPrimitive,
  MenuSubmenu as MenuSubmenuPrimitive,
  MenuSubmenuTrigger as MenuSubmenuTriggerPrimitive,
  type MenuProps as MenuPrimitiveProps,
  type MenuTriggerProps as MenuTriggerPrimitiveProps,
  type MenuPortalProps as MenuPortalPrimitiveProps,
  type MenuPopupProps as MenuPopupPrimitiveProps,
  type MenuPositionerProps as MenuPositionerPrimitiveProps,
  type MenuGroupProps as MenuGroupPrimitiveProps,
  type MenuGroupLabelProps as MenuGroupLabelPrimitiveProps,
  type MenuArrowProps as MenuArrowPrimitiveProps,
  type MenuItemProps as MenuItemPrimitiveProps,
  type MenuCheckboxItemProps as MenuCheckboxItemPrimitiveProps,
  type MenuRadioGroupProps as MenuRadioGroupPrimitiveProps,
  type MenuRadioItemProps as MenuRadioItemPrimitiveProps,
  type MenuSeparatorProps as MenuSeparatorPrimitiveProps,
  type MenuShortcutProps as MenuShortcutPrimitiveProps,
  type MenuSubmenuProps as MenuSubmenuPrimitiveProps,
  type MenuSubmenuTriggerProps as MenuSubmenuTriggerPrimitiveProps,
} from '@/registry/primitives/base/menu';
import { cn } from '@workspace/ui/lib/utils';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';

type MenuProps = MenuPrimitiveProps;

function Menu(props: MenuProps) {
  return <MenuPrimitive {...props} />;
}

type MenuTriggerProps = MenuTriggerPrimitiveProps;

function MenuTrigger(props: MenuTriggerProps) {
  return <MenuTriggerPrimitive {...props} />;
}

type MenuPortalProps = MenuPortalPrimitiveProps;

function MenuPortal(props: MenuPortalProps) {
  return <MenuPortalPrimitive {...props} />;
}

type MenuPanelProps = MenuPopupPrimitiveProps & MenuPositionerPrimitiveProps;

function MenuPanel({
  className,
  finalFocus,
  id,
  children,
  sideOffset = 4,
  transition = { duration: 0.2 },
  ...props
}: MenuPanelProps) {
  return (
    <MenuPortal>
      <MenuPositionerPrimitive
        className="z-50"
        sideOffset={sideOffset}
        {...props}
      >
        <MenuPopupPrimitive
          finalFocus={finalFocus}
          transition={transition}
          id={id}
          className={cn(
            'bg-popover text-popover-foreground max-h-(--available-height) min-w-[8rem] origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md outline-none',
            className,
          )}
        >
          <MenuHighlightPrimitive className="absolute inset-0 bg-accent z-0 rounded-sm">
            {children}
          </MenuHighlightPrimitive>
        </MenuPopupPrimitive>
      </MenuPositionerPrimitive>
    </MenuPortal>
  );
}

type MenuGroupProps = MenuGroupPrimitiveProps;

function MenuGroup(props: MenuGroupProps) {
  return <MenuGroupPrimitive {...props} />;
}

type MenuGroupLabelProps = MenuGroupLabelPrimitiveProps & {
  inset?: boolean;
};

function MenuGroupLabel({ className, inset, ...props }: MenuGroupLabelProps) {
  return (
    <MenuGroupLabelPrimitive
      data-inset={inset}
      className={cn(
        'px-2 py-1.5 text-sm font-medium data-[inset]:pl-8',
        className,
      )}
      {...props}
    />
  );
}

type MenuItemProps = MenuItemPrimitiveProps & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
};

function MenuItem({
  className,
  inset,
  variant = 'default',
  disabled,
  ...props
}: MenuItemProps) {
  return (
    <MenuHighlightItemPrimitive
      activeClassName={
        variant === 'destructive'
          ? 'bg-destructive/10 dark:bg-destructive/20'
          : ''
      }
      disabled={disabled}
    >
      <MenuItemPrimitive
        disabled={disabled}
        data-inset={inset}
        data-variant={variant}
        className={cn(
          "focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className,
        )}
        {...props}
      />
    </MenuHighlightItemPrimitive>
  );
}

type MenuCheckboxItemProps = MenuCheckboxItemPrimitiveProps;

function MenuCheckboxItem({
  className,
  children,
  checked,
  disabled,
  ...props
}: MenuCheckboxItemProps) {
  return (
    <MenuHighlightItemPrimitive disabled={disabled}>
      <MenuCheckboxItemPrimitive
        disabled={disabled}
        className={cn(
          "focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className,
        )}
        checked={checked}
        {...props}
      >
        <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
          <MenuCheckboxItemIndicatorPrimitive
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <CheckIcon className="size-4" />
          </MenuCheckboxItemIndicatorPrimitive>
        </span>
        {children}
      </MenuCheckboxItemPrimitive>
    </MenuHighlightItemPrimitive>
  );
}

type MenuRadioGroupProps = MenuRadioGroupPrimitiveProps;

function MenuRadioGroup(props: MenuRadioGroupProps) {
  return <MenuRadioGroupPrimitive {...props} />;
}

type MenuRadioItemProps = MenuRadioItemPrimitiveProps;

function MenuRadioItem({
  className,
  children,
  disabled,
  ...props
}: MenuRadioItemProps) {
  return (
    <MenuHighlightItemPrimitive disabled={disabled}>
      <MenuRadioItemPrimitive
        disabled={disabled}
        className={cn(
          "focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className,
        )}
        {...props}
      >
        <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
          <MenuRadioItemIndicatorPrimitive layoutId="dropdown-menu-item-indicator-radio">
            <CircleIcon className="size-2 fill-current" />
          </MenuRadioItemIndicatorPrimitive>
        </span>
        {children}
      </MenuRadioItemPrimitive>
    </MenuHighlightItemPrimitive>
  );
}

type MenuSeparatorProps = MenuSeparatorPrimitiveProps;

function MenuSeparator({ className, ...props }: MenuSeparatorProps) {
  return (
    <MenuSeparatorPrimitive
      className={cn('bg-border -mx-1 my-1 h-px', className)}
      {...props}
    />
  );
}

type MenuShortcutProps = MenuShortcutPrimitiveProps;

function MenuShortcut({ className, ...props }: MenuShortcutProps) {
  return (
    <MenuShortcutPrimitive
      className={cn(
        'text-muted-foreground ml-auto text-xs tracking-widest',
        className,
      )}
      {...props}
    />
  );
}

type MenuArrowProps = MenuArrowPrimitiveProps;

function MenuArrow(props: MenuArrowProps) {
  return <MenuArrowPrimitive {...props} />;
}

type MenuSubmenuProps = MenuSubmenuPrimitiveProps;

function MenuSubmenu(props: MenuSubmenuProps) {
  return <MenuSubmenuPrimitive {...props} />;
}

type MenuSubmenuTriggerProps = MenuSubmenuTriggerPrimitiveProps & {
  inset?: boolean;
  children?: React.ReactNode;
};

function MenuSubmenuTrigger({
  disabled,
  className,
  inset,
  children,
  ...props
}: MenuSubmenuTriggerProps) {
  return (
    <MenuHighlightItemPrimitive disabled={disabled}>
      <MenuSubmenuTriggerPrimitive
        disabled={disabled}
        data-inset={inset}
        className={cn(
          'focus:text-accent-foreground data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8',
          'aria-[expanded=true]:[&_[data-slot=chevron]]:rotate-90 [&_[data-slot=chevron]]:transition-transform [&_[data-slot=chevron]]:duration-300 [&_[data-slot=chevron]]:ease-in-out',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronRightIcon data-slot="chevron" className="ml-auto size-4" />
      </MenuSubmenuTriggerPrimitive>
    </MenuHighlightItemPrimitive>
  );
}

type MenuSubmenuPanelProps = MenuPopupPrimitiveProps &
  MenuPositionerPrimitiveProps;

function MenuSubmenuPanel({
  className,
  finalFocus,
  id,
  children,
  sideOffset = 4,
  transition = { duration: 0.2 },
  ...props
}: MenuSubmenuPanelProps) {
  return (
    <MenuPortal>
      <MenuPositionerPrimitive
        className="z-50"
        sideOffset={sideOffset}
        {...props}
      >
        <MenuPopupPrimitive
          finalFocus={finalFocus}
          transition={transition}
          id={id}
          className={cn(
            'bg-popover text-popover-foreground max-h-(--available-height) min-w-[8rem] origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md',
            className,
          )}
        >
          {children}
        </MenuPopupPrimitive>
      </MenuPositionerPrimitive>
    </MenuPortal>
  );
}

export {
  Menu,
  MenuTrigger,
  MenuPortal,
  MenuPanel,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuArrow,
  MenuSubmenu,
  MenuSubmenuTrigger,
  MenuSubmenuPanel,
  type MenuProps,
  type MenuTriggerProps,
  type MenuPortalProps,
  type MenuPanelProps,
  type MenuGroupProps,
  type MenuGroupLabelProps,
  type MenuItemProps,
  type MenuCheckboxItemProps,
  type MenuRadioGroupProps,
  type MenuRadioItemProps,
  type MenuSeparatorProps,
  type MenuShortcutProps,
  type MenuArrowProps,
  type MenuSubmenuProps,
  type MenuSubmenuTriggerProps,
  type MenuSubmenuPanelProps,
};
