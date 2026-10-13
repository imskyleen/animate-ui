'use client';
/* eslint-disable @typescript-eslint/no-namespace */

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

import Trigger = ContextMenuPrimitive.Trigger;
import Backdrop = ContextMenuPrimitive.Backdrop;
import Portal = ContextMenuPrimitive.Portal;
import Positioner = ContextMenuPrimitive.Positioner;
import Arrow = ContextMenuPrimitive.Arrow;
import Group = ContextMenuPrimitive.Group;
import GroupLabel = ContextMenuPrimitive.GroupLabel;
import Separator = ContextMenuPrimitive.Separator;

function Root({ actionsRef, onOpenChange, ...props }: Root.Props) {
  const manual = useManualUnmount(actionsRef, onOpenChange);
  return (
    <UnmountContext value={manual.unmount}>
      <RootPicks picked={manual.picked} registerCheck={manual.registerCheck}>
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
