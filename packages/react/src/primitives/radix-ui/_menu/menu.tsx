'use client';

import * as React from 'react';
import { AnimatePresence, useMotionValue, type Transition } from 'motion/react';

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
import { useStaggerOnOpen } from '../../../internal/stagger';
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
import { MotionSlot, slotChild } from '../../../internal/modal-motion';

type PresenceAnimationProps = {
  transition?: Transition;
  exitTransition?: Transition;
};

type IndicatorAnimationProps = ItemCheckAnimationProps;

type MenuState = {
  open: boolean;
  picked?: Picked;
};

const MenuStateContext = React.createContext<MenuState | null>(null);
const PortalForceMountContext = React.createContext(false);

type IndicatorItem = {
  checked: boolean | 'indeterminate';
  kind: 'checkbox' | 'radio';
  group?: CheckGroup;
};

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

function createOpenRoot<P extends OpenStateProps>(
  RadixRoot: React.ComponentType<P>,
  { sub = false }: { sub?: boolean } = {},
) {
  function OpenRoot(props: P) {
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
  origin: string;
  sub?: boolean;
  returnFocus: 'trigger' | 'previous' | 'none';
  handoff?: boolean;
};

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
  Content.displayName = RadixContent.displayName;
  return Content;
}

type ContentMotionProps = ContentProps &
  PresenceAnimationProps & {
    component: React.ComponentType<ContentProps>;
    options: ContentOptions;
    keepMounted: boolean;
  };

function ContentMotion({
  component: RadixContent,
  options,
  keepMounted,
  transition,
  exitTransition,
  style,
  asChild,
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
  const morph = useTempoTransition(transition ?? MORPH_TRANSITION);
  const hold = usePickHold();
  const hidden = { opacity: 0, scale: reduce ? 1 : HIDDEN_SCALE.menu };
  const opacity = useMotionValue(hidden.opacity);
  const scale = useMotionValue(hidden.scale);
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
  useHandoffNested(ref, Boolean(options.sub));
  useStaggerOnOpen(ref, open, { skip: Boolean(handoff.from) });
  const exit: Transition = handoff.dropped
    ? { duration: 0 }
    : picked && !reduce
      ? {
          ...leave,
          delay: ((leave as { delay?: number }).delay ?? 0) + hold(picked),
        }
      : leave;

  const [settledClosed, setSettledClosed] = React.useState(!open);
  if (open && settledClosed) setSettledClosed(false);
  const openRef = React.useRef(open);
  React.useLayoutEffect(() => {
    openRef.current = open;
  });
  const openedAtRef = React.useRef(-Infinity);
  const guard =
    <E extends OutsideEvent>(handler?: (event: E) => void) =>
    (event: E) => {
      handler?.(event);
      const cause = (event.detail as { originalEvent?: Event } | undefined)
        ?.originalEvent;
      if (!openRef.current || (cause && cause.timeStamp < openedAtRef.current))
        event.preventDefault();
    };

  React.useLayoutEffect(() => {
    if (!open) return;
    openedAtRef.current = performance.now();
    previousFocusRef.current = ref.current?.ownerDocument.activeElement ?? null;
    returnedFocusRef.current = false;
  }, [open]);

  React.useEffect(() => {
    const node = ref.current;
    if (open || !node) return;
    const doc = node.ownerDocument;
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

  const slot = slotChild(asChild, children);
  return (
    <RadixContent
      {...props}
      forceMount
      asChild
      onEscapeKeyDown={guard(onEscapeKeyDown)}
      onPointerDownOutside={guard(onPointerDownOutside)}
      onFocusOutside={guard(onFocusOutside)}
      onInteractOutside={guard(onInteractOutside)}
      onCloseAutoFocus={(event: Event) => {
        onCloseAutoFocus?.(event);
        if (returnedFocusRef.current) event.preventDefault();
      }}
    >
      <MotionSlot
        element={slot.element}
        ref={ref}
        initial={
          handoff.from ? { opacity: handoff.from.opacity, scale: 1 } : hidden
        }
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
          isolation: 'isolate',
          ...(keepMounted && settledClosed && !open
            ? { visibility: 'hidden' as const }
            : null),
          ...(open ? null : { pointerEvents: 'none' as const }),
          ...style,
        }}
      >
        {options.sub ? (
          children
        ) : (
          <HandoffNestedContext value={options.handoff ? handoff.entry : null}>
            <HighlightScope open={open}>{slot.inner}</HighlightScope>
          </HandoffNestedContext>
        )}
      </MotionSlot>
    </RadixContent>
  );
}

type ItemProps = {
  asChild?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
};

type SelectableItemProps = ItemProps & { onSelect?: (event: Event) => void };

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

function createItem<P extends ItemProps>(RadixItem: React.ComponentType<P>) {
  function Item(props: P) {
    return <HighlightedItem component={RadixItem} props={props} />;
  }
  Item.displayName = RadixItem.displayName;
  return Item;
}

type CheckboxItemProps = SelectableItemProps & {
  checked?: boolean | 'indeterminate';
};

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

function createCheckboxItem<P extends CheckboxItemProps>(
  RadixCheckboxItem: React.ComponentType<P>,
) {
  function CheckboxItem(props: P) {
    const picks = React.use(PickContext);
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
  CheckboxItem.displayName = RadixCheckboxItem.displayName;
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
  RadioGroup.displayName = RadixRadioGroup.displayName;
  return RadioGroup;
}

function createRadioItem<P extends SelectableItemProps & { value: string }>(
  RadixRadioItem: React.ComponentType<P>,
) {
  function RadioItem(props: P) {
    const group = React.use(RadioGroupContext);
    const picks = React.use(PickContext);
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
  RadioItem.displayName = RadixRadioItem.displayName;
  return RadioItem;
}

type ItemIndicatorProps = {
  forceMount?: true;
  asChild?: boolean;
  children?: React.ReactNode;
};

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
  ItemIndicator.displayName = RadixItemIndicator.displayName;
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
