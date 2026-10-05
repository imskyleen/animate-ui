'use client';

import * as React from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  type AnimationPlaybackControls,
  type Transition,
} from 'motion/react';

import {
  motionTokens,
  useMotionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../utils/motion';

// Shared by the Radix UI, Base UI and React Aria tabs. They move like Animate
// UI v1's tabs:
// - the active tab's surface slides to the new tab with a spring, the new
//   surface fading in while the previous one fades out 200ms later (v1's
//   Highlight, a shared layout animation);
// - the tabs' text color changes over 500ms on `ease`, the curve of a color
//   change;
// - the incoming panel fades in from a 4px blur over 500ms on a strong
//   ease-out (it enters: most of it shows in the first 150ms) while its height
//   springs from the previous panel's (v1's TabsContents), on the spring of
//   Auto Height and Animate UI's own Tabs; the outgoing one leaves at once.
// Keyboard changes animate like clicks.
//
// shadcn/ui styles the active tab itself (its background, border, shadow and,
// for the line variant, an ::after underline). To make that surface slide
// without touching the component, the list renders an indicator that copies
// the active tab's classes and data attributes (so it looks exactly like the
// active tab, in every style and theme) and sits behind the tabs, while a
// small stylesheet hides the active tab's own surface.

/** Set on every animated tab, so the stylesheet only touches ours. */
const TAB_ATTRIBUTE = 'data-animate-ui-tab';
/** Set on the list once its indicator is on screen. */
const READY_ATTRIBUTE = 'data-animate-ui-indicator';
/** The tabs' text color duration, on the list (paced by the tempo). */
const COLOR_DURATION_VAR = '--animate-ui-tab-color-duration';

// Unlayered, so it wins over Tailwind's layered utilities. The focus ring of
// a keyboard-focused tab (border and box-shadow) stays on the tab.
const SURFACE_CSS = [
  `[${READY_ATTRIBUTE}] [${TAB_ATTRIBUTE}][aria-selected="true"]{background-color:transparent;background-image:none}`,
  `[${READY_ATTRIBUTE}] [${TAB_ATTRIBUTE}][aria-selected="true"]:not(:focus-visible){border-color:transparent;box-shadow:none}`,
  `[${READY_ATTRIBUTE}] [${TAB_ATTRIBUTE}][aria-selected="true"]::after{opacity:0}`,
  // The tabs change their colors over 500ms (v1's duration), on `ease`.
  `[${READY_ATTRIBUTE}] [${TAB_ATTRIBUTE}]{transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke;transition-duration:var(${COLOR_DURATION_VAR},.5s);transition-timing-function:ease}`,
].join('');

// Data attributes the indicator copies from the active tab, minus identity and
// interaction states (hover, press, focus) that belong to the real tab.
const SKIPPED_ATTRIBUTE =
  /^data-(slot|animate-ui-.*|hovered|pressed|focused|focus-visible|highlighted|rac|key|radix-.*|composite-.*)$/;

const INDICATOR_SLOT = 'tabs-indicator';

/** The selection spring (v1's TabsHighlight). */
const INDICATOR_TRANSITION: Transition = motionTokens.spring.selection;

/** v1's Highlight `exitDelay`: the previous surface fades out 200ms later. */
const EXIT_DELAY = 0.2;

/** v1's tabs text color duration, in seconds. */
const COLOR_DURATION = 0.5;

const INSTANT: Transition = { duration: 0 };

type IndicatorSnapshot = {
  /** Bumped when another tab becomes active: only then does it slide. */
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

/** Changes inside the indicators (their own classes) don't move them. */
function isInIndicator(node: Node) {
  return (
    node instanceof Element &&
    node.closest(`[data-slot="${INDICATOR_SLOT}"]`) !== null
  );
}

type TabsIndicatorOptions = {
  /** Off when the user renders the library's own indicator. */
  enabled?: boolean;
  /** Transition of the slide. Defaults to a spring (stiffness 300, damping 30). */
  transition?: Transition;
};

/**
 * The sliding indicator of a tab list. Render `indicator` as a child of the
 * list element and spread `listProps` on it.
 */
function useTabsIndicator(
  list: HTMLElement | null,
  { enabled = true, transition }: TabsIndicatorOptions = {},
) {
  const layoutId = `animate-ui-tabs-indicator-${React.useId()}`;
  const { tempo } = useMotionTokens();
  const [snapshot, setSnapshot] = React.useState<IndicatorSnapshot | null>(
    null,
  );

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
      if (records.every((r) => isInIndicator(r.target))) return;
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

  React.useLayoutEffect(() => {
    if (!list || !enabled) return;
    list.style.setProperty(COLOR_DURATION_VAR, `${COLOR_DURATION * tempo}s`);
  }, [list, enabled, tempo]);

  const base = transition ?? INDICATOR_TRANSITION;
  const slide = useTempoTransition(base);
  const fadeOut = useTempoTransition({
    ...base,
    delay: (base.delay ?? 0) + EXIT_DELAY,
  });

  // No indicator while disabled (the user renders the library's own).
  const visible = list && enabled ? snapshot : null;

  const indicator = visible ? (
    <>
      <style href="animate-ui-tabs-indicator" precedence="animate-ui">
        {SURFACE_CSS}
      </style>
      {/* One surface per active tab, sharing a layoutId (v1's Highlight):
          the new one slides from the previous one's box while fading in, the
          previous one follows it and fades out. */}
      <AnimatePresence initial={false}>
        <motion.span
          key={visible.version}
          aria-hidden
          {...visible.attributes}
          data-slot={INDICATOR_SLOT}
          className={visible.className}
          layoutId={layoutId}
          // Only a change of tab slides it: a resize moves it at once.
          layoutDependency={visible.version}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: fadeOut }}
          transition={slide}
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
      </AnimatePresence>
    </>
  ) : null;

  return {
    indicator,
    listProps: {
      [READY_ATTRIBUTE]: visible ? '' : undefined,
    } as Record<string, string | undefined>,
  };
}

/** The panel's entrance: a fade from a 4px blur, 500ms, strong ease-out. */
const PANEL_TRANSITION: Transition = motionTokens.transition.panel;
/** The panels' height: the spring of Auto Height and Animate UI's own Tabs. */
const HEIGHT_TRANSITION: Transition = motionTokens.spring.height;
const PANEL_HIDDEN = { opacity: 0, filter: motionTokens.blur.surface };
// Keyframes: a force-mounted panel becoming active again starts from hidden
// too. The blur is dropped at rest: `filter` would make the panel the
// containing block of its fixed descendants.
const PANEL_ENTRANCE = {
  opacity: [0, 1],
  filter: [motionTokens.blur.surface, 'blur(0px)'],
  transitionEnd: { filter: 'none' },
};
const PANEL_SHOWN = { opacity: 1, filter: 'none' };

/** Last height of the active panel, by the element holding the panels. */
const panelHeights = new WeakMap<Element, number>();

type PanelMotionOptions = {
  /** The user's `transition`, if any. */
  transition: Transition | undefined;
};

/**
 * A tab panel's motion (v1's TabsContent inside TabsContents): spread
 * `initial` and `animate` on its motion element and pass `ref`.
 *
 * - The incoming panel fades in from a 4px blur, on mount (page load) too,
 *   as in v1. A panel that leaves goes at once (hidden, or unmounted by the
 *   library).
 * - Its height springs from the previous panel's to its own, as v1's
 *   TabsContents did around the panels: the panels share an element (the
 *   tabs root, usually), which remembers the active one's height.
 * - Under reduced motion the height jumps while the fade still plays.
 *
 * `transition` covers both: the fade, and `transition.height` (or the whole
 * transition) for the height.
 */
function usePanelMotion(active: boolean, { transition }: PanelMotionOptions) {
  const ref = React.useRef<HTMLElement | null>(null);
  const reduce = useShouldReduceMotion();
  const panelTransition = useTempoTransition(
    transition ?? { ...PANEL_TRANSITION, height: HEIGHT_TRANSITION },
  );
  const heightSpring =
    (panelTransition as { height?: Transition }).height ?? panelTransition;

  // Read by the effect below, which only runs when the panel (de)activates.
  const latestRef = React.useRef({ heightSpring, animateHeight: false });
  React.useLayoutEffect(() => {
    latestRef.current = { heightSpring, animateHeight: !reduce };
  });

  React.useLayoutEffect(() => {
    const element = ref.current;
    const holder = element?.parentElement;
    if (!active || !element || !holder) return;

    const { style } = element;
    const own = {
      minHeight: style.minHeight,
      maxHeight: style.maxHeight,
      overflow: style.overflow,
    };
    // Once: a stopped animation settles later, after a newer one started.
    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true;
      style.minHeight = own.minHeight;
      style.maxHeight = own.maxHeight;
      style.overflow = own.overflow;
    };

    let controls: AnimationPlaybackControls | undefined;
    const from = panelHeights.get(holder);
    const to = element.offsetHeight;
    if (
      latestRef.current.animateHeight &&
      from !== undefined &&
      to > 0 &&
      Math.abs(from - to) > 0.5
    ) {
      // The height is held between min-height and max-height: `height`
      // alone loses to a flex basis (shadcn's panels are `flex-1`).
      const computed = getComputedStyle(element);
      const inset =
        computed.boxSizing === 'border-box'
          ? 0
          : parseFloat(computed.paddingTop) +
            parseFloat(computed.paddingBottom) +
            parseFloat(computed.borderTopWidth) +
            parseFloat(computed.borderBottomWidth);
      const start = from - inset;
      const end = to - inset;
      // Held at the previous panel's height from the first frame, and
      // clipped while it grows, as v1's container was.
      style.minHeight = style.maxHeight = `${start}px`;
      style.overflow = 'hidden';
      // One keyframes array each (Motion resolves them in place), in px:
      // Motion has no default unit for min-height.
      const keyframes = () => [`${start}px`, `${end}px`];
      const animation = animate(
        element,
        { minHeight: keyframes(), maxHeight: keyframes() },
        latestRef.current.heightSpring,
      );
      // Back to its own height (auto) once there.
      animation.then(restore, () => {});
      controls = animation;
    }

    // Remembers this panel's height (while it springs too, so a quick
    // switch starts from where it is).
    const observer = new ResizeObserver(() => {
      if (element.offsetHeight > 0)
        panelHeights.set(holder, element.offsetHeight);
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
      controls?.stop();
      restore();
    };
  }, [active]);

  return {
    ref,
    initial: active ? PANEL_HIDDEN : (false as const),
    // An inactive panel is hidden (or gone) by its library; React Aria's
    // force-mounted ones stay as they are.
    animate: active
      ? { ...PANEL_ENTRANCE, transition: panelTransition }
      : { ...PANEL_SHOWN, transition: INSTANT },
  };
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
  usePanelMotion,
  useFinishAnimationsWhen,
  type TabsIndicatorOptions,
};
