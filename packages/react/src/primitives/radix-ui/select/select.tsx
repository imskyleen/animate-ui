'use client';

import * as React from 'react';
import { Select as SelectPrimitive } from 'radix-ui';
import { AnimatePresence, type Transition } from 'motion/react';

import { getStrictContext } from '../../../utils/strict-context';
import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import {
  HIDDEN_SCALE,
  MENU_TRANSITION,
  mergeRefs,
} from '../../../internal/anchored';
import {
  HighlightScope,
  useItemHighlight,
  withHighlight,
} from '../../../internal/item-highlight';
import {
  CheckRegistryContext,
  ItemCheck,
  usePickHold,
  useCheckGroup,
  useCheckRegistry,
  type CheckGroup,
  type ItemCheckAnimationProps,
  type Picked,
  type RegisterCheck,
} from '../../../internal/item-indicator';
import { MotionSlot, slotChild } from '../../../internal/modal-motion';

const [OpenProvider, useOpen] = getStrictContext<{
  open: boolean;
  value: string | undefined;
  picked: Picked;
  markPick: (item: Element) => void;
  registerCheck: RegisterCheck;
}>('Select.Root');

const ItemSelectedContext = React.createContext<boolean | null>(null);

type SelectProps = SelectPrimitive.SelectProps;
type SelectTriggerProps = SelectPrimitive.SelectTriggerProps;
type SelectValueProps = SelectPrimitive.SelectValueProps;
type SelectIconProps = SelectPrimitive.SelectIconProps;
type SelectPortalProps = SelectPrimitive.SelectPortalProps;
type SelectContentProps = SelectPrimitive.SelectContentProps &
  ContentAnimationProps;
type SelectViewportProps = SelectPrimitive.SelectViewportProps;
type SelectGroupProps = SelectPrimitive.SelectGroupProps;
type SelectLabelProps = SelectPrimitive.SelectLabelProps;
type SelectItemProps = SelectPrimitive.SelectItemProps;
type SelectItemTextProps = SelectPrimitive.SelectItemTextProps;
type SelectItemIndicatorProps = SelectPrimitive.SelectItemIndicatorProps &
  IndicatorAnimationProps;
type SelectScrollUpButtonProps = SelectPrimitive.SelectScrollUpButtonProps;
type SelectScrollDownButtonProps = SelectPrimitive.SelectScrollDownButtonProps;
type SelectSeparatorProps = SelectPrimitive.SelectSeparatorProps;
type SelectArrowProps = SelectPrimitive.SelectArrowProps;
type SelectSharedProps = SelectPrimitive.SelectSharedProps;
type unstable_SelectProviderProps =
  SelectPrimitive.unstable_SelectProviderProps;
type unstable_SelectBubbleInputProps =
  SelectPrimitive.unstable_SelectBubbleInputProps;

type ContentAnimationProps = {
  transition?: Transition;
  exitTransition?: Transition;
};

type IndicatorAnimationProps = ItemCheckAnimationProps;

type OpenProps = Pick<
  SelectSharedProps,
  'open' | 'defaultOpen' | 'onOpenChange'
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

function useOpenState({
  open: openProp,
  defaultOpen,
  onOpenChange,
  value: valueProp,
  defaultValue,
  onValueChange,
}: OpenProps) {
  const controlled = openProp !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen ?? false);
  const open = controlled ? openProp : uncontrolled;
  const [ownValue, setOwnValue] = React.useState(defaultValue);
  const value = valueProp !== undefined ? valueProp : ownValue;
  const [picked, setPicked] = React.useState<Picked>(false);
  const { registerCheck, checkOf } = useCheckRegistry();
  const pickedRef = React.useRef<Element | null>(null);
  const markPick = React.useCallback((item: Element) => {
    pickedRef.current = item;
    queueMicrotask(() => {
      pickedRef.current = null;
    });
  }, []);

  const setOpen = (next: boolean) => {
    if (!controlled) setUncontrolled(next);
    const item = pickedRef.current;
    setPicked(!next && item !== null && checkOf(item));
    onOpenChange?.(next);
  };
  const setValue = (next: string) => {
    setOwnValue(next);
    onValueChange?.(next);
  };

  return {
    state: { open, value, picked, markPick, registerCheck },
    radix: { open, onOpenChange: setOpen, onValueChange: setValue },
  };
}

const IndicatorGroupContext = React.createContext<CheckGroup | null>(null);

function Root(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  const { state, radix } = useOpenState(props);

  return (
    <OpenProvider value={state}>
      <SelectPrimitive.Root {...props} {...radix} />
    </OpenProvider>
  );
}

function Provider(
  props: React.ComponentProps<typeof SelectPrimitive.unstable_Provider>,
) {
  const { state, radix } = useOpenState(props);

  return (
    <OpenProvider value={state}>
      <SelectPrimitive.unstable_Provider {...props} {...radix} />
    </OpenProvider>
  );
}

const Trigger = SelectPrimitive.Trigger;
const Value = SelectPrimitive.Value;
const Icon = SelectPrimitive.Icon;

function Portal({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  forceMount,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Portal>) {
  return <SelectPrimitive.Portal {...props} />;
}

function Content({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  forceMount,
  transition,
  exitTransition,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content> &
  ContentAnimationProps) {
  const { open } = useOpen();
  const enter = useTempoTransition(transition ?? MENU_TRANSITION);
  const exit = useTempoTransition(
    exitTransition ?? transition ?? MENU_TRANSITION,
  );

  const [present, setPresent] = React.useState(open);
  if (open && !present) setPresent(true);

  return (
    <>
      <AnimatePresence onExitComplete={() => setPresent(false)}>
        {open && (
          <ReducedMotionConfig key="content">
            <ContentMotion {...props} enter={enter} exit={exit} />
          </ReducedMotionConfig>
        )}
      </AnimatePresence>
      {!present && <SelectPrimitive.Content {...props} />}
    </>
  );
}

type ContentMotionProps = Omit<
  React.ComponentProps<typeof SelectPrimitive.Content>,
  'forceMount'
> & {
  enter: Transition;
  exit: Transition;
};

function ContentMotion({
  enter,
  exit,
  asChild,
  children,
  style,
  ...props
}: ContentMotionProps) {
  const { open, picked, registerCheck } = useOpen();
  const reduce = useShouldReduceMotion();
  const hold = usePickHold();
  const exitDelay = (exit as { delay?: number }).delay ?? 0;
  const leave: Transition =
    picked && !reduce ? { ...exit, delay: exitDelay + hold(picked) } : exit;
  const group = useCheckGroup();
  const popper = props.position === 'popper';
  const hidden = popper
    ? { opacity: 0, scale: reduce ? 1 : HIDDEN_SCALE.menu }
    : { opacity: 0 };
  const visible = popper ? { opacity: 1, scale: 1 } : { opacity: 1 };

  const slot = slotChild(asChild, children);
  return (
    <SelectPrimitive.Content {...props} forceMount asChild>
      <MotionSlot
        element={slot.element}
        initial={hidden}
        animate={
          open
            ? { ...visible, transition: enter }
            : { ...hidden, transition: leave }
        }
        exit={{ ...hidden, transition: leave }}
        inert={!open}
        style={{
          transformOrigin: popper
            ? 'var(--radix-select-content-transform-origin)'
            : undefined,
          isolation: 'isolate',
          ...style,
        }}
      >
        <IndicatorGroupContext value={group}>
          <CheckRegistryContext value={registerCheck}>
            <HighlightScope open={open}>{slot.inner}</HighlightScope>
          </CheckRegistryContext>
        </IndicatorGroupContext>
      </MotionSlot>
    </SelectPrimitive.Content>
  );
}

const Viewport = SelectPrimitive.Viewport;
const Group = SelectPrimitive.Group;
const Label = SelectPrimitive.Label;

const SELECTION_KEYS = new Set(['Enter', ' ']);

function Item({
  asChild,
  disabled,
  children,
  ref,
  onPointerUp,
  onClick,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  const { value, markPick } = useOpen();
  const { ref: highlightRef, highlight } = useItemHighlight(disabled);
  const mergedRef = React.useMemo(
    () => mergeRefs(ref, highlightRef),
    [ref, highlightRef],
  );
  const mark = (event: React.SyntheticEvent<HTMLDivElement>) => {
    const item = event.currentTarget;
    if (
      !disabled &&
      !event.defaultPrevented &&
      item.getAttribute('data-state') !== 'checked'
    )
      markPick(item);
  };
  return (
    <ItemSelectedContext value={value === props.value}>
      <SelectPrimitive.Item
        {...props}
        ref={mergedRef}
        asChild={asChild}
        disabled={disabled}
        onPointerUp={(event) => {
          onPointerUp?.(event);
          mark(event);
        }}
        onClick={(event) => {
          onClick?.(event);
          mark(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (SELECTION_KEYS.has(event.key)) mark(event);
        }}
      >
        {withHighlight(children, highlight, asChild)}
      </SelectPrimitive.Item>
    </ItemSelectedContext>
  );
}

const ItemText = SelectPrimitive.ItemText;

function ItemIndicator({
  animation,
  transition,
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ItemIndicator> &
  IndicatorAnimationProps) {
  const group = React.use(IndicatorGroupContext);
  const selected = React.use(ItemSelectedContext);
  if (!group || selected === null || asChild) {
    return (
      <SelectPrimitive.ItemIndicator {...props} asChild={asChild}>
        {children}
      </SelectPrimitive.ItemIndicator>
    );
  }
  return (
    <ItemCheck
      aria-hidden
      {...(props as React.ComponentProps<'span'>)}
      multiple={false}
      group={group}
      checked={selected}
      animation={animation}
      transition={transition}
    >
      {children}
    </ItemCheck>
  );
}
const ScrollUpButton = SelectPrimitive.ScrollUpButton;
const ScrollDownButton = SelectPrimitive.ScrollDownButton;
const Separator = SelectPrimitive.Separator;
const Arrow = SelectPrimitive.Arrow;
const BubbleInput = SelectPrimitive.unstable_BubbleInput;

const createSelectScope: typeof SelectPrimitive.createSelectScope =
  SelectPrimitive.createSelectScope;

Content.displayName = 'SelectContent';
Item.displayName = 'SelectItem';
ItemIndicator.displayName = 'SelectItemIndicator';

export {
  Root,
  Trigger,
  Value,
  Icon,
  Portal,
  Content,
  Viewport,
  Group,
  Label,
  Item,
  ItemText,
  ItemIndicator,
  ScrollUpButton,
  ScrollDownButton,
  Separator,
  Arrow,
  Root as Select,
  Trigger as SelectTrigger,
  Value as SelectValue,
  Icon as SelectIcon,
  Portal as SelectPortal,
  Content as SelectContent,
  Viewport as SelectViewport,
  Group as SelectGroup,
  Label as SelectLabel,
  Item as SelectItem,
  ItemText as SelectItemText,
  ItemIndicator as SelectItemIndicator,
  ScrollUpButton as SelectScrollUpButton,
  ScrollDownButton as SelectScrollDownButton,
  Separator as SelectSeparator,
  Arrow as SelectArrow,
  Provider as unstable_Provider,
  Provider as unstable_SelectProvider,
  BubbleInput as unstable_BubbleInput,
  BubbleInput as unstable_SelectBubbleInput,
  createSelectScope,
  type SelectProps,
  type SelectSharedProps,
  type SelectTriggerProps,
  type SelectValueProps,
  type SelectIconProps,
  type SelectPortalProps,
  type SelectContentProps,
  type SelectViewportProps,
  type SelectGroupProps,
  type SelectLabelProps,
  type SelectItemProps,
  type SelectItemTextProps,
  type SelectItemIndicatorProps,
  type SelectScrollUpButtonProps,
  type SelectScrollDownButtonProps,
  type SelectSeparatorProps,
  type SelectArrowProps,
  type unstable_SelectProviderProps,
  type unstable_SelectBubbleInputProps,
};
