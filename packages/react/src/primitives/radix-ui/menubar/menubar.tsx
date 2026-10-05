'use client';

import * as React from 'react';
import { Menubar as MenubarPrimitive } from 'radix-ui';

import {
  MenuStateContext,
  createCheckboxItem,
  createContent,
  createItem,
  createItemIndicator,
  createOpenRoot,
  createPortal,
  createRadioGroup,
  createRadioItem,
  type IndicatorAnimationProps,
  type PresenceAnimationProps,
} from '../_menu/menu';

// Same API as Radix's Menubar. The Root mirrors which menu is open (Radix
// keeps it private) so each Content can play an exit before it unmounts.
// Radix's Menubar has no Animate UI v1 counterpart: each menu moves like v1's
// DropdownMenu (a 250ms fade and scale, a highlight gliding behind the
// highlighted item), including when moving from one open menu to another.

type MenubarProps = MenubarPrimitive.MenubarProps;
type MenubarMenuProps = MenubarPrimitive.MenubarMenuProps;
type MenubarTriggerProps = MenubarPrimitive.MenubarTriggerProps;
type MenubarPortalProps = MenubarPrimitive.MenubarPortalProps;
type MenubarContentProps = MenubarPrimitive.MenubarContentProps &
  PresenceAnimationProps;
type MenubarGroupProps = MenubarPrimitive.MenubarGroupProps;
type MenubarLabelProps = MenubarPrimitive.MenubarLabelProps;
type MenubarItemProps = MenubarPrimitive.MenubarItemProps;
type MenubarCheckboxItemProps = MenubarPrimitive.MenubarCheckboxItemProps;
type MenubarRadioGroupProps = MenubarPrimitive.MenubarRadioGroupProps;
type MenubarRadioItemProps = MenubarPrimitive.MenubarRadioItemProps;
type MenubarItemIndicatorProps = MenubarPrimitive.MenubarItemIndicatorProps &
  IndicatorAnimationProps;
type MenubarSeparatorProps = MenubarPrimitive.MenubarSeparatorProps;
type MenubarArrowProps = MenubarPrimitive.MenubarArrowProps;
type MenubarSubProps = MenubarPrimitive.MenubarSubProps;
type MenubarSubTriggerProps = MenubarPrimitive.MenubarSubTriggerProps;
type MenubarSubContentProps = MenubarPrimitive.MenubarSubContentProps &
  PresenceAnimationProps;

type MenubarState = {
  /** The value of the open menu ('' when none is). */
  value: string;
};

const MenubarStateContext = React.createContext<MenubarState | null>(null);

function Root({
  value: valueProp,
  defaultValue,
  onValueChange,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  const controlled = valueProp !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? '');
  const value = controlled ? valueProp : uncontrolled;

  return (
    <MenubarStateContext value={{ value }}>
      <MenubarPrimitive.Root
        {...props}
        value={value}
        onValueChange={(next) => {
          if (!controlled) setUncontrolled(next);
          onValueChange?.(next);
        }}
      />
    </MenubarStateContext>
  );
}

function Menu({
  value: valueProp,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  // Radix generates a value when there is none: generate it here so the open
  // state can be read from the Root's value.
  const fallbackId = React.useId();
  const value = valueProp || fallbackId;
  const menubar = React.use(MenubarStateContext);
  if (!menubar) return <MenubarPrimitive.Menu {...props} value={valueProp} />;

  return (
    <MenuStateContext value={{ open: menubar.value === value }}>
      <MenubarPrimitive.Menu {...props} value={value} />
    </MenuStateContext>
  );
}

const Trigger = MenubarPrimitive.Trigger;
const Portal = createPortal(MenubarPrimitive.Portal);
const Content = createContent(MenubarPrimitive.Content, {
  origin: '--radix-menubar-content-transform-origin',
  returnFocus: 'trigger',
});
const Group = MenubarPrimitive.Group;
const Label = MenubarPrimitive.Label;
const Item = createItem(MenubarPrimitive.Item);
const CheckboxItem = createCheckboxItem(MenubarPrimitive.CheckboxItem);
const RadioGroup = createRadioGroup(MenubarPrimitive.RadioGroup);
const RadioItem = createRadioItem(MenubarPrimitive.RadioItem);
const ItemIndicator = createItemIndicator(MenubarPrimitive.ItemIndicator);
const Separator = MenubarPrimitive.Separator;
const Arrow = MenubarPrimitive.Arrow;
const Sub = createOpenRoot(MenubarPrimitive.Sub);
const SubTrigger = createItem(MenubarPrimitive.SubTrigger);
const SubContent = createContent(MenubarPrimitive.SubContent, {
  origin: '--radix-menubar-content-transform-origin',
  sub: true,
  returnFocus: 'none',
});

const createMenubarScope: typeof MenubarPrimitive.createMenubarScope =
  MenubarPrimitive.createMenubarScope;

export {
  Root,
  Menu,
  Trigger,
  Portal,
  Content,
  Group,
  Label,
  Item,
  CheckboxItem,
  RadioGroup,
  RadioItem,
  ItemIndicator,
  Separator,
  Arrow,
  Sub,
  SubTrigger,
  SubContent,
  // `Menubar` is Radix's alias of Root: with the radix-ui import style,
  // `MenubarPrimitive.Menubar` keeps working.
  Root as Menubar,
  Menu as MenubarMenu,
  Trigger as MenubarTrigger,
  Portal as MenubarPortal,
  Content as MenubarContent,
  Group as MenubarGroup,
  Label as MenubarLabel,
  Item as MenubarItem,
  CheckboxItem as MenubarCheckboxItem,
  RadioGroup as MenubarRadioGroup,
  RadioItem as MenubarRadioItem,
  ItemIndicator as MenubarItemIndicator,
  Separator as MenubarSeparator,
  Arrow as MenubarArrow,
  Sub as MenubarSub,
  SubTrigger as MenubarSubTrigger,
  SubContent as MenubarSubContent,
  createMenubarScope,
  type MenubarProps,
  type MenubarMenuProps,
  type MenubarTriggerProps,
  type MenubarPortalProps,
  type MenubarContentProps,
  type MenubarGroupProps,
  type MenubarLabelProps,
  type MenubarItemProps,
  type MenubarCheckboxItemProps,
  type MenubarRadioGroupProps,
  type MenubarRadioItemProps,
  type MenubarItemIndicatorProps,
  type MenubarSeparatorProps,
  type MenubarArrowProps,
  type MenubarSubProps,
  type MenubarSubTriggerProps,
  type MenubarSubContentProps,
};
