'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import type { Transition } from 'motion/react';

import { mergeRefs } from '../../internal/anchored';
import { IconSwap } from '../buttons/_icon-swap';
import {
  TriggerHighlightScope,
  useTriggerHighlight,
} from '../../internal/item-highlight';
import {
  motionTokens,
  toCssTiming,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';
import {
  runCollapse,
  snapshotCollapse,
  stopCollapse,
  type CollapseSnapshot,
  type CollapseTimings,
} from './collapse';

// shadcn/ui's sidebar, headless and library-agnostic: the parts of it that
// carry behaviour or motion, for the sidebar of any shadcn/ui base (Radix UI,
// Base UI, React Aria) or your own. Animate UI v1's sidebar, in v2's motion:
//
// - `Provider` is shadcn/ui's SidebarProvider without its styles: open state
//   (controlled or not, kept in the `sidebar_state` cookie), the mobile
//   sheet's, Cmd/Ctrl+B, `useSidebar()`. Its wrapper `div` takes your props.
// - `Gap` and `Container` are the desktop sidebar's gap (the room it makes in
//   the page) and its fixed container. Collapsing and expanding (offcanvas or
//   to icons), their widths (and the container's `left`/`right`) change on
//   one curve and one duration (`transition.collapse`), so the sidebar's
//   edge and the page's stay together. They're CSS transitions: the widths
//   are your classes (`group-data-[collapsible=icon]:w-…`), only the timing
//   is Animate UI's (and the tempo's, and none under reduced motion).
//   Nothing animates on mount.
// - `Highlight` wraps a sidebar's content (the desktop container's inner
//   element, the mobile sheet's, a `collapsible="none"` sidebar): its menu
//   buttons (`data-sidebar="menu-button"`, `"menu-sub-button"`, as shadcn/ui
//   marks them) share one highlight. When a button's own styles paint it
//   (`hover:bg-sidebar-accent`, an open menu's `data-[state=open]:…`), the
//   surface glides to it from the one lit before (`spring.highlight`), fades
//   in from nothing when none was, and fades out where it is once none is
//   (`transition.color`): one surface handed from button to button
//   (internal/item-highlight), sub-menu buttons included. The buttons clip
//   their content (`overflow-hidden`): the surface goes beside each one, in
//   its parent (the menu item), laid over its box, so it glides in from the
//   previous one instead of being cut at the button's edge.
//   Collapsing to icons and back, everything inside follows the sidebar's
//   timing: the buttons resize on it (their own `transition-[width,…]`,
//   retimed), the group labels slide up on it, and the labels fade into a
//   light blur first and back last, with no ellipsis on the way; the parts
//   the collapse hides fold and fade with it (./collapse).
// - `TriggerIcon` swaps the trigger's icon as the sidebar opens or closes
//   (the swap recipe: half its size, faded, in a light blur).
// - The rail's hover line fades on the color's curve (`transition.color`).
//
// The mobile sheet, the tooltips of a sidebar collapsed to icons and the
// collapsible menus are the shadcn/ui components your sidebar already uses
// (Sheet, Tooltip, Collapsible): `animate-ui animate` animates them.

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';
/** shadcn/ui's `useIsMobile` breakpoint. */
const MOBILE_BREAKPOINT = 768;

/**
 * The sidebar collapsing and expanding, and all that resizes with it: one
 * curve, one duration.
 */
const COLLAPSE_TRANSITION: Transition = motionTokens.transition.collapse;
/** Labels fading out first, and back in last. */
const LABEL_TRANSITION: Transition = motionTokens.transition.collapseLabel;
/** The rail's hover line. */
const COLOR_TRANSITION: Transition = motionTokens.transition.color;

/**
 * What follows the collapse's timing (`--animate-ui-sidebar-duration` and
 * `-easing`, set by the Provider) and the rail's: a style sheet, unlayered,
 * so it wins over Tailwind's utilities (and new elements get it at once).
 *
 * - The menu buttons' own transitions (shadcn/ui's
 *   `transition-[width,height,padding]`, at Tailwind's 150ms): the
 *   collapse's, so the icons stay put while the sidebar resizes.
 * - The group labels' slide (`-mt-8`, at 200ms linear): the collapse's; their
 *   fade is the labels' (./collapse).
 * - The rail's line is its `::after` (shadcn/ui's `after:` classes): only a
 *   style sheet reaches it. It fades on the color's curve.
 */
const SIDEBAR_STYLE = {
  href: 'animate-ui-sidebar',
  css: [
    '[data-sidebar="menu-button"]{transition-duration:var(--animate-ui-sidebar-duration,280ms);transition-timing-function:var(--animate-ui-sidebar-easing,cubic-bezier(0.77,0,0.175,1))}',
    '[data-sidebar="group-label"]{transition-property:margin;transition-duration:var(--animate-ui-sidebar-duration,280ms);transition-timing-function:var(--animate-ui-sidebar-easing,cubic-bezier(0.77,0,0.175,1))}',
    '[data-sidebar="rail"],[data-sidebar="rail"]::after{transition-duration:var(--animate-ui-sidebar-color-duration,200ms);transition-timing-function:var(--animate-ui-sidebar-color-easing,ease)}',
    '[data-sidebar="rail"]::after{transition-property:background-color}',
  ].join(''),
};

/* Provider ---------------------------------------------------------------- */

type SidebarContextProps = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

/** The provider's `animateOnHover`, for the highlights inside. */
const AnimateOnHoverContext = React.createContext(true);

/** shadcn/ui's `useSidebar`: the sidebar's state, from its Provider. */
function useSidebar() {
  const context = React.use(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}

const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function subscribeMobile(onChange: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

/** shadcn/ui's `useIsMobile()`: narrower than 768px (false on the server). */
function useIsMobile() {
  return React.useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}

type ProviderProps = React.ComponentProps<'div'> & {
  /** Open at first (uncontrolled). */
  defaultOpen?: boolean;
  /** Open (controlled). */
  open?: boolean;
  /** Called when the sidebar opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * The menu buttons share one gliding highlight (`Highlight`). False keeps
   * their own hover styles.
   */
  animateOnHover?: boolean;
};

function Provider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  animateOnHover = true,
  style,
  children,
  ...props
}: ProviderProps) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // Uncontrolled unless `open` is passed; `onOpenChange` is called either way.
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value;
      if (openProp === undefined) setUncontrolledOpen(openState);
      onOpenChange?.(openState);

      // The cookie keeps the sidebar's state, as shadcn/ui's does.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [onOpenChange, open, openProp],
  );

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen]);

  // Cmd/Ctrl+B toggles the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // `data-state="expanded" | "collapsed"` in shadcn/ui's sidebar.
  const state = open ? 'expanded' : 'collapsed';

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar],
  );

  // The rail's hover line fades on the color's curve (SIDEBAR_STYLE).
  const color = toCssTiming(useTempoTransition(COLOR_TRANSITION));
  // The collapse's timing, for what else follows it (a page header
  // shrinking: `duration-(--animate-ui-sidebar-duration)`).
  const reduce = useShouldReduceMotion();
  const collapse = toCssTiming(useTempoTransition(COLLAPSE_TRANSITION));

  return (
    <SidebarContext value={contextValue}>
      <AnimateOnHoverContext value={animateOnHover}>
        <style href={SIDEBAR_STYLE.href} precedence="animate-ui">
          {SIDEBAR_STYLE.css}
        </style>
        <div
          {...props}
          style={
            {
              '--animate-ui-sidebar-color-duration': `${color.duration}ms`,
              '--animate-ui-sidebar-color-easing': color.easing,
              '--animate-ui-sidebar-duration': `${reduce ? 0 : collapse.duration}ms`,
              '--animate-ui-sidebar-easing': collapse.easing,
              ...style,
            } as React.CSSProperties
          }
        >
          {children}
        </div>
      </AnimateOnHoverContext>
    </SidebarContext>
  );
}

/* Gap and Container -------------------------------------------------------- */

/**
 * A CSS transition of `properties` on a Motion transition's timing (paced by
 * the tempo): none under reduced motion. Longhands, so the element's own
 * `transition-*` classes are overridden, never mixed in.
 */
function useCssTransition(
  transition: Transition,
  properties: string,
): React.CSSProperties {
  const reduce = useShouldReduceMotion();
  const { duration, easing } = toCssTiming(useTempoTransition(transition));
  return {
    transitionProperty: properties,
    transitionDuration: `${reduce ? 0 : duration}ms`,
    transitionTimingFunction: easing,
    transitionDelay: '0ms',
  };
}

type GapProps = React.ComponentProps<'div'> & {
  /**
   * Transition of its width as the sidebar collapses or expands (a tween:
   * its duration and curve become a CSS transition).
   */
  transition?: Transition;
};

/** The room the desktop sidebar makes in the page: its width animates. */
function Gap({ transition = COLLAPSE_TRANSITION, style, ...props }: GapProps) {
  const timing = useCssTransition(transition, 'width');
  return <div {...props} style={{ ...timing, ...style }} />;
}

type ContainerProps = React.ComponentProps<'div'> & {
  /**
   * Transition of its `left`, `right` and `width` as the sidebar collapses
   * or expands (a tween: its duration and curve become a CSS transition).
   */
  transition?: Transition;
};

/** The desktop sidebar's fixed container: it slides and resizes. */
function Container({
  transition = COLLAPSE_TRANSITION,
  style,
  ...props
}: ContainerProps) {
  const timing = useCssTransition(transition, 'left, right, width');
  return <div {...props} style={{ ...timing, ...style }} />;
}

/* Highlight ----------------------------------------------------------------- */

/** shadcn/ui's menu buttons, which share the highlight. */
const ITEMS = '[data-sidebar="menu-button"], [data-sidebar="menu-sub-button"]';
/** Their own disabled state: they stay out of it. */
const DISABLED = ':disabled, [aria-disabled="true"], [data-disabled]';
/** The surfaces the highlight renders: their comings and goings don't count. */
const SURFACE = '[data-slot="trigger-highlight"]';

/** The Highlight elements, so each item goes to the closest one. */
const roots = new WeakSet<Element>();

type Item = {
  node: HTMLElement;
  /** Where its surface goes: beside it, in its parent. */
  host: HTMLElement;
  disabled: boolean;
  key: number;
};

const keys = new WeakMap<HTMLElement, number>();
let nextKey = 0;
function keyOf(node: HTMLElement) {
  let key = keys.get(node);
  if (key === undefined) keys.set(node, (key = nextKey++));
  return key;
}

function closestRoot(node: HTMLElement) {
  for (let el = node.parentElement; el; el = el.parentElement)
    if (roots.has(el)) return el;
  return null;
}

/** The elements matching `selector` in `root`, not in a nested Highlight. */
const own = (root: HTMLElement, selector: string) =>
  [...root.querySelectorAll<HTMLElement>(selector)].filter(
    (node) => closestRoot(node) === root,
  );

const sameItems = (a: readonly Item[], b: readonly Item[]) =>
  a.length === b.length &&
  a.every(
    (item, i) =>
      item.node === b[i]!.node &&
      item.host === b[i]!.host &&
      item.disabled === b[i]!.disabled,
  );

/** Only the highlight's own surfaces came or went. */
const onlySurfaces = (record: MutationRecord) =>
  record.type === 'childList' &&
  [...record.addedNodes, ...record.removedNodes].every(
    (node) => node instanceof Element && node.matches(SURFACE),
  );

/**
 * Calls `onChange` when the elements inside `root` change (the highlight's
 * own surfaces aside).
 */
function useContentChanges(root: HTMLElement | null, onChange: () => void) {
  const onChangeRef = React.useRef(onChange);
  React.useLayoutEffect(() => {
    onChangeRef.current = onChange;
  });
  React.useLayoutEffect(() => {
    if (!root) return;
    onChangeRef.current();
    const observer = new MutationObserver((records) => {
      if (!records.every(onlySurfaces)) onChangeRef.current();
    });
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        'data-sidebar',
        'disabled',
        'aria-disabled',
        'data-disabled',
      ],
    });
    return () => observer.disconnect();
  }, [root]);
}

const NO_ITEMS: readonly Item[] = [];

/** The menu buttons inside `root` (not inside a nested Highlight). */
function useItems(root: HTMLElement | null) {
  const [items, setItems] = React.useState<readonly Item[]>([]);
  useContentChanges(root, () => {
    const found: Item[] = [];
    for (const node of own(root!, ITEMS)) {
      const host = node.parentElement;
      if (!host) continue;
      found.push({
        node,
        host,
        disabled: node.matches(DISABLED),
        key: keyOf(node),
      });
    }
    setItems((current) => (sameItems(current, found) ? current : found));
  });
  return root ? items : NO_ITEMS;
}

type CollapseMotionProps = {
  root: HTMLElement | null;
  state: string | undefined;
  timings: CollapseTimings;
};

/**
 * Runs ./collapse on every toggle: it reads what's shown before React
 * changes the DOM (`getSnapshotBeforeUpdate`), and moves what changed right
 * after, before it's painted.
 */
class CollapseMotion extends React.Component<CollapseMotionProps> {
  getSnapshotBeforeUpdate(previous: CollapseMotionProps) {
    const { root, state } = this.props;
    if (!root || previous.state === state || previous.state === undefined)
      return null;
    return snapshotCollapse(root);
  }

  componentDidUpdate(
    _: CollapseMotionProps,
    __: unknown,
    snapshot: CollapseSnapshot | null,
  ) {
    const { root, timings } = this.props;
    if (root && snapshot) runCollapse(root, snapshot, timings);
  }

  componentWillUnmount() {
    if (this.props.root) stopCollapse(this.props.root);
  }

  render() {
    return null;
  }
}

/** One menu button's part of the highlight: its surface, beside it. */
function ItemSurface({ node, host, disabled }: Omit<Item, 'key'>) {
  const { ref, highlight } = useTriggerHighlight(disabled, { beside: true });
  React.useLayoutEffect(() => ref(node), [ref, node]);
  return highlight ? createPortal(highlight, host) : null;
}

type HighlightProps = React.ComponentProps<'div'> & {
  /**
   * The menu buttons inside share one gliding highlight. Defaults to the
   * Provider's `animateOnHover`; false keeps their own hover styles.
   */
  animateOnHover?: boolean;
};

/**
 * A sidebar's content: its menu buttons share one highlight, and what's
 * inside follows the sidebar as it collapses to icons. It's its own stacking
 * context, so the highlight goes under the buttons' content and above the
 * sidebar's background.
 */
function Highlight({
  animateOnHover,
  ref,
  style,
  children,
  ...props
}: HighlightProps) {
  const inherited = React.use(AnimateOnHoverContext);
  const sidebar = React.use(SidebarContext);
  const enabled = animateOnHover ?? inherited;
  const [root, setRoot] = React.useState<HTMLDivElement | null>(null);
  const setRootRef = React.useCallback((node: HTMLDivElement | null) => {
    if (node) roots.add(node);
    setRoot(node);
  }, []);
  const mergedRef = React.useMemo(
    () => mergeRefs(ref, setRootRef),
    [ref, setRootRef],
  );
  const items = useItems(enabled ? root : null);

  const reduce = useShouldReduceMotion();
  const collapse = toCssTiming(useTempoTransition(COLLAPSE_TRANSITION));
  const label = toCssTiming(useTempoTransition(LABEL_TRANSITION));
  const duration = reduce ? 0 : collapse.duration;
  const timings = React.useMemo<CollapseTimings>(
    () => ({
      duration,
      easing: collapse.easing,
      labelDuration: label.duration,
      labelEasing: label.easing,
      blur: motionTokens.blur.icon,
      reduce,
    }),
    [duration, collapse.easing, label.duration, label.easing, reduce],
  );

  return (
    <div
      {...props}
      ref={mergedRef}
      style={enabled ? { isolation: 'isolate', ...style } : style}
    >
      <TriggerHighlightScope>
        {children}
        {items.map(({ key, ...item }) => (
          <ItemSurface key={key} {...item} />
        ))}
      </TriggerHighlightScope>
      <CollapseMotion root={root} state={sidebar?.state} timings={timings} />
    </div>
  );
}

/* TriggerIcon --------------------------------------------------------------- */

type TriggerIconProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  /** The icon while the sidebar is open (shadcn/ui: a panel closing). */
  open: React.ReactNode;
  /** The icon while it's closed (a panel opening). */
  closed: React.ReactNode;
  /** Transition of the swap. */
  transition?: Transition;
};

/**
 * The trigger's icon, swapping as the sidebar opens or closes (the mobile
 * sheet on a phone): the old icon shrinks to half its size into a light blur
 * as it fades, while the new one grows out of it. Nothing on mount; a
 * crossfade under reduced motion.
 */
function TriggerIcon({ open, closed, ...props }: TriggerIconProps) {
  const { state, isMobile, openMobile } = useSidebar();
  const isOpen = isMobile ? openMobile : state === 'expanded';
  return (
    <IconSwap swapKey={isOpen ? 'open' : 'closed'} {...props}>
      {isOpen ? open : closed}
    </IconSwap>
  );
}

export {
  Provider,
  Gap,
  Container,
  Highlight,
  TriggerIcon,
  useSidebar,
  type ProviderProps,
  type GapProps,
  type ContainerProps,
  type HighlightProps,
  type TriggerIconProps,
  type SidebarContextProps,
};
