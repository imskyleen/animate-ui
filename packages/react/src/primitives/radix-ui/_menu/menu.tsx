'use client';

import * as React from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  type Transition,
} from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import {
  HIDDEN_SCALE,
  MENU_TRANSITION,
  MORPH_TRANSITION,
  mergeRefs,
} from '../../../internal/anchored';
import {
  HighlightScope,
  useItemHighlight,
  withHighlight,
} from '../../../internal/item-highlight';
import {
  HandoffNestedContext,
  MenuHandoffContext,
  takeOver,
  useHandoffNested,
  useMenuHandoff,
} from '../../../internal/menu-handoff';
import {
  CheckRegistryContext,
  ItemCheck,
  usePickHold,
  PickContext,
  useCheckGroup,
  usePicks,
  type CheckGroup,
  type ItemCheckAnimationProps,
  type Picked,
} from '../../../internal/item-indicator';

// Shared by Radix's Dropdown Menu, Context Menu and Menubar: the three are
// built on the same internal Menu, so they animate the same way (Animate UI
// v1's DropdownMenu). Each module passes its own Radix parts to these
// factories.
//
// - Content and SubContent fade and scale from 0.9 in 220ms, both ways.
// - One highlight glides behind the highlighted item (internal/item-highlight).
// - An item's check draws itself when it's checked (or the menu opens), and
//   erases itself when it's unchecked, like a checkbox's; with `pop`, it pops
//   in and out, and a radio item's check glides to the newly checked item,
//   like a select's (internal/item-indicator).
// - Choosing an item closes the menu (Radix's default): when its check
//   changes, the menu holds still first (250ms for a drawn check, 150ms
//   for a glide or a pop), so the change is seen.

/** Animate UI's additions to the parts that appear and disappear. */
type PresenceAnimationProps = {
  /**
   * Transition of the entrance (and, in a menubar, of the popover moving to
   * the next menu), and of the exit unless `exitTransition` is set. Defaults
   * to `{ duration: 0.22, ease: [0.215, 0.61, 0.355, 1] }`, and in a menubar
   * the popover moves on `{ type: 'spring', stiffness: 660, damping: 52 }`.
   */
  transition?: Transition;
  /** Transition of the exit. Defaults to `transition`. */
  exitTransition?: Transition;
};

/** Animate UI's additions to `ItemIndicator`. */
type IndicatorAnimationProps = ItemCheckAnimationProps;

type MenuState = {
  open: boolean;
  /**
   * It closed because an item was chosen whose check moves: how it shows
   * (it holds for it).
   */
  picked?: Picked;
};

// Nullable contexts: a part used outside Animate UI's Root falls back to the
// plain Radix part instead of throwing.
const MenuStateContext = React.createContext<MenuState | null>(null);
/** `forceMount` passed by the user to the Portal (Animate UI always mounts it). */
const PortalForceMountContext = React.createContext(false);

type IndicatorItem = {
  checked: boolean | 'indeterminate';
  kind: 'checkbox' | 'radio';
  /** The group of a radio item's check: it glides between them (`pop`). */
  group?: CheckGroup;
};

/** The checked state of the closest checkbox or radio item. */
const IndicatorItemContext = React.createContext<IndicatorItem | null>(null);
const RadioGroupContext = React.createContext<{
  value: string | undefined;
  group: CheckGroup;
} | null>(null);

type OpenStateProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/** Mirrors Radix's open state, which it keeps private. */
function useOpenState({ open, defaultOpen, onOpenChange }: OpenStateProps) {
  const controlled = open !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen ?? false);
  const value = controlled ? open : uncontrolled;
  const setValue = (next: boolean) => {
    if (!controlled) setUncontrolled(next);
    onOpenChange?.(next);
  };
  return [value, setValue] as const;
}

/**
 * A menu's picks, for its root (a Root, or a Menubar): `onClose` reads them
 * when the menu closes. Its submenus and items use the same.
 */
function useMenuPicks() {
  const { picks, registerCheck, wasPicked } = usePicks();
  const [picked, setPicked] = React.useState<Picked>(false);
  const onOpenChange = (open: boolean) => setPicked(!open && wasPicked());
  const provide = (children: React.ReactNode) => (
    <PickContext value={picks}>
      <CheckRegistryContext value={registerCheck}>
        {children}
      </CheckRegistryContext>
    </PickContext>
  );
  return { picked, onOpenChange, provide };
}

/** `Root` and `Sub`: they track the open state and give it back to Radix. */
function createOpenRoot<P extends OpenStateProps>(
  RadixRoot: React.ComponentType<P>,
  { sub = false }: { sub?: boolean } = {},
) {
  function OpenRoot(props: P) {
    // A Sub closes with its root: the root's picks hold it too.
    const parent = React.use(MenuStateContext);
    const picks = useMenuPicks();
    const [open, setOpen] = useOpenState(props);
    const root = (
      <MenuStateContext
        value={{ open, picked: sub ? parent?.picked : picks.picked }}
      >
        <RadixRoot
          {...props}
          open={open}
          onOpenChange={(next: boolean) => {
            if (!sub) picks.onOpenChange(next);
            setOpen(next);
          }}
        />
      </MenuStateContext>
    );
    return sub ? root : picks.provide(root);
  }
  return OpenRoot;
}

type PortalProps = { forceMount?: true; children?: React.ReactNode };

/**
 * Radix unmounts the Portal as soon as the menu closes, which would cut the
 * exit short. Animate UI keeps it mounted; the Content decides when to leave.
 */
function createPortal<P extends PortalProps>(
  RadixPortal: React.ComponentType<P>,
) {
  function Portal({ forceMount, ...props }: P) {
    return (
      <PortalForceMountContext value={Boolean(forceMount)}>
        <RadixPortal {...(props as P)} forceMount />
      </PortalForceMountContext>
    );
  }
  return Portal;
}

type OutsideEvent = {
  preventDefault: () => void;
  /**
   * Radix's outside events carry the pointer or focus event behind them
   * (`originalEvent`); Escape's is a key event (a number).
   */
  detail?: unknown;
};

type ContentProps = {
  forceMount?: true;
  asChild?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onCloseAutoFocus?: (event: Event) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: never) => void;
  onFocusOutside?: (event: never) => void;
  onInteractOutside?: (event: never) => void;
};

type ContentOptions = {
  /** The CSS variable Radix sets with the trigger-anchored origin. */
  origin: string;
  /** A submenu: it shares the highlight of its root content. */
  sub?: boolean;
  /**
   * Where focus goes when the menu closes, done at once instead of after the
   * exit (Radix does it on unmount, once the exit is over): `trigger` (the
   * element
   * labelling the content), `previous` (the element focused before opening),
   * or `none` (Radix handles it, as it does for submenus).
   */
  returnFocus: 'trigger' | 'previous' | 'none';
  /**
   * A menubar's menu: it takes over the popover of the menu open before it,
   * which moves to it (internal/menu-handoff).
   */
  handoff?: boolean;
};

/** `Content` and `SubContent`: scale and fade from the trigger. */
function createContent<P extends ContentProps>(
  RadixContent: React.ComponentType<P>,
  options: ContentOptions,
) {
  function Content({
    forceMount,
    transition,
    exitTransition,
    ...props
  }: P & PresenceAnimationProps) {
    const state = React.use(MenuStateContext);
    const portalForceMount = React.use(PortalForceMountContext);
    if (!state)
      return <RadixContent {...(props as P)} forceMount={forceMount} />;

    const keepMounted = Boolean(forceMount) || portalForceMount;

    return (
      <AnimatePresence>
        {(state.open || keepMounted) && (
          <ReducedMotionConfig>
            <ContentMotion
              {...(props as ContentProps)}
              component={RadixContent as React.ComponentType<ContentProps>}
              options={options}
              keepMounted={keepMounted}
              transition={transition}
              exitTransition={exitTransition}
            />
          </ReducedMotionConfig>
        )}
      </AnimatePresence>
    );
  }
  return Content;
}

type ContentMotionProps = ContentProps &
  PresenceAnimationProps & {
    component: React.ComponentType<ContentProps>;
    options: ContentOptions;
    keepMounted: boolean;
  };

// Rendered inside ReducedMotionConfig, so useShouldReduceMotion() sees it.
// It reads the open state from context (not props): while it exits,
// AnimatePresence keeps its last element, but context still reaches it.
function ContentMotion({
  component: RadixContent,
  options,
  keepMounted,
  transition,
  exitTransition,
  style,
  children,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onPointerDownOutside,
  onFocusOutside,
  onInteractOutside,
  ...props
}: ContentMotionProps) {
  const { open, picked } = React.use(MenuStateContext)!;
  const reduce = useShouldReduceMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<Element | null>(null);
  const returnedFocusRef = React.useRef(false);

  const enter = useTempoTransition(transition ?? MENU_TRANSITION);
  const leave = useTempoTransition(
    exitTransition ?? transition ?? MENU_TRANSITION,
  );
  // A menubar's popover moving and resizing to the next menu.
  const morph = useTempoTransition(transition ?? MORPH_TRANSITION);
  const hold = usePickHold();
  // `scale`, like v1: Motion writes `transform: none` once it's back to 1, so
  // a settled content never becomes the containing block of the submenus'
  // fixed positioning (shadcn/ui renders them inside the content).
  const hidden = { opacity: 0, scale: reduce ? 1 : HIDDEN_SCALE.menu };
  // Its values, to end its exit at once when a menubar's next menu takes its
  // popover over.
  const opacity = useMotionValue(hidden.opacity);
  const scale = useMotionValue(hidden.scale);
  // A menubar's next menu takes its popover over: it starts from where this
  // one is, which leaves at once, unseen (its exit ends there, so Radix
  // unmounts it: focus and Escape go to the next menu).
  const handoff = useMenuHandoff(
    options.handoff ? React.use(MenuHandoffContext) : null,
    {
      nodeRef: ref,
      open,
      transition: morph,
      reduce,
      onDrop: () => {
        for (const value of [opacity, scale])
          (
            value.animation as { complete?: () => void } | undefined
          )?.complete?.();
      },
    },
  );
  // A submenu goes with its menu when the next one takes its popover over.
  useHandoffNested(ref, Boolean(options.sub));
  // Closing because an item was chosen whose check moves: the menu holds
  // still while it does (nothing moves under reduced motion).
  const exit: Transition = handoff.dropped
    ? { duration: 0 }
    : picked && !reduce
      ? {
          ...leave,
          delay: ((leave as { delay?: number }).delay ?? 0) + hold(picked),
        }
      : leave;

  // Force-mounted content stays in the DOM while closed: once its exit has
  // played, hide it so it leaves the tab order and the accessibility tree.
  const [settledClosed, setSettledClosed] = React.useState(!open);
  if (open && settledClosed) setSettledClosed(false);
  const openRef = React.useRef(open);
  React.useLayoutEffect(() => {
    openRef.current = open;
  });
  // When it last opened (performance.now()).
  const openedAtRef = React.useRef(-Infinity);
  const guard =
    <E extends OutsideEvent>(handler?: (event: E) => void) =>
    (event: E) => {
      handler?.(event);
      // Neither a leaving menu, nor the event that opened it: a kept-mounted
      // menu is a dismissable layer already, so Radix takes the pointer down
      // on its trigger, once it has opened it, for one outside it.
      const cause = (event.detail as { originalEvent?: Event } | undefined)
        ?.originalEvent;
      if (!openRef.current || (cause && cause.timeStamp < openedAtRef.current))
        event.preventDefault();
    };

  // A layout effect runs before Radix's focus scope moves focus in (a
  // passive effect), so this still sees the element focused before opening.
  React.useLayoutEffect(() => {
    if (!open) return;
    openedAtRef.current = performance.now();
    previousFocusRef.current = ref.current?.ownerDocument.activeElement ?? null;
    returnedFocusRef.current = false;
  }, [open]);

  // A passive effect: by then Radix's focus scope has stopped trapping focus
  // (it would pull it back in).
  React.useEffect(() => {
    const node = ref.current;
    if (open || !node) return;
    const doc = node.ownerDocument;
    // Closing. Keyboard users must not keep acting on a menu that is leaving:
    // return focus now, the way Radix will on unmount. A user handler on
    // onCloseAutoFocus keeps full control instead.
    if (options.returnFocus === 'none' || onCloseAutoFocus) return;
    if (!node.contains(doc.activeElement)) return;
    const target =
      options.returnFocus === 'trigger'
        ? doc.getElementById(node.getAttribute('aria-labelledby') ?? '')
        : previousFocusRef.current;
    if (target instanceof HTMLElement) {
      target.focus({ preventScroll: true });
      returnedFocusRef.current = true;
    }
  }, [open, onCloseAutoFocus, options.returnFocus]);

  return (
    <RadixContent
      {...props}
      forceMount
      asChild
      // A leaving menu is still a dismissable layer until it unmounts: it
      // must not dismiss anything. When moving between the menus of a
      // menubar, focus entering the new menu would otherwise close the bar.
      onEscapeKeyDown={guard(onEscapeKeyDown)}
      onPointerDownOutside={guard(onPointerDownOutside)}
      onFocusOutside={guard(onFocusOutside)}
      onInteractOutside={guard(onInteractOutside)}
      onCloseAutoFocus={(event: Event) => {
        onCloseAutoFocus?.(event);
        // Focus already went back on close: don't move it again on unmount
        // (the user may have moved on since).
        if (returnedFocusRef.current) event.preventDefault();
      }}
    >
      <motion.div
        ref={ref}
        initial={
          handoff.from ? { opacity: handoff.from.opacity, scale: 1 } : hidden
        }
        // Transitions live in the targets: each direction keeps its own.
        animate={
          open
            ? handoff.from
              ? takeOver(handoff.from, enter)
              : { opacity: 1, scale: 1, transition: enter }
            : { ...hidden, transition: exit }
        }
        exit={{ ...hidden, transition: exit }}
        onAnimationComplete={() => {
          if (!openRef.current && keepMounted) setSettledClosed(true);
        }}
        style={{
          opacity,
          scale,
          transformOrigin: `var(${options.origin})`,
          // The highlight goes under the items' content, above the menu's
          // background: the menu is its own stacking context.
          isolation: 'isolate',
          ...(keepMounted && settledClosed && !open
            ? { visibility: 'hidden' as const }
            : null),
          // A leaving menu doesn't react to the pointer: hovering it would
          // move focus back into it. (No key at all while open: Radix sets
          // pointer-events on the layer of a modal menu.)
          ...(open ? null : { pointerEvents: 'none' as const }),
          ...style,
        }}
      >
        {options.sub ? (
          children
        ) : (
          // Its submenus go with it in a menubar's handoff (none otherwise).
          <HandoffNestedContext value={options.handoff ? handoff.entry : null}>
            <HighlightScope open={open}>{children}</HighlightScope>
          </HandoffNestedContext>
        )}
      </motion.div>
    </RadixContent>
  );
}

type ItemProps = {
  asChild?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
};

/** Checkbox and radio items: Radix's `onSelect`, before it closes. */
type SelectableItemProps = ItemProps & { onSelect?: (event: Event) => void };

/** An item that takes part in the content's highlight. */
function HighlightedItem<P extends ItemProps>({
  component: RadixItem,
  props: { asChild, disabled, children, ref, ...props },
}: {
  component: React.ComponentType<P>;
  props: P;
}) {
  const { ref: highlightRef, highlight } = useItemHighlight(disabled);
  const mergedRef = React.useMemo(
    () => mergeRefs(ref, highlightRef),
    [ref, highlightRef],
  );
  return (
    <RadixItem
      {...(props as P)}
      ref={mergedRef}
      asChild={asChild}
      disabled={disabled}
    >
      {withHighlight(children, highlight, asChild)}
    </RadixItem>
  );
}

/** `Item` and `SubTrigger`. */
function createItem<P extends ItemProps>(RadixItem: React.ComponentType<P>) {
  function Item(props: P) {
    return <HighlightedItem component={RadixItem} props={props} />;
  }
  return Item;
}

type CheckboxItemProps = SelectableItemProps & {
  checked?: boolean | 'indeterminate';
};

/**
 * Radix calls `onSelect` right before it closes the menu (unless it's
 * prevented): the pick is marked then, if `moves` says its check moves (how
 * it shows).
 */
function useMarkPick(
  onSelect: ((event: Event) => void) | undefined,
  moves: (item: Element | null) => Picked,
) {
  const picks = React.use(PickContext);
  return (event: Event) => {
    onSelect?.(event);
    if (event.defaultPrevented) return;
    const look = moves(event.currentTarget as Element | null);
    if (look) picks?.markPick(look);
  };
}

/** Shares its checked state with its ItemIndicator. */
function createCheckboxItem<P extends CheckboxItemProps>(
  RadixCheckboxItem: React.ComponentType<P>,
) {
  function CheckboxItem(props: P) {
    const picks = React.use(PickContext);
    // Its check shows or hides itself.
    const onSelect = useMarkPick(
      props.onSelect,
      (item) => picks?.checkOf(item) ?? false,
    );
    return (
      <IndicatorItemContext
        value={{ checked: props.checked ?? false, kind: 'checkbox' }}
      >
        <HighlightedItem
          component={RadixCheckboxItem}
          props={{ ...props, onSelect }}
        />
      </IndicatorItemContext>
    );
  }
  return CheckboxItem;
}

function createRadioGroup<P extends { value?: string }>(
  RadixRadioGroup: React.ComponentType<P>,
) {
  function RadioGroup(props: P) {
    const group = useCheckGroup();
    return (
      <RadioGroupContext value={{ value: props.value, group }}>
        <RadixRadioGroup {...props} />
      </RadioGroupContext>
    );
  }
  return RadioGroup;
}

function createRadioItem<P extends SelectableItemProps & { value: string }>(
  RadixRadioItem: React.ComponentType<P>,
) {
  function RadioItem(props: P) {
    const group = React.use(RadioGroupContext);
    const picks = React.use(PickContext);
    // Another item than the checked one: the check moves there.
    const onSelect = useMarkPick(
      props.onSelect,
      (item) =>
        item?.getAttribute('data-state') !== 'checked' &&
        (picks?.checkOf(item) ?? false),
    );
    return (
      <IndicatorItemContext
        value={
          group
            ? {
                checked: group.value === props.value,
                kind: 'radio',
                group: group.group,
              }
            : null
        }
      >
        <HighlightedItem
          component={RadixRadioItem}
          props={{ ...props, onSelect }}
        />
      </IndicatorItemContext>
    );
  }
  return RadioItem;
}

type ItemIndicatorProps = {
  forceMount?: true;
  asChild?: boolean;
  children?: React.ReactNode;
};

/**
 * An item's check shows itself when the item is checked, and hides itself
 * when it's unchecked: it stays mounted for that. The menu opening shows it
 * at rest. With `pop`, a radio item's check glides from the previously
 * checked item.
 */
function createItemIndicator<P extends ItemIndicatorProps>(
  RadixItemIndicator: React.ComponentType<P>,
) {
  function ItemIndicator({
    animation,
    transition,
    forceMount,
    children,
    ...props
  }: P & IndicatorAnimationProps) {
    const item = React.use(IndicatorItemContext);
    if (!item) {
      return (
        <RadixItemIndicator {...(props as P)} forceMount={forceMount}>
          {children}
        </RadixItemIndicator>
      );
    }

    return (
      <RadixItemIndicator {...(props as P)} forceMount asChild>
        <ItemCheck
          multiple={item.kind === 'checkbox'}
          group={item.group ?? null}
          checked={item.checked !== false}
          indeterminate={item.checked === 'indeterminate'}
          animation={animation}
          transition={transition}
        >
          {children}
        </ItemCheck>
      </RadixItemIndicator>
    );
  }
  return ItemIndicator;
}

export {
  MenuStateContext,
  useMenuPicks,
  createOpenRoot,
  createPortal,
  createContent,
  createItem,
  createCheckboxItem,
  createRadioGroup,
  createRadioItem,
  createItemIndicator,
  type MenuState,
  type PresenceAnimationProps,
  type IndicatorAnimationProps,
};
