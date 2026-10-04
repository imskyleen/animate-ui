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
  motionTokens,
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { HIDDEN_SCALE, MENU_TRANSITION } from '../../../internal/anchored';
import { HIGHLIGHT_TRANSITION } from '../../../internal/item-highlight';

// Same API as Radix's Navigation Menu. The Root (and each Sub) mirrors the
// open value (Radix keeps it private) so the Viewport, the Content and the
// Indicator can play an exit before they unmount.
//
// It has no Animate UI v1 counterpart: it moves like v1's DropdownMenu.
// - The Viewport fades and scales from 0.9 in 200ms, both ways, like the
//   menus, and its size follows the active content in 200ms too.
// - Content swapped inside the Viewport fades in from a 4px blur, in 200ms;
//   the previous one leaves at once. Without a Viewport, each Content fades and scales on its
//   own, like a menu.
// - The Indicator follows the active trigger like v1's menu highlight: a
//   spring (stiffness 350, damping 35), fading in on it and out 200ms later.

/** Animate UI's additions to the parts that appear and disappear. */
type PresenceAnimationProps = {
  /**
   * Transition of the entrance, and of the exit unless `exitTransition` is
   * set. Defaults to `{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }` (the
   * Indicator: v1's highlight spring).
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
      <NavigationMenuPrimitive.Root
        {...props}
        value={state.value}
        onValueChange={onValueChange}
      />
    </MenuStateContext>
  );
}

function Sub(props: React.ComponentProps<typeof NavigationMenuPrimitive.Sub>) {
  const parent = React.use(MenuStateContext);
  const [state, onValueChange] = useMenuState(props, parent?.dir ?? 'ltr');
  return (
    <MenuStateContext value={state}>
      <NavigationMenuPrimitive.Sub
        {...props}
        value={state.value}
        onValueChange={onValueChange}
      />
    </MenuStateContext>
  );
}

const List = NavigationMenuPrimitive.List;

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

const Trigger = NavigationMenuPrimitive.Trigger;
const Link = NavigationMenuPrimitive.Link;

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
  // in the Viewport): it just needs an entrance.
  if (menu.hasViewport) {
    return (
      <NavigationMenuPrimitive.Content
        {...props}
        forceMount={forceMount}
        asChild
      >
        <ViewportContentMotion transition={transition}>
          {children}
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
              {children}
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

/** Radix renders it in the Viewport, through asChild. */
function ViewportContentMotion(
  props: SlotChildProps & { transition?: Transition },
) {
  return (
    <ReducedMotionConfig>
      <ViewportContentMotionInner {...props} />
    </ReducedMotionConfig>
  );
}

function ViewportContentMotionInner({
  transition,
  ...props
}: SlotChildProps & { transition?: Transition }) {
  const fade = useTempoTransition(transition ?? MENU_TRANSITION);
  // Radix's `data-motion` is set when moving between items (from-start or
  // from-end): read once, on mount. The first opening has none: the
  // Viewport's entrance is enough.
  const [swapped] = React.useState(Boolean(props['data-motion']));

  return (
    <motion.div
      {...(props as React.ComponentProps<typeof motion.div>)}
      // From a light blur, like a tab panel: the swap reads as one surface
      // changing. The blur is dropped at rest (a `filter` would make it the
      // containing block of fixed descendants).
      initial={
        swapped ? { opacity: 0, filter: motionTokens.blur.surface } : false
      }
      animate={{
        opacity: 1,
        filter: 'blur(0px)',
        transition: fade,
        transitionEnd: { filter: 'none' },
      }}
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
      const active =
        Array.from(viewport.children).find(
          (child): child is HTMLElement =>
            child instanceof HTMLElement &&
            !child.dataset.motion?.startsWith('to-'),
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
