'use client';

import * as React from 'react';
import { Direction, NavigationMenu as NavigationMenuPrimitive } from 'radix-ui';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
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
  mergeRefs,
} from '../../../internal/anchored';
import {
  SwapContext,
  useContentSwapper,
  type Way,
} from '../../../internal/content-swap';
import {
  HIGHLIGHT_TRANSITION,
  TriggerHighlightScope,
  useTriggerHighlight,
  withHighlight,
} from '../../../internal/item-highlight';

// Same API as Radix's Navigation Menu. The Root (and each Sub) mirrors the
// open value (Radix keeps it private) so the Viewport, the Content and the
// Indicator can play an exit before they unmount.
//
// It has no Animate UI v1 counterpart: it moves like v1's DropdownMenu, and
// like Animate UI's Menubar between items.
// - The Viewport fades and scales from 0.9 in 250ms, both ways, like the
//   menus, and its size follows the active content in 250ms too.
// - Moving to another item, the content changes inside the Viewport like a
//   menubar's, like Motion's mega menu: the previous one leaves 6px away from
//   where the next one comes from while it fades out, the next one comes in
//   from 6px that way and fades in behind it (internal/content-swap). Without
//   a Viewport, each Content fades and scales on its own, like a menu.
// - The triggers (and the links beside them) share one highlight, like a
//   menubar's, and so do the links of each Content (internal/item-highlight).
// - The Indicator follows the active trigger like v1's menu highlight, on
//   the highlight's spring (stiffness 500, damping 40), fading in on it and
//   out 200ms later.

/** Animate UI's additions to the parts that appear and disappear. */
type PresenceAnimationProps = {
  /**
   * Transition of the entrance, and of the exit unless `exitTransition` is
   * set. Defaults to `{ duration: 0.25, ease: [0.215, 0.61, 0.355, 1] }` (the
   * Indicator: the highlight's spring).
   */
  transition?: Transition;
  /** Transition of the exit. Defaults to `transition`. */
  exitTransition?: Transition;
};

type NavigationMenuProps = NavigationMenuPrimitive.NavigationMenuProps;
type NavigationMenuSubProps = NavigationMenuPrimitive.NavigationMenuSubProps;
type NavigationMenuListProps = NavigationMenuPrimitive.NavigationMenuListProps;
type NavigationMenuItemProps = NavigationMenuPrimitive.NavigationMenuItemProps;
type NavigationMenuTriggerProps =
  NavigationMenuPrimitive.NavigationMenuTriggerProps;
type NavigationMenuLinkProps = NavigationMenuPrimitive.NavigationMenuLinkProps;
type NavigationMenuContentProps =
  NavigationMenuPrimitive.NavigationMenuContentProps & PresenceAnimationProps;
type NavigationMenuViewportProps =
  NavigationMenuPrimitive.NavigationMenuViewportProps & PresenceAnimationProps;
type NavigationMenuIndicatorProps =
  NavigationMenuPrimitive.NavigationMenuIndicatorProps & PresenceAnimationProps;

type MenuState = {
  value: string;
  orientation: 'horizontal' | 'vertical';
  dir: 'ltr' | 'rtl';
  /** A Viewport is rendered: Contents are displayed inside it. */
  hasViewport: boolean;
  registerViewport: () => () => void;
};

// Nullable contexts: a part used outside Animate UI's Root falls back to the
// plain Radix part instead of throwing.
const MenuStateContext = React.createContext<MenuState | null>(null);
const ItemValueContext = React.createContext<string | null>(null);

type ValueProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
};

/** Mirrors Radix's value and hands it back (one source of truth). */
function useMenuState(
  { value: valueProp, defaultValue, onValueChange, orientation }: ValueProps,
  dir: 'ltr' | 'rtl',
) {
  const controlled = valueProp !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? '');
  const value = controlled ? valueProp : uncontrolled;
  const [viewports, setViewports] = React.useState(0);
  const registerViewport = React.useCallback(() => {
    setViewports((count) => count + 1);
    return () => setViewports((count) => count - 1);
  }, []);

  const state: MenuState = {
    value,
    orientation: orientation ?? 'horizontal',
    dir,
    hasViewport: viewports > 0,
    registerViewport,
  };
  const onChange = (next: string) => {
    if (!controlled) setUncontrolled(next);
    onValueChange?.(next);
  };
  return [state, onChange] as const;
}

function Root(
  props: React.ComponentProps<typeof NavigationMenuPrimitive.Root>,
) {
  const dir = Direction.useDirection(props.dir);
  const [state, onValueChange] = useMenuState(props, dir);
  return (
    <MenuStateContext value={state}>
      {/* Its triggers share one highlight. */}
      <TriggerHighlightScope>
        <NavigationMenuPrimitive.Root
          {...props}
          value={state.value}
          onValueChange={onValueChange}
        />
      </TriggerHighlightScope>
    </MenuStateContext>
  );
}

function Sub(props: React.ComponentProps<typeof NavigationMenuPrimitive.Sub>) {
  const parent = React.use(MenuStateContext);
  const [state, onValueChange] = useMenuState(props, parent?.dir ?? 'ltr');
  return (
    <MenuStateContext value={state}>
      <TriggerHighlightScope>
        <NavigationMenuPrimitive.Sub
          {...props}
          value={state.value}
          onValueChange={onValueChange}
        />
      </TriggerHighlightScope>
    </MenuStateContext>
  );
}

function List({
  style,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      {...props}
      // The triggers' highlight goes under their content, above what's
      // behind the list: the list is its own stacking context (not the Root,
      // whose Viewport must stay above the page).
      style={{ isolation: 'isolate', ...style }}
    />
  );
}

function Item({
  value: valueProp,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  // Radix generates a value when there is none: generate it here so the open
  // state can be read from the Root's value.
  const fallbackId = React.useId();
  const value = valueProp || fallbackId;
  return (
    <ItemValueContext value={value}>
      <NavigationMenuPrimitive.Item {...props} value={value} />
    </ItemValueContext>
  );
}

type HighlightedProps = {
  asChild?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  ref?: React.Ref<HTMLElement>;
};

/**
 * A trigger, or a link: it takes part in the highlight of its list (the
 * triggers'), or of its Content (the links').
 */
function useHighlighted<P extends HighlightedProps>({
  asChild,
  disabled,
  children,
  ref,
  ...props
}: P) {
  const { ref: highlightRef, highlight } = useTriggerHighlight(disabled);
  const mergedRef = React.useMemo(
    () => mergeRefs(ref, highlightRef),
    [ref, highlightRef],
  );
  return {
    ...props,
    ref: mergedRef,
    asChild,
    disabled,
    children: withHighlight(children, highlight, asChild),
  };
}

function Trigger(
  props: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>,
) {
  return (
    <NavigationMenuPrimitive.Trigger
      {...(useHighlighted(props) as typeof props)}
    />
  );
}

function Link(
  props: React.ComponentProps<typeof NavigationMenuPrimitive.Link>,
) {
  return (
    <NavigationMenuPrimitive.Link
      {...(useHighlighted(props) as typeof props)}
    />
  );
}

function Content({
  forceMount,
  transition,
  exitTransition,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content> &
  PresenceAnimationProps) {
  const menu = React.use(MenuStateContext);
  const itemValue = React.use(ItemValueContext);
  if (!menu || itemValue === null) {
    return (
      <NavigationMenuPrimitive.Content {...props} forceMount={forceMount}>
        {children}
      </NavigationMenuPrimitive.Content>
    );
  }

  // Inside a Viewport, Radix mounts only the active Content (and renders it
  // in the Viewport): moving between items, it changes in place.
  if (menu.hasViewport) {
    return (
      <NavigationMenuPrimitive.Content
        {...props}
        forceMount={forceMount}
        asChild
      >
        <ViewportContentMotion>
          <TriggerHighlightScope>{children}</TriggerHighlightScope>
        </ViewportContentMotion>
      </NavigationMenuPrimitive.Content>
    );
  }

  const open = menu.value === itemValue;
  return (
    <AnimatePresence>
      {(open || forceMount) && (
        <ReducedMotionConfig>
          <NavigationMenuPrimitive.Content {...props} forceMount asChild>
            <InlineContentMotion
              open={open}
              keepMounted={Boolean(forceMount)}
              transition={transition}
              exitTransition={exitTransition}
            >
              <TriggerHighlightScope>{children}</TriggerHighlightScope>
            </InlineContentMotion>
          </NavigationMenuPrimitive.Content>
        </ReducedMotionConfig>
      )}
    </AnimatePresence>
  );
}

type SlotChildProps = React.ComponentProps<'div'> & {
  'data-motion'?: string;
  'data-orientation'?: string;
};

/** Where the next content comes from, by Radix's `data-motion`. */
function wayOf(motionAttribute: string | undefined, menu: MenuState | null) {
  if (!motionAttribute?.startsWith('from-')) return null;
  const axis = menu?.orientation === 'vertical' ? 'y' : 'x';
  const motion = motionAttribute === 'from-end' ? 1 : -1;
  // Radix orders the items the other way in a right-to-left menu, whatever
  // its orientation: its `start` is then the physical left, which is right
  // across, but the bottom, down a vertical menu.
  const sign = axis === 'y' && menu?.dir === 'rtl' ? -motion : motion;
  return { axis, sign } satisfies Way;
}

/**
 * Radix renders it in the Viewport, through asChild. Moving between items,
 * the one leaving is copied as it unmounts, and the one coming in comes in
 * from Radix's `data-motion` (from-start or from-end, read once, on mount).
 * The first opening has none: the Viewport's entrance is enough.
 */
function ViewportContentMotion({ ref, style, ...props }: SlotChildProps) {
  const swapper = React.use(SwapContext);
  const menu = React.use(MenuStateContext);
  const nodeRef = React.useRef<HTMLDivElement>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, nodeRef), [ref]);
  const [way] = React.useState(() => wayOf(props['data-motion'], menu));
  const [id] = React.useState(() => props.id ?? null);

  React.useLayoutEffect(() => {
    const node = nodeRef.current;
    if (!swapper || !node) return;
    swapper.enter(node, id, way);
    // Still in the page: Radix removes it after this.
    return () => swapper.leave(node, id);
  }, [swapper, id, way]);

  return (
    <div
      {...props}
      ref={mergedRef}
      // Its links' highlight goes under their content, above the Viewport's
      // background.
      style={{ isolation: 'isolate', ...style }}
    />
  );
}

/** Without a Viewport, each Content scales and fades under its item. */
function InlineContentMotion({
  open,
  keepMounted,
  transition,
  exitTransition,
  style,
  ...props
}: SlotChildProps &
  PresenceAnimationProps & { open: boolean; keepMounted: boolean }) {
  const reduce = useShouldReduceMotion();
  const menu = React.use(MenuStateContext);
  const enter = useTempoTransition(transition ?? MENU_TRANSITION);
  const exit = useTempoTransition(
    exitTransition ?? transition ?? MENU_TRANSITION,
  );
  const hidden = { opacity: 0, scale: reduce ? 1 : HIDDEN_SCALE.menu };
  const [settledClosed, setSettledClosed] = React.useState(!open);
  if (open && settledClosed) setSettledClosed(false);

  return (
    <motion.div
      {...(props as React.ComponentProps<typeof motion.div>)}
      initial={hidden}
      animate={
        open
          ? { opacity: 1, scale: 1, transition: enter }
          : { ...hidden, transition: exit }
      }
      exit={{ ...hidden, transition: exit }}
      onAnimationComplete={() => {
        if (keepMounted && !open) setSettledClosed(true);
      }}
      style={{
        // It hangs from the start edge of its item.
        transformOrigin: menu?.dir === 'rtl' ? 'top right' : 'top left',
        // Its links' highlight goes under their content, above its
        // background.
        isolation: 'isolate',
        ...(keepMounted && settledClosed && !open
          ? { visibility: 'hidden' as const }
          : null),
        ...style,
      }}
    />
  );
}

const MotionViewport = motion.create(NavigationMenuPrimitive.Viewport);

function Viewport({
  forceMount,
  transition,
  exitTransition,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport> &
  PresenceAnimationProps) {
  const menu = React.use(MenuStateContext);
  const registerViewport = menu?.registerViewport;
  React.useLayoutEffect(() => registerViewport?.(), [registerViewport]);
  if (!menu) {
    return (
      <NavigationMenuPrimitive.Viewport {...props} forceMount={forceMount} />
    );
  }

  const open = Boolean(menu.value);
  return (
    <AnimatePresence>
      {(open || forceMount) && (
        <ReducedMotionConfig>
          <ViewportMotion
            {...props}
            open={open}
            keepMounted={Boolean(forceMount)}
            transition={transition}
            exitTransition={exitTransition}
          />
        </ReducedMotionConfig>
      )}
    </AnimatePresence>
  );
}

const WIDTH = '--radix-navigation-menu-viewport-width';
const HEIGHT = '--radix-navigation-menu-viewport-height';

function ViewportMotion({
  open,
  keepMounted,
  transition,
  exitTransition,
  style,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport> &
  PresenceAnimationProps & { open: boolean; keepMounted: boolean }) {
  const reduce = useShouldReduceMotion();
  const menu = React.use(MenuStateContext);
  const ref = React.useRef<HTMLDivElement>(null);
  const enter = useTempoTransition(transition ?? MENU_TRANSITION);
  const exit = useTempoTransition(
    exitTransition ?? transition ?? MENU_TRANSITION,
  );
  const hidden = { opacity: 0, scale: reduce ? 1 : HIDDEN_SCALE.menu };
  const [settledClosed, setSettledClosed] = React.useState(!open);
  if (open && settledClosed) setSettledClosed(false);

  const { measured, width, height } = useActiveContentSize(ref, {
    transition: enter,
    reduce,
  });
  // Its contents change in place, moving between items.
  const swapper = useContentSwapper(enter, reduce);

  // Radix measures the active content and sets these variables at once:
  // Animate UI animates them instead, so classes reading them
  // (h-(--radix-navigation-menu-viewport-height)) resize smoothly. Written
  // on the element directly, every frame, and again whenever Radix writes
  // its own value (it would show for a frame).
  React.useEffect(() => {
    const node = ref.current;
    if (!node || !measured) return;
    const write = () => {
      for (const [name, value] of [
        [WIDTH, width.get()],
        [HEIGHT, height.get()],
      ] as const) {
        if (node.style.getPropertyValue(name) !== value)
          node.style.setProperty(name, value);
      }
    };
    write();
    const stopWidth = width.on('change', write);
    const stopHeight = height.on('change', write);
    const observer = new MutationObserver(write);
    observer.observe(node, { attributes: true, attributeFilter: ['style'] });
    return () => {
      stopWidth();
      stopHeight();
      observer.disconnect();
    };
  }, [measured, width, height]);

  return (
    <SwapContext value={swapper}>
      <MotionViewport
        // Motion reads onAnimationStart & co. as its own events, not CSS ones.
        {...(props as React.ComponentProps<typeof MotionViewport>)}
        ref={ref}
        forceMount
        initial={hidden}
        animate={
          open
            ? { opacity: 1, scale: 1, transition: enter }
            : { ...hidden, transition: exit }
        }
        exit={{ ...hidden, transition: exit }}
        onAnimationComplete={() => {
          if (keepMounted && !open) setSettledClosed(true);
        }}
        style={{
          // It drops from the menu, centered under it.
          transformOrigin:
            menu?.orientation === 'vertical'
              ? menu.dir === 'rtl'
                ? 'center right'
                : 'center left'
              : 'top center',
          ...(keepMounted && settledClosed && !open
            ? { visibility: 'hidden' as const }
            : null),
          ...style,
        }}
      />
    </SwapContext>
  );
}

/**
 * The size of the Content displayed in the Viewport, animated when it
 * changes. Radix mounts only the active Content in the Viewport; one leaving
 * with a CSS animation is marked `data-motion="to-…"`.
 */
function useActiveContentSize(
  viewportRef: React.RefObject<HTMLDivElement | null>,
  options: { transition: Transition; reduce: boolean },
) {
  const width = useMotionValue(0);
  const height = useMotionValue(0);
  const widthPx = useTransform(width, (v) => `${v}px`);
  const heightPx = useTransform(height, (v) => `${v}px`);
  const [measured, setMeasured] = React.useState(false);
  const optionsRef = React.useRef(options);
  React.useLayoutEffect(() => {
    optionsRef.current = options;
  });

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let content: HTMLElement | null = null;
    let first = true;

    const measure = () => {
      if (!content) return;
      const next = { width: content.offsetWidth, height: content.offsetHeight };
      const { transition, reduce } = optionsRef.current;
      if (first || reduce) {
        width.jump(next.width);
        height.jump(next.height);
      } else {
        animate(width, next.width, transition);
        animate(height, next.height, transition);
      }
      if (first) setMeasured(true);
      first = false;
    };

    const resizeObserver = new ResizeObserver(measure);
    const track = () => {
      // Not a previous content's copy, leaving (internal/content-swap).
      const active =
        Array.from(viewport.children).find(
          (child): child is HTMLElement =>
            child instanceof HTMLElement &&
            !child.dataset.motion?.startsWith('to-') &&
            !child.hasAttribute('data-animate-ui-handoff'),
        ) ?? null;
      if (active === content) return;
      if (content) resizeObserver.unobserve(content);
      content = active;
      if (content) {
        resizeObserver.observe(content);
        measure();
      }
    };

    const mutationObserver = new MutationObserver(track);
    mutationObserver.observe(viewport, {
      childList: true,
      attributes: true,
      subtree: true,
      attributeFilter: ['data-motion'],
    });
    track();
    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [viewportRef, width, height]);

  return { measured, width: widthPx, height: heightPx };
}

function Indicator({
  forceMount,
  transition,
  exitTransition,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator> &
  PresenceAnimationProps) {
  const menu = React.use(MenuStateContext);
  if (!menu) {
    return (
      <NavigationMenuPrimitive.Indicator {...props} forceMount={forceMount}>
        {children}
      </NavigationMenuPrimitive.Indicator>
    );
  }

  const visible = Boolean(menu.value);
  return (
    <AnimatePresence>
      {(visible || forceMount) && (
        <ReducedMotionConfig>
          <NavigationMenuPrimitive.Indicator {...props} forceMount asChild>
            <IndicatorMotion
              visible={visible}
              transition={transition}
              exitTransition={exitTransition}
            >
              {children}
            </IndicatorMotion>
          </NavigationMenuPrimitive.Indicator>
        </ReducedMotionConfig>
      )}
    </AnimatePresence>
  );
}

/** Radix positions it with an inline transform and size: Motion animates them. */
function IndicatorMotion({
  visible,
  transition,
  exitTransition,
  style,
  ...props
}: React.ComponentProps<'div'> &
  PresenceAnimationProps & { visible: boolean }) {
  const reduce = useShouldReduceMotion();
  const { transform, width, height, ...rest } = style ?? {};
  const position = Object.fromEntries(
    Object.entries({ transform, width, height }).filter(
      ([, value]) => value !== undefined,
    ),
  );
  // v1's menu highlight: one spring to move and to fade in, and a fade out
  // that waits 200ms.
  const spring = useTempoTransition(transition ?? HIGHLIGHT_TRANSITION);
  const move = reduce ? { duration: 0 } : spring;
  const enter = spring;
  const exit = useTempoTransition(
    exitTransition ?? { ...HIGHLIGHT_TRANSITION, delay: 0.2 },
  );

  return (
    <motion.div
      {...(props as React.ComponentProps<typeof motion.div>)}
      // It appears where it is: only the opacity animates the first time.
      initial={{ opacity: 0, ...position }}
      animate={{
        opacity: visible ? 1 : 0,
        ...position,
        transition: { default: move, opacity: visible ? enter : exit },
      }}
      exit={{ opacity: 0, transition: exit }}
      style={rest}
    />
  );
}

const createNavigationMenuScope: typeof NavigationMenuPrimitive.createNavigationMenuScope =
  NavigationMenuPrimitive.createNavigationMenuScope;

export {
  Root,
  Sub,
  List,
  Item,
  Trigger,
  Link,
  Content,
  Viewport,
  Indicator,
  // `NavigationMenu` is Radix's alias of Root: with the radix-ui import
  // style, `NavigationMenuPrimitive.NavigationMenu` keeps working.
  Root as NavigationMenu,
  Sub as NavigationMenuSub,
  List as NavigationMenuList,
  Item as NavigationMenuItem,
  Trigger as NavigationMenuTrigger,
  Link as NavigationMenuLink,
  Content as NavigationMenuContent,
  Viewport as NavigationMenuViewport,
  Indicator as NavigationMenuIndicator,
  createNavigationMenuScope,
  type NavigationMenuProps,
  type NavigationMenuSubProps,
  type NavigationMenuListProps,
  type NavigationMenuItemProps,
  type NavigationMenuTriggerProps,
  type NavigationMenuLinkProps,
  type NavigationMenuContentProps,
  type NavigationMenuViewportProps,
  type NavigationMenuIndicatorProps,
};
