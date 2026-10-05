'use client';

import * as React from 'react';
import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { animate, type Transition } from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import {
  IndicatorMotion,
  useHighlightedItem,
  usePopupRender,
  useRootMotion,
  type IndicatorAnimationProps,
  type IndicatorRender,
  type PopupAnimationProps,
  type RootMotion,
} from '../select/motion';

// Same API as Base UI's Combobox, animated like Animate UI v1's Base UI Menu
// (see ../select/motion.tsx); a chip added to the selection pops in like v1's
// checkbox check. With an `actionsRef`, Base UI keeps the popup mounted until
// we unmount it after the exit animation; it also waits until then to reset
// the query and sync the input, so the list doesn't change while it fades out.

const RootContext = React.createContext<RootMotion | null>(null);
/** True once the Chips container has mounted: later chips were just added. */
const ChipsContext = React.createContext<React.RefObject<boolean> | null>(null);

function Root<
  Value,
  Multiple extends boolean | undefined = false,
  Item = Value,
>({
  actionsRef,
  onOpenChange,
  ...props
}: ComboboxPrimitive.Root.Props<Value, Multiple, Item>) {
  const [internalRef, context, handleOpenChange] = useRootMotion(
    actionsRef,
    Boolean(props.multiple),
    onOpenChange,
  );

  return (
    <RootContext value={context}>
      <ComboboxPrimitive.Root
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

// Single selection: the check glides to the chosen item while the list
// closes. Multiple selection keeps the list open: a selected item's check
// pops in.
function ItemIndicator({ render, transition, ...props }: ItemIndicator.Props) {
  const root = React.use(RootContext);
  if (!root) {
    return <ComboboxPrimitive.ItemIndicator {...props} render={render} />;
  }

  return (
    <ComboboxPrimitive.ItemIndicator
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
  return <ComboboxPrimitive.Item {...useHighlightedItem(props)} />;
}

declare namespace Item {
  type Props = ComboboxPrimitive.Item.Props;
  type State = ComboboxPrimitive.Item.State;
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
  /**
   * Transition of a chip being added. Defaults to Motion's defaults, as v1's
   * checkbox check.
   */
  transition?: Transition;
};

/** Motion's defaults, which v1's checkbox check used: written out for the tempo. */
const CHIP_TRANSITION = {
  scale: { type: 'spring', stiffness: 550, damping: 30, restSpeed: 10 },
  opacity: { duration: 0.3, ease: [0.25, 0.1, 0.35, 1] },
} as const satisfies Transition;

// A chip added to the selection pops in from half its size, like v1's
// checkbox check; chips already there on mount don't. Removing one is
// instant: it's often Backspace, and its neighbours reflow.
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
  const pop = useTempoTransition(transition ?? CHIP_TRANSITION);

  // Before paint, so the chip never flashes at full opacity first.
  React.useLayoutEffect(() => {
    const element = elementRef.current;
    if (!entering || !element) return undefined;
    const controls = animate(
      element,
      { opacity: [0, 1], scale: [reduce ? 1 : 0.5, 1] },
      pop,
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
export import ChipRemove = ComboboxPrimitive.ChipRemove;
export import Row = ComboboxPrimitive.Row;
export import Collection = ComboboxPrimitive.Collection;
export import Empty = ComboboxPrimitive.Empty;
export import Clear = ComboboxPrimitive.Clear;
export import Separator = ComboboxPrimitive.Separator;
export import useFilter = ComboboxPrimitive.useFilter;
export import useFilteredItems = ComboboxPrimitive.useFilteredItems;
export import createItems = ComboboxPrimitive.createItems;

export { Root, Popup, Item, ItemIndicator, Chips, Chip };
