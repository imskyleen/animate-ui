'use client';

import * as React from 'react';
import { Select as SelectPrimitive } from '@base-ui/react/select';

import { ReducedMotionConfig } from '../../../utils/motion';
import {
  IndicatorMotion,
  usePopupRender,
  useRootMotion,
  type IndicatorAnimationProps,
  type IndicatorRender,
  type PopupAnimationProps,
  type RootMotion,
} from './motion';

// Same API as Base UI's Select. Base UI has no `keepMounted` for this popup:
// with an `actionsRef`, it keeps the popup mounted until we unmount it, after
// the exit animation.

const RootContext = React.createContext<RootMotion | null>(null);

function Root<Value, Multiple extends boolean | undefined = false>({
  actionsRef,
  ...props
}: SelectPrimitive.Root.Props<Value, Multiple>) {
  const [internalRef, context] = useRootMotion(
    actionsRef,
    Boolean(props.multiple),
  );

  return (
    <RootContext value={context}>
      <SelectPrimitive.Root {...props} actionsRef={internalRef} />
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

// Single selection: not animated, it only mounts with the list (choosing an
// item closes it). Multiple selection keeps the list open, so toggling an item
// fades and scales its check.
function ItemIndicator({
  keepMounted,
  render,
  transition,
  exitTransition,
  ...props
}: ItemIndicator.Props) {
  const root = React.use(RootContext);

  if (!root?.multiple) {
    return (
      <SelectPrimitive.ItemIndicator
        {...props}
        keepMounted={keepMounted}
        render={render}
      />
    );
  }

  return (
    <SelectPrimitive.ItemIndicator
      {...props}
      // Mounted unselected too, so the check can leave with an animation.
      keepMounted
      render={(elementProps, state) => (
        <IndicatorMotion
          render={render as IndicatorRender}
          props={elementProps as Record<string, unknown>}
          state={state}
          transition={transition}
          exitTransition={exitTransition}
        />
      )}
    />
  );
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
// No animated highlight: arrow keys move it, and keyboard navigation stays
// instant. Style `data-highlighted` instead.
export import Item = SelectPrimitive.Item;
export import ItemText = SelectPrimitive.ItemText;
export import Arrow = SelectPrimitive.Arrow;
export import ScrollDownArrow = SelectPrimitive.ScrollDownArrow;
export import ScrollUpArrow = SelectPrimitive.ScrollUpArrow;
export import Group = SelectPrimitive.Group;
export import GroupLabel = SelectPrimitive.GroupLabel;
export import Separator = SelectPrimitive.Separator;

export { Root, Popup, ItemIndicator };
