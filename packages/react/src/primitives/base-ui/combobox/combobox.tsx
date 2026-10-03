'use client';

import * as React from 'react';
import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { animate, type Transition } from 'motion/react';

import {
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
} from '../../../utils/motion';
import {
  IndicatorMotion,
  usePopupRender,
  useRootMotion,
  type IndicatorAnimationProps,
  type IndicatorRender,
  type PopupAnimationProps,
  type RootMotion,
} from '../select/motion';

// Same API as Base UI's Combobox. With an `actionsRef`, Base UI keeps the
// popup mounted until we unmount it after the exit animation; it also waits
// until then to reset the query and sync the input, so the list doesn't
// change while it fades out.

const RootContext = React.createContext<RootMotion | null>(null);
/** True once the Chips container has mounted: later chips were just added. */
const ChipsContext = React.createContext<React.RefObject<boolean> | null>(null);

function Root<
  Value,
  Multiple extends boolean | undefined = false,
  Item = Value,
>({
  actionsRef,
  ...props
}: ComboboxPrimitive.Root.Props<Value, Multiple, Item>) {
  const [internalRef, context] = useRootMotion(
    actionsRef,
    Boolean(props.multiple),
  );

  return (
    <RootContext value={context}>
      <ComboboxPrimitive.Root {...props} actionsRef={internalRef} />
    </RootContext>
  );
}

declare namespace Root {
  type Props<
    Value,
    Multiple extends boolean | undefined = false,
    Item = Value,
  > = ComboboxPrimitive.Root.Props<Value, Multiple, Item>;
  type State = ComboboxPrimitive.Root.State;
  type Actions = ComboboxPrimitive.Root.Actions;
  type ChangeEventReason = ComboboxPrimitive.Root.ChangeEventReason;
  type ChangeEventDetails = ComboboxPrimitive.Root.ChangeEventDetails;
  type HighlightEventReason = ComboboxPrimitive.Root.HighlightEventReason;
  type HighlightEventDetails = ComboboxPrimitive.Root.HighlightEventDetails;
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
  type Props = Omit<ComboboxPrimitive.Popup.Props, 'render'> &
    PopupAnimationProps;
  type State = ComboboxPrimitive.Popup.State;
}

// Inside ReducedMotionConfig, so useShouldReduceMotion() sees it.
function PopupMotion({ transition, exitTransition, ...props }: Popup.Props) {
  const root = React.use(RootContext);
  const render = usePopupRender(root, { transition, exitTransition });
  return <ComboboxPrimitive.Popup {...props} render={render} />;
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
      <ComboboxPrimitive.ItemIndicator
        {...props}
        keepMounted={keepMounted}
        render={render}
      />
    );
  }

  return (
    <ComboboxPrimitive.ItemIndicator
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
  type Props = ComboboxPrimitive.ItemIndicator.Props & IndicatorAnimationProps;
  type State = ComboboxPrimitive.ItemIndicator.State;
}

function Chips(props: ComboboxPrimitive.Chips.Props) {
  const mountedRef = React.useRef(false);
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <ChipsContext value={mountedRef}>
      <ComboboxPrimitive.Chips {...props} />
    </ChipsContext>
  );
}

declare namespace Chips {
  type Props = ComboboxPrimitive.Chips.Props;
  type State = ComboboxPrimitive.Chips.State;
}

/** Animate UI's additions to `Chip`. */
type ChipAnimationProps = {
  /** Transition of a chip being added. Defaults to `transition.change` (600ms). */
  transition?: Transition;
};

// A chip added to the selection pops in; chips already there on mount don't.
// Removing one is instant: it's often Backspace, and its neighbours reflow.
function Chip(props: Chip.Props) {
  return (
    <ReducedMotionConfig>
      <AnimatedChip {...props} />
    </ReducedMotionConfig>
  );
}

// Inside ReducedMotionConfig, so useShouldReduceMotion() sees it.
function AnimatedChip({ ref, transition, ...props }: Chip.Props) {
  const chips = React.use(ChipsContext);
  const [entering] = React.useState(() => chips?.current === true);
  const elementRef = React.useRef<HTMLDivElement | null>(null);
  const reduce = useShouldReduceMotion();
  const tokens = useMotionTokens();

  // Before paint, so the chip never flashes at full opacity first.
  React.useLayoutEffect(() => {
    const element = elementRef.current;
    if (!entering || !element) return undefined;
    const controls = animate(
      element,
      {
        opacity: [0, 1],
        transform: [`scale(${reduce ? 1 : tokens.scale.enter})`, 'scale(1)'],
      },
      transition ?? tokens.transition.change,
    );
    return () => controls.stop();
    // Plays once, when the chip mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps, @eslint-react/exhaustive-deps
  }, []);

  const setRefs = React.useCallback(
    (element: HTMLDivElement | null) => {
      elementRef.current = element;
      if (typeof ref === 'function') return ref(element);
      if (ref) ref.current = element;
      return undefined;
    },
    [ref],
  );

  return <ComboboxPrimitive.Chip {...props} ref={setRefs} />;
}

declare namespace Chip {
  type Props = ComboboxPrimitive.Chip.Props &
    ChipAnimationProps & { ref?: React.Ref<HTMLDivElement> };
  type State = ComboboxPrimitive.Chip.State;
}

// Untouched parts keep Base UI's value and type namespace (`Input.Props`…).
export import Label = ComboboxPrimitive.Label;
export import Value = ComboboxPrimitive.Value;
export import Input = ComboboxPrimitive.Input;
export import InputGroup = ComboboxPrimitive.InputGroup;
export import Trigger = ComboboxPrimitive.Trigger;
// No per-item or height animation: items appear and disappear at once as the
// query changes (typing is keyboard-driven and high frequency).
export import List = ComboboxPrimitive.List;
export import Status = ComboboxPrimitive.Status;
export import Portal = ComboboxPrimitive.Portal;
export import Backdrop = ComboboxPrimitive.Backdrop;
export import Positioner = ComboboxPrimitive.Positioner;
export import Arrow = ComboboxPrimitive.Arrow;
export import Icon = ComboboxPrimitive.Icon;
export import Group = ComboboxPrimitive.Group;
export import GroupLabel = ComboboxPrimitive.GroupLabel;
// No animated highlight: arrow keys move it, and keyboard navigation stays
// instant. Style `data-highlighted` instead.
export import Item = ComboboxPrimitive.Item;
export import ChipRemove = ComboboxPrimitive.ChipRemove;
export import Row = ComboboxPrimitive.Row;
export import Collection = ComboboxPrimitive.Collection;
export import Empty = ComboboxPrimitive.Empty;
export import Clear = ComboboxPrimitive.Clear;
export import Separator = ComboboxPrimitive.Separator;
export import useFilter = ComboboxPrimitive.useFilter;
export import useFilteredItems = ComboboxPrimitive.useFilteredItems;
export import createItems = ComboboxPrimitive.createItems;

export { Root, Popup, ItemIndicator, Chips, Chip };
