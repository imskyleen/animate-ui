'use client';
/* eslint-disable @typescript-eslint/no-namespace -- each part keeps Base UI's `Part.Props`/`Part.State` type namespace */

import * as React from 'react';
import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { ReducedMotionConfig } from '../../../utils/motion';
import { mergeRefs } from '../../../internal/anchored';
import {
  useItemHighlight,
  useTriggerHighlight,
  withHighlight,
} from '../../../internal/item-highlight';
import { useCheckGroup } from '../../../internal/item-indicator';
import { MenuHandoffContext } from '../../../internal/menu-handoff';
import {
  IndicatorMotion,
  MovedOnContext,
  PopupHandoffContext,
  PopupMotion,
  RadioGroupCheckContext,
  RootPicks,
  UnmountContext,
  useManualUnmount,
  type IndicatorAnimationProps,
  type PresenceAnimationProps,
} from './shared';

// Untouched parts: the import alias keeps both the component and its type
// namespace (`Menu.Trigger.Props`).
import Arrow = MenuPrimitive.Arrow;
import Backdrop = MenuPrimitive.Backdrop;
import Group = MenuPrimitive.Group;
import GroupLabel = MenuPrimitive.GroupLabel;
import Portal = MenuPrimitive.Portal;
import Positioner = MenuPrimitive.Positioner;
import Viewport = MenuPrimitive.Viewport;
import Separator = MenuPrimitive.Separator;
import Handle = MenuPrimitive.Handle;
import createHandle = MenuPrimitive.createHandle;

// Same API as Base UI's Menu, animated like Animate UI v1's (see shared.tsx).
// The Root asks Base UI to keep the popup mounted after it closes, and the
// Popup unmounts it once its exit has played. In Animate UI's Menubar, the
// menus hand their popover over to one another (internal/menu-handoff).

function Root<Payload = unknown>({
  actionsRef,
  onOpenChange,
  ...props
}: Root.Props<Payload>) {
  const manual = useManualUnmount(actionsRef, onOpenChange);
  // One of a menubar's menus: its popup only (menus nested in it aren't).
  const menubar = React.use(MenuHandoffContext);
  return (
    <UnmountContext value={manual.unmount}>
      <RootPicks picked={manual.picked} registerCheck={manual.registerCheck}>
        <MenuHandoffContext value={null}>
          <PopupHandoffContext value={menubar}>
            <MovedOnContext value={manual.movedOn}>
              <MenuPrimitive.Root<Payload>
                {...props}
                actionsRef={manual.ownActionsRef}
                onOpenChange={manual.handleOpenChange}
              />
            </MovedOnContext>
          </PopupHandoffContext>
        </MenuHandoffContext>
      </RootPicks>
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

/**
 * Base UI's Trigger. A menubar's menu's trigger takes part in its triggers'
 * highlight (see Menubar).
 */
function Trigger<Payload = unknown>(props: Trigger.Props<Payload>) {
  // One of a menubar's menus (not a menu nested in one).
  const menubar = React.use(PopupHandoffContext);
  if (!menubar) return <MenuPrimitive.Trigger<Payload> {...props} />;
  return <BarTrigger<Payload> {...props} />;
}

function BarTrigger<Payload>({
  disabled,
  children,
  ref,
  ...props
}: Trigger.Props<Payload> & { ref?: React.Ref<HTMLElement> }) {
  const { ref: highlightRef, highlight } = useTriggerHighlight(disabled);
  const mergedRef = React.useMemo(
    () => mergeRefs(ref, highlightRef),
    [ref, highlightRef],
  );
  return (
    <MenuPrimitive.Trigger<Payload>
      {...props}
      ref={mergedRef}
      disabled={disabled}
    >
      {withHighlight(children, highlight)}
    </MenuPrimitive.Trigger>
  );
}

namespace Trigger {
  export type Props<Payload = unknown> =
    MenuPrimitive.Trigger.Props<Payload> & {
      ref?: React.Ref<HTMLElement>;
    };
  export type State = MenuPrimitive.Trigger.State;
}

function SubmenuRoot({
  actionsRef,
  onOpenChange,
  ...props
}: SubmenuRoot.Props) {
  const manual = useManualUnmount(actionsRef, onOpenChange);
  return (
    <UnmountContext value={manual.unmount}>
      {/* A submenu's popup opens on its own. */}
      <PopupHandoffContext value={null}>
        <MenuPrimitive.SubmenuRoot
          {...props}
          actionsRef={manual.ownActionsRef}
          onOpenChange={manual.handleOpenChange}
        />
      </PopupHandoffContext>
    </UnmountContext>
  );
}

namespace SubmenuRoot {
  export type Props = MenuPrimitive.SubmenuRoot.Props;
  export type State = MenuPrimitive.SubmenuRoot.State;
  export type ChangeEventReason = MenuPrimitive.SubmenuRoot.ChangeEventReason;
  export type ChangeEventDetails = MenuPrimitive.SubmenuRoot.ChangeEventDetails;
}

function Popup({ transition, exitTransition, render, ...props }: Popup.Props) {
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

type HighlightableProps = {
  disabled?: boolean;
  children?: React.ReactNode;
  ref?: React.Ref<HTMLElement>;
};

/**
 * An item that takes part in the menu's highlight. With `render`, Base UI
 * puts the children (and the highlight) in the user's element.
 */
function useHighlighted<P extends HighlightableProps>({
  disabled,
  children,
  ref,
  ...props
}: P) {
  const { ref: highlightRef, highlight } = useItemHighlight(disabled);
  const mergedRef = React.useMemo(
    () => mergeRefs(ref, highlightRef),
    [ref, highlightRef],
  );
  return {
    ...props,
    disabled,
    ref: mergedRef,
    children: withHighlight(children, highlight),
  };
}

function Item(props: Item.Props) {
  return <MenuPrimitive.Item {...useHighlighted(props)} />;
}

namespace Item {
  export type Props = MenuPrimitive.Item.Props;
  export type State = MenuPrimitive.Item.State;
}

function LinkItem(props: LinkItem.Props) {
  return <MenuPrimitive.LinkItem {...useHighlighted(props)} />;
}

namespace LinkItem {
  export type Props = MenuPrimitive.LinkItem.Props;
  export type State = MenuPrimitive.LinkItem.State;
}

function CheckboxItem(props: CheckboxItem.Props) {
  return <MenuPrimitive.CheckboxItem {...useHighlighted(props)} />;
}

namespace CheckboxItem {
  export type Props = MenuPrimitive.CheckboxItem.Props;
  export type State = MenuPrimitive.CheckboxItem.State;
  export type ChangeEventReason = MenuPrimitive.CheckboxItem.ChangeEventReason;
  export type ChangeEventDetails =
    MenuPrimitive.CheckboxItem.ChangeEventDetails;
}

function RadioItem(props: RadioItem.Props) {
  return <MenuPrimitive.RadioItem {...useHighlighted(props)} />;
}

namespace RadioItem {
  export type Props = MenuPrimitive.RadioItem.Props;
  export type State = MenuPrimitive.RadioItem.State;
}

function SubmenuTrigger(props: SubmenuTrigger.Props) {
  return <MenuPrimitive.SubmenuTrigger {...useHighlighted(props)} />;
}

namespace SubmenuTrigger {
  export type Props = MenuPrimitive.SubmenuTrigger.Props;
  export type State = MenuPrimitive.SubmenuTrigger.State;
}

/** Its radio items' checks glide from one to the other (`pop`). */
function RadioGroup(props: RadioGroup.Props) {
  const group = useCheckGroup();
  return (
    <RadioGroupCheckContext value={group}>
      <MenuPrimitive.RadioGroup {...props} />
    </RadioGroupCheckContext>
  );
}

namespace RadioGroup {
  export type Props = MenuPrimitive.RadioGroup.Props;
  export type State = MenuPrimitive.RadioGroup.State;
  export type ChangeEventReason = MenuPrimitive.RadioGroup.ChangeEventReason;
  export type ChangeEventDetails = MenuPrimitive.RadioGroup.ChangeEventDetails;
}

function CheckboxItemIndicator({
  animation,
  transition,
  ...props
}: CheckboxItemIndicator.Props) {
  return (
    <MenuPrimitive.CheckboxItemIndicator
      {...props}
      // Kept mounted, to hide itself when its item is unchecked.
      keepMounted
      render={(htmlProps, state) => (
        <IndicatorMotion
          kind="checkbox"
          htmlProps={htmlProps}
          state={state}
          animation={animation}
          transition={transition}
        />
      )}
    />
  );
}

namespace CheckboxItemIndicator {
  /** Base UI's props, plus Animate UI's `animation` and `transition`. */
  export type Props = MenuPrimitive.CheckboxItemIndicator.Props &
    IndicatorAnimationProps;
  export type State = MenuPrimitive.CheckboxItemIndicator.State;
}

function RadioItemIndicator({
  animation,
  transition,
  ...props
}: RadioItemIndicator.Props) {
  return (
    <MenuPrimitive.RadioItemIndicator
      {...props}
      // Kept mounted, to hide itself when another item is checked.
      keepMounted
      render={(htmlProps, state) => (
        <IndicatorMotion
          kind="radio"
          htmlProps={htmlProps}
          state={state}
          animation={animation}
          transition={transition}
        />
      )}
    />
  );
}

namespace RadioItemIndicator {
  /** Base UI's props, plus Animate UI's `animation` and `transition`. */
  export type Props = MenuPrimitive.RadioItemIndicator.Props &
    IndicatorAnimationProps;
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
