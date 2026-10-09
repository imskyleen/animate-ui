'use client';
/* eslint-disable @typescript-eslint/no-namespace -- each part keeps Base UI's `Part.Props`/`Part.State` type namespace */

import { ContextMenu as ContextMenuPrimitive } from '@base-ui/react/context-menu';

import {
  PopupHandoffContext,
  RootPicks,
  UnmountContext,
  useManualUnmount,
} from '../menu/shared';
import {
  CheckboxItem,
  CheckboxItemIndicator,
  Item,
  LinkItem,
  Popup,
  RadioGroup,
  RadioItem,
  RadioItemIndicator,
  SubmenuRoot,
  SubmenuTrigger,
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
import Separator = ContextMenuPrimitive.Separator;

// Same API as Base UI's Context Menu, which is a Menu opened by a right click
// or a long press: its Popup, items, indicators and submenus are the animated
// Menu parts. It has no Animate UI v1 counterpart: it moves like v1's Base UI
// Menu (a 250ms fade and scale from the pointer, a highlight gliding behind
// the highlighted item, checks popping in).

function Root({ actionsRef, onOpenChange, ...props }: Root.Props) {
  const manual = useManualUnmount(actionsRef, onOpenChange);
  return (
    <UnmountContext value={manual.unmount}>
      <RootPicks picked={manual.picked} registerCheck={manual.registerCheck}>
        {/* Its popup opens on its own, even inside a menubar's menu. */}
        <PopupHandoffContext value={null}>
          <ContextMenuPrimitive.Root
            {...props}
            actionsRef={manual.ownActionsRef}
            onOpenChange={manual.handleOpenChange}
          />
        </PopupHandoffContext>
      </RootPicks>
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
