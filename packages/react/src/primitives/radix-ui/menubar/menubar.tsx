'use client';

import * as React from 'react';
import { Menubar as MenubarPrimitive } from 'radix-ui';

import {
  MenuStateContext,
  createCheckboxItem,
  createContent,
  createItemIndicator,
  createOpenRoot,
  createPortal,
  createRadioGroup,
  createRadioItem,
  type PresenceAnimationProps,
} from '../_menu/menu';

// Same API as Radix's Menubar. The Root mirrors which menu is open (Radix
// keeps it private) so each Content can play an exit before it unmounts.
// Moving from one open menu to another (hover or arrow keys) is instant, like
// native menubars: only opening the bar and closing it animate.

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
  PresenceAnimationProps;
type MenubarSeparatorProps = MenubarPrimitive.MenubarSeparatorProps;
type MenubarArrowProps = MenubarPrimitive.MenubarArrowProps;
type MenubarSubProps = MenubarPrimitive.MenubarSubProps;
type MenubarSubTriggerProps = MenubarPrimitive.MenubarSubTriggerProps;
type MenubarSubContentProps = MenubarPrimitive.MenubarSubContentProps &
  PresenceAnimationProps;

type MenubarState = {
  value: string;
  /** The value went from one menu straight to another. */
  switching: boolean;
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

  // Derived from the previous value during render (not in an effect), so
  // the closing and the opening menus both read it on the same render.
  const [state, setState] = React.useState<MenubarState>({
    value,
    switching: false,
  });
  let current = state;
  if (state.value !== value) {
    current = { value, switching: Boolean(state.value) && Boolean(value) };
    setState(current);
  }

  return (
    <MenubarStateContext value={current}>
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
    <MenuStateContext
      value={{ open: menubar.value === value, instant: menubar.switching }}
    >
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
const Item = MenubarPrimitive.Item;
const CheckboxItem = createCheckboxItem(MenubarPrimitive.CheckboxItem);
const RadioGroup = createRadioGroup(MenubarPrimitive.RadioGroup);
const RadioItem = createRadioItem(MenubarPrimitive.RadioItem);
const ItemIndicator = createItemIndicator(MenubarPrimitive.ItemIndicator);
const Separator = MenubarPrimitive.Separator;
const Arrow = MenubarPrimitive.Arrow;
const Sub = createOpenRoot(MenubarPrimitive.Sub);
const SubTrigger = MenubarPrimitive.SubTrigger;
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
