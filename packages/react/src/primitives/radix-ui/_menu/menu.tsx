'use client';

import * as React from 'react';
import { AnimatePresence, motion, type Transition } from 'motion/react';

import {
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
} from '../../../utils/motion';

// Shared by Radix's Dropdown Menu, Context Menu and Menubar: the three are
// built on the same internal Menu, so they animate the same way. Each module
// passes its own Radix parts to these factories.

/** Animate UI's additions to the parts that appear and disappear. */
type PresenceAnimationProps = {
  /** Transition of the entrance. */
  transition?: Transition;
  /** Transition of the exit. */
  exitTransition?: Transition;
};

type MenuState = {
  open: boolean;
  /**
   * Switching between the menus of a menubar: the new menu appears and the old
   * one disappears without animation, like native menubars.
   */
  instant: boolean;
};

// Nullable contexts: a part used outside Animate UI's Root falls back to the
// plain Radix part instead of throwing.
const MenuStateContext = React.createContext<MenuState | null>(null);
/** `forceMount` passed by the user to the Portal (Animate UI always mounts it). */
const PortalForceMountContext = React.createContext(false);
/** The checked state of the closest checkbox or radio item. */
const ItemCheckedContext = React.createContext<
  boolean | 'indeterminate' | null
>(null);
const RadioValueContext = React.createContext<string | undefined>(undefined);

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
      <MenuStateContext value={{ open, instant: false }}>
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
function createPortal<P extends PortalProps>(RadixPortal: React.ComponentType<P>) {
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
  /** Submenus open often: a shorter entrance. */
  sub?: boolean;
  /**
   * Where focus goes when the menu closes, done at once instead of after the
   * exit (Radix does it on unmount, 400ms later): `trigger` (the element
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
    if (!state) return <RadixContent {...(props as P)} forceMount={forceMount} />;

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
  const { open, instant } = React.use(MenuStateContext)!;
  const tokens = useMotionTokens();
  const reduce = useShouldReduceMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<Element | null>(null);
  const returnedFocusRef = React.useRef(false);

  const enter = instant
    ? tokens.transition.instant
    : (transition ??
      (options.sub ? tokens.transition.exit : tokens.transition.dropdown));
  const exit = instant
    ? tokens.transition.instant
    : (exitTransition ?? tokens.transition.exit);
  // Settled open, the content has no transform (see transitionEnd below):
  // leaving from `none`, Motion would start from scale(0), so the exit
  // starts from an explicit scale(1).
  const settledRef = React.useRef(false);
  const hiddenScale = reduce ? 'scale(1)' : `scale(${tokens.scale.enter})`;
  const hidden = {
    opacity: 0,
    // eslint-disable-next-line react-hooks/refs -- read at the render that closes, before the effect below resets it
    transform: settledRef.current ? ['scale(1)', hiddenScale] : hiddenScale,
  };
  React.useLayoutEffect(() => {
    settledRef.current = false;
  }, [open]);

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
    if (options.returnFocus === 'none' || instant || onCloseAutoFocus) return;
    if (!node.contains(doc.activeElement)) return;
    const target =
      options.returnFocus === 'trigger'
        ? doc.getElementById(node.getAttribute('aria-labelledby') ?? '')
        : previousFocusRef.current;
    if (target instanceof HTMLElement) {
      target.focus({ preventScroll: true });
      returnedFocusRef.current = true;
    }
  }, [open, instant, onCloseAutoFocus, options.returnFocus]);

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
        initial={instant ? false : { opacity: 0, transform: hiddenScale }}
        // Transitions live in the targets: each direction keeps its own.
        animate={
          open
            ? {
                opacity: 1,
                transform: 'scale(1)',
                transition: enter,
                // No transform once settled: it would become the containing
                // block of the submenus' fixed positioning (shadcn/ui renders
                // them inside the content) and clip them.
                transitionEnd: { transform: 'none' },
              }
            : { ...hidden, transition: exit }
        }
        exit={{ ...hidden, transition: exit }}
        onAnimationComplete={() => {
          if (openRef.current) settledRef.current = true;
          else if (keepMounted) setSettledClosed(true);
        }}
        style={{
          transformOrigin: `var(${options.origin})`,
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
        {children}
      </motion.div>
    </RadixContent>
  );
}

type CheckboxItemProps = { checked?: boolean | 'indeterminate' };

/** Shares its checked state with its ItemIndicator. */
function createCheckboxItem<P extends CheckboxItemProps>(
  RadixCheckboxItem: React.ComponentType<P>,
) {
  function CheckboxItem(props: P) {
    return (
      <ItemCheckedContext value={props.checked ?? false}>
        <RadixCheckboxItem {...props} />
      </ItemCheckedContext>
    );
  }
  return CheckboxItem;
}

function createRadioGroup<P extends { value?: string }>(
  RadixRadioGroup: React.ComponentType<P>,
) {
  function RadioGroup(props: P) {
    return (
      <RadioValueContext value={props.value}>
        <RadixRadioGroup {...props} />
      </RadioValueContext>
    );
  }
  return RadioGroup;
}

function createRadioItem<P extends { value: string }>(
  RadixRadioItem: React.ComponentType<P>,
) {
  function RadioItem(props: P) {
    const value = React.use(RadioValueContext);
    return (
      <ItemCheckedContext value={value === props.value}>
        <RadixRadioItem {...props} />
      </ItemCheckedContext>
    );
  }
  return RadioItem;
}

type ItemIndicatorProps = {
  forceMount?: true;
  asChild?: boolean;
  children?: React.ReactNode;
};

/** The check and the radio dot fade in and out, no scale. */
function createItemIndicator<P extends ItemIndicatorProps>(
  RadixItemIndicator: React.ComponentType<P>,
) {
  function ItemIndicator({
    forceMount,
    transition,
    exitTransition,
    children,
    ...props
  }: P & PresenceAnimationProps) {
    const checked = React.use(ItemCheckedContext);
    const tokens = useMotionTokens();
    if (checked === null) {
      return (
        <RadixItemIndicator {...(props as P)} forceMount={forceMount}>
          {children}
        </RadixItemIndicator>
      );
    }

    const present = checked === true || checked === 'indeterminate';
    const enter = transition ?? tokens.transition.change;
    const exit = exitTransition ?? tokens.transition.exit;

    return (
      // initial={false}: items checked when the menu opens show at once.
      <AnimatePresence initial={false}>
        {(present || forceMount) && (
          <RadixItemIndicator {...(props as P)} forceMount asChild>
            <motion.span
              initial={{ opacity: 0 }}
              animate={
                present
                  ? { opacity: 1, transition: enter }
                  : { opacity: 0, transition: exit }
              }
              exit={{ opacity: 0, transition: exit }}
            >
              {children}
            </motion.span>
          </RadixItemIndicator>
        )}
      </AnimatePresence>
    );
  }
  return ItemIndicator;
}

export {
  MenuStateContext,
  createOpenRoot,
  createPortal,
  createContent,
  createCheckboxItem,
  createRadioGroup,
  createRadioItem,
  createItemIndicator,
  type MenuState,
  type PresenceAnimationProps,
};
