'use client';

import * as React from 'react';
import { Select as SelectPrimitive } from 'radix-ui';
import { AnimatePresence, motion, type Transition } from 'motion/react';

import { getStrictContext } from '../../../utils/strict-context';
import {
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
} from '../../../utils/motion';

// Same API as Radix's Select. The Root mirrors `open` (Radix keeps it private)
// so the Content can play an exit before Radix unmounts it.

const [OpenProvider, useOpen] = getStrictContext<{ open: boolean }>(
  'Select.Root',
);

// `forceMount` on the Portal applies to the Content, like in Radix.
const PortalContext = React.createContext<{ forceMount?: true }>({});

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
type SelectItemIndicatorProps = SelectPrimitive.SelectItemIndicatorProps;
type SelectScrollUpButtonProps = SelectPrimitive.SelectScrollUpButtonProps;
type SelectScrollDownButtonProps = SelectPrimitive.SelectScrollDownButtonProps;
type SelectSeparatorProps = SelectPrimitive.SelectSeparatorProps;
type SelectArrowProps = SelectPrimitive.SelectArrowProps;
type SelectSharedProps = SelectPrimitive.SelectSharedProps;
type unstable_SelectProviderProps =
  SelectPrimitive.unstable_SelectProviderProps;
type unstable_SelectBubbleInputProps =
  SelectPrimitive.unstable_SelectBubbleInputProps;

/** Animate UI's additions to `Select.Content`. */
type ContentAnimationProps = {
  /** Transition of the opening. Defaults to `transition.dropdown` (600ms). */
  transition?: Transition;
  /** Transition of the closing. Defaults to `transition.exit` (400ms). */
  exitTransition?: Transition;
};

type OpenProps = Pick<
  SelectSharedProps,
  'open' | 'defaultOpen' | 'onOpenChange'
>;

/** `open` controlled or not, exactly like Radix resolves it. */
function useOpenState({
  open: openProp,
  defaultOpen,
  onOpenChange,
}: OpenProps) {
  const controlled = openProp !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen ?? false);
  const open = controlled ? openProp : uncontrolled;

  const setOpen = (next: boolean) => {
    if (!controlled) setUncontrolled(next);
    onOpenChange?.(next);
  };

  return [open, setOpen] as const;
}

function Root(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  const [open, setOpen] = useOpenState(props);

  return (
    <OpenProvider value={{ open }}>
      <SelectPrimitive.Root {...props} open={open} onOpenChange={setOpen} />
    </OpenProvider>
  );
}

function Provider(
  props: React.ComponentProps<typeof SelectPrimitive.unstable_Provider>,
) {
  const [open, setOpen] = useOpenState(props);

  return (
    <OpenProvider value={{ open }}>
      <SelectPrimitive.unstable_Provider
        {...props}
        open={open}
        onOpenChange={setOpen}
      />
    </OpenProvider>
  );
}

const Trigger = SelectPrimitive.Trigger;
const Value = SelectPrimitive.Value;
const Icon = SelectPrimitive.Icon;

function Portal(props: React.ComponentProps<typeof SelectPrimitive.Portal>) {
  return (
    <PortalContext value={{ forceMount: props.forceMount }}>
      <SelectPrimitive.Portal {...props} />
    </PortalContext>
  );
}

function Content({
  forceMount,
  transition,
  exitTransition,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content> &
  ContentAnimationProps) {
  const { open } = useOpen();
  const portal = React.use(PortalContext);
  const tokens = useMotionTokens();
  const keepMounted = Boolean(forceMount ?? portal.forceMount);

  // True while the list is open or playing its exit.
  const [present, setPresent] = React.useState(open);
  if (open && !present) setPresent(true);

  return (
    <>
      <AnimatePresence onExitComplete={() => setPresent(false)}>
        {(open || keepMounted) && (
          <ReducedMotionConfig key="content">
            <ContentMotion
              {...props}
              enter={transition ?? tokens.transition.dropdown}
              exit={exitTransition ?? tokens.transition.exit}
            />
          </ReducedMotionConfig>
        )}
      </AnimatePresence>
      {/* Once the exit is over, Radix's closed Content takes back: it keeps the
          items mounted off-screen, so the trigger shows the selected label,
          typeahead works on the closed trigger and forms submit. */}
      {!present && !keepMounted && <SelectPrimitive.Content {...props} />}
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

// Inside ReducedMotionConfig, so useShouldReduceMotion() sees it.
function ContentMotion({
  enter,
  exit,
  children,
  style,
  ...props
}: ContentMotionProps) {
  // From context, not props: AnimatePresence freezes the props of an exiting
  // child, but context still reaches it, so the closing list turns inert.
  const { open } = useOpen();
  const reduce = useShouldReduceMotion();
  const { scale } = useMotionTokens();
  // Item-aligned (Radix's default) lays the list over the trigger, lining the
  // selected item up with the value, and measures it on mount: a scale would
  // skew that measure, and there's no anchor side to grow from. Fade only.
  const popper = props.position === 'popper';
  const hidden = popper
    ? { opacity: 0, transform: `scale(${reduce ? 1 : scale.enter})` }
    : { opacity: 0 };
  const visible = popper
    ? { opacity: 1, transform: 'scale(1)' }
    : { opacity: 1 };

  return (
    // Radix's props (className, data-state, data-side, role, ids…) land on
    // the motion.div through asChild; it only carries the animation.
    <SelectPrimitive.Content {...props} forceMount asChild>
      <motion.div
        initial={hidden}
        // Transitions live in the targets: an exiting element keeps the props
        // of its last render, when it was still open.
        animate={
          open
            ? { ...visible, transition: enter }
            : { ...hidden, transition: exit }
        }
        exit={{ ...hidden, transition: exit }}
        // A closing (or force-mounted closed) list can't be clicked through.
        inert={!open}
        style={{
          transformOrigin: popper
            ? 'var(--radix-select-content-transform-origin)'
            : undefined,
          ...style,
        }}
      >
        {children}
      </motion.div>
    </SelectPrimitive.Content>
  );
}

const Viewport = SelectPrimitive.Viewport;
const Group = SelectPrimitive.Group;
const Label = SelectPrimitive.Label;
// No animated highlight: arrow keys move it, and keyboard navigation stays
// instant. Style `data-highlighted` / `:focus` instead.
const Item = SelectPrimitive.Item;
const ItemText = SelectPrimitive.ItemText;
// Not animated: it only mounts with the list (choosing an item closes it), so
// a fade would just repeat the list's.
const ItemIndicator = SelectPrimitive.ItemIndicator;
const ScrollUpButton = SelectPrimitive.ScrollUpButton;
const ScrollDownButton = SelectPrimitive.ScrollDownButton;
const Separator = SelectPrimitive.Separator;
const Arrow = SelectPrimitive.Arrow;
const BubbleInput = SelectPrimitive.unstable_BubbleInput;

const createSelectScope: typeof SelectPrimitive.createSelectScope =
  SelectPrimitive.createSelectScope;

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
