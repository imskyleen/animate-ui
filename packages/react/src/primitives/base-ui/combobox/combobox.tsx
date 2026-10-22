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
import { useInputSwap } from '../../../internal/value-swap';
import {
  CHIP_EXIT_TRANSITION,
  CHIP_SCALE,
  CHIP_TRANSITION,
  PLACEHOLDER_TRANSITION,
  REFLOW_STYLE,
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

const RootContext = React.createContext<RootMotion | null>(null);

type ChipsMotion = {
  mounted: React.RefObject<boolean>;
  reflow: Reflow;
};

const ChipsContext = React.createContext<ChipsMotion | null>(null);

// The root tells its input when an option is picked, so the input's text swaps.
const PickedContext = React.createContext<
  ((changed: () => void) => () => void) | null
>(null);

function Root<
  Value,
  Multiple extends boolean | undefined = false,
  Item = Value,
>({
  actionsRef,
  onOpenChange,
  onValueChange,
  ...props
}: ComboboxPrimitive.Root.Props<Value, Multiple, Item>) {
  const [internalRef, context, handleOpenChange] = useRootMotion(
    actionsRef,
    Boolean(props.multiple),
    onOpenChange,
  );
  const pickedRef = React.useRef<(() => void) | null>(null);
  const registerPicked = React.useCallback((changed: () => void) => {
    pickedRef.current = changed;
    return () => {
      if (pickedRef.current === changed) pickedRef.current = null;
    };
  }, []);

  return (
    <RootContext value={context}>
      <PickedContext value={registerPicked}>
        <ComboboxPrimitive.Root
          {...props}
          actionsRef={internalRef}
          onOpenChange={handleOpenChange}
          onValueChange={(
            ...args: Parameters<NonNullable<typeof onValueChange>>
          ) => {
            onValueChange?.(...args);
            pickedRef.current?.();
          }}
        />
      </PickedContext>
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
  type Props = Omit<ComboboxPrimitive.Popup.Props, 'render'> &
    PopupAnimationProps;
  type State = ComboboxPrimitive.Popup.State;
}

function PopupMotion({ transition, exitTransition, ...props }: Popup.Props) {
  const root = React.use(RootContext);
  const render = usePopupRender(root, { transition, exitTransition });
  return <ComboboxPrimitive.Popup {...props} render={render} />;
}

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
  const fade = useTempoTransition(PLACEHOLDER_TRANSITION);
  const reflow = useReflow({
    container: () => elementRef.current,
    glide,
    fade,
    reduce,
  });
  const motion = React.useMemo(
    () => ({ mounted: mountedRef, reflow }),
    [reflow],
  );

  return (
    <ChipsContext value={motion}>
      <style href={REFLOW_STYLE.href} precedence="animate-ui">
        {REFLOW_STYLE.css}
      </style>
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

type ChipAnimationProps = {
  transition?: Transition;
  exitTransition?: Transition;
};

function Chip(props: Chip.Props) {
  return (
    <ReducedMotionConfig>
      <AnimatedChip {...props} />
    </ReducedMotionConfig>
  );
}

function AnimatedChip({
  ref,
  transition,
  exitTransition,
  ...props
}: Chip.Props) {
  const chips = React.use(ChipsContext);
  const [entering] = React.useState(() => {
    const added = chips?.mounted.current === true;
    if (added) chips?.reflow.measure();
    return added;
  });
  const elementRef = React.useRef<HTMLDivElement | null>(null);
  const reduce = useShouldReduceMotion();
  const pop = useTempoTransition(transition ?? CHIP_TRANSITION);
  const out = useTempoTransition(exitTransition ?? CHIP_EXIT_TRANSITION);
  const exitRef = React.useRef({ out, reduce });
  React.useLayoutEffect(() => {
    exitRef.current = { out, reduce };
  });

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
      chips?.reflow.leave(element, exitRef.current.out, exitRef.current.reduce);
    };
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

export import Label = ComboboxPrimitive.Label;
export import Value = ComboboxPrimitive.Value;
export import InputGroup = ComboboxPrimitive.InputGroup;
export import Trigger = ComboboxPrimitive.Trigger;
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

function Input({ ref, ...props }: Input.Props) {
  const registerPicked = React.use(PickedContext);
  const swap = useInputSwap();
  const { changed } = swap;
  React.useEffect(() => registerPicked?.(changed));
  return <ComboboxPrimitive.Input ref={mergeRefs(ref, swap.ref)} {...props} />;
}

declare namespace Input {
  type Props = React.ComponentProps<typeof ComboboxPrimitive.Input>;
}

export { Root, Input, Popup, Item, ItemIndicator, Chips, Chip };
