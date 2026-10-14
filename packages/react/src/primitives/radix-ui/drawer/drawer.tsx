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
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import {
  DRAWER_EXIT_TRANSITION,
  DRAWER_TRANSITION,
  motionRender,
  scrubBackdrop,
  scrubShadow,
  toCssTiming,
  useOverlayTransitions,
  type Scrub,
} from '../../../internal/modal-motion';
import { type Part } from '../../../internal/part';

const CLOSE_THRESHOLD = 0.25;
const SCROLL_LOCK_TIMEOUT = 100;
const VELOCITY_THRESHOLD = 0.4;
const SNAP_SKIP_VELOCITY = 2;
const VELOCITY_WINDOW = 100;
const MIN_THROW_VELOCITY = 0.2;
const MAX_THROW_VELOCITY = 4;
const MIN_THROW_DURATION = 80;
const MAX_THROW_DURATION = 360;
const NESTED_DISPLACEMENT = 16;
const WINDOW_TOP_OFFSET = 26;
const BORDER_RADIUS = 8;
const DRAG_CLASS = 'vaul-dragging';
const LONG_HANDLE_PRESS_TIMEOUT = 250;
const DOUBLE_TAP_TIMEOUT = 120;
const RUBBER_BAND_FACTOR = 0.5;
const RUBBER_BAND_LIMIT = 48;
const INSTANT: Transition = { duration: 0 };

type Direction = 'top' | 'bottom' | 'left' | 'right';
type SnapPoint = number | string;

interface WithFadeFromProps {
  snapPoints: (number | string)[];
  fadeFromIndex: number;
}

interface WithoutFadeFromProps {
  snapPoints?: (number | string)[];
  fadeFromIndex?: never;
}

type DialogProps = {
  activeSnapPoint?: number | string | null;
  setActiveSnapPoint?: (snapPoint: number | string | null) => void;
  children?: React.ReactNode;
  open?: boolean;
  closeThreshold?: number;
  noBodyStyles?: boolean;
  onOpenChange?: (open: boolean) => void;
  shouldScaleBackground?: boolean;
  setBackgroundColorOnScale?: boolean;
  scrollLockTimeout?: number;
  fixed?: boolean;
  handleOnly?: boolean;
  dismissible?: boolean;
  onDrag?: (
    event: React.PointerEvent<HTMLDivElement>,
    percentageDragged: number,
  ) => void;
  onRelease?: (
    event: React.PointerEvent<HTMLDivElement>,
    open: boolean,
  ) => void;
  modal?: boolean;
  nested?: boolean;
  onClose?: () => void;
  direction?: 'top' | 'bottom' | 'left' | 'right';
  defaultOpen?: boolean;
  disablePreventScroll?: boolean;
  repositionInputs?: boolean;
  snapToSequentialPoint?: boolean;
  container?: HTMLElement | null;
  onAnimationEnd?: (open: boolean) => void;
  preventScrollRestoration?: boolean;
  autoFocus?: boolean;
} & (WithFadeFromProps | WithoutFadeFromProps);

type ContentAnimationProps = {
  transition?: Transition;
  exitTransition?: Transition;
};

type OverlayAnimationProps = {
  transition?: Transition;
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
  size: number;
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
  shouldAnimate: boolean;
  snapPoints: SnapPoint[] | undefined;
  snapDistances: number[];
  activeSnapPoint: SnapPoint | null | undefined;
  activeSnapPointIndex: number | null;
  setActiveSnapPoint: (snapPoint: SnapPoint | null) => void;
  shouldFade: boolean;
  position: MotionValue<number>;
  dragged: MotionValue<number>;
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

const PortalContext = React.createContext(false);

const isVertical = (direction: Direction) =>
  direction === 'top' || direction === 'bottom';

const closedSign = (direction: Direction) =>
  direction === 'bottom' || direction === 'right' ? 1 : -1;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

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

function onNextFrame(start: () => void) {
  const id = requestAnimationFrame(start);
  return () => cancelAnimationFrame(id);
}

function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') ref(node);
  else if (ref) (ref as React.RefObject<T | null>).current = node;
}

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
  const reduce = useShouldReduceMotion();
  const sheet = useTempoTransition<Transition>(DRAWER_TRANSITION);
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

  const [shouldAnimate, setShouldAnimate] = React.useState(!defaultOpen);
  React.useEffect(() => {
    if (shouldAnimate) return;
    const id = requestAnimationFrame(() => setShouldAnimate(true));
    return () => cancelAnimationFrame(id);
  }, [shouldAnimate]);

  const position = useMotionValue(0);
  const dragged = useMotionValue(0);
  const nestedShift = useMotionValue(0);

  const geometryRef = React.useRef<Geometry>({ size: 0, closed: 0 });
  const getGeometry = React.useCallback(() => geometryRef.current, []);
  const setGeometry = React.useCallback((next: Geometry) => {
    geometryRef.current = next;
  }, []);

  const snappingRef = useLatest({ distances: snapDistances, fadeFromIndex });
  const sign = closedSign(direction);

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
    window.clearTimeout(resetTimerRef.current);
    if (snapPoints) {
      resetTimerRef.current = window.setTimeout(
        () => setActiveSnapPoint(snapPoints[0] ?? null),
        toCssTiming(sheet).duration,
      );
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!dismissible && !open) return;
    if (!open) closeDrawer(true);
    setOpen(open);
  };

  const moveShift = (to: number, transition: Transition) => {
    if (reduce) nestedShift.jump(to);
    else animate(nestedShift, to, transition);
  };
  const onNestedOpenChange = (open: boolean) => moveShift(open ? 1 : 0, sheet);
  const onNestedDrag = (percentageDragged: number) => {
    if (percentageDragged < 0) return;
    nestedShift.stop();
    nestedShift.set(1 - clamp01(percentageDragged));
  };
  const onNestedRelease = (open: boolean) => {
    if (open) moveShift(1, sheet);
  };

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
    dragged,
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

function Portal(props: PortalProps): React.JSX.Element {
  const context = useDrawerContext();
  const {
    container = context.container,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    forceMount,
    children,
    ...portalProps
  } = props;

  return (
    <AnimatePresence>
      {context.isOpen && (
        <DialogPrimitive.Portal
          key="portal"
          {...portalProps}
          container={container}
          forceMount
        >
          <PortalContext value>
            <ReducedMotionConfig>{children}</ReducedMotionConfig>
          </PortalContext>
        </DialogPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

const Overlay: Part<OverlayProps & React.RefAttributes<HTMLDivElement>> = (
  props,
) => {
  const context = useDrawerContext();
  const portal = React.use(PortalContext);
  if (!context.modal) return null;

  const body = <OverlayMotion {...props} />;
  if (portal) return body;
  return (
    <AnimatePresence>
      {context.isOpen && (
        <ReducedMotionConfig key="overlay">{body}</ReducedMotionConfig>
      )}
    </AnimatePresence>
  );
};

function OverlayMotion({
  asChild,
  transition,
  exitTransition,
  style,
  children,
  ref,
  ...props
}: OverlayProps & React.RefAttributes<HTMLDivElement>) {
  const context = useDrawerContext();
  const { enter, exit } = useOverlayTransitions(transition, exitTransition);
  const [isPresent, safeToRemove] = usePresence();
  const visible = context.isOpen && isPresent;
  const hasSnapPoints = Boolean(context.snapPoints?.length);

  const presence = useMotionValue(0);
  const linkedRef = useLatest(hasSnapPoints);
  const level = useTransform(
    [presence, context.position, context.dragged],
    ([fade, value, dragged]: number[]) =>
      linkedRef.current || dragged
        ? Math.min(fade!, context.overlayProgress(value!))
        : fade!,
  );
  const elementRef = React.useRef<HTMLDivElement | null>(null);
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      elementRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );
  const scrubRef = React.useRef<Scrub | null>(null);
  React.useLayoutEffect(() => {
    const node = elementRef.current;
    if (!node || !visible) return;
    scrubRef.current?.stop();
    scrubRef.current = scrubBackdrop(node);
    scrubRef.current.set(level.get());
  }, [visible, level]);
  React.useLayoutEffect(() => {
    const unsubscribe = level.on('change', (value) =>
      scrubRef.current?.set(value),
    );
    return () => {
      unsubscribe();
      scrubRef.current?.stop();
      scrubRef.current = null;
    };
  }, [level]);

  const liveRef = useLatest({
    enter,
    exit,
    isPresent,
    safeToRemove,
    shouldAnimate: context.shouldAnimate,
  });
  const firstRef = React.useRef(true);
  const generationRef = React.useRef(0);

  React.useLayoutEffect(() => {
    const { enter, exit, shouldAnimate } = liveRef.current;
    const id = ++generationRef.current;
    const isFirst = firstRef.current;
    firstRef.current = false;

    if (visible) {
      if (isFirst && !shouldAnimate) {
        presence.jump(1);
        return;
      }
      return onNextFrame(() => animate(presence, 1, enter));
    }
    if (isFirst) return;
    return onNextFrame(() =>
      animate(presence, 0, exit).then(() => {
        if (generationRef.current !== id) return;
        if (!liveRef.current.isPresent) liveRef.current.safeToRemove?.();
      }),
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
      ref={setRef}
      forceMount
      asChild
    >
      {motionChild(asChild, children, {
        style: closedStyle({ ...style }, visible),
      })}
    </DialogPrimitive.Overlay>
  );
}

const Content: Part<ContentProps & React.RefAttributes<HTMLDivElement>> = (
  props,
) => {
  const context = useDrawerContext();
  const portal = React.use(PortalContext);

  const body = <ContentMotion {...props} />;
  if (portal) return body;
  return (
    <AnimatePresence>
      {context.isOpen && (
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
  start: number;
  samples: { time: number; distance: number }[];
};

function ContentMotion({
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
}: ContentProps & React.RefAttributes<HTMLDivElement>) {
  const context = useDrawerContext();
  const reduce = useShouldReduceMotion();
  const enter = useTempoTransition(transition ?? DRAWER_TRANSITION);
  const exit = useTempoTransition(exitTransition ?? DRAWER_EXIT_TRANSITION);
  const [isPresent, safeToRemove] = usePresence();
  const visible = context.isOpen && isPresent;

  const { direction, position, nestedShift } = context;
  const vertical = isVertical(direction);
  const sign = closedSign(direction);
  const hasSnapPoints = Boolean(context.snapPoints?.length);
  const restDistance = hasSnapPoints
    ? (context.snapDistances[context.activeSnapPointIndex ?? 0] ?? 0)
    : 0;

  const instant = INSTANT;
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

  const shadowRef = React.useRef<Scrub | null>(null);
  React.useLayoutEffect(() => {
    const node = elementRef.current;
    if (!node || !visible) return;
    shadowRef.current?.stop();
    shadowRef.current = scrubShadow(node);
    shadowRef.current.set(
      liveRef.current.context.backgroundProgress(position.get()),
    );
  }, [visible, position, liveRef]);
  React.useLayoutEffect(() => {
    const unsubscribe = position.on('change', (value) =>
      shadowRef.current?.set(liveRef.current.context.backgroundProgress(value)),
    );
    return () => {
      unsubscribe();
      shadowRef.current?.stop();
      shadowRef.current = null;
    };
  }, [position, liveRef]);

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

  const generationRef = React.useRef(0);
  const targetRef = React.useRef<number | null>(null);
  const throwRef = React.useRef<number | null>(null);
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

  const firstRef = React.useRef(true);
  React.useLayoutEffect(() => {
    const { context, reduce, enter, exit, instant, restDistance, sign } =
      liveRef.current;
    const isFirst = firstRef.current;
    firstRef.current = false;
    measure();
    const { closed } = context.getGeometry();

    if (visible) {
      context.dragged.jump(0);
      if (isFirst) {
        if (!context.shouldAnimate) {
          position.jump(sign * restDistance);
          opacity.jump(1);
          targetRef.current = restDistance;
          return;
        }
        position.jump(sign * (reduce ? restDistance : closed));
        opacity.jump(reduce ? 0 : 1);
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
      targetRef.current = restDistance;
      if (!reduce) opacity.jump(1);
      return onNextFrame(() =>
        moveTo(
          restDistance,
          reduce ? instant : enter,
          reduce ? [1, enter] : undefined,
        ).then((done) => {
          if (done) liveRef.current.context.onAnimationEnd(true);
        }),
      );
    }

    if (isFirst) {
      position.jump(sign * closed);
      opacity.jump(0);
      targetRef.current = closed;
      return;
    }
    const thrown = throwRef.current;
    throwRef.current = null;
    const out =
      thrown === null
        ? exit
        : throwTransition(closed - position.get() * sign, thrown);
    const to = reduce ? position.get() * sign : closed;
    targetRef.current = to;
    return onNextFrame(() =>
      moveTo(to, reduce ? instant : out, reduce ? [0, exit] : undefined).then(
        (done) => {
          if (!done) return;
          const { context, isPresent, safeToRemove } = liveRef.current;
          context.onAnimationEnd(false);
          if (!isPresent) safeToRemove?.();
        },
      ),
    );
  }, [visible, liveRef, measure, moveTo, position, opacity]);

  const pressRef = React.useRef<Press | null>(null);
  React.useEffect(() => {
    if (!visible || pressRef.current?.dragging) return;
    if (targetRef.current === restDistance) return;
    moveTo(
      restDistance,
      liveRef.current.reduce ? instant : liveRef.current.enter,
    );
  }, [visible, restDistance, moveTo, liveRef, instant]);

  const lastScrollRef = React.useRef(0);
  React.useEffect(() => {
    const node = elementRef.current;
    if (!node) return;
    const resize = new ResizeObserver(() => measure());
    resize.observe(node);
    const onScroll = () => {
      lastScrollRef.current = performance.now();
    };
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

  const shouldDrag = (target: Element, along: number) => {
    const node = elementRef.current;
    if (!node) return false;
    if (target.closest('select, [data-vaul-no-drag]')) return false;
    if (window.getSelection()?.toString()) return false;
    const distance = position.get() * sign;
    const mostOpen = hasSnapPoints ? (context.snapDistances.at(-1) ?? 0) : 0;
    if (distance > mostOpen + 1) return true;
    if (performance.now() - lastScrollRef.current < context.scrollLockTimeout)
      return false;
    for (let el: Element | null = target; el; el = el.parentElement) {
      if (canScroll(el, vertical, along)) return false;
      if (el === node) break;
    }
    return true;
  };

  const startDrag = (current: Press) => {
    generationRef.current++;
    position.stop();
    context.dragged.jump(1);
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
    const mostOpen = hasSnapPoints ? (distances.at(-1) ?? 0) : 0;
    if (distance < mostOpen)
      distance = mostOpen - rubberBand(mostOpen - distance);
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

  const requestClose = (velocity: number) => {
    throwRef.current = velocity;
    context.closeDrawer();
    window.setTimeout(() => {
      const { context, restDistance, reduce, instant, enter } = liveRef.current;
      if (context.isOpen && !pressRef.current?.dragging) {
        throwRef.current = null;
        moveTo(restDistance, reduce ? instant : enter);
      }
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
    if (dismiss) return requestClose(velocity);
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
      return context.dismissible ? requestClose(velocity) : snapTo(0);
    }
    const firstDistance = distances[0]!;
    if (
      context.dismissible &&
      distance >
        firstDistance + (closed - firstDistance) * context.closeThreshold
    )
      return requestClose(velocity);
    const dimension = vertical ? window.innerHeight : window.innerWidth;
    if (speed > VELOCITY_THRESHOLD && Math.abs(dragged) < dimension * 0.4) {
      if (towardsOpen) return snapTo(index + 1);
      if (index === 0)
        return context.dismissible ? requestClose(velocity) : snapTo(0);
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
    if (!node || !node.contains(target)) return;
    if (context.handleOnly && !target.closest('[data-vaul-handle]')) return;
    try {
      target.setPointerCapture(event.pointerId);
    } catch {}
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
          style: closedStyle(
            { ...snapStyle, ...style, transform, opacity },
            visible,
          ),
        })}
      </DialogPrimitive.Content>
    </>
  );
}

const Handle: Part<HandleProps & React.RefAttributes<HTMLDivElement>> = ({
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

/* eslint-disable @typescript-eslint/no-explicit-any */
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

function closedStyle<T extends object>(style: T, open: boolean): T {
  if (open) return style;
  return { ...style, pointerEvents: 'none' };
}

function toTransform(direction: Direction, value: number, shift: number) {
  const vertical = isVertical(direction);
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

function releaseVelocity(
  samples: { time: number; distance: number }[],
  now: number,
) {
  const to = samples[samples.length - 1];
  if (!to || now - to.time > VELOCITY_WINDOW / 2) return 0;
  const from = samples.find(
    (sample) => to.time - sample.time <= VELOCITY_WINDOW,
  )!;
  return to.time > from.time
    ? (to.distance - from.distance) / (to.time - from.time)
    : 0;
}

function throwTransition(remaining: number, velocity: number): Transition {
  const ms =
    velocity > MIN_THROW_VELOCITY
      ? Math.min(
          Math.max(
            remaining / Math.min(velocity, MAX_THROW_VELOCITY),
            MIN_THROW_DURATION,
          ),
          MAX_THROW_DURATION,
        )
      : MAX_THROW_DURATION;
  return { duration: ms / 1000, ease: 'linear' };
}

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

Root.displayName = 'Drawer';
NestedRoot.displayName = 'DrawerNestedRoot';
Portal.displayName = 'DrawerPortal';

Overlay.displayName = 'DrawerOverlay';
Content.displayName = 'DrawerContent';
Handle.displayName = 'DrawerHandle';

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
