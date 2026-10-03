'use client';
/* eslint-disable @typescript-eslint/no-namespace -- each part keeps Base UI's `Part.Props`/`Part.State` type namespace */

import * as React from 'react';
import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { ReducedMotionConfig } from '../../../utils/motion';
import {
  IndicatorMotion,
  PopupMotion,
  UnmountContext,
  useManualUnmount,
  type PresenceAnimationProps,
} from './shared';

// Untouched parts: the import alias keeps both the component and its type
// namespace (`Menu.Trigger.Props`).
import Arrow = MenuPrimitive.Arrow;
import Backdrop = MenuPrimitive.Backdrop;
import CheckboxItem = MenuPrimitive.CheckboxItem;
import Group = MenuPrimitive.Group;
import GroupLabel = MenuPrimitive.GroupLabel;
import Item = MenuPrimitive.Item;
import LinkItem = MenuPrimitive.LinkItem;
import Portal = MenuPrimitive.Portal;
import Positioner = MenuPrimitive.Positioner;
import RadioGroup = MenuPrimitive.RadioGroup;
import RadioItem = MenuPrimitive.RadioItem;
import Trigger = MenuPrimitive.Trigger;
import Viewport = MenuPrimitive.Viewport;
import Separator = MenuPrimitive.Separator;
import SubmenuTrigger = MenuPrimitive.SubmenuTrigger;
import Handle = MenuPrimitive.Handle;
import createHandle = MenuPrimitive.createHandle;

// Same API as Base UI's Menu. Base UI tells the popup whether it is open and
// whether the change should be instant (moving between the menus of a
// menubar); the Root asks Base UI to keep the popup mounted after it closes,
// and the Popup unmounts it once its exit has played.

function Root<Payload = unknown>({
  actionsRef,
  onOpenChange,
  ...props
}: Root.Props<Payload>) {
  const manual = useManualUnmount(actionsRef, onOpenChange);
  return (
    <UnmountContext value={manual.unmount}>
      <MenuPrimitive.Root<Payload>
        {...props}
        actionsRef={manual.ownActionsRef}
        onOpenChange={manual.handleOpenChange}
      />
    </UnmountContext>
  );
}

namespace Root {
  export type Props<Payload = unknown> = MenuPrimitive.Root.Props<Payload>;
  export type State = MenuPrimitive.Root.State;
  export type Actions = MenuPrimitive.Root.Actions;
  export type ChangeEventReason = MenuPrimitive.Root.ChangeEventReason;
  export type ChangeEventDetails = MenuPrimitive.Root.ChangeEventDetails;
  export type Orientation = MenuPrimitive.Root.Orientation;
}

function SubmenuRoot({
  actionsRef,
  onOpenChange,
  ...props
}: SubmenuRoot.Props) {
  const manual = useManualUnmount(actionsRef, onOpenChange);
  return (
    <UnmountContext value={manual.unmount}>
      <MenuPrimitive.SubmenuRoot
        {...props}
        actionsRef={manual.ownActionsRef}
        onOpenChange={manual.handleOpenChange}
      />
    </UnmountContext>
  );
}

namespace SubmenuRoot {
  export type Props = MenuPrimitive.SubmenuRoot.Props;
  export type State = MenuPrimitive.SubmenuRoot.State;
  export type ChangeEventReason = MenuPrimitive.SubmenuRoot.ChangeEventReason;
  export type ChangeEventDetails = MenuPrimitive.SubmenuRoot.ChangeEventDetails;
}

function Popup({
  transition,
  exitTransition,
  render,
  ...props
}: Popup.Props) {
  const unmount = React.use(UnmountContext);
  // Outside Animate UI's Root (nothing would unmount it): Base UI's popup.
  if (!unmount) return <MenuPrimitive.Popup {...props} render={render} />;

  return (
    <MenuPrimitive.Popup
      {...props}
      // The motion element is Base UI's element: its props, data attributes
      // and children land on it.
      render={(htmlProps, state) => (
        <ReducedMotionConfig>
          <PopupMotion
            htmlProps={htmlProps}
            state={state}
            unmount={unmount}
            transition={transition}
            exitTransition={exitTransition}
          />
        </ReducedMotionConfig>
      )}
    />
  );
}

namespace Popup {
  /** Base UI's props, plus Animate UI's `transition` and `exitTransition`. */
  export type Props = MenuPrimitive.Popup.Props & PresenceAnimationProps;
  export type State = MenuPrimitive.Popup.State;
}

function CheckboxItemIndicator({
  transition,
  exitTransition,
  ...props
}: CheckboxItemIndicator.Props) {
  return (
    <MenuPrimitive.CheckboxItemIndicator
      {...props}
      render={(htmlProps, state) => (
        <IndicatorMotion
          htmlProps={htmlProps}
          state={state}
          transition={transition}
          exitTransition={exitTransition}
        />
      )}
    />
  );
}

namespace CheckboxItemIndicator {
  /** Base UI's props, plus Animate UI's `transition` and `exitTransition`. */
  export type Props = MenuPrimitive.CheckboxItemIndicator.Props &
    PresenceAnimationProps;
  export type State = MenuPrimitive.CheckboxItemIndicator.State;
}

function RadioItemIndicator({
  transition,
  exitTransition,
  ...props
}: RadioItemIndicator.Props) {
  return (
    <MenuPrimitive.RadioItemIndicator
      {...props}
      render={(htmlProps, state) => (
        <IndicatorMotion
          htmlProps={htmlProps}
          state={state}
          transition={transition}
          exitTransition={exitTransition}
        />
      )}
    />
  );
}

namespace RadioItemIndicator {
  /** Base UI's props, plus Animate UI's `transition` and `exitTransition`. */
  export type Props = MenuPrimitive.RadioItemIndicator.Props &
    PresenceAnimationProps;
  export type State = MenuPrimitive.RadioItemIndicator.State;
}

export {
  Arrow,
  Backdrop,
  CheckboxItem,
  CheckboxItemIndicator,
  Group,
  GroupLabel,
  Item,
  LinkItem,
  Popup,
  Portal,
  Positioner,
  RadioGroup,
  RadioItem,
  RadioItemIndicator,
  Root,
  SubmenuRoot,
  Trigger,
  Viewport,
  Separator,
  SubmenuTrigger,
  Handle,
  createHandle,
};
