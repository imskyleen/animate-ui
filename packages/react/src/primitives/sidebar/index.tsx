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

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';
const MOBILE_BREAKPOINT = 768;

const COLLAPSE_TRANSITION: Transition = motionTokens.transition.collapse;
const LABEL_TRANSITION: Transition = motionTokens.transition.collapseLabel;
const COLOR_TRANSITION: Transition = motionTokens.transition.color;

const SIDEBAR_STYLE = {
  href: 'animate-ui-sidebar',
  css: [
    '[data-sidebar="menu-button"]{transition-duration:var(--animate-ui-sidebar-duration,280ms);transition-timing-function:var(--animate-ui-sidebar-easing,cubic-bezier(0.77,0,0.175,1))}',
    '[data-sidebar="group-label"]{transition-property:margin;transition-duration:var(--animate-ui-sidebar-duration,280ms);transition-timing-function:var(--animate-ui-sidebar-easing,cubic-bezier(0.77,0,0.175,1))}',
    '[data-sidebar="rail"],[data-sidebar="rail"]::after{transition-duration:var(--animate-ui-sidebar-color-duration,200ms);transition-timing-function:var(--animate-ui-sidebar-color-easing,ease)}',
    '[data-sidebar="rail"]::after{transition-property:background-color}',
  ].join(''),
};

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

const AnimateOnHoverContext = React.createContext(true);

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

function useIsMobile() {
  return React.useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}

type ProviderProps = React.ComponentProps<'div'> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value;
      if (openProp === undefined) setUncontrolledOpen(openState);
      onOpenChange?.(openState);

      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [onOpenChange, open, openProp],
  );

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey) &&
        !(event.target as HTMLElement | null)?.closest?.(
          'input, textarea, select, [contenteditable]:not([contenteditable="false"])',
        )
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

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

  const color = toCssTiming(useTempoTransition(COLOR_TRANSITION));
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
  transition?: Transition;
};

function Gap({ transition = COLLAPSE_TRANSITION, style, ...props }: GapProps) {
  const timing = useCssTransition(transition, 'width');
  return <div {...props} style={{ ...timing, ...style }} />;
}

type ContainerProps = React.ComponentProps<'div'> & {
  transition?: Transition;
};

function Container({
  transition = COLLAPSE_TRANSITION,
  style,
  ...props
}: ContainerProps) {
  const timing = useCssTransition(transition, 'left, right, width');
  return <div {...props} style={{ ...timing, ...style }} />;
}

const ITEMS = '[data-sidebar="menu-button"], [data-sidebar="menu-sub-button"]';
const DISABLED = ':disabled, [aria-disabled="true"], [data-disabled]';
const SURFACE = '[data-slot="trigger-highlight"]';

const roots = new WeakSet<Element>();

type Item = {
  node: HTMLElement;
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

const onlySurfaces = (record: MutationRecord) =>
  record.type === 'childList' &&
  [...record.addedNodes, ...record.removedNodes].every(
    (node) => node instanceof Element && node.matches(SURFACE),
  );

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

function ItemSurface({ node, host, disabled }: Omit<Item, 'key'>) {
  const { ref, highlight } = useTriggerHighlight(disabled, { beside: true });
  React.useLayoutEffect(() => ref(node), [ref, node]);
  return highlight ? createPortal(highlight, host) : null;
}

type HighlightProps = React.ComponentProps<'div'> & {
  animateOnHover?: boolean;
};

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

type TriggerIconProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  open: React.ReactNode;
  closed: React.ReactNode;
  transition?: Transition;
};

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
