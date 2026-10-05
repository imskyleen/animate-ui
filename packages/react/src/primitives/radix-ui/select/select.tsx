'use client';

import * as React from 'react';
import { Select as SelectPrimitive } from 'radix-ui';
import {
  AnimatePresence,
  motion,
  PresenceContext,
  type Transition,
} from 'motion/react';

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
  GLIDE_TRANSITION,
  PICK_HOLD,
  useCheckRegistry,
  useRegisterCheck,
} from '../../../internal/item-indicator';

// Same API as Radix's Select. It has no Animate UI v1 counterpart: its list
// moves like the menus (a 250ms fade and scale from 0.9, both
// ways), a highlight glides behind the highlighted item, and the check glides
// to the chosen item on the highlight's spring. Choosing another item closes
// the list after a 200ms hold, so the check is seen landing (internal/
// item-indicator). The Root mirrors `open` (Radix keeps it private) so the
// Content can play an exit before Radix unmounts it.

const [OpenProvider, useOpen] = getStrictContext<{
  open: boolean;
  /** The list closed because an item was chosen, with a check to glide. */
  picked: boolean;
  /** Called by an item about to be chosen, just before Radix closes. */
  markPick: () => void;
  /** Lets a shown check register with the list. */
  registerCheck: () => () => void;
}>('Select.Root');

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

/** Animate UI's additions to `Select.Content`. */
type ContentAnimationProps = {
  /**
   * Transition of the opening, and of the closing unless `exitTransition` is
   * set. Defaults to `{ duration: 0.25, ease: [0.215, 0.61, 0.355, 1] }`.
   */
  transition?: Transition;
  /** Transition of the closing. Defaults to `transition`. */
  exitTransition?: Transition;
};

/** Animate UI's addition to `Select.ItemIndicator`. */
type IndicatorAnimationProps = {
  /**
   * Transition of the check moving to the chosen item. Defaults to the
   * highlight's spring (stiffness 350, damping 35).
   */
  transition?: Transition;
};

type OpenProps = Pick<
  SelectSharedProps,
  'open' | 'defaultOpen' | 'onOpenChange'
>;

/**
 * `open` controlled or not, exactly like Radix resolves it, and whether the
 * list closed because an item was chosen. Radix chooses an item from its
 * pointer and key handlers, which run right after the item's own: the item
 * marks itself there (`markPick`), and Radix closes the list in the same
 * event.
 */
function useOpenState({
  open: openProp,
  defaultOpen,
  onOpenChange,
}: OpenProps) {
  const controlled = openProp !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen ?? false);
  const open = controlled ? openProp : uncontrolled;
  const [picked, setPicked] = React.useState(false);
  const { registerCheck, hasCheck } = useCheckRegistry();
  const pickingRef = React.useRef(false);
  const markPick = React.useCallback(() => {
    pickingRef.current = true;
    // Only for this event: an item that wasn't chosen leaves no mark.
    queueMicrotask(() => {
      pickingRef.current = false;
    });
  }, []);

  const setOpen = (next: boolean) => {
    if (!controlled) setUncontrolled(next);
    // A check is shown (the chosen one isn't mounted yet): it will glide.
    setPicked(!next && pickingRef.current && hasCheck());
    onOpenChange?.(next);
  };

  return { open, setOpen, picked, markPick, registerCheck };
}

/**
 * The checks of an open list share it: the check glides to the chosen item.
 * Only in the animated list: Radix also renders the items of a closed select,
 * off-screen.
 */
const IndicatorLayoutContext = React.createContext<string | null>(null);

function Root(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  const { open, setOpen, picked, markPick, registerCheck } =
    useOpenState(props);

  return (
    <OpenProvider value={{ open, picked, markPick, registerCheck }}>
      <SelectPrimitive.Root {...props} open={open} onOpenChange={setOpen} />
    </OpenProvider>
  );
}

function Provider(
  props: React.ComponentProps<typeof SelectPrimitive.unstable_Provider>,
) {
  const { open, setOpen, picked, markPick, registerCheck } =
    useOpenState(props);

  return (
    <OpenProvider value={{ open, picked, markPick, registerCheck }}>
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
  const keepMounted = Boolean(forceMount ?? portal.forceMount);
  const enter = useTempoTransition(transition ?? MENU_TRANSITION);
  const exit = useTempoTransition(
    exitTransition ?? transition ?? MENU_TRANSITION,
  );

  // True while the list is open or playing its exit.
  const [present, setPresent] = React.useState(open);
  if (open && !present) setPresent(true);

  return (
    <>
      <AnimatePresence onExitComplete={() => setPresent(false)}>
        {(open || keepMounted) && (
          <ReducedMotionConfig key="content">
            <ContentMotion {...props} enter={enter} exit={exit} />
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
  const { open, picked, registerCheck } = useOpen();
  const reduce = useShouldReduceMotion();
  const { delay: hold = 0 } = useTempoTransition({ delay: PICK_HOLD });
  // Closing because an item was chosen: the list holds still while the check
  // glides there (it doesn't glide under reduced motion).
  const exitDelay = (exit as { delay?: number }).delay ?? 0;
  const leave: Transition =
    picked && !reduce ? { ...exit, delay: exitDelay + hold } : exit;
  const layoutId = React.useId();
  // Item-aligned (Radix's default) lays the list over the trigger, lining the
  // selected item up with the value, and measures it on mount: a scale would
  // skew that measure, and there's no anchor side to grow from. Fade only.
  const popper = props.position === 'popper';
  // `scale` (like v1's menus): `transform: none` once settled.
  const hidden = popper
    ? { opacity: 0, scale: reduce ? 1 : HIDDEN_SCALE.menu }
    : { opacity: 0 };
  const visible = popper ? { opacity: 1, scale: 1 } : { opacity: 1 };

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
            : { ...hidden, transition: leave }
        }
        exit={{ ...hidden, transition: leave }}
        // A closing (or force-mounted closed) list can't be clicked through.
        inert={!open}
        style={{
          transformOrigin: popper
            ? 'var(--radix-select-content-transform-origin)'
            : undefined,
          // The highlight goes under the items' content, above the list's
          // background: the list is its own stacking context.
          isolation: 'isolate',
          ...style,
        }}
      >
        <IndicatorLayoutContext value={layoutId}>
          <CheckRegistryContext value={registerCheck}>
            <HighlightScope open={open}>{children}</HighlightScope>
          </CheckRegistryContext>
        </IndicatorLayoutContext>
      </motion.div>
    </SelectPrimitive.Content>
  );
}

const Viewport = SelectPrimitive.Viewport;
const Group = SelectPrimitive.Group;
const Label = SelectPrimitive.Label;

/** Radix's keys to choose an item. */
const SELECTION_KEYS = new Set(['Enter', ' ']);

/**
 * Takes part in the list's highlight (pointer and arrow keys alike), and
 * tells the Root when it's being chosen.
 */
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
  const { markPick } = useOpen();
  const { ref: highlightRef, highlight } = useItemHighlight(disabled);
  const mergedRef = React.useMemo(
    () => mergeRefs(ref, highlightRef),
    [ref, highlightRef],
  );
  // Run before Radix's own handlers, which choose the item and close.
  const mark = (event: React.SyntheticEvent) => {
    if (!disabled && !event.defaultPrevented) markPick();
  };
  return (
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
  );
}

const ItemText = SelectPrimitive.ItemText;

/**
 * Shows with the list; choosing another item moves it there, while the list
 * holds still before it closes.
 */
function ItemIndicator({
  transition,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ItemIndicator> &
  IndicatorAnimationProps) {
  const layoutId = React.use(IndicatorLayoutContext);
  const glide = useTempoTransition(transition ?? GLIDE_TRANSITION);
  if (!layoutId) {
    return (
      <SelectPrimitive.ItemIndicator {...props}>
        {children}
      </SelectPrimitive.ItemIndicator>
    );
  }
  return (
    <SelectPrimitive.ItemIndicator {...props} asChild>
      <CheckMotion layoutId={layoutId} transition={glide}>
        {children}
      </CheckMotion>
    </SelectPrimitive.ItemIndicator>
  );
}

function CheckMotion({
  layoutId,
  transition,
  ...props
}: React.ComponentProps<'span'> & {
  layoutId: string;
  transition: Transition;
}) {
  // Shown (Radix renders it for the chosen item only): choosing another item
  // holds the list while it glides.
  useRegisterCheck(true);
  return (
    // Out of the list's exit: the list doesn't wait for the glide to end
    // before it unmounts.
    <PresenceContext value={null}>
      <motion.span
        {...(props as React.ComponentProps<typeof motion.span>)}
        layoutId={layoutId}
        // One check moving, not two crossfading.
        layoutCrossfade={false}
        transition={transition}
      />
    </PresenceContext>
  );
}
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
