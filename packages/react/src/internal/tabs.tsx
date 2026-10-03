'use client';

import * as React from 'react';
import { motion, type Transition } from 'motion/react';

import { useMotionTokens } from '../utils/motion';
import { isKeyboardInput, useInputModality } from './input-modality';

// Shared by the Radix UI, Base UI and React Aria tabs.
//
// shadcn/ui styles the active tab itself (its background, border, shadow and,
// for the line variant, an ::after underline). To make that surface glide
// without touching the component, the list renders an indicator that copies
// the active tab's classes and data attributes (so it looks exactly like the
// active tab, in every style and theme) and sits behind the tabs, while a
// small stylesheet hides the active tab's own surface. The indicator moves
// with a layout animation (transforms), keyboard moves are instant.

/** Set on every animated tab, so the stylesheet only touches ours. */
const TAB_ATTRIBUTE = 'data-animate-ui-tab';
/** Set on the list once its indicator is on screen. */
const READY_ATTRIBUTE = 'data-animate-ui-indicator';

// Unlayered, so it wins over Tailwind's layered utilities. The focus ring of
// a keyboard-focused tab (border and box-shadow) stays on the tab.
const SURFACE_CSS = [
  `[${READY_ATTRIBUTE}] [${TAB_ATTRIBUTE}][aria-selected="true"]{background-color:transparent;background-image:none}`,
  `[${READY_ATTRIBUTE}] [${TAB_ATTRIBUTE}][aria-selected="true"]:not(:focus-visible){border-color:transparent;box-shadow:none}`,
  `[${READY_ATTRIBUTE}] [${TAB_ATTRIBUTE}][aria-selected="true"]::after{opacity:0}`,
].join('');

// Data attributes the indicator copies from the active tab, minus identity and
// interaction states (hover, press, focus) that belong to the real tab.
const SKIPPED_ATTRIBUTE =
  /^data-(slot|animate-ui-.*|hovered|pressed|focused|focus-visible|highlighted|rac|key|radix-.*|composite-.*)$/;

type IndicatorSnapshot = {
  /** Bumped when another tab becomes active: only then does it glide. */
  version: number;
  tab: Element;
  x: number;
  y: number;
  width: number;
  height: number;
  className: string;
  attributes: Record<string, string>;
};

function findActiveTab(list: HTMLElement) {
  for (const tab of list.querySelectorAll(`[${TAB_ATTRIBUTE}]`)) {
    if (
      tab.getAttribute('aria-selected') === 'true' &&
      tab.closest('[role="tablist"]') === list
    )
      return tab as HTMLElement;
  }
  return null;
}

function readSnapshot(
  list: HTMLElement,
  previous: IndicatorSnapshot | null,
): IndicatorSnapshot | null {
  const tab = findActiveTab(list);
  if (!tab) return null;

  // Layout coordinates inside the list, whatever transform an ancestor has
  // (a dialog scaling in, for example).
  const listRect = list.getBoundingClientRect();
  const rect = tab.getBoundingClientRect();
  const scaleX = list.offsetWidth ? listRect.width / list.offsetWidth : 1;
  const scaleY = list.offsetHeight ? listRect.height / list.offsetHeight : 1;
  const x =
    (rect.left - listRect.left) / scaleX - list.clientLeft + list.scrollLeft;
  const y =
    (rect.top - listRect.top) / scaleY - list.clientTop + list.scrollTop;
  const width = rect.width / scaleX;
  const height = rect.height / scaleY;

  const attributes: Record<string, string> = {};
  for (const { name, value } of tab.attributes) {
    if (name.startsWith('data-') && !SKIPPED_ATTRIBUTE.test(name))
      attributes[name] = value;
  }
  const className = tab.getAttribute('class') ?? '';

  const same =
    previous &&
    previous.tab === tab &&
    Math.abs(previous.x - x) < 0.01 &&
    Math.abs(previous.y - y) < 0.01 &&
    Math.abs(previous.width - width) < 0.01 &&
    Math.abs(previous.height - height) < 0.01 &&
    previous.className === className &&
    JSON.stringify(previous.attributes) === JSON.stringify(attributes);
  if (same) return previous;

  return {
    version:
      previous && previous.tab !== tab
        ? previous.version + 1
        : (previous?.version ?? 0),
    tab,
    x,
    y,
    width,
    height,
    className,
    attributes,
  };
}

type TabsIndicatorOptions = {
  /** Off when the user renders the library's own indicator. */
  enabled?: boolean;
  /** Transition of the glide. Defaults to `spring.snappy`. */
  transition?: Transition;
};

/**
 * The gliding indicator of a tab list. Render `indicator` as a child of the
 * list element and spread `listProps` on it.
 */
function useTabsIndicator(
  list: HTMLElement | null,
  { enabled = true, transition }: TabsIndicatorOptions = {},
) {
  useInputModality();
  const tokens = useMotionTokens();
  const [snapshot, setSnapshot] = React.useState<IndicatorSnapshot | null>(
    null,
  );
  const indicatorRef = React.useRef<HTMLSpanElement>(null);

  React.useLayoutEffect(() => {
    if (!list || !enabled) return;
    // The indicator is positioned inside the list, behind its tabs.
    if (getComputedStyle(list).position === 'static')
      list.style.position = 'relative';
    list.style.isolation = 'isolate';

    const update = () =>
      setSnapshot((previous) => readSnapshot(list, previous));
    const resize = new ResizeObserver(update);
    const observeTabs = () => {
      resize.observe(list);
      for (const tab of list.querySelectorAll(`[${TAB_ATTRIBUTE}]`))
        resize.observe(tab);
    };
    const mutations = new MutationObserver((records) => {
      const indicator = indicatorRef.current;
      if (records.every((r) => indicator && indicator.contains(r.target)))
        return;
      observeTabs();
      update();
    });
    mutations.observe(list, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        'aria-selected',
        'class',
        'data-state',
        'data-active',
        'data-selected',
        'data-orientation',
        'data-disabled',
      ],
    });
    observeTabs();
    update();

    return () => {
      mutations.disconnect();
      resize.disconnect();
    };
  }, [list, enabled]);

  // Keyboard moves are instant; pointer moves glide.
  const glide = isKeyboardInput()
    ? tokens.transition.instant
    : (transition ?? tokens.spring.snappy);

  // No indicator while disabled (the user renders the library's own).
  const visible = list && enabled ? snapshot : null;

  const indicator = visible ? (
    <>
      <style href="animate-ui-tabs-indicator" precedence="animate-ui">
        {SURFACE_CSS}
      </style>
      <motion.span
        ref={indicatorRef}
        aria-hidden
        {...visible.attributes}
        data-slot="tabs-indicator"
        className={visible.className}
        layout
        layoutDependency={visible.version}
        transition={glide}
        style={{
          position: 'absolute',
          left: visible.x,
          top: visible.y,
          width: visible.width,
          height: visible.height,
          margin: 0,
          zIndex: -1,
          pointerEvents: 'none',
          // The copied classes may carry a CSS transition (transition-all):
          // Motion owns the movement.
          transition: 'none',
        }}
      />
    </>
  ) : null;

  return {
    indicator,
    listProps: {
      [READY_ATTRIBUTE]: visible ? '' : undefined,
    } as Record<string, string | undefined>,
  };
}

// Panels fade in when the selection changes after mount (never on page
// load), and appear at once after a keyboard change.

const TabsCommittedContext =
  React.createContext<React.RefObject<boolean> | null>(null);

/** Wrap the tabs root: panels mounted after its first commit fade in. */
function TabsMotionProvider({ children }: { children: React.ReactNode }) {
  const committedRef = React.useRef(false);
  React.useEffect(() => {
    committedRef.current = true;
  }, []);
  return (
    <TabsCommittedContext value={committedRef}>{children}</TabsCommittedContext>
  );
}

/**
 * Whether a panel should fade in: when it becomes active after the tabs
 * mounted (or mounts active after that), unless the keyboard changed it.
 */
function usePanelEnters(active: boolean) {
  const committed = React.use(TabsCommittedContext);
  const [state, setState] = React.useState(() => ({
    active,
    enters: active && Boolean(committed?.current) && !isKeyboardInput(),
  }));
  if (state.active !== active) {
    const next = { active, enters: active && !isKeyboardInput() };
    setState(next);
    return next.enters;
  }
  return state.enters;
}

/**
 * Libraries that wait for running animations before removing a panel (Base
 * UI, React Aria) would keep the old panel on screen while its fade-in ends:
 * finish them as soon as it leaves, so it goes at once.
 */
function useFinishAnimationsWhen(
  ref: React.RefObject<HTMLElement | null>,
  when: boolean,
) {
  React.useLayoutEffect(() => {
    if (!when || !ref.current || !('getAnimations' in ref.current)) return;
    for (const animation of ref.current.getAnimations()) animation.finish();
  }, [ref, when]);
}

export {
  TAB_ATTRIBUTE,
  useTabsIndicator,
  TabsMotionProvider,
  usePanelEnters,
  useFinishAnimationsWhen,
  isKeyboardInput,
  type TabsIndicatorOptions,
};
