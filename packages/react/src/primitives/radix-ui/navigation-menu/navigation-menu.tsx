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
  MORPH_TRANSITION,
  mergeRefs,
} from '../../../internal/anchored';
import { useStaggeredEnter, useStaggerOnOpen } from '../../../internal/stagger';
import {
  SwapContext,
  useContentSwapper,
  type Way,
} from '../../../internal/content-swap';
import {
  curveOf,
  startOf,
  velocityOf,
  type Run,
} from '../../../internal/momentum';
import {
  HIGHLIGHT_TRANSITION,
  TriggerHighlightScope,
  useTriggerHighlight,
  withHighlight,
} from '../../../internal/item-highlight';

type PresenceAnimationProps = {
  transition?: Transition;
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
  hasViewport: boolean;
  registerViewport: () => () => void;
  clicked: (item: string) => void;
  pointerEntered: () => void;
  justOpened: (item: string) => boolean;
  keptOpen: (item: string) => void;
};

const PATIENT_CLICK = 500;

const MenuStateContext = React.createContext<MenuState | null>(null);
const ItemValueContext = React.createContext<string | null>(null);

type ValueProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
};

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
  const openedRef = React.useRef({ item: '', at: -Infinity, byClick: false });
  const clickedRef = React.useRef<string | null>(null);

  const state: MenuState = {
    value,
    orientation: orientation ?? 'horizontal',
    dir,
    hasViewport: viewports > 0,
    registerViewport,
    clicked: (item) => {
      clickedRef.current = item;
    },
    pointerEntered: () => {
      clickedRef.current = null;
    },
    justOpened: (item) => {
      const opened = openedRef.current;
      return (
        opened.item === item &&
        !opened.byClick &&
        performance.now() - opened.at < PATIENT_CLICK
      );
    },
    keptOpen: (item) => {
      if (openedRef.current.item === item)
        openedRef.current = { ...openedRef.current, byClick: true };
    },
  };
  const onChange = (next: string) => {
    if (!controlled) setUncontrolled(next);
    onValueChange?.(next);
    if (next === value) return;
    openedRef.current = next
      ? {
          item: next,
          at: performance.now(),
          byClick: clickedRef.current === next,
        }
      : { item: '', at: -Infinity, byClick: false };
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
      style={{ isolation: 'isolate', ...style }}
    />
  );
}

function Item({
  value: valueProp,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
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

function Trigger({
  onClick,
  onPointerEnter,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  const menu = React.use(MenuStateContext);
  const item = React.use(ItemValueContext);
  return (
    <NavigationMenuPrimitive.Trigger
      {...(useHighlighted(props) as typeof props)}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        menu?.pointerEntered();
      }}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !menu || item === null) return;
        if (
          menu.value === item &&
          event.detail > 0 &&
          !event.currentTarget.matches('a[href]') &&
          menu.justOpened(item)
        ) {
          event.preventDefault();
          menu.keptOpen(item);
          return;
        }
        menu.clicked(item);
      }}
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

function wayOf(motionAttribute: string | undefined, menu: MenuState | null) {
  if (!motionAttribute?.startsWith('from-')) return null;
  const axis = menu?.orientation === 'vertical' ? 'y' : 'x';
  const motion = motionAttribute === 'from-end' ? 1 : -1;
  const sign = axis === 'y' && menu?.dir === 'rtl' ? -motion : motion;
  return { axis, sign } satisfies Way;
}

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
    return () => swapper.leave(node, id);
  }, [swapper, id, way]);
  useStaggerOnOpen(nodeRef, true, { fresh: way === null });

  return (
    <div
      {...props}
      ref={mergedRef}
      style={{ isolation: 'isolate', ...style }}
    />
  );
}

function InlineContentMotion({
  ref,
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
  const enter = useStaggeredEnter(
    useTempoTransition(transition ?? MENU_TRANSITION),
  );
  const exit = useTempoTransition(
    exitTransition ?? transition ?? MENU_TRANSITION,
  );
  const hidden = { opacity: 0, scale: reduce ? 1 : HIDDEN_SCALE.menu };
  const [settledClosed, setSettledClosed] = React.useState(!open);
  if (open && settledClosed) setSettledClosed(false);
  const nodeRef = React.useRef<HTMLDivElement>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, nodeRef), [ref]);
  useStaggerOnOpen(nodeRef, open);

  return (
    <motion.div
      {...(props as React.ComponentProps<typeof motion.div>)}
      ref={mergedRef}
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
        transformOrigin: menu?.dir === 'rtl' ? 'top right' : 'top left',
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
  const enter = useStaggeredEnter(
    useTempoTransition(transition ?? MENU_TRANSITION),
  );
  const exit = useTempoTransition(
    exitTransition ?? transition ?? MENU_TRANSITION,
  );
  const morph = useTempoTransition(transition ?? MORPH_TRANSITION);
  const hidden = { opacity: 0, scale: reduce ? 1 : HIDDEN_SCALE.menu };
  const [settledClosed, setSettledClosed] = React.useState(!open);
  if (open && settledClosed) setSettledClosed(false);

  const { measured, width, height } = useActiveContentSize(ref, {
    transition: morph,
    reduce,
  });
  const swapper = useContentSwapper(morph, reduce);

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
    let heading: { width: number; height: number } | null = null;
    const runs = new Map<typeof width, { run: Run; since: number }>();

    const measure = () => {
      if (!content) return;
      const next = { width: content.offsetWidth, height: content.offsetHeight };
      const { transition, reduce } = optionsRef.current;
      if (first || reduce) {
        width.jump(next.width);
        height.jump(next.height);
        runs.clear();
      } else if (
        !heading ||
        next.width !== heading.width ||
        next.height !== heading.height
      ) {
        const resize = (value: typeof width, to: number) => {
          value.stop();
          const now = performance.now();
          const moving = runs.get(value);
          const velocity = moving
            ? velocityOf(moving.run, now - moving.since)[0]!
            : 0;
          const offset = value.get() - to;
          const speed = startOf(transition, [offset], [velocity]);
          animate(value, to, {
            ...transition,
            velocity: -offset * speed * 1000,
          });
          runs.set(value, {
            run: { offset: [offset], curve: curveOf(transition, speed) },
            since: now,
          });
        };
        resize(width, next.width);
        resize(height, next.height);
      }
      heading = next;
      if (first) setMeasured(true);
      first = false;
    };

    const resizeObserver = new ResizeObserver(measure);
    const track = () => {
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
  const spring = useTempoTransition(transition ?? HIGHLIGHT_TRANSITION);
  const move = reduce ? { duration: 0 } : spring;
  const enter = spring;
  const exit = useTempoTransition(
    exitTransition ?? { ...HIGHLIGHT_TRANSITION, delay: 0.2 },
  );

  return (
    <motion.div
      {...(props as React.ComponentProps<typeof motion.div>)}
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

Root.displayName = 'NavigationMenu';
Sub.displayName = 'NavigationMenuSub';
List.displayName = 'NavigationMenuList';
Item.displayName = 'NavigationMenuItem';
Trigger.displayName = 'NavigationMenuTrigger';
Link.displayName = 'NavigationMenuLink';
Content.displayName = 'NavigationMenuContent';
Viewport.displayName = 'NavigationMenuViewport';
Indicator.displayName = 'NavigationMenuIndicator';

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
