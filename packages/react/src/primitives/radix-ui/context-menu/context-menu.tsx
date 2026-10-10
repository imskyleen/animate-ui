'use client';

import { ContextMenu as ContextMenuPrimitive } from 'radix-ui';

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

// Same API as Radix's Context Menu. It has no Animate UI v1 counterpart: it
// moves like v1's DropdownMenu (a 220ms fade and scale from the pointer, a
// highlight gliding behind the highlighted item, checks popping in). The Root
// and each Sub mirror their open state (Radix keeps it private) so the
// Content and SubContent can play an exit before they unmount.

type ContextMenuProps = ContextMenuPrimitive.ContextMenuProps;
type ContextMenuTriggerProps = ContextMenuPrimitive.ContextMenuTriggerProps;
type ContextMenuPortalProps = ContextMenuPrimitive.ContextMenuPortalProps;
type ContextMenuContentProps = ContextMenuPrimitive.ContextMenuContentProps &
  PresenceAnimationProps;
type ContextMenuGroupProps = ContextMenuPrimitive.ContextMenuGroupProps;
type ContextMenuLabelProps = ContextMenuPrimitive.ContextMenuLabelProps;
type ContextMenuItemProps = ContextMenuPrimitive.ContextMenuItemProps;
type ContextMenuCheckboxItemProps =
  ContextMenuPrimitive.ContextMenuCheckboxItemProps;
type ContextMenuRadioGroupProps =
  ContextMenuPrimitive.ContextMenuRadioGroupProps;
type ContextMenuRadioItemProps = ContextMenuPrimitive.ContextMenuRadioItemProps;
type ContextMenuItemIndicatorProps =
  ContextMenuPrimitive.ContextMenuItemIndicatorProps & IndicatorAnimationProps;
type ContextMenuSeparatorProps = ContextMenuPrimitive.ContextMenuSeparatorProps;
type ContextMenuArrowProps = ContextMenuPrimitive.ContextMenuArrowProps;
type ContextMenuSubProps = ContextMenuPrimitive.ContextMenuSubProps;
type ContextMenuSubTriggerProps =
  ContextMenuPrimitive.ContextMenuSubTriggerProps;
type ContextMenuSubContentProps =
  ContextMenuPrimitive.ContextMenuSubContentProps & PresenceAnimationProps;

const Root = createOpenRoot(ContextMenuPrimitive.Root);
const Trigger = ContextMenuPrimitive.Trigger;
const Portal = createPortal(ContextMenuPrimitive.Portal);
const Content = createContent(ContextMenuPrimitive.Content, {
  origin: '--radix-context-menu-content-transform-origin',
  // The trigger is an area, not a control: focus goes back where it was.
  returnFocus: 'previous',
});
const Group = ContextMenuPrimitive.Group;
const Label = ContextMenuPrimitive.Label;
const Item = createItem(ContextMenuPrimitive.Item);
const CheckboxItem = createCheckboxItem(ContextMenuPrimitive.CheckboxItem);
const RadioGroup = createRadioGroup(ContextMenuPrimitive.RadioGroup);
const RadioItem = createRadioItem(ContextMenuPrimitive.RadioItem);
const ItemIndicator = createItemIndicator(ContextMenuPrimitive.ItemIndicator);
const Separator = ContextMenuPrimitive.Separator;
const Arrow = ContextMenuPrimitive.Arrow;
const Sub = createOpenRoot(ContextMenuPrimitive.Sub, { sub: true });
const SubTrigger = createItem(ContextMenuPrimitive.SubTrigger);
const SubContent = createContent(ContextMenuPrimitive.SubContent, {
  origin: '--radix-context-menu-content-transform-origin',
  sub: true,
  returnFocus: 'none',
});

const createContextMenuScope: typeof ContextMenuPrimitive.createContextMenuScope =
  ContextMenuPrimitive.createContextMenuScope;

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
  // `ContextMenu` is Radix's alias of Root: with the radix-ui import style,
  // `ContextMenuPrimitive.ContextMenu` keeps working.
  Root as ContextMenu,
  Trigger as ContextMenuTrigger,
  Portal as ContextMenuPortal,
  Content as ContextMenuContent,
  Group as ContextMenuGroup,
  Label as ContextMenuLabel,
  Item as ContextMenuItem,
  CheckboxItem as ContextMenuCheckboxItem,
  RadioGroup as ContextMenuRadioGroup,
  RadioItem as ContextMenuRadioItem,
  ItemIndicator as ContextMenuItemIndicator,
  Separator as ContextMenuSeparator,
  Arrow as ContextMenuArrow,
  Sub as ContextMenuSub,
  SubTrigger as ContextMenuSubTrigger,
  SubContent as ContextMenuSubContent,
  createContextMenuScope,
  type ContextMenuProps,
  type ContextMenuTriggerProps,
  type ContextMenuPortalProps,
  type ContextMenuContentProps,
  type ContextMenuGroupProps,
  type ContextMenuLabelProps,
  type ContextMenuItemProps,
  type ContextMenuCheckboxItemProps,
  type ContextMenuRadioGroupProps,
  type ContextMenuRadioItemProps,
  type ContextMenuItemIndicatorProps,
  type ContextMenuSeparatorProps,
  type ContextMenuArrowProps,
  type ContextMenuSubProps,
  type ContextMenuSubTriggerProps,
  type ContextMenuSubContentProps,
};
