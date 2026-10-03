'use client';
/* eslint-disable @typescript-eslint/no-namespace -- each part keeps Base UI's `Part.Props`/`Part.State` type namespace */

import { ContextMenu as ContextMenuPrimitive } from '@base-ui/react/context-menu';

import { UnmountContext, useManualUnmount } from '../menu/shared';
import {
  CheckboxItemIndicator,
  Popup,
  RadioItemIndicator,
  SubmenuRoot,
} from '../menu/menu';

// Untouched parts: the import alias keeps both the component and its type
// namespace (`ContextMenu.Trigger.Props`).
import Trigger = ContextMenuPrimitive.Trigger;
import Backdrop = ContextMenuPrimitive.Backdrop;
import Portal = ContextMenuPrimitive.Portal;
import Positioner = ContextMenuPrimitive.Positioner;
import Arrow = ContextMenuPrimitive.Arrow;
import Group = ContextMenuPrimitive.Group;
import GroupLabel = ContextMenuPrimitive.GroupLabel;
import Item = ContextMenuPrimitive.Item;
import CheckboxItem = ContextMenuPrimitive.CheckboxItem;
import LinkItem = ContextMenuPrimitive.LinkItem;
import RadioGroup = ContextMenuPrimitive.RadioGroup;
import RadioItem = ContextMenuPrimitive.RadioItem;
import SubmenuTrigger = ContextMenuPrimitive.SubmenuTrigger;
import Separator = ContextMenuPrimitive.Separator;

// Same API as Base UI's Context Menu, which is a Menu opened by a right click
// or a long press: its Popup, item indicators and submenus are the animated
// Menu parts. The menu grows from the pointer.

function Root({ actionsRef, onOpenChange, ...props }: Root.Props) {
  const manual = useManualUnmount(actionsRef, onOpenChange);
  return (
    <UnmountContext value={manual.unmount}>
      <ContextMenuPrimitive.Root
        {...props}
        actionsRef={manual.ownActionsRef}
        onOpenChange={manual.handleOpenChange}
      />
    </UnmountContext>
  );
}

namespace Root {
  export type Props = ContextMenuPrimitive.Root.Props;
  export type State = ContextMenuPrimitive.Root.State;
  export type Actions = ContextMenuPrimitive.Root.Actions;
  export type ChangeEventReason = ContextMenuPrimitive.Root.ChangeEventReason;
  export type ChangeEventDetails = ContextMenuPrimitive.Root.ChangeEventDetails;
}

export {
  Root,
  Trigger,
  Backdrop,
  Portal,
  Positioner,
  Popup,
  Arrow,
  Group,
  GroupLabel,
  Item,
  CheckboxItem,
  CheckboxItemIndicator,
  LinkItem,
  RadioGroup,
  RadioItem,
  RadioItemIndicator,
  SubmenuRoot,
  SubmenuTrigger,
  Separator,
};
