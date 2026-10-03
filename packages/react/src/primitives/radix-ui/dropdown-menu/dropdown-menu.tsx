'use client';

import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui';

import {
  createCheckboxItem,
  createContent,
  createItemIndicator,
  createOpenRoot,
  createPortal,
  createRadioGroup,
  createRadioItem,
  type PresenceAnimationProps,
} from '../_menu/menu';

// Same API as Radix's Dropdown Menu. The Root and each Sub mirror their open
// state (Radix keeps it private) so the Content and SubContent can play an
// exit before they unmount.

type DropdownMenuProps = DropdownMenuPrimitive.DropdownMenuProps;
type DropdownMenuTriggerProps = DropdownMenuPrimitive.DropdownMenuTriggerProps;
type DropdownMenuPortalProps = DropdownMenuPrimitive.DropdownMenuPortalProps;
type DropdownMenuContentProps = DropdownMenuPrimitive.DropdownMenuContentProps &
  PresenceAnimationProps;
type DropdownMenuGroupProps = DropdownMenuPrimitive.DropdownMenuGroupProps;
type DropdownMenuLabelProps = DropdownMenuPrimitive.DropdownMenuLabelProps;
type DropdownMenuItemProps = DropdownMenuPrimitive.DropdownMenuItemProps;
type DropdownMenuCheckboxItemProps =
  DropdownMenuPrimitive.DropdownMenuCheckboxItemProps;
type DropdownMenuRadioGroupProps =
  DropdownMenuPrimitive.DropdownMenuRadioGroupProps;
type DropdownMenuRadioItemProps =
  DropdownMenuPrimitive.DropdownMenuRadioItemProps;
type DropdownMenuItemIndicatorProps =
  DropdownMenuPrimitive.DropdownMenuItemIndicatorProps & PresenceAnimationProps;
type DropdownMenuSeparatorProps =
  DropdownMenuPrimitive.DropdownMenuSeparatorProps;
type DropdownMenuArrowProps = DropdownMenuPrimitive.DropdownMenuArrowProps;
type DropdownMenuSubProps = DropdownMenuPrimitive.DropdownMenuSubProps;
type DropdownMenuSubTriggerProps =
  DropdownMenuPrimitive.DropdownMenuSubTriggerProps;
type DropdownMenuSubContentProps =
  DropdownMenuPrimitive.DropdownMenuSubContentProps & PresenceAnimationProps;

const Root = createOpenRoot(DropdownMenuPrimitive.Root);
const Trigger = DropdownMenuPrimitive.Trigger;
const Portal = createPortal(DropdownMenuPrimitive.Portal);
const Content = createContent(DropdownMenuPrimitive.Content, {
  origin: '--radix-dropdown-menu-content-transform-origin',
  returnFocus: 'trigger',
});
const Group = DropdownMenuPrimitive.Group;
const Label = DropdownMenuPrimitive.Label;
const Item = DropdownMenuPrimitive.Item;
const CheckboxItem = createCheckboxItem(DropdownMenuPrimitive.CheckboxItem);
const RadioGroup = createRadioGroup(DropdownMenuPrimitive.RadioGroup);
const RadioItem = createRadioItem(DropdownMenuPrimitive.RadioItem);
const ItemIndicator = createItemIndicator(DropdownMenuPrimitive.ItemIndicator);
const Separator = DropdownMenuPrimitive.Separator;
const Arrow = DropdownMenuPrimitive.Arrow;
const Sub = createOpenRoot(DropdownMenuPrimitive.Sub);
const SubTrigger = DropdownMenuPrimitive.SubTrigger;
const SubContent = createContent(DropdownMenuPrimitive.SubContent, {
  // Radix sets the same variable on submenus: they grow from their side.
  origin: '--radix-dropdown-menu-content-transform-origin',
  sub: true,
  returnFocus: 'none',
});

const createDropdownMenuScope: typeof DropdownMenuPrimitive.createDropdownMenuScope =
  DropdownMenuPrimitive.createDropdownMenuScope;

export {
  Root,
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
  // `DropdownMenu` is Radix's alias of Root: with the radix-ui import style,
  // `DropdownMenuPrimitive.DropdownMenu` keeps working.
  Root as DropdownMenu,
  Trigger as DropdownMenuTrigger,
  Portal as DropdownMenuPortal,
  Content as DropdownMenuContent,
  Group as DropdownMenuGroup,
  Label as DropdownMenuLabel,
  Item as DropdownMenuItem,
  CheckboxItem as DropdownMenuCheckboxItem,
  RadioGroup as DropdownMenuRadioGroup,
  RadioItem as DropdownMenuRadioItem,
  ItemIndicator as DropdownMenuItemIndicator,
  Separator as DropdownMenuSeparator,
  Arrow as DropdownMenuArrow,
  Sub as DropdownMenuSub,
  SubTrigger as DropdownMenuSubTrigger,
  SubContent as DropdownMenuSubContent,
  createDropdownMenuScope,
  type DropdownMenuProps,
  type DropdownMenuTriggerProps,
  type DropdownMenuPortalProps,
  type DropdownMenuContentProps,
  type DropdownMenuGroupProps,
  type DropdownMenuLabelProps,
  type DropdownMenuItemProps,
  type DropdownMenuCheckboxItemProps,
  type DropdownMenuRadioGroupProps,
  type DropdownMenuRadioItemProps,
  type DropdownMenuItemIndicatorProps,
  type DropdownMenuSeparatorProps,
  type DropdownMenuArrowProps,
  type DropdownMenuSubProps,
  type DropdownMenuSubTriggerProps,
  type DropdownMenuSubContentProps,
};
