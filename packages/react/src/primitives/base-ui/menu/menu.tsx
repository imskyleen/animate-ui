'use client';
/* eslint-disable @typescript-eslint/no-namespace -- each part keeps Base UI's `Part.Props`/`Part.State` type namespace */

import * as React from 'react';
import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { ReducedMotionConfig } from '../../../utils/motion';
import { mergeRefs } from '../../../internal/anchored';
import {
  useItemHighlight,
  withHighlight,
} from '../../../internal/item-highlight';
import {
  IndicatorMotion,
  PopupMotion,
  RadioGroupLayoutContext,
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
import Trigger = MenuPrimitive.Trigger;
import Viewport = MenuPrimitive.Viewport;
import Separator = MenuPrimitive.Separator;
import Handle = MenuPrimitive.Handle;
import createHandle = MenuPrimitive.createHandle;

// Same API as Base UI's Menu, animated like Animate UI v1's (see shared.tsx).
// The Root asks Base UI to keep the popup mounted after it closes, and the
// Popup unmounts it once its exit has played.

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

/** Its radio items' indicators glide from one to the other. */
function RadioGroup(props: RadioGroup.Props) {
  const layoutId = React.useId();
  return (
    <RadioGroupLayoutContext value={layoutId}>
      <MenuPrimitive.RadioGroup {...props} />
    </RadioGroupLayoutContext>
  );
}

namespace RadioGroup {
  export type Props = MenuPrimitive.RadioGroup.Props;
  export type State = MenuPrimitive.RadioGroup.State;
  export type ChangeEventReason = MenuPrimitive.RadioGroup.ChangeEventReason;
  export type ChangeEventDetails = MenuPrimitive.RadioGroup.ChangeEventDetails;
}

function CheckboxItemIndicator({
  transition,
  ...props
}: CheckboxItemIndicator.Props) {
  return (
    <MenuPrimitive.CheckboxItemIndicator
      {...props}
      render={(htmlProps, state) => (
        <IndicatorMotion
          kind="checkbox"
          htmlProps={htmlProps}
          state={state}
          transition={transition}
        />
      )}
    />
  );
}

namespace CheckboxItemIndicator {
  /** Base UI's props, plus Animate UI's `transition`. */
  export type Props = MenuPrimitive.CheckboxItemIndicator.Props &
    IndicatorAnimationProps;
  export type State = MenuPrimitive.CheckboxItemIndicator.State;
}

function RadioItemIndicator({
  transition,
  ...props
}: RadioItemIndicator.Props) {
  return (
    <MenuPrimitive.RadioItemIndicator
      {...props}
      render={(htmlProps, state) => (
        <IndicatorMotion
          kind="radio"
          htmlProps={htmlProps}
          state={state}
          transition={transition}
        />
      )}
    />
  );
}

namespace RadioItemIndicator {
  /** Base UI's props, plus Animate UI's `transition`. */
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
