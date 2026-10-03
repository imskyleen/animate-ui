'use client';

import * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  usePresence,
  useTransform,
  type MotionValue,
  type Transition,
} from 'motion/react';

import {
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
} from '../../../utils/motion';
import { motionRender } from '../../../internal/modal-motion';

// A drop-in replacement for Vaul (https://vaul.emilkowal.ski), with exactly
// its public API: the `Drawer` object and its parts, the same props and the
// same data attributes, built on Radix's Dialog and Motion.
//
// One motion value drives everything: `position`, the drawer's translation
// along its axis in px. The open and close animations, the drag (the finger
// sets it directly: 1:1, no lag), snap points and the release all write it,
// and the rest is derived from it on the same frame: the overlay's opacity,
// the scaled background (`shouldScaleBackground`) and the progress reported
// to `onDrag`. Below, a "distance" is that translation measured towards the
// closed edge: 0 is fully open, `closed` is off screen.
//
// Radix unmounts closed content at once: the Portal gates itself with
// AnimatePresence and passes `forceMount` down, and the Overlay and the
// Content play their exit through `usePresence`.

const CLOSE_THRESHOLD = 0.25;
const SCROLL_LOCK_TIMEOUT = 100;
/** px/ms: a release faster than this is a flick. */
const VELOCITY_THRESHOLD = 0.4;
/** px/ms: with snap points, a flick this fast skips to the first or last one. */
const SNAP_SKIP_VELOCITY = 2;
/** ms of pointer history used for the release velocity. */
const VELOCITY_WINDOW = 100;
const NESTED_DISPLACEMENT = 16;
const WINDOW_TOP_OFFSET = 26;
const BORDER_RADIUS = 8;
const DRAG_CLASS = 'vaul-dragging';
const LONG_HANDLE_PRESS_TIMEOUT = 250;
const DOUBLE_TAP_TIMEOUT = 120;
/** Rubber band past the open position: slope at the start, then a limit. */
const RUBBER_BAND_FACTOR = 0.5;
const RUBBER_BAND_LIMIT = 48;

type Direction = 'top' | 'bottom' | 'left' | 'right';
type SnapPoint = number | string;

interface WithFadeFromProps {
  /**
   * Array of numbers from 0 to 100 that corresponds to % of the screen a given snap point should take up.
   * Should go from least visible. Example `[0.2, 0.5, 0.8]`.
   * You can also use px values, which doesn't take screen height into account.
   */
  snapPoints: (number | string)[];
  /**
   * Index of a `snapPoint` from which the overlay fade should be applied. Defaults to the last snap point.
   */
  fadeFromIndex: number;
}

interface WithoutFadeFromProps {
  /**
   * Array of numbers from 0 to 100 that corresponds to % of the screen a given snap point should take up.
   * Should go from least visible. Example `[0.2, 0.5, 0.8]`.
   * You can also use px values, which doesn't take screen height into account.
   */
  snapPoints?: (number | string)[];
  fadeFromIndex?: never;
}

type DialogProps = {
  activeSnapPoint?: number | string | null;
  setActiveSnapPoint?: (snapPoint: number | string | null) => void;
  children?: React.ReactNode;
  open?: boolean;
  /**
   * Number between 0 and 1 that determines when the drawer should be closed.
   * Example: threshold of 0.5 would close the drawer if the user swiped for 50% of the height of the drawer or more.
   * @default 0.25
   */
  closeThreshold?: number;
  /**
   * When `true` the `body` doesn't get any styles assigned from Vaul
   */
  noBodyStyles?: boolean;
  onOpenChange?: (open: boolean) => void;
  shouldScaleBackground?: boolean;
  /**
   * When `false` we don't change body's background color when the drawer is open.
   * @default true
   */
  setBackgroundColorOnScale?: boolean;
  /**
   * Duration for which the drawer is not draggable after scrolling content inside of the drawer.
   * @default 100 (ms; Vaul's runtime default, its docs say 500ms)
   */
  scrollLockTimeout?: number;
  /**
   * When `true`, don't move the drawer upwards if there's space, but rather only change it's height so it's fully scrollable when the keyboard is open
   */
  fixed?: boolean;
  /**
   * When `true` only allows the drawer to be dragged by the `<Drawer.Handle />` component.
   * @default false
   */
  handleOnly?: boolean;
  /**
   * When `false` dragging, clicking outside, pressing esc, etc. will not close the drawer.
   * Use this in comination with the `open` prop, otherwise you won't be able to open/close the drawer.
   * @default true
   */
  dismissible?: boolean;
  onDrag?: (
    event: React.PointerEvent<HTMLDivElement>,
    percentageDragged: number,
  ) => void;
  onRelease?: (
    event: React.PointerEvent<HTMLDivElement>,
    open: boolean,
  ) => void;
  /**
   * When `false` it allows to interact with elements outside of the drawer without closing it.
   * @default true
   */
  modal?: boolean;
  nested?: boolean;
  onClose?: () => void;
  /**
   * Direction of the drawer. Can be `top` or `bottom`, `left`, `right`.
   * @default 'bottom'
   */
  direction?: 'top' | 'bottom' | 'left' | 'right';
  /**
   * Opened by default, skips initial enter animation. Still reacts to `open` state changes
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * When set to `true` prevents scrolling on the document body on mount, and restores it on unmount.
   * @default false
   */
  disablePreventScroll?: boolean;
  /**
   * When `true` Vaul will reposition inputs rather than scroll then into view if the keyboard is in the way.
   * Setting it to `false` will fall back to the default browser behavior.
   * @default true when {@link snapPoints} is defined
   */
  repositionInputs?: boolean;
  /**
   * Disabled velocity based swiping for snap points.
   * This means that a snap point won't be skipped even if the velocity is high enough.
   * Useful if each snap point in a drawer is equally important.
   * @default false
   */
  snapToSequentialPoint?: boolean;
  container?: HTMLElement | null;
  /**
   * Gets triggered after the open or close animation ends, it receives an `open` argument with the `open` state of the drawer by the time the function was triggered.
   * Useful to revert any state changes for example.
   */
  onAnimationEnd?: (open: boolean) => void;
  preventScrollRestoration?: boolean;
  autoFocus?: boolean;
} & (WithFadeFromProps | WithoutFadeFromProps);

/** Animate UI's additions to `Drawer.Content`. */
type ContentAnimationProps = {
  /**
   * Opening, moving between snap points and settling back after a drag that
   * doesn't dismiss. Defaults to `transition.drawer` (600ms, drawer curve).
   */
  transition?: Transition;
  /**
   * Closing, a drag dismissal included (it continues from where the finger
   * let go). Defaults to `transition.drawerExit` (400ms, drawer curve).
   */
  exitTransition?: Transition;
};

/** Animate UI's additions to `Drawer.Overlay`. */
type OverlayAnimationProps = {
  /** Fade in. Defaults to `transition.drawer` (600ms, drawer curve). */
  transition?: Transition;
  /** Fade out. Defaults to `transition.drawerExit` (400ms, drawer curve). */
  exitTransition?: Transition;
};

type ContentProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> &
  ContentAnimationProps;
type OverlayProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Overlay
> &
  OverlayAnimationProps;
type PortalProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Portal
>;
type HandleProps = React.ComponentPropsWithoutRef<'div'> & {
  preventCycle?: boolean;
};

type Geometry = {
  /** The drawer's size along its axis. */
  size: number;
  /** Distance at which it's off screen (its size plus any gap to the edge). */
  closed: number;
};

type DrawerContextValue = {
  direction: Direction;
  isOpen: boolean;
  modal: boolean;
  dismissible: boolean;
  handleOnly: boolean;
  container: HTMLElement | null | undefined;
  autoFocus: boolean;
  closeThreshold: number;
  scrollLockTimeout: number;
  snapToSequentialPoint: boolean;
  shouldScaleBackground: boolean;
  setBackgroundColorOnScale: boolean;
  noBodyStyles: boolean;
  repositionInputs: boolean;
  fixed: boolean | undefined;
  /** False for the first frame of a `defaultOpen` drawer. */
  shouldAnimate: boolean;
  snapPoints: SnapPoint[] | undefined;
  /** The distance of each snap point. */
  snapDistances: number[];
  activeSnapPoint: SnapPoint | null | undefined;
  activeSnapPointIndex: number | null;
  setActiveSnapPoint: (snapPoint: SnapPoint | null) => void;
  shouldFade: boolean;
  position: MotionValue<number>;
  /** 0 → 1 while a nested drawer is open: this one steps back. */
  nestedShift: MotionValue<number>;
  getGeometry: () => Geometry;
  setGeometry: (geometry: Geometry) => void;
  overlayProgress: (position: number) => number;
  backgroundProgress: (position: number) => number;
  closeDrawer: () => void;
  onDrag: (
    event: React.PointerEvent<HTMLDivElement>,
    percentageDragged: number,
  ) => void;
  onRelease: (event: React.PointerEvent<HTMLDivElement>, open: boolean) => void;
  onAnimationEnd: (open: boolean) => void;
  onNestedOpenChange: (open: boolean) => void;
  onNestedDrag: (percentageDragged: number) => void;
  onNestedRelease: (open: boolean) => void;
};

const DrawerContext = React.createContext<DrawerContextValue | null>(null);

function useDrawerContext() {
  const context = React.use(DrawerContext);
  if (!context)
    throw new Error('useDrawerContext must be used within a Drawer.Root');
  return context;
}

// Set inside our Portal: presence is handled there.
const PortalContext = React.createContext<{ forceMount: boolean } | null>(null);

const isVertical = (direction: Direction) =>
  direction === 'top' || direction === 'bottom';

/** +1 when the closed edge is towards positive coordinates. */
const closedSign = (direction: Direction) =>
  direction === 'bottom' || direction === 'right' ? 1 : -1;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Resistance past a limit: follows at half speed, then saturates. */
function rubberBand(overshoot: number) {
  const pulled = RUBBER_BAND_FACTOR * overshoot;
  return (pulled * RUBBER_BAND_LIMIT) / (RUBBER_BAND_LIMIT + pulled);
}

function useLatest<T>(value: T) {
  const ref = React.useRef(value);
  React.useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') ref(node);
  else if (ref) (ref as React.RefObject<T | null>).current = node;
}

// Vaul's stylesheet, minus its keyframes and transitions (Motion animates):
// touch handling, the background bleed past the open edge (seen while the
// drawer is pulled beyond it) and the Handle's default look. Zero
// specificity, hoisted once by React.
const STYLE_HREF = 'animate-ui-radix-ui-drawer';
const STYLESHEET = `
:where([data-vaul-drawer]) { touch-action: none; }
@media (hover: hover) and (pointer: fine) { :where([data-vaul-drawer]) { user-select: none; } }
:where([data-vaul-drawer]:not([data-vaul-custom-container="true"]))::after { content: ''; position: absolute; background: inherit; background-color: inherit; }
:where([data-vaul-drawer][data-vaul-drawer-direction="top"])::after { top: initial; bottom: 100%; left: 0; right: 0; height: 200%; }
:where([data-vaul-drawer][data-vaul-drawer-direction="bottom"])::after { top: 100%; bottom: initial; left: 0; right: 0; height: 200%; }
:where([data-vaul-drawer][data-vaul-drawer-direction="left"])::after { left: initial; right: 100%; top: 0; bottom: 0; width: 200%; }
:where([data-vaul-drawer][data-vaul-drawer-direction="right"])::after { left: 100%; right: initial; top: 0; bottom: 0; width: 200%; }
:where([data-vaul-handle]) { display: block; position: relative; opacity: 0.7; background: #e2e2e4; margin-left: auto; margin-right: auto; height: 5px; width: 32px; border-radius: 1rem; touch-action: pan-y; }
:where([data-vaul-handle]:hover, [data-vaul-handle]:active) { opacity: 1; }
:where([data-vaul-handle-hitarea]) { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: max(100%, 2.75rem); height: max(100%, 2.75rem); touch-action: inherit; }
`;

function DrawerStyle() {
  return (
    <style href={STYLE_HREF} precedence="animate-ui">
      {STYLESHEET}
    </style>
  );
}

/* ------------------------------------------------------------------------ */
/* Root                                                                     */
/* ------------------------------------------------------------------------ */

function Root(props: DialogProps): React.JSX.Element {
  return (
    <ReducedMotionConfig>
      <DrawerRoot {...props} />
    </ReducedMotionConfig>
  );
}

function DrawerRoot({
  open: openProp,
  onOpenChange,
  children,
  onDrag: onDragProp,
  onRelease: onReleaseProp,
  snapPoints,
  shouldScaleBackground = false,
  setBackgroundColorOnScale = true,
  closeThreshold = CLOSE_THRESHOLD,
  scrollLockTimeout = SCROLL_LOCK_TIMEOUT,
  dismissible = true,
  handleOnly = false,
  fadeFromIndex = snapPoints && snapPoints.length - 1,
  activeSnapPoint: activeSnapPointProp,
  setActiveSnapPoint: setActiveSnapPointProp,
  fixed,
  modal = true,
  onClose,
  nested,
  noBodyStyles = false,
  direction = 'bottom',
  defaultOpen = false,
  snapToSequentialPoint = false,
  repositionInputs = true,
  onAnimationEnd,
  container,
  autoFocus = false,
}: DialogProps) {
  const tokens = useMotionTokens();
  const reduce = useShouldReduceMotion();
  // The drawer this one is nested in, if any.
  const parent = React.use(DrawerContext);

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isOpen = openProp ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setUncontrolledOpen(next);
    if (next !== isOpen) onOpenChange?.(next);
  };

  const [uncontrolledSnapPoint, setUncontrolledSnapPoint] = React.useState<
    SnapPoint | null | undefined
  >(snapPoints?.[0]);
  const activeSnapPoint =
    activeSnapPointProp !== undefined
      ? activeSnapPointProp
      : uncontrolledSnapPoint;
  const setActiveSnapPoint = (next: SnapPoint | null) => {
    if (activeSnapPointProp === undefined) setUncontrolledSnapPoint(next);
    if (next !== activeSnapPoint) setActiveSnapPointProp?.(next);
  };
  const foundIndex = snapPoints
    ? snapPoints.findIndex((point) => point === activeSnapPoint)
    : -1;
  const activeSnapPointIndex = foundIndex >= 0 ? foundIndex : null;
  const shouldFade =
    !snapPoints ||
    (snapPoints.length > 0 &&
      fadeFromIndex !== undefined &&
      !Number.isNaN(fadeFromIndex) &&
      snapPoints[fadeFromIndex] === activeSnapPoint);

  // Snap points are measured against the container (or the window).
  const [viewport, setViewport] = React.useState(() =>
    typeof window === 'undefined'
      ? null
      : { width: window.innerWidth, height: window.innerHeight },
  );
  React.useEffect(() => {
    const onResize = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const vertical = isVertical(direction);
  const snapDistances = React.useMemo(() => {
    if (!snapPoints || !viewport) return [];
    const rect = container?.getBoundingClientRect();
    const total = vertical
      ? (rect?.height ?? viewport.height)
      : (rect?.width ?? viewport.width);
    return snapPoints.map(
      (point) =>
        total -
        (typeof point === 'string' ? parseInt(point, 10) : point * total),
    );
  }, [snapPoints, viewport, container, vertical]);

  // Skips the entrance of a `defaultOpen` drawer.
  const [shouldAnimate, setShouldAnimate] = React.useState(!defaultOpen);
  React.useEffect(() => {
    if (shouldAnimate) return;
    const id = requestAnimationFrame(() => setShouldAnimate(true));
    return () => cancelAnimationFrame(id);
  }, [shouldAnimate]);

  const position = useMotionValue(0);
  const nestedShift = useMotionValue(0);

  const geometryRef = React.useRef<Geometry>({ size: 0, closed: 0 });
  const getGeometry = React.useCallback(() => geometryRef.current, []);
  const setGeometry = React.useCallback((next: Geometry) => {
    geometryRef.current = next;
  }, []);

  // Read by the motion value callbacks, which can't wait for a render.
  const snappingRef = useLatest({ distances: snapDistances, fadeFromIndex });
  const sign = closedSign(direction);

  /** Overlay opacity at a position: 1 open, 0 closed, Vaul's `fadeFromIndex`. */
  const overlayProgress = React.useCallback(
    (value: number) => {
      const distance = value * sign;
      const { distances, fadeFromIndex: fadeIndex } = snappingRef.current;
      const { closed } = geometryRef.current;
      if (distances.length === 0)
        return closed > 0 ? clamp01(1 - distance / closed) : 1;
      const fade = Math.min(
        Math.max(fadeIndex ?? distances.length - 1, 0),
        distances.length - 1,
      );
      const to = distances[fade]!;
      const from = fade > 0 ? distances[fade - 1]! : closed;
      if (from <= to) return distance <= to ? 1 : 0;
      return clamp01((from - distance) / (from - to));
    },
    [sign, snappingRef],
  );

  /** How much the background is scaled: 1 from the first snap point up. */
  const backgroundProgress = React.useCallback(
    (value: number) => {
      const distance = value * sign;
      const first = snappingRef.current.distances[0] ?? 0;
      const { closed } = geometryRef.current;
      return closed > first
        ? clamp01((closed - distance) / (closed - first))
        : 1;
    },
    [sign, snappingRef],
  );

  const resetTimerRef = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(resetTimerRef.current), []);

  const closeDrawer = (fromWithin?: boolean) => {
    onClose?.();
    if (!fromWithin) setOpen(false);
    // Back to the first snap point once it's gone.
    window.clearTimeout(resetTimerRef.current);
    if (snapPoints) {
      resetTimerRef.current = window.setTimeout(
        () => setActiveSnapPoint(snapPoints[0] ?? null),
        tokens.duration.drawerExit * 1000,
      );
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!dismissible && !open) return;
    if (!open) closeDrawer(true);
    setOpen(open);
  };

  // As a parent: step back while a nested drawer is open.
  const moveShift = (to: number, transition: Transition) => {
    if (reduce) nestedShift.jump(to);
    else animate(nestedShift, to, transition);
  };
  const onNestedOpenChange = (open: boolean) =>
    moveShift(
      open ? 1 : 0,
      open ? tokens.transition.drawer : tokens.transition.drawerExit,
    );
  const onNestedDrag = (percentageDragged: number) => {
    if (percentageDragged < 0) return;
    nestedShift.stop();
    nestedShift.set(1 - clamp01(percentageDragged));
  };
  const onNestedRelease = (open: boolean) => {
    if (open) moveShift(1, tokens.transition.drawer);
  };

  // As a nested drawer: tell the parent.
  const notifiedOpenRef = React.useRef<boolean | null>(null);
  React.useEffect(() => {
    if (!nested || !parent) return;
    const previous = notifiedOpenRef.current;
    notifiedOpenRef.current = isOpen;
    if (previous === isOpen || (previous === null && !isOpen)) return;
    parent.onNestedOpenChange(isOpen);
  }, [nested, parent, isOpen]);

  const context: DrawerContextValue = {
    direction,
    isOpen,
    modal,
    dismissible,
    handleOnly,
    container,
    autoFocus,
    closeThreshold,
    scrollLockTimeout,
    snapToSequentialPoint,
    shouldScaleBackground,
    setBackgroundColorOnScale,
    noBodyStyles,
    repositionInputs,
    fixed,
    shouldAnimate,
    snapPoints,
    snapDistances,
    activeSnapPoint,
    activeSnapPointIndex,
    setActiveSnapPoint,
    shouldFade,
    position,
    nestedShift,
    getGeometry,
    setGeometry,
    overlayProgress,
    backgroundProgress,
    closeDrawer: () => closeDrawer(),
    onDrag: (event, percentageDragged) => {
      onDragProp?.(event, percentageDragged);
      if (nested && parent) parent.onNestedDrag(percentageDragged);
    },
    onRelease: (event, open) => {
      onReleaseProp?.(event, open);
      if (nested && parent) parent.onNestedRelease(open);
    },
    onAnimationEnd: (open) => onAnimationEnd?.(open),
    onNestedOpenChange,
    onNestedDrag,
    onNestedRelease,
  };

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={handleOpenChange}
      modal={modal}
    >
      <DrawerContext value={context}>{children}</DrawerContext>
    </DialogPrimitive.Root>
  );
}

function NestedRoot({
  onDrag,
  onOpenChange,
  open: nestedIsOpen,
  ...rest
}: DialogProps): React.JSX.Element {
  const parent = React.use(DrawerContext);
  if (!parent)
    throw new Error('Drawer.NestedRoot must be placed in another drawer');
  return (
    <Root
      {...(rest as DialogProps)}
      nested
      open={nestedIsOpen}
      onDrag={onDrag}
      onOpenChange={onOpenChange}
    />
  );
}

/* ------------------------------------------------------------------------ */
/* Portal                                                                   */
/* ------------------------------------------------------------------------ */

function Portal(props: PortalProps): React.JSX.Element {
  const context = useDrawerContext();
  const {
    container = context.container,
    forceMount,
    children,
    ...portalProps
  } = props;

  return (
    <AnimatePresence>
      {(context.isOpen || forceMount) && (
        // Radix's Overlay and Content inherit `forceMount` from the Portal.
        <DialogPrimitive.Portal
          key="portal"
          {...portalProps}
          container={container}
          forceMount
        >
          <PortalContext value={{ forceMount: Boolean(forceMount) }}>
            <ReducedMotionConfig>{children}</ReducedMotionConfig>
          </PortalContext>
        </DialogPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------------ */
/* Overlay                                                                  */
/* ------------------------------------------------------------------------ */

const Overlay: React.FC<OverlayProps & React.RefAttributes<HTMLDivElement>> = (
  props,
) => {
  const context = useDrawerContext();
  const portal = React.use(PortalContext);
  const keepMounted = Boolean(props.forceMount ?? portal?.forceMount);
  // Vaul: a non-modal drawer has no overlay.
  if (!context.modal) return null;

  const body = <OverlayMotion {...props} keepMounted={keepMounted} />;
  if (portal) return body;
  return (
    <AnimatePresence>
      {(context.isOpen || keepMounted) && (
        <ReducedMotionConfig key="overlay">{body}</ReducedMotionConfig>
      )}
    </AnimatePresence>
  );
};

function OverlayMotion({
  keepMounted,
  asChild,
  transition,
  exitTransition,
  style,
  children,
  ...props
}: OverlayProps &
  React.RefAttributes<HTMLDivElement> & { keepMounted: boolean }) {
  const context = useDrawerContext();
  const tokens = useMotionTokens();
  const [isPresent, safeToRemove] = usePresence();
  const visible = context.isOpen && isPresent;
  const hasSnapPoints = Boolean(context.snapPoints?.length);

  // Its own fade, capped by the drawer's position: it follows the drag.
  const presence = useMotionValue(0);
  const opacity = useTransform(
    [presence, context.position],
    ([fade, value]: number[]) =>
      Math.min(fade!, context.overlayProgress(value!)),
  );

  const [settled, setSettled] = React.useState(!visible);
  if (visible && settled) setSettled(false);

  const liveRef = useLatest({
    tokens,
    transition,
    exitTransition,
    isPresent,
    safeToRemove,
    shouldAnimate: context.shouldAnimate,
  });
  const firstRef = React.useRef(true);
  const generationRef = React.useRef(0);

  React.useLayoutEffect(() => {
    const { tokens, transition, exitTransition, shouldAnimate } =
      liveRef.current;
    const id = ++generationRef.current;
    const isFirst = firstRef.current;
    firstRef.current = false;

    if (visible) {
      if (isFirst && !shouldAnimate) presence.jump(1);
      else animate(presence, 1, transition ?? tokens.transition.drawer);
      return;
    }
    if (isFirst) return;
    animate(presence, 0, exitTransition ?? tokens.transition.drawerExit).then(
      () => {
        if (generationRef.current !== id) return;
        if (!liveRef.current.isPresent) liveRef.current.safeToRemove?.();
        else setSettled(true);
      },
    );
  }, [visible, presence, liveRef]);

  return (
    <DialogPrimitive.Overlay
      data-vaul-overlay=""
      data-vaul-snap-points={context.isOpen && hasSnapPoints ? 'true' : 'false'}
      data-vaul-snap-points-overlay={
        context.isOpen && context.shouldFade ? 'true' : 'false'
      }
      data-vaul-animate={context.shouldAnimate ? 'true' : 'false'}
      {...props}
      forceMount
      asChild
    >
      {motionChild(asChild, children, {
        // Once closed (exiting, or kept mounted), clicks go through to the
        // page: Radix sets `pointer-events: auto` on the overlay.
        style: closedStyle(
          { ...style, opacity },
          visible,
          keepMounted && !visible && settled,
        ),
      })}
    </DialogPrimitive.Overlay>
  );
}

/* ------------------------------------------------------------------------ */
/* Content                                                                  */
/* ------------------------------------------------------------------------ */

const Content: React.FC<ContentProps & React.RefAttributes<HTMLDivElement>> = (
  props,
) => {
  const context = useDrawerContext();
  const portal = React.use(PortalContext);
  const keepMounted = Boolean(props.forceMount ?? portal?.forceMount);

  const body = <ContentMotion {...props} keepMounted={keepMounted} />;
  if (portal) return body;
  // Rendered without a Portal (Radix allows it): it gates itself.
  return (
    <AnimatePresence>
      {(context.isOpen || keepMounted) && (
        <ReducedMotionConfig key="content">{body}</ReducedMotionConfig>
      )}
    </AnimatePresence>
  );
};

type Press = {
  id: number;
  x: number;
  y: number;
  dragging: boolean;
  /** Distance when the drag started. */
  start: number;
  samples: { time: number; distance: number }[];
};

function ContentMotion({
  keepMounted,
  asChild,
  transition,
  exitTransition,
  children,
  style,
  ref,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  onOpenAutoFocus,
  onPointerDownOutside,
  onFocusOutside,
  ...props
}: ContentProps &
  React.RefAttributes<HTMLDivElement> & { keepMounted: boolean }) {
  const context = useDrawerContext();
  const tokens = useMotionTokens();
  const reduce = useShouldReduceMotion();
  const [isPresent, safeToRemove] = usePresence();
  const visible = context.isOpen && isPresent;

  const { direction, position, nestedShift } = context;
  const vertical = isVertical(direction);
  const sign = closedSign(direction);
  const hasSnapPoints = Boolean(context.snapPoints?.length);
  const restDistance = hasSnapPoints
    ? (context.snapDistances[context.activeSnapPointIndex ?? 0] ?? 0)
    : 0;

  const enter = transition ?? tokens.transition.drawer;
  const exit = exitTransition ?? tokens.transition.drawerExit;
  const instant = tokens.transition.instant;
  // Under reduced motion it fades in place, and settles without moving.
  const settle = reduce ? instant : enter;

  const elementRef = React.useRef<HTMLDivElement | null>(null);
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      elementRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );

  const opacity = useMotionValue(1);
  // Updated synchronously (not on the next frame like `useTransform`): the
  // first frame must already show the drawer off screen.
  const transform = useMotionValue(
    toTransform(direction, position.get(), nestedShift.get()),
  );
  React.useLayoutEffect(() => {
    const update = () =>
      transform.set(toTransform(direction, position.get(), nestedShift.get()));
    update();
    const offPosition = position.on('change', update);
    const offShift = nestedShift.on('change', update);
    return () => {
      offPosition();
      offShift();
    };
  }, [direction, position, nestedShift, transform]);

  const [settled, setSettled] = React.useState(!visible);
  if (visible && settled) setSettled(false);

  const [delayedSnapPoints, setDelayedSnapPoints] = React.useState(false);
  React.useEffect(() => {
    if (!hasSnapPoints) return;
    const id = requestAnimationFrame(() => setDelayedSnapPoints(true));
    return () => cancelAnimationFrame(id);
  }, [hasSnapPoints]);

  const liveRef = useLatest({
    context,
    reduce,
    enter,
    exit,
    instant,
    restDistance,
    isPresent,
    safeToRemove,
    sign,
    vertical,
  });

  const measure = React.useCallback(() => {
    const node = elementRef.current;
    if (!node) return;
    const { context, vertical } = liveRef.current;
    const size = vertical ? node.offsetHeight : node.offsetWidth;
    const rect = node.getBoundingClientRect();
    const current = getComputedStyle(node).transform;
    const matrix =
      current && current !== 'none' ? new DOMMatrix(current) : new DOMMatrix();
    const top = rect.top - matrix.m42;
    const left = rect.left - matrix.m41;
    const bounds = context.container
      ? context.container.getBoundingClientRect()
      : new DOMRect(0, 0, window.innerWidth, window.innerHeight);
    const gap = {
      bottom: bounds.bottom - (top + size),
      top: top - bounds.top,
      right: bounds.right - (left + size),
      left: left - bounds.left,
    }[context.direction];
    context.setGeometry({ size, closed: size + Math.max(0, gap) });
  }, [liveRef]);

  // Every animation of the position goes through here: the latest one wins.
  const generationRef = React.useRef(0);
  const targetRef = React.useRef<number | null>(null);
  const moveTo = React.useCallback(
    (distance: number, how: Transition, fade?: [number, Transition]) => {
      const id = ++generationRef.current;
      targetRef.current = distance;
      const runs = [
        animate(position, liveRef.current.sign * distance, how).then(() => {}),
      ];
      if (fade) runs.push(animate(opacity, fade[0], fade[1]).then(() => {}));
      return Promise.all(runs).then(() => generationRef.current === id);
    },
    [position, opacity, liveRef],
  );

  // Open and close.
  const firstRef = React.useRef(true);
  React.useLayoutEffect(() => {
    const { context, reduce, enter, exit, instant, restDistance, sign } =
      liveRef.current;
    const isFirst = firstRef.current;
    firstRef.current = false;
    measure();
    const { closed } = context.getGeometry();

    if (visible) {
      if (isFirst) {
        if (!context.shouldAnimate) {
          // `defaultOpen`: already there.
          position.jump(sign * restDistance);
          opacity.jump(1);
          targetRef.current = restDistance;
          return;
        }
        position.jump(sign * (reduce ? restDistance : closed));
        opacity.jump(reduce ? 0 : 1);
        // Before the first paint: Motion writes the style on its next frame.
        const node = elementRef.current;
        if (node) {
          node.style.transform = toTransform(
            context.direction,
            position.get(),
            context.nestedShift.get(),
          );
          node.style.opacity = String(opacity.get());
        }
      }
      moveTo(restDistance, reduce ? instant : enter, [
        1,
        reduce ? enter : instant,
      ]).then((done) => {
        if (done) liveRef.current.context.onAnimationEnd(true);
      });
      return;
    }

    if (isFirst) {
      // Mounted closed (`forceMount`).
      position.jump(sign * closed);
      opacity.jump(reduce ? 0 : 1);
      targetRef.current = closed;
      return;
    }
    // From wherever it is: a drag dismissal continues from the release.
    const from = position.get() * sign;
    moveTo(reduce ? from : closed, reduce ? instant : exit, [
      reduce ? 0 : 1,
      reduce ? exit : instant,
    ]).then((done) => {
      if (!done) return;
      const { context, isPresent, safeToRemove } = liveRef.current;
      context.onAnimationEnd(false);
      if (!isPresent) safeToRemove?.();
      else setSettled(true);
    });
  }, [visible, liveRef, measure, moveTo, position, opacity]);

  // A new snap point (dragged, cycled with the Handle, controlled, resized).
  const pressRef = React.useRef<Press | null>(null);
  React.useEffect(() => {
    if (!visible || pressRef.current?.dragging) return;
    if (targetRef.current === restDistance) return;
    moveTo(
      restDistance,
      liveRef.current.reduce ? instant : liveRef.current.enter,
    );
  }, [visible, restDistance, moveTo, liveRef, instant]);

  // Size changes, scroll timestamps, and touch scrolling while dragging.
  const lastScrollRef = React.useRef(0);
  React.useEffect(() => {
    const node = elementRef.current;
    if (!node) return;
    const resize = new ResizeObserver(() => measure());
    resize.observe(node);
    const onScroll = () => {
      lastScrollRef.current = performance.now();
    };
    // Once the drawer follows the finger, the page must not scroll too.
    const onTouchMove = (event: TouchEvent) => {
      if (pressRef.current?.dragging && event.cancelable)
        event.preventDefault();
    };
    node.addEventListener('scroll', onScroll, { capture: true, passive: true });
    node.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      resize.disconnect();
      node.removeEventListener('scroll', onScroll, { capture: true });
      node.removeEventListener('touchmove', onTouchMove);
    };
  }, [measure]);

  // `shouldScaleBackground`: the wrapper follows the drawer's position.
  const {
    shouldScaleBackground,
    setBackgroundColorOnScale,
    noBodyStyles,
    backgroundProgress,
  } = context;
  React.useEffect(() => {
    if (!shouldScaleBackground) return;
    const wrapper =
      document.querySelector<HTMLElement>('[data-vaul-drawer-wrapper]') ??
      document.querySelector<HTMLElement>('[vaul-drawer-wrapper]');
    if (!wrapper) return;
    const body = document.body;
    const previous = {
      transform: wrapper.style.transform,
      transformOrigin: wrapper.style.transformOrigin,
      borderRadius: wrapper.style.borderRadius,
      overflow: wrapper.style.overflow,
      background: body.style.background,
    };
    const paintBody = setBackgroundColorOnScale && !noBodyStyles;
    if (paintBody) body.style.background = 'black';
    wrapper.style.transformOrigin = vertical ? 'top' : 'left';

    const apply = (value: number) => {
      const progress = backgroundProgress(value);
      if (progress <= 0) {
        wrapper.style.transform = previous.transform;
        wrapper.style.borderRadius = previous.borderRadius;
        wrapper.style.overflow = previous.overflow;
        return;
      }
      const scale = 1 - (progress * WINDOW_TOP_OFFSET) / window.innerWidth;
      const shift = `calc(${progress} * (env(safe-area-inset-top) + 14px))`;
      wrapper.style.transform = vertical
        ? `scale(${scale}) translate3d(0, ${shift}, 0)`
        : `scale(${scale}) translate3d(${shift}, 0, 0)`;
      wrapper.style.borderRadius = `${BORDER_RADIUS * progress}px`;
      wrapper.style.overflow = 'hidden';
    };
    apply(position.get());
    const unsubscribe = position.on('change', apply);
    return () => {
      unsubscribe();
      Object.assign(wrapper.style, {
        transform: previous.transform,
        transformOrigin: previous.transformOrigin,
        borderRadius: previous.borderRadius,
        overflow: previous.overflow,
      });
      if (paintBody) body.style.background = previous.background;
    };
  }, [
    shouldScaleBackground,
    setBackgroundColorOnScale,
    noBodyStyles,
    backgroundProgress,
    position,
    vertical,
  ]);

  // `repositionInputs`: a bottom drawer stays above the on-screen keyboard.
  const keyboardOpenRef = React.useRef(false);
  const { repositionInputs, fixed } = context;
  React.useEffect(() => {
    const visualViewport = window.visualViewport;
    if (!visualViewport || !repositionInputs || direction !== 'bottom') return;
    let initialHeight = 0;
    let previousDiff = 0;
    const onResize = () => {
      const node = elementRef.current;
      if (!node) return;
      if (!isTextInput(document.activeElement) && !keyboardOpenRef.current)
        return;
      const visualHeight = visualViewport.height;
      const totalHeight = window.innerHeight;
      let diff = totalHeight - visualHeight;
      const rect = node.getBoundingClientRect();
      const tallEnough = rect.height > totalHeight * 0.8;
      if (!initialHeight) initialHeight = rect.height;
      if (Math.abs(previousDiff - diff) > 60)
        keyboardOpenRef.current = !keyboardOpenRef.current;
      if (hasSnapPoints) diff += liveRef.current.restDistance;
      previousDiff = diff;
      if (rect.height > visualHeight || keyboardOpenRef.current) {
        const height =
          rect.height > visualHeight
            ? visualHeight - (tallEnough ? rect.top : WINDOW_TOP_OFFSET)
            : rect.height;
        node.style.height = fixed
          ? `${rect.height - Math.max(diff, 0)}px`
          : `${Math.max(height, visualHeight - rect.top)}px`;
      } else {
        node.style.height = `${initialHeight}px`;
      }
      node.style.bottom =
        hasSnapPoints && !keyboardOpenRef.current
          ? '0px'
          : `${Math.max(diff, 0)}px`;
    };
    visualViewport.addEventListener('resize', onResize);
    return () => visualViewport.removeEventListener('resize', onResize);
  }, [repositionInputs, fixed, direction, hasSnapPoints, liveRef]);

  /* Dragging ------------------------------------------------------------- */

  /** Whether a gesture moving `along` px on the axis should move the drawer. */
  const shouldDrag = (target: Element, along: number) => {
    const node = elementRef.current;
    if (!node) return false;
    if (target.closest('select, [data-vaul-no-drag]')) return false;
    if (window.getSelection()?.toString()) return false;
    // Partly closed (a lower snap point, or mid-animation): it moves first.
    const distance = position.get() * sign;
    const mostOpen = hasSnapPoints ? (context.snapDistances.at(-1) ?? 0) : 0;
    if (distance > mostOpen + 1) return true;
    if (performance.now() - lastScrollRef.current < context.scrollLockTimeout)
      return false;
    // Content that can scroll that way scrolls instead.
    for (let el: Element | null = target; el; el = el.parentElement) {
      if (canScroll(el, vertical, along)) return false;
      if (el === node) break;
    }
    return true;
  };

  const startDrag = (current: Press) => {
    generationRef.current++;
    position.stop();
    current.dragging = true;
    current.start = position.get() * sign;
    elementRef.current!.classList.add(DRAG_CLASS);
  };

  const dragTo = (
    current: Press,
    along: number,
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const distances = context.snapDistances;
    let distance = current.start + along * sign;
    // Past the most open position: rubber band.
    const mostOpen = hasSnapPoints ? (distances.at(-1) ?? 0) : 0;
    if (distance < mostOpen)
      distance = mostOpen - rubberBand(mostOpen - distance);
    // Not dismissible: it resists past the least open position too.
    if (!context.dismissible) {
      const leastOpen = hasSnapPoints ? (distances[0] ?? 0) : 0;
      if (distance > leastOpen)
        distance = leastOpen + rubberBand(distance - leastOpen);
    }
    position.set(sign * distance);
    current.samples.push({ time: event.timeStamp, distance });
    if (current.samples.length > 20) current.samples.shift();

    const { closed } = context.getGeometry();
    const span = closed - restDistance;
    context.onDrag(
      event,
      span > 0 ? clamp01((distance - restDistance) / span) : 0,
    );
  };

  /** Close; a controlled drawer whose owner keeps it open settles back. */
  const requestClose = () => {
    context.closeDrawer();
    window.setTimeout(() => {
      const { context, restDistance, reduce, instant, enter } = liveRef.current;
      if (context.isOpen && !pressRef.current?.dragging)
        moveTo(restDistance, reduce ? instant : enter);
    }, 0);
    return false;
  };

  const releaseFree = (distance: number, velocity: number) => {
    const { size } = context.getGeometry();
    const visibleSize = Math.min(
      size,
      vertical ? window.innerHeight : window.innerWidth,
    );
    const dismiss =
      context.dismissible &&
      distance > 0 &&
      velocity > -VELOCITY_THRESHOLD &&
      (velocity > VELOCITY_THRESHOLD ||
        distance >= visibleSize * context.closeThreshold);
    if (dismiss) return requestClose();
    moveTo(0, settle);
    return true;
  };

  const releaseToSnapPoint = (
    distance: number,
    start: number,
    velocity: number,
  ) => {
    const distances = context.snapDistances;
    const points = context.snapPoints!;
    const last = distances.length - 1;
    const index = context.activeSnapPointIndex ?? 0;
    const { closed } = context.getGeometry();
    const snapTo = (next: number) => {
      const clamped = Math.min(Math.max(next, 0), last);
      moveTo(distances[clamped]!, settle);
      context.setActiveSnapPoint(points[clamped]!);
      return true;
    };
    const speed = Math.abs(velocity);
    const dragged = start - distance;
    const towardsOpen = speed > VELOCITY_THRESHOLD ? velocity < 0 : dragged > 0;

    if (!context.snapToSequentialPoint && speed > SNAP_SKIP_VELOCITY) {
      if (towardsOpen) return snapTo(last);
      return context.dismissible ? requestClose() : snapTo(0);
    }
    // Pulled well below the first snap point.
    const firstDistance = distances[0]!;
    if (
      context.dismissible &&
      distance >
        firstDistance + (closed - firstDistance) * context.closeThreshold
    )
      return requestClose();
    const dimension = vertical ? window.innerHeight : window.innerWidth;
    if (speed > VELOCITY_THRESHOLD && Math.abs(dragged) < dimension * 0.4) {
      if (towardsOpen) return snapTo(index + 1);
      if (index === 0) return context.dismissible ? requestClose() : snapTo(0);
      return snapTo(index - 1);
    }
    let closest = 0;
    distances.forEach((value, i) => {
      if (Math.abs(value - distance) < Math.abs(distances[closest]! - distance))
        closest = i;
    });
    return snapTo(closest);
  };

  const release = (
    event: React.PointerEvent<HTMLDivElement>,
    cancelled: boolean,
  ) => {
    const current = pressRef.current;
    pressRef.current = null;
    if (!current?.dragging) return;
    elementRef.current?.classList.remove(DRAG_CLASS);
    const captured = event.target as Element;
    if (captured.hasPointerCapture?.(event.pointerId))
      captured.releasePointerCapture(event.pointerId);
    suppressNextClick();

    const distance = position.get() * sign;
    const velocity = cancelled
      ? 0
      : releaseVelocity(current.samples, event.timeStamp);
    const open = hasSnapPoints
      ? releaseToSnapPoint(distance, current.start, velocity)
      : releaseFree(distance, velocity);
    context.onRelease(event, open);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const target = event.target as Element;
    const node = elementRef.current;
    // Events from portals rendered inside the content don't drag it.
    if (!node || !node.contains(target)) return;
    if (context.handleOnly && !target.closest('[data-vaul-handle]')) return;
    // Like Vaul: the pointer stays with what it pressed (clicks still work)
    // even when the drag leaves the drawer.
    try {
      target.setPointerCapture(event.pointerId);
    } catch {
      // The pointer is already gone.
    }
    pressRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      dragging: false,
      start: 0,
      samples: [],
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    const current = pressRef.current;
    if (!current || current.id !== event.pointerId) return;
    const along = vertical
      ? event.clientY - current.y
      : event.clientX - current.x;
    if (!current.dragging) {
      const across = vertical
        ? event.clientX - current.x
        : event.clientY - current.y;
      const threshold = event.pointerType === 'touch' ? 10 : 2;
      if (Math.abs(along) <= threshold && Math.abs(across) <= threshold) return;
      if (
        Math.abs(across) > Math.abs(along) ||
        !shouldDrag(event.target as Element, along)
      ) {
        pressRef.current = null;
        return;
      }
      startDrag(current);
    }
    dragTo(current, along, event);
  };

  const hidden = keepMounted && !visible && settled;
  const snapStyle = hasSnapPoints
    ? ({
        '--snap-point-height': `${sign * restDistance}px`,
      } as React.CSSProperties)
    : undefined;

  return (
    <>
      <DrawerStyle />
      <DialogPrimitive.Content
        data-vaul-drawer-direction={direction}
        data-vaul-drawer=""
        data-vaul-delayed-snap-points={delayedSnapPoints ? 'true' : 'false'}
        data-vaul-snap-points={
          context.isOpen && hasSnapPoints ? 'true' : 'false'
        }
        data-vaul-custom-container={context.container ? 'true' : 'false'}
        data-vaul-animate={context.shouldAnimate ? 'true' : 'false'}
        {...props}
        ref={setRef}
        forceMount
        asChild
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => {
          onPointerUp?.(event);
          release(event, false);
        }}
        onPointerCancel={(event) => {
          onPointerCancel?.(event);
          release(event, true);
        }}
        onLostPointerCapture={(event) => {
          onLostPointerCapture?.(event);
          release(event, true);
        }}
        onOpenAutoFocus={(event) => {
          onOpenAutoFocus?.(event);
          if (!context.autoFocus) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          onPointerDownOutside?.(event);
          // Its own Trigger toggles it: pressing it while the closed drawer
          // is kept mounted (`forceMount`) isn't an outside dismissal.
          const pressed = event.target as Element | null;
          const id = elementRef.current?.id;
          if (id && pressed?.closest?.(`[aria-controls="${CSS.escape(id)}"]`))
            event.preventDefault();
          if (!context.modal || event.defaultPrevented) {
            event.preventDefault();
            return;
          }
          keyboardOpenRef.current = false;
        }}
        onFocusOutside={(event) => {
          onFocusOutside?.(event);
          if (!context.modal) event.preventDefault();
        }}
      >
        {motionChild(asChild, children, {
          // A closed Content kept mounted stays out of reach.
          inert: keepMounted && !visible ? true : undefined,
          style: closedStyle(
            { ...snapStyle, ...style, transform, opacity },
            visible,
            hidden,
          ),
        })}
      </DialogPrimitive.Content>
    </>
  );
}

/* ------------------------------------------------------------------------ */
/* Handle                                                                   */
/* ------------------------------------------------------------------------ */

const Handle: React.FC<HandleProps & React.RefAttributes<HTMLDivElement>> = ({
  preventCycle = false,
  children,
  onClick,
  onPointerDown,
  onPointerCancel,
  ...rest
}) => {
  const context = useDrawerContext();
  const longPressRef = React.useRef<number | undefined>(undefined);
  const shouldCancelRef = React.useRef(false);

  const cancelInteraction = () => {
    window.clearTimeout(longPressRef.current);
    shouldCancelRef.current = false;
  };

  // A tap cycles through the snap points, then closes from the last one.
  const cycle = () => {
    if (preventCycle || shouldCancelRef.current) {
      cancelInteraction();
      return;
    }
    cancelInteraction();
    const { snapPoints, activeSnapPoint, dismissible } = context;
    if (!snapPoints || snapPoints.length === 0) return;
    const index = snapPoints.findIndex((point) => point === activeSnapPoint);
    if (index === snapPoints.length - 1) {
      if (dismissible) context.closeDrawer();
      return;
    }
    if (index === -1) return;
    context.setActiveSnapPoint(snapPoints[index + 1]!);
  };

  return (
    <>
      <DrawerStyle />
      <div
        onClick={(event) => {
          onClick?.(event);
          // The second click of a double click.
          if (shouldCancelRef.current) {
            cancelInteraction();
            return;
          }
          window.setTimeout(cycle, DOUBLE_TAP_TIMEOUT);
        }}
        onPointerCancel={(event) => {
          onPointerCancel?.(event);
          cancelInteraction();
        }}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          // A long press isn't a tap. (A press that became a drag never
          // clicks: start afresh.)
          cancelInteraction();
          longPressRef.current = window.setTimeout(() => {
            shouldCancelRef.current = true;
          }, LONG_HANDLE_PRESS_TIMEOUT);
        }}
        data-vaul-drawer-visible={context.isOpen ? 'true' : 'false'}
        data-vaul-handle=""
        aria-hidden="true"
        {...rest}
      >
        <span data-vaul-handle-hitarea="" aria-hidden="true">
          {children}
        </span>
      </div>
    </>
  );
};

/* ------------------------------------------------------------------------ */
/* Helpers                                                                  */
/* ------------------------------------------------------------------------ */

/* eslint-disable @typescript-eslint/no-explicit-any -- motion props of any
   element. */
/**
 * The motion element Radix renders the part onto: a motion.div around the
 * children, or with `asChild`, the user's child made animatable.
 */
function motionChild(
  asChild: boolean | undefined,
  children: React.ReactNode,
  motionProps: Record<string, any>,
) {
  if (asChild && React.isValidElement(children))
    return motionRender(children, motionProps) as React.ReactElement;
  return <motion.div {...motionProps}>{children}</motion.div>;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function closedStyle<T extends object>(
  style: T,
  open: boolean,
  hidden: boolean,
): T {
  if (open) return style;
  return {
    ...style,
    pointerEvents: 'none',
    visibility: hidden ? 'hidden' : undefined,
  };
}

/** The Content's transform: its position, stepped back under a nested drawer. */
function toTransform(direction: Direction, value: number, shift: number) {
  const vertical = isVertical(direction);
  // Smaller and towards the open edge while a nested drawer is open.
  const lift = -NESTED_DISPLACEMENT * shift * closedSign(direction);
  const across =
    typeof window === 'undefined'
      ? 0
      : vertical
        ? window.innerWidth
        : window.innerHeight;
  const scale =
    shift && across ? 1 - (shift * NESTED_DISPLACEMENT) / across : 1;
  const offset = value + lift;
  return vertical
    ? `translate3d(0px, ${offset}px, 0px) scale(${scale})`
    : `translate3d(${offset}px, 0px, 0px) scale(${scale})`;
}

/** Whether `el` can scroll on the axis in the direction a finger moving `along` scrolls it. */
function canScroll(el: Element, vertical: boolean, along: number) {
  const style = getComputedStyle(el);
  const overflow = vertical ? style.overflowY : style.overflowX;
  if (!/auto|scroll|overlay/.test(overflow)) return false;
  if (vertical) {
    if (el.scrollHeight <= el.clientHeight + 1) return false;
    return along > 0
      ? el.scrollTop > 0
      : el.scrollTop + el.clientHeight < el.scrollHeight - 1;
  }
  if (el.scrollWidth <= el.clientWidth + 1) return false;
  const left = Math.abs(el.scrollLeft);
  return along > 0 ? left > 0 : left + el.clientWidth < el.scrollWidth - 1;
}

/** px/ms over the last moments of the gesture, positive towards closing. */
function releaseVelocity(
  samples: { time: number; distance: number }[],
  now: number,
) {
  const to = samples[samples.length - 1];
  // Held still before letting go: no flick.
  if (!to || now - to.time > VELOCITY_WINDOW / 2) return 0;
  const from = samples.find(
    (sample) => to.time - sample.time <= VELOCITY_WINDOW,
  )!;
  return to.time > from.time
    ? (to.distance - from.distance) / (to.time - from.time)
    : 0;
}

/** After a drag, the click that ends it doesn't activate what's under it. */
function suppressNextClick() {
  const stop = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  window.addEventListener('click', stop, { capture: true, once: true });
  window.setTimeout(
    () => window.removeEventListener('click', stop, { capture: true }),
    0,
  );
}

const NON_TEXT_INPUTS = new Set([
  'checkbox',
  'radio',
  'range',
  'color',
  'file',
  'image',
  'button',
  'submit',
  'reset',
]);

function isTextInput(target: Element | null) {
  return (
    (target instanceof HTMLInputElement && !NON_TEXT_INPUTS.has(target.type)) ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

/* ------------------------------------------------------------------------ */
/* Exports                                                                  */
/* ------------------------------------------------------------------------ */

type DrawerParts = {
  Root: typeof Root;
  NestedRoot: typeof NestedRoot;
  Content: typeof Content;
  Overlay: typeof Overlay;
  Trigger: typeof DialogPrimitive.Trigger;
  Portal: typeof Portal;
  Handle: typeof Handle;
  Close: typeof DialogPrimitive.Close;
  Title: typeof DialogPrimitive.Title;
  Description: typeof DialogPrimitive.Description;
};

const Drawer: DrawerParts = {
  Root,
  NestedRoot,
  Content,
  Overlay,
  Trigger: DialogPrimitive.Trigger,
  Portal,
  Handle,
  Close: DialogPrimitive.Close,
  Title: DialogPrimitive.Title,
  Description: DialogPrimitive.Description,
};

export {
  Content,
  Drawer,
  Handle,
  NestedRoot,
  Overlay,
  Portal,
  Root,
  type ContentProps,
  type DialogProps,
  type HandleProps,
  type WithFadeFromProps,
  type WithoutFadeFromProps,
};
