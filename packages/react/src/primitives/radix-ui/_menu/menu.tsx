'use client';

import * as React from 'react';
import {
  AnimatePresence,
  motion,
  PresenceContext,
  type Transition,
} from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { MENU_TRANSITION, mergeRefs } from '../../../internal/anchored';
import {
  HighlightScope,
  useItemHighlight,
  withHighlight,
} from '../../../internal/item-highlight';

// Shared by Radix's Dropdown Menu, Context Menu and Menubar: the three are
// built on the same internal Menu, so they animate the same way (Animate UI
// v1's DropdownMenu). Each module passes its own Radix parts to these
// factories.
//
// - Content and SubContent fade and scale from 0.95 in 200ms, both ways.
// - One highlight glides behind the highlighted item (internal/item-highlight).
// - A checkbox item's check pops in from half its size when it appears; a
//   radio item's indicator glides to the newly checked item.

/** Animate UI's additions to the parts that appear and disappear. */
type PresenceAnimationProps = {
  /**
   * Transition of the entrance, and of the exit unless `exitTransition` is
   * set. Defaults to `{ duration: 0.2 }`.
   */
  transition?: Transition;
  /** Transition of the exit. Defaults to `transition`. */
  exitTransition?: Transition;
};

/** Animate UI's addition to `ItemIndicator`. */
type IndicatorAnimationProps = {
  /**
   * Transition of the check popping in (checkbox items), or of the indicator
   * moving to the checked item (radio items). Defaults to Motion's defaults,
   * as in v1.
   */
  transition?: Transition;
};

type MenuState = {
  open: boolean;
};

// Nullable contexts: a part used outside Animate UI's Root falls back to the
// plain Radix part instead of throwing.
const MenuStateContext = React.createContext<MenuState | null>(null);
/** `forceMount` passed by the user to the Portal (Animate UI always mounts it). */
const PortalForceMountContext = React.createContext(false);

type IndicatorItem = {
  checked: boolean | 'indeterminate';
  kind: 'checkbox' | 'radio';
  /** Shared by the indicators of a radio group: the indicator glides. */
  layoutId?: string;
};

/** The checked state of the closest checkbox or radio item. */
const IndicatorItemContext = React.createContext<IndicatorItem | null>(null);
const RadioGroupContext = React.createContext<{
  value: string | undefined;
  layoutId: string;
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

/** `Root` and `Sub`: they track the open state and give it back to Radix. */
function createOpenRoot<P extends OpenStateProps>(
  RadixRoot: React.ComponentType<P>,
) {
  function OpenRoot(props: P) {
    const [open, setOpen] = useOpenState(props);
    return (
      <MenuStateContext value={{ open }}>
        <RadixRoot {...props} open={open} onOpenChange={setOpen} />
      </MenuStateContext>
    );
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

type OutsideEvent = { preventDefault: () => void };

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
   * exit (Radix does it on unmount, 200ms later): `trigger` (the element
   * labelling the content), `previous` (the element focused before opening),
   * or `none` (Radix handles it, as it does for submenus).
   */
  returnFocus: 'trigger' | 'previous' | 'none';
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
  const { open } = React.use(MenuStateContext)!;
  const reduce = useShouldReduceMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<Element | null>(null);
  const returnedFocusRef = React.useRef(false);

  const enter = useTempoTransition(transition ?? MENU_TRANSITION);
  const exit = useTempoTransition(
    exitTransition ?? transition ?? MENU_TRANSITION,
  );
  // `scale`, like v1: Motion writes `transform: none` once it's back to 1, so
  // a settled content never becomes the containing block of the submenus'
  // fixed positioning (shadcn/ui renders them inside the content).
  const hidden = { opacity: 0, scale: reduce ? 1 : 0.95 };

  // Force-mounted content stays in the DOM while closed: once its exit has
  // played, hide it so it leaves the tab order and the accessibility tree.
  const [settledClosed, setSettledClosed] = React.useState(!open);
  if (open && settledClosed) setSettledClosed(false);
  const openRef = React.useRef(open);
  React.useLayoutEffect(() => {
    openRef.current = open;
  });
  const guard =
    <E extends OutsideEvent>(handler?: (event: E) => void) =>
    (event: E) => {
      handler?.(event);
      if (!openRef.current) event.preventDefault();
    };

  // A layout effect runs before Radix's focus scope moves focus in (a
  // passive effect), so this still sees the element focused before opening.
  React.useLayoutEffect(() => {
    if (!open) return;
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
        initial={hidden}
        // Transitions live in the targets: each direction keeps its own.
        animate={
          open
            ? { opacity: 1, scale: 1, transition: enter }
            : { ...hidden, transition: exit }
        }
        exit={{ ...hidden, transition: exit }}
        onAnimationComplete={() => {
          if (!openRef.current && keepMounted) setSettledClosed(true);
        }}
        style={{
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
          <HighlightScope open={open}>{children}</HighlightScope>
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

type CheckboxItemProps = ItemProps & { checked?: boolean | 'indeterminate' };

/** Shares its checked state with its ItemIndicator. */
function createCheckboxItem<P extends CheckboxItemProps>(
  RadixCheckboxItem: React.ComponentType<P>,
) {
  function CheckboxItem(props: P) {
    return (
      <IndicatorItemContext
        value={{ checked: props.checked ?? false, kind: 'checkbox' }}
      >
        <HighlightedItem component={RadixCheckboxItem} props={props} />
      </IndicatorItemContext>
    );
  }
  return CheckboxItem;
}

function createRadioGroup<P extends { value?: string }>(
  RadixRadioGroup: React.ComponentType<P>,
) {
  function RadioGroup(props: P) {
    const layoutId = React.useId();
    return (
      <RadioGroupContext value={{ value: props.value, layoutId }}>
        <RadixRadioGroup {...props} />
      </RadioGroupContext>
    );
  }
  return RadioGroup;
}

function createRadioItem<P extends ItemProps & { value: string }>(
  RadixRadioItem: React.ComponentType<P>,
) {
  function RadioItem(props: P) {
    const group = React.use(RadioGroupContext);
    return (
      <IndicatorItemContext
        value={
          group
            ? {
                checked: group.value === props.value,
                kind: 'radio',
                layoutId: group.layoutId,
              }
            : null
        }
      >
        <HighlightedItem component={RadixRadioItem} props={props} />
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

/** Motion's defaults, which v1's check used: written out for the tempo. */
const CHECK_TRANSITION = {
  scale: { type: 'spring', stiffness: 550, damping: 30, restSpeed: 10 },
  opacity: { duration: 0.3, ease: [0.25, 0.1, 0.35, 1] },
} as const satisfies Transition;
/** Motion's default layout transition, which v1's radio indicator used. */
const RADIO_TRANSITION = {
  duration: 0.45,
  ease: [0.4, 0, 0.1, 1],
} as const satisfies Transition;

/**
 * A checkbox item's check pops in from half its size and fades in whenever
 * it appears (checking the item, or opening the menu); unchecking removes it
 * at once. A radio item's indicator glides from the previously checked item.
 */
function createItemIndicator<P extends ItemIndicatorProps>(
  RadixItemIndicator: React.ComponentType<P>,
) {
  function ItemIndicator({
    transition,
    children,
    ...props
  }: P & IndicatorAnimationProps) {
    const item = React.use(IndicatorItemContext);
    if (!item) {
      return (
        <RadixItemIndicator {...(props as P)}>{children}</RadixItemIndicator>
      );
    }

    return (
      <RadixItemIndicator {...(props as P)} asChild>
        <IndicatorMotion item={item} transition={transition}>
          {children}
        </IndicatorMotion>
      </RadixItemIndicator>
    );
  }
  return ItemIndicator;
}

function IndicatorMotion({
  item,
  transition,
  ...props
}: React.ComponentProps<'span'> &
  IndicatorAnimationProps & { item: IndicatorItem }) {
  const reduce = useShouldReduceMotion();
  const check = useTempoTransition(transition ?? CHECK_TRANSITION);
  const glide = useTempoTransition(transition ?? RADIO_TRANSITION);

  if (item.kind === 'radio') {
    return (
      // Out of the menu's exit: the menu doesn't wait for the glide to end
      // before it unmounts (v1 cut it short the same way).
      <PresenceContext value={null}>
        <motion.span
          {...(props as React.ComponentProps<typeof motion.span>)}
          layoutId={item.layoutId}
          // One indicator moving, not two crossfading.
          layoutCrossfade={false}
          transition={glide}
        />
      </PresenceContext>
    );
  }
  return (
    <motion.span
      {...(props as React.ComponentProps<typeof motion.span>)}
      initial={{ opacity: 0, scale: reduce ? 1 : 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={check}
    />
  );
}

export {
  MenuStateContext,
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
