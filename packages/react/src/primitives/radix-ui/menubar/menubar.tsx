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

// Same API as Radix's Menubar. The Root mirrors which menu is open (Radix
// keeps it private) so each Content can play an exit before it unmounts.
// Radix's Menubar has no Animate UI v1 counterpart: a menu opens and closes
// like v1's DropdownMenu (a 250ms fade and scale, a highlight gliding behind
// the highlighted item). Moving from an open menu to another, the popover
// doesn't close and reopen: it moves to the next menu and resizes, on a
// spring that eases in, without going past, while the content changes like
// Motion's mega menu, the previous items sliding 6px away as the next ones
// slide in (internal/menu-handoff). The
// triggers share one highlight, like a menu's items: hovered, focused or
// with its menu open, a trigger's background glides from the previous one
// (internal/item-highlight).

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
  /** The open menu closed because an item whose check moves was chosen. */
  picked: boolean;
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
  // Its menus' picks: choosing an item closes the open menu.
  const picks = useMenuPicks();
  // Its menus hand their popover over to one another.
  const handoff = useHandoffGroup();

  return picks.provide(
    <MenubarStateContext value={{ value, picked: picks.picked }}>
      <MenuHandoffContext value={handoff}>
        <TriggerHighlightScope>
          <MenubarPrimitive.Root
            {...props}
            // The triggers' highlight goes under their content, above the
            // bar's background: the bar is its own stacking context.
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
  // Radix generates a value when there is none: generate it here so the open
  // state can be read from the Root's value.
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
