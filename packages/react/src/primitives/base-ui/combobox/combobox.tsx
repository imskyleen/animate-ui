'use client';

import * as React from 'react';
import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { animate, type Transition } from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { mergeRefs } from '../../../internal/anchored';
import {
  CHIP_EXIT_TRANSITION,
  CHIP_SCALE,
  CHIP_TRANSITION,
  REFLOW_TRANSITION,
  useReflow,
  type Reflow,
} from '../../../internal/reflow';
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
// (see ../select/motion.tsx). A chip added to the selection pops in, a
// removed one shrinks out, and the others (the input too) glide to make
// room or close the gap (internal/reflow). With an `actionsRef`, Base UI
// keeps the popup mounted until we unmount it after the exit animation; it
// also waits until then to reset the query and sync the input, so the list
// doesn't change while it fades out.

const RootContext = React.createContext<RootMotion | null>(null);

type ChipsMotion = {
  /** True once the Chips have mounted: later chips were just added. */
  mounted: React.RefObject<boolean>;
  reflow: Reflow;
};

const ChipsContext = React.createContext<ChipsMotion | null>(null);

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

// An item's check draws itself when the item is chosen and erases itself
// when it's not anymore (with `pop`, it pops in and out, and a single
// selection's check glides to the chosen item), while a closing list holds.
function ItemIndicator({
  render,
  animation,
  transition,
  ...props
}: ItemIndicator.Props) {
  const root = React.use(RootContext);
  if (!root) {
    return <ComboboxPrimitive.ItemIndicator {...props} render={render} />;
  }

  return (
    <ComboboxPrimitive.ItemIndicator
      {...props}
      // Kept mounted, to hide itself when its item isn't chosen anymore.
      keepMounted
      render={(elementProps, state) => (
        <IndicatorMotion
          render={render as IndicatorRender}
          props={elementProps as Record<string, unknown>}
          state={state}
          multiple={root.multiple}
          animation={animation}
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

// Lays the chips out: they glide in it when one is added or removed.
function Chips({ ref, ...props }: Chips.Props) {
  const mountedRef = React.useRef(false);
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const elementRef = React.useRef<HTMLDivElement | null>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, elementRef), [ref]);
  const reduce = useShouldReduceMotion();
  const glide = useTempoTransition(REFLOW_TRANSITION);
  const reflow = useReflow({
    container: () => elementRef.current,
    glide,
    reduce,
  });
  const motion = React.useMemo(
    () => ({ mounted: mountedRef, reflow }),
    [reflow],
  );

  return (
    <ChipsContext value={motion}>
      <ComboboxPrimitive.Chips {...props} ref={mergedRef} />
    </ChipsContext>
  );
}

declare namespace Chips {
  type Props = ComboboxPrimitive.Chips.Props & {
    ref?: React.Ref<HTMLDivElement>;
  };
  type State = ComboboxPrimitive.Chips.State;
}

/** Animate UI's additions to `Chip`. */
type ChipAnimationProps = {
  /**
   * Transition of a chip being added: it pops in from half its size. Defaults
   * to a spring (stiffness 300, damping 25).
   */
  transition?: Transition;
  /**
   * Transition of a removed chip shrinking out. Defaults to 0.15s on a
   * strong ease-out.
   */
  exitTransition?: Transition;
};

// A chip added to the selection pops in from half its size; chips already
// there on mount don't. A removed one (with its remove button or Backspace)
// shrinks out in place, out of the flow, while the others close the gap.
function Chip(props: Chip.Props) {
  return (
    <ReducedMotionConfig>
      <AnimatedChip {...props} />
    </ReducedMotionConfig>
  );
}

// Inside ReducedMotionConfig, so useShouldReduceMotion() sees it.
function AnimatedChip({
  ref,
  transition,
  exitTransition,
  ...props
}: Chip.Props) {
  const chips = React.use(ChipsContext);
  const [entering] = React.useState(() => {
    const added = chips?.mounted.current === true;
    // Where the others are, before this chip pushes them.
    if (added) chips?.reflow.measure();
    return added;
  });
  const elementRef = React.useRef<HTMLDivElement | null>(null);
  const reduce = useShouldReduceMotion();
  const pop = useTempoTransition(transition ?? CHIP_TRANSITION);
  const out = useTempoTransition(exitTransition ?? CHIP_EXIT_TRANSITION);
  // Read when it leaves.
  const exitRef = React.useRef({ out, reduce });
  React.useLayoutEffect(() => {
    exitRef.current = { out, reduce };
  });

  // Before paint, so the chip never flashes at full opacity first.
  React.useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;
    const controls = entering
      ? animate(
          element,
          { opacity: [0, 1], scale: [reduce ? 1 : CHIP_SCALE, 1] },
          pop,
        )
      : null;
    if (entering) chips?.reflow.settle();
    return () => {
      controls?.stop();
      // Removed: it leaves through a copy, the others close the gap.
      chips?.reflow.leave(element, exitRef.current.out, exitRef.current.reduce);
    };
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
