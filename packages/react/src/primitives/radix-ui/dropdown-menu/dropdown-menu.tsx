'use client';

import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui';

import {
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
  DropdownMenuPrimitive.DropdownMenuItemIndicatorProps &
    IndicatorAnimationProps;
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
const Item = createItem(DropdownMenuPrimitive.Item);
const CheckboxItem = createCheckboxItem(DropdownMenuPrimitive.CheckboxItem);
const RadioGroup = createRadioGroup(DropdownMenuPrimitive.RadioGroup);
const RadioItem = createRadioItem(DropdownMenuPrimitive.RadioItem);
const ItemIndicator = createItemIndicator(DropdownMenuPrimitive.ItemIndicator);
const Separator = DropdownMenuPrimitive.Separator;
const Arrow = DropdownMenuPrimitive.Arrow;
const Sub = createOpenRoot(DropdownMenuPrimitive.Sub, { sub: true });
const SubTrigger = createItem(DropdownMenuPrimitive.SubTrigger);
const SubContent = createContent(DropdownMenuPrimitive.SubContent, {
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
