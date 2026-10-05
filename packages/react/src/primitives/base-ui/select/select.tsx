'use client';

import * as React from 'react';
import { Select as SelectPrimitive } from '@base-ui/react/select';

import { ReducedMotionConfig } from '../../../utils/motion';
import {
  IndicatorMotion,
  useHighlightedItem,
  usePopupRender,
  useRootMotion,
  type IndicatorAnimationProps,
  type IndicatorRender,
  type PopupAnimationProps,
  type RootMotion,
} from './motion';

// Same API as Base UI's Select, animated like Animate UI v1's Base UI Menu
// (see motion.tsx). Base UI has no `keepMounted` for this popup: with an
// `actionsRef`, it keeps the popup mounted until we unmount it, after the exit
// animation.

const RootContext = React.createContext<RootMotion | null>(null);

function Root<Value, Multiple extends boolean | undefined = false>({
  actionsRef,
  onOpenChange,
  ...props
}: SelectPrimitive.Root.Props<Value, Multiple>) {
  const [internalRef, context, handleOpenChange] = useRootMotion(
    actionsRef,
    Boolean(props.multiple),
    onOpenChange,
  );

  return (
    <RootContext value={context}>
      <SelectPrimitive.Root
        {...props}
        actionsRef={internalRef}
        onOpenChange={handleOpenChange}
      />
    </RootContext>
  );
}

declare namespace Root {
  type Props<
    Value,
    Multiple extends boolean | undefined = false,
  > = SelectPrimitive.Root.Props<Value, Multiple>;
  type State = SelectPrimitive.Root.State;
  type Actions = SelectPrimitive.Root.Actions;
  type ChangeEventReason = SelectPrimitive.Root.ChangeEventReason;
  type ChangeEventDetails = SelectPrimitive.Root.ChangeEventDetails;
}

function Popup({ transition, exitTransition, ...props }: Popup.Props) {
  return (
    <ReducedMotionConfig>
      <PopupMotion
        {...props}
        transition={transition}
        exitTransition={exitTransition}
      />
    </ReducedMotionConfig>
  );
}

declare namespace Popup {
  /** Base UI's props, but `render`: Animate UI renders the popup. */
  type Props = Omit<SelectPrimitive.Popup.Props, 'render'> &
    PopupAnimationProps;
  type State = SelectPrimitive.Popup.State;
}

// Inside ReducedMotionConfig, so useShouldReduceMotion() sees it.
function PopupMotion({ transition, exitTransition, ...props }: Popup.Props) {
  const root = React.use(RootContext);
  const render = usePopupRender(root, { transition, exitTransition });
  return <SelectPrimitive.Popup {...props} render={render} />;
}

// Single selection: the check glides to the chosen item while the list
// closes. Multiple selection keeps the list open: a selected item's check
// draws itself, a deselected one's erases itself.
function ItemIndicator({ render, transition, ...props }: ItemIndicator.Props) {
  const root = React.use(RootContext);
  if (!root)
    return <SelectPrimitive.ItemIndicator {...props} render={render} />;

  return (
    <SelectPrimitive.ItemIndicator
      {...props}
      // A multiple selection's check shrinks out when its item is deselected:
      // kept mounted for that.
      keepMounted={root.multiple || props.keepMounted}
      render={(elementProps, state) => (
        <IndicatorMotion
          render={render as IndicatorRender}
          props={elementProps as Record<string, unknown>}
          state={state}
          multiple={root.multiple}
          transition={transition}
        />
      )}
    />
  );
}

/** Takes part in the list's highlight (pointer and arrow keys alike). */
function Item(props: Item.Props) {
  return <SelectPrimitive.Item {...useHighlightedItem(props)} />;
}

declare namespace Item {
  type Props = SelectPrimitive.Item.Props;
  type State = SelectPrimitive.Item.State;
}

declare namespace ItemIndicator {
  type Props = SelectPrimitive.ItemIndicator.Props & IndicatorAnimationProps;
  type State = SelectPrimitive.ItemIndicator.State;
}

// Untouched parts keep Base UI's value and type namespace (`Trigger.Props`…).
export import Label = SelectPrimitive.Label;
export import Trigger = SelectPrimitive.Trigger;
export import Value = SelectPrimitive.Value;
export import Icon = SelectPrimitive.Icon;
export import Portal = SelectPrimitive.Portal;
export import Backdrop = SelectPrimitive.Backdrop;
export import Positioner = SelectPrimitive.Positioner;
export import List = SelectPrimitive.List;
export import ItemText = SelectPrimitive.ItemText;
export import Arrow = SelectPrimitive.Arrow;
export import ScrollDownArrow = SelectPrimitive.ScrollDownArrow;
export import ScrollUpArrow = SelectPrimitive.ScrollUpArrow;
export import Group = SelectPrimitive.Group;
export import GroupLabel = SelectPrimitive.GroupLabel;
export import Separator = SelectPrimitive.Separator;

export { Root, Popup, Item, ItemIndicator };
