'use client';

import * as React from 'react';
import { Menubar as MenubarPrimitive } from 'radix-ui';

import {
  MenuStateContext,
  useMenuPicks,
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
import { mergeRefs } from '../../../internal/anchored';
import {
  TriggerHighlightScope,
  useTriggerHighlight,
  withHighlight,
} from '../../../internal/item-highlight';
import {
  MenuHandoffContext,
  useHandoffGroup,
} from '../../../internal/menu-handoff';
import type { Picked } from '../../../internal/item-indicator';

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
  value: string;
  picked: Picked;
};

const MenubarStateContext = React.createContext<MenubarState | null>(null);

function Root({
  value: valueProp,
  defaultValue,
  onValueChange,
  style,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  const controlled = valueProp !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? '');
  const value = controlled ? valueProp : uncontrolled;
  const picks = useMenuPicks();
  const handoff = useHandoffGroup();

  return picks.provide(
    <MenubarStateContext value={{ value, picked: picks.picked }}>
      <MenuHandoffContext value={handoff}>
        <TriggerHighlightScope>
          <MenubarPrimitive.Root
            {...props}
            style={{ isolation: 'isolate', ...style }}
            value={value}
            onValueChange={(next) => {
              picks.onOpenChange(next !== '');
              if (!controlled) setUncontrolled(next);
              onValueChange?.(next);
            }}
          />
        </TriggerHighlightScope>
      </MenuHandoffContext>
    </MenubarStateContext>,
  );
}

function Menu({
  value: valueProp,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  const fallbackId = React.useId();
  const value = valueProp || fallbackId;
  const menubar = React.use(MenubarStateContext);
  if (!menubar) return <MenubarPrimitive.Menu {...props} value={valueProp} />;

  return (
    <MenuStateContext
      value={{ open: menubar.value === value, picked: menubar.picked }}
    >
      <MenubarPrimitive.Menu {...props} value={value} />
    </MenuStateContext>
  );
}

function Trigger({
  asChild,
  disabled,
  children,
  ref,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  const { ref: highlightRef, highlight } = useTriggerHighlight(disabled);
  const mergedRef = React.useMemo(
    () => mergeRefs(ref, highlightRef),
    [ref, highlightRef],
  );
  return (
    <MenubarPrimitive.Trigger
      {...props}
      ref={mergedRef}
      asChild={asChild}
      disabled={disabled}
    >
      {withHighlight(children, highlight, asChild)}
    </MenubarPrimitive.Trigger>
  );
}
const Portal = createPortal(MenubarPrimitive.Portal);
const Content = createContent(MenubarPrimitive.Content, {
  origin: '--radix-menubar-content-transform-origin',
  returnFocus: 'trigger',
  handoff: true,
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
const Sub = createOpenRoot(MenubarPrimitive.Sub, { sub: true });
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
