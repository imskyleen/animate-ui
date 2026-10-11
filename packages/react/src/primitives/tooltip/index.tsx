'use client';

import * as React from 'react';
import {
  motion,
  animate,
  cancelFrame,
  frame,
  motionValue,
  useMotionValue,
  AnimatePresence,
  LayoutGroup,
  type AnimationPlaybackControls,
  type MotionValue,
  type Transition,
  type HTMLMotionProps,
} from 'motion/react';
import {
  useFloating,
  autoUpdate,
  offset as floatingOffset,
  flip,
  shift,
  arrow as floatingArrow,
  FloatingPortal,
  FloatingArrow,
  type UseFloatingReturn,
} from '@floating-ui/react';

import { getStrictContext } from '../../utils/strict-context';
import {
  motionTokens,
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';
import { Slot, type WithAsChild } from '../slot';

// Animate UI's own tooltip: every tooltip of a provider shares one popup,
// positioned with Floating UI. Moving from a trigger to the next one glides
// the popup (a shared layout animation) instead of closing and reopening it.
// It moves like the library tooltips (Radix UI, Base UI, React Aria): the
// popup grows from 0.7 and fades in from the point facing its trigger, and
// goes back the same way when it closes, on a spring as quick as theirs, a
// touch calmer (stiffness 400, damping 31: about 2% past, theirs 4%).
// While it glides, its content changes like an icon swapping: the previous
// label leaves into a light blur, fading out and sliding a few px away from
// where the popup goes, the next one comes in from there (ContentSwap).

type Side = 'top' | 'bottom' | 'left' | 'right';
type Align = 'start' | 'center' | 'end';

type TooltipData = {
  contentProps: HTMLMotionProps<'div'>;
  contentAsChild: boolean;
  rect: DOMRect;
  side: Side;
  sideOffset: number;
  align: Align;
  alignOffset: number;
  id: string;
};

type GlobalTooltipContextType = {
  showTooltip: (data: TooltipData) => void;
  hideTooltip: () => void;
  hideImmediate: () => void;
  currentTooltip: TooltipData | null;
  transition: Transition;
  globalId: string;
  setReferenceEl: (el: HTMLElement | null) => void;
  referenceElRef: React.RefObject<HTMLElement | null>;
};

const [GlobalTooltipProvider, useGlobalTooltip] =
  getStrictContext<GlobalTooltipContextType>('GlobalTooltipProvider');

type TooltipContextType = {
  props: HTMLMotionProps<'div'>;
  setProps: React.Dispatch<React.SetStateAction<HTMLMotionProps<'div'>>>;
  asChild: boolean;
  setAsChild: React.Dispatch<React.SetStateAction<boolean>>;
  side: Side;
  sideOffset: number;
  align: Align;
  alignOffset: number;
  id: string;
};

const [LocalTooltipProvider, useTooltip] = getStrictContext<TooltipContextType>(
  'LocalTooltipProvider',
);

type TooltipPosition = { x: number; y: number };

/** The popup's id, referenced by its trigger's `aria-describedby`. */
const contentIdOf = (id: string) => `${id}-tooltip`;

function getResolvedSide(placement: Side | `${Side}-${Align}`) {
  if (placement.includes('-')) {
    return placement.split('-')[0] as Side;
  }
  return placement as Side;
}

/**
 * The entrance, the exit and the glide between triggers: as quick as the
 * library tooltips' spring, a touch calmer.
 */
const TOOLTIP_TRANSITION = motionTokens.spring.tooltip;

/**
 * The point of the popup facing its trigger (Motion's `originX`/`originY`,
 * which its layout projection takes into account): it grows out of the
 * trigger, like the library tooltips from their origin variables.
 */
function originFor(side: Side, align: Align) {
  const along = align === 'start' ? 0 : align === 'end' ? 1 : 0.5;
  if (side === 'top') return { originX: along, originY: 1 };
  if (side === 'bottom') return { originX: along, originY: 0 };
  if (side === 'left') return { originX: 1, originY: along };
  return { originX: 0, originY: along };
}

/* Content swap ------------------------------------------------------------ */

/** Where the next content comes from: its axis, and 1 the end, -1 the start. */
type Way = { axis: 'x' | 'y'; sign: number };

/** From a trigger to the next: by their centers on screen (RTL included). */
function wayBetween(from: DOMRect, to: DOMRect): Way {
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return { axis: 'x', sign: 0 };
  return Math.abs(dx) >= Math.abs(dy)
    ? { axis: 'x', sign: Math.sign(dx) }
    : { axis: 'y', sign: Math.sign(dy) };
}

type SwapValues = {
  x: MotionValue<number>;
  y: MotionValue<number>;
  opacity: MotionValue<number>;
  /** In px. */
  blur: MotionValue<number>;
};

type SwapTarget = { x: number; y: number; opacity: number; blur: number };

type SwapLayer = {
  values: SwapValues;
  controls: AnimationPlaybackControls[];
};

const swapValues = (from: SwapTarget): SwapValues => ({
  x: motionValue(from.x),
  y: motionValue(from.y),
  opacity: motionValue(from.opacity),
  blur: motionValue(from.blur),
});

const REST: SwapTarget = { x: 0, y: 0, opacity: 1, blur: 0 };

const readValues = (values: SwapValues): SwapTarget => ({
  x: values.x.get(),
  y: values.y.get(),
  opacity: values.opacity.get(),
  blur: values.blur.get(),
});

/** `blur.tooltip`, in px. */
const SWAP_BLUR = Number.parseFloat(
  motionTokens.blur.tooltip.replace(/[^\d.]/g, ''),
);

/**
 * The content's swap, like a menubar's content handed to the next menu: the
 * leaving label goes softly (`transition.handoffOut`), the next one slides in
 * on a spring that never goes past its place (`spring.handoff`) and shows
 * late, as it arrives (`transition.handoffIn`, `ease.arrive`).
 */
type SwapTimings = { out: Transition; move: Transition; in: Transition };

const SWAP_TIMINGS: SwapTimings = {
  out: motionTokens.transition.handoffOut,
  move: motionTokens.spring.handoff,
  in: motionTokens.transition.handoffIn,
};

/** The layout styles the content's layer takes from the popup. */
const LAYOUT_KEYS = [
  'display',
  'flexDirection',
  'flexWrap',
  'alignItems',
  'justifyContent',
  'alignContent',
  'rowGap',
  'columnGap',
  'gridTemplateColumns',
  'gridTemplateRows',
  'gridAutoFlow',
] as const;

/**
 * The content's layer: it lays its content out like the popup would
 * (whatever display the popup has), so it changes nothing until it moves.
 */
const LAYER_STYLE: React.CSSProperties = Object.fromEntries(
  LAYOUT_KEYS.map((key) => [key, 'inherit']),
);

/** Where a leaving content is copied: the popup's box, which clips it. */
const VIEWPORT_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  borderRadius: 'inherit',
  pointerEvents: 'none',
};

/**
 * The content changing while the popup glides from a trigger to the next.
 *
 * - The content is laid out in a layer inside the popup. As the trigger
 *   changes, the layer is copied as it shows (aria-hidden, inert) into the
 *   popup's box, which clips it, and the copy leaves into `blur.tooltip`,
 *   fading out and sliding `shift.tooltip` away from where the popup goes
 *   (see `SWAP_TIMINGS`). The layer, showing the next content, comes in from
 *   there, out of the blur.
 * - The popup resizes on its shared layout animation, which scales it: both
 *   are scaled back every frame (around the point the popup grows from), so
 *   no text is ever stretched, and the layer is clipped by the popup too.
 * - Each content is one layer: coming back to a content still leaving takes
 *   it back from where its copy is, and what was coming in leaves from where
 *   it is.
 */
class ContentSwap {
  private layer: HTMLElement | null = null;
  private viewport: HTMLElement | null = null;
  /** The point the popup grows from, as fractions of its box. */
  private anchor: [number, number] = [0.5, 1];
  /** The popup's own scale (its entrance), not its layout's. */
  private popupScale: () => number = () => 1;
  private timing: () => SwapTimings = () => SWAP_TIMINGS;
  private current: SwapLayer = { values: swapValues(REST), controls: [] };
  private leaving = new Map<string, SwapLayer & { element: HTMLElement }>();
  private pending: {
    id: string;
    element: HTMLElement;
    width: number;
    height: number;
    from: SwapTarget;
    way: Way;
  } | null = null;
  private running = false;
  /** Frames the popup's resizing has been settled for. */
  private settled = 0;

  configure(options: {
    anchor: [number, number];
    popupScale: () => number;
    timing: () => SwapTimings;
  }) {
    this.anchor = options.anchor;
    this.popupScale = options.popupScale;
    this.timing = options.timing;
  }

  /** The content's layer (null: unmounted, everything stops). */
  setLayer(el: HTMLElement | null) {
    if (!el) this.reset();
    this.layer = el;
  }

  /** Where leaving contents are copied. */
  setViewport(el: HTMLElement | null) {
    this.viewport = el;
  }

  /** The layer showing `id` is about to show the next trigger's content. */
  capture(id: string, way: Way) {
    const layer = this.layer;
    if (!layer?.isConnected) return;
    const element = layer.cloneNode(true) as HTMLElement;
    const style = getComputedStyle(layer);
    for (const key of LAYOUT_KEYS) element.style[key] = style[key];
    for (const el of [element, ...element.querySelectorAll('*')]) {
      el.removeAttribute('id');
      el.removeAttribute('data-slot');
    }
    element.setAttribute('aria-hidden', 'true');
    element.setAttribute('inert', '');
    element.setAttribute('data-tooltip-leaving', id);
    this.pending = {
      id,
      element,
      width: layer.offsetWidth,
      height: layer.offsetHeight,
      from: readValues(this.current.values),
      way,
    };
  }

  /** The layer shows the next content `id`: the swap starts. */
  commit(id: string | undefined) {
    const pending = this.pending;
    this.pending = null;
    const layer = this.layer;
    const viewport = this.viewport;
    if (!pending || !id || !layer || !viewport || pending.id === id) return;
    const timings = this.timing();
    const { axis, sign } = pending.way;
    const shift = motionTokens.shift.tooltip * sign;
    const [ax, ay] = this.anchor;

    // The previous content leaves from where it is.
    const { element } = pending;
    Object.assign(element.style, {
      position: 'absolute',
      margin: '0px',
      boxSizing: 'border-box',
      width: `${pending.width}px`,
      height: `${pending.height}px`,
      left: `${layer.offsetLeft + ax * (layer.offsetWidth - pending.width)}px`,
      top: `${layer.offsetTop + ay * (layer.offsetHeight - pending.height)}px`,
      pointerEvents: 'none',
    });
    viewport.appendChild(element);
    const out: SwapLayer & { element: HTMLElement } = {
      element,
      values: swapValues(pending.from),
      controls: [],
    };
    this.leaving.get(pending.id)?.element.remove();
    this.leaving.set(pending.id, out);
    this.run(
      out,
      {
        x: axis === 'x' ? -shift : 0,
        y: axis === 'y' ? -shift : 0,
        opacity: 0,
        blur: SWAP_BLUR,
      },
      {
        x: timings.out,
        y: timings.out,
        opacity: timings.out,
        blur: timings.out,
      },
      () => {
        if (this.leaving.get(pending.id) !== out) return;
        this.leaving.delete(pending.id);
        element.remove();
      },
    );

    // The next one comes in from where the popup goes, or, coming back to a
    // content still leaving, from where its copy is.
    const back = this.leaving.get(id);
    const from = back
      ? readValues(back.values)
      : {
          x: axis === 'x' ? shift : 0,
          y: axis === 'y' ? shift : 0,
          opacity: 0,
          blur: SWAP_BLUR,
        };
    if (back) {
      for (const control of back.controls) control.stop();
      back.element.remove();
      this.leaving.delete(id);
    }
    for (const control of this.current.controls) control.stop();
    const values = this.current.values;
    values.x.jump(from.x);
    values.y.jump(from.y);
    values.opacity.jump(from.opacity);
    values.blur.jump(from.blur);
    this.run(this.current, REST, {
      x: timings.move,
      y: timings.move,
      opacity: timings.in,
      blur: timings.in,
    });

    this.start();
  }

  /** Stops everything: the content shows as it is, at rest. */
  reset() {
    this.pending = null;
    for (const out of this.leaving.values()) {
      for (const control of out.controls) control.stop();
      out.element.remove();
    }
    this.leaving.clear();
    for (const control of this.current.controls) control.stop();
    this.current = { values: swapValues(REST), controls: [] };
    if (this.running) cancelFrame(this.tick);
    this.running = false;
    this.clear();
  }

  private run(
    layer: SwapLayer,
    to: SwapTarget,
    transitions: Record<keyof SwapTarget, Transition>,
    done?: () => void,
  ) {
    layer.controls = (['x', 'y', 'opacity', 'blur'] as const).map((key) =>
      animate(layer.values[key], to[key], transitions[key]),
    );
    if (done) layer.controls[2]!.finished.then(done, () => {});
  }

  private start() {
    this.settled = 0;
    if (!this.running) {
      this.running = true;
      // After Motion has drawn the popup (its layout animation), every frame.
      frame.postRender(this.tick, true);
    }
    // And now (already running too): the swap's first frame, once Motion has
    // started the popup's layout animation (in a microtask after this
    // commit).
    queueMicrotask(() => this.tick());
  }

  private clear() {
    const layer = this.layer;
    if (!layer) return;
    for (const key of [
      'transform',
      'transform-origin',
      'opacity',
      'filter',
      'clip-path',
    ])
      layer.style.removeProperty(key);
  }

  private tick = () => {
    if (!this.running) return;
    const layer = this.layer;
    const popup = layer?.parentElement;
    if (!layer?.isConnected || !popup) {
      this.reset();
      return;
    }
    // The popup's layout animation's scale: what it shows over its size,
    // without its own (entrance) scale.
    const [sx, sy] = this.layoutScale(popup);
    const values = readValues(this.current.values);
    this.draw(layer, values, sx, sy);
    // The layer, clipped by the popup's box, as it shows.
    const [ax, ay] = this.anchor;
    const { offsetLeft: l, offsetTop: t } = layer;
    const { offsetWidth: w, offsetHeight: h } = layer;
    const ox = l + ax * w;
    const oy = t + ay * h;
    const ux = (c: number) => ax * w - values.x + sx * (c - ox);
    const uy = (c: number) => ay * h - values.y + sy * (c - oy);
    layer.style.clipPath = `inset(${uy(0)}px ${w - ux(popup.clientWidth)}px ${
      h - uy(popup.clientHeight)
    }px ${ux(0)}px)`;
    for (const out of this.leaving.values())
      this.draw(out.element, readValues(out.values), sx, sy);

    // Settled for a few frames: not a spring crossing its rest as it
    // overshoots.
    this.settled =
      Math.abs(sx - 1) > 1e-3 || Math.abs(sy - 1) > 1e-3 ? 0 : this.settled + 1;
    const moving =
      this.leaving.size > 0 ||
      Object.values(this.current.values).some((value) => value.isAnimating()) ||
      this.settled < 4;
    if (!moving) {
      cancelFrame(this.tick);
      this.running = false;
      this.clear();
    }
  };

  /**
   * The popup's layout animation's scale: what it shows over its size, apart
   * from its own (entrance) scale. 1 once Motion has dropped its transform.
   */
  private layoutScale(popup: HTMLElement): [number, number] {
    const transform = popup.style.transform;
    if (!transform || transform === 'none') return [1, 1];
    const rect = popup.getBoundingClientRect();
    const own = this.popupScale() || 1;
    // Its size, unrounded (offsetWidth is rounded to whole pixels).
    const style = getComputedStyle(popup);
    const extra = (a: string, b: string) =>
      style.boxSizing === 'border-box'
        ? 0
        : Number.parseFloat(style[`padding${a}` as 'paddingLeft']) +
          Number.parseFloat(style[`padding${b}` as 'paddingLeft']) +
          Number.parseFloat(style[`border${a}Width` as 'borderLeftWidth']) +
          Number.parseFloat(style[`border${b}Width` as 'borderLeftWidth']);
    const width = Number.parseFloat(style.width) + extra('Left', 'Right');
    const height = Number.parseFloat(style.height) + extra('Top', 'Bottom');
    return [
      width ? rect.width / (width * own) || 1 : 1,
      height ? rect.height / (height * own) || 1 : 1,
    ];
  }

  /** Scaled back from the popup's resizing, around the popup's origin. */
  private draw(el: HTMLElement, v: SwapTarget, sx: number, sy: number) {
    const [ax, ay] = this.anchor;
    el.style.transformOrigin = `${ax * 100}% ${ay * 100}%`;
    el.style.transform = `scale(${1 / sx}, ${1 / sy}) translate(${v.x}px, ${
      v.y
    }px)`;
    el.style.opacity = String(v.opacity);
    el.style.filter = v.blur > 0.01 ? `blur(${v.blur}px)` : '';
  }
}

/** A `TooltipArrow` inside the content hands its props to the popup's. */
const ArrowSlotContext = React.createContext<
  ((props: TooltipArrowProps | null) => void) | null
>(null);

type TooltipProviderProps = {
  children: React.ReactNode;
  id?: string;
  openDelay?: number;
  closeDelay?: number;
  transition?: Transition;
};

function TooltipProvider({
  children,
  id,
  openDelay = 0,
  closeDelay = 300,
  transition: transitionProp = TOOLTIP_TRANSITION,
}: TooltipProviderProps) {
  const transition = useTempoTransition(transitionProp);
  const globalId = React.useId();
  const [currentTooltip, setCurrentTooltip] =
    React.useState<TooltipData | null>(null);
  const timeoutRef = React.useRef<number | null>(null);
  const lastCloseTimeRef = React.useRef<number>(0);
  const referenceElRef = React.useRef<HTMLElement | null>(null);

  const showTooltip = React.useCallback(
    (data: TooltipData) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (currentTooltip !== null) {
        setCurrentTooltip(data);
        return;
      }
      const now = Date.now();
      const delay = now - lastCloseTimeRef.current < closeDelay ? 0 : openDelay;
      timeoutRef.current = window.setTimeout(
        () => setCurrentTooltip(data),
        delay,
      );
    },
    [openDelay, closeDelay, currentTooltip],
  );

  const hideTooltip = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setCurrentTooltip(null);
      lastCloseTimeRef.current = Date.now();
    }, closeDelay);
  }, [closeDelay]);

  const hideImmediate = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCurrentTooltip(null);
    lastCloseTimeRef.current = Date.now();
  }, []);

  const setReferenceEl = React.useCallback((el: HTMLElement | null) => {
    referenceElRef.current = el;
  }, []);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hideImmediate();
    };
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('scroll', hideImmediate, true);
    window.addEventListener('resize', hideImmediate, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('scroll', hideImmediate, true);
      window.removeEventListener('resize', hideImmediate, true);
    };
  }, [hideImmediate]);

  React.useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  return (
    <GlobalTooltipProvider
      value={{
        showTooltip,
        hideTooltip,
        hideImmediate,
        currentTooltip,
        transition,
        globalId: id ?? globalId,
        setReferenceEl,
        referenceElRef,
      }}
    >
      <ReducedMotionConfig>
        <LayoutGroup>{children}</LayoutGroup>
        <TooltipOverlay />
      </ReducedMotionConfig>
    </GlobalTooltipProvider>
  );
}

type RenderedTooltipContextType = {
  side: Side;
  align: Align;
  open: boolean;
  /** Floating UI has placed the popup (it's measured unseen until then). */
  positioned: boolean;
};

const [RenderedTooltipProvider, useRenderedTooltip] =
  getStrictContext<RenderedTooltipContextType>('RenderedTooltipContext');

type FloatingContextType = {
  context: UseFloatingReturn['context'];
  arrowRef: React.RefObject<SVGSVGElement | null>;
};

const [FloatingProvider, useFloatingContext] =
  getStrictContext<FloatingContextType>('FloatingContext');

const MotionTooltipArrow = motion.create(FloatingArrow);

type TooltipArrowProps = Omit<
  React.ComponentProps<typeof MotionTooltipArrow>,
  'context'
> & {
  withTransition?: boolean;
};

function TooltipArrowImpl({
  ref,
  withTransition = true,
  ...props
}: TooltipArrowProps) {
  const { side, align, open, positioned } = useRenderedTooltip();
  const { context, arrowRef } = useFloatingContext();
  const { transition, globalId } = useGlobalTooltip();
  React.useImperativeHandle(ref, () => arrowRef.current as SVGSVGElement);

  const deg = { top: 0, right: 90, bottom: 180, left: -90 }[side];

  return (
    <MotionTooltipArrow
      ref={arrowRef}
      context={context}
      data-state={open ? 'open' : 'closed'}
      data-side={side}
      data-align={align}
      data-slot="tooltip-arrow"
      style={{ rotate: deg }}
      // Like the popup's: no layoutId while it's measured at 0, 0, or the
      // arrow would fly in from there.
      layoutId={
        withTransition && positioned ? `tooltip-arrow-${globalId}` : undefined
      }
      transition={withTransition ? transition : undefined}
      {...props}
    />
  );
}

function shallowEqualProps(a: object | null, b: object | null) {
  if (a === b) return true;
  if (!a || !b) return false;
  const keysA = Object.keys(a);
  if (keysA.length !== Object.keys(b).length) return false;
  return keysA.every(
    (key) =>
      (a as Record<string, unknown>)[key] ===
      (b as Record<string, unknown>)[key],
  );
}

/**
 * The popup's arrow. Written inside `TooltipContent`, it's drawn by the popup
 * itself, outside the content that changes from a trigger to the next: it
 * glides with the popup, never fades or blurs with the content.
 */
function TooltipArrow(props: TooltipArrowProps) {
  const register = React.use(ArrowSlotContext);
  React.useLayoutEffect(() => {
    register?.(props);
  });
  React.useLayoutEffect(
    () => (register ? () => register(null) : undefined),
    [register],
  );
  if (register) return null;
  return <TooltipArrowImpl {...props} />;
}

type TooltipPortalProps = React.ComponentProps<typeof FloatingPortal>;

function TooltipPortal(props: TooltipPortalProps) {
  return <FloatingPortal {...props} />;
}

function TooltipOverlay() {
  const { currentTooltip, transition, globalId, referenceElRef } =
    useGlobalTooltip();
  const reduce = useShouldReduceMotion();

  const [rendered, setRendered] = React.useState<{
    data: TooltipData | null;
    open: boolean;
  }>({ data: null, open: false });

  const arrowRef = React.useRef<SVGSVGElement | null>(null);

  // The arrow written in the content, drawn by the popup.
  const [arrowProps, setArrowProps] = React.useState<TooltipArrowProps | null>(
    null,
  );
  const registerArrow = React.useCallback(
    (props: TooltipArrowProps | null) =>
      setArrowProps((previous) =>
        shallowEqualProps(previous, props) ? previous : props,
      ),
    [],
  );

  // The popup's own scale (its entrance and exit), apart from its layout's.
  const popupScale = useMotionValue(1);
  const swapOut = useTempoTransition(SWAP_TIMINGS.out);
  const swapMove = useTempoTransition(SWAP_TIMINGS.move);
  const swapIn = useTempoTransition(SWAP_TIMINGS.in);
  const [swap] = React.useState(() => new ContentSwap());

  const side = rendered.data?.side ?? 'top';
  const align = rendered.data?.align ?? 'center';

  const { refs, x, y, strategy, context, update, isPositioned } = useFloating({
    // Tracked so `isPositioned` tells when the first position is known.
    open: rendered.data !== null,
    placement: align === 'center' ? side : `${side}-${align}`,
    whileElementsMounted: autoUpdate,
    middleware: [
      floatingOffset({
        mainAxis: rendered.data?.sideOffset ?? 0,
        crossAxis: rendered.data?.alignOffset ?? 0,
      }),
      flip(),
      shift({ padding: 8 }),
      floatingArrow({ element: arrowRef }),
    ],
  });

  const swapStateRef = React.useRef({ rendered, positioned: false, reduce });
  React.useLayoutEffect(() => {
    swapStateRef.current = { rendered, positioned: isPositioned, reduce };
  });

  React.useEffect(() => {
    if (currentTooltip) {
      // Another trigger's content while the popup shows: it swaps (the
      // layer is copied as it shows, before it changes).
      const { rendered: previous, positioned, reduce } = swapStateRef.current;
      if (
        previous.data &&
        previous.data.id !== currentTooltip.id &&
        positioned &&
        !reduce
      )
        swap.capture(
          previous.data.id,
          wayBetween(previous.data.rect, currentTooltip.rect),
        );
      setRendered({ data: currentTooltip, open: true });
    } else {
      setRendered((p) => (p.data ? { ...p, open: false } : p));
    }
  }, [currentTooltip, swap]);

  const renderedId = rendered.data?.id;
  React.useLayoutEffect(() => {
    swap.commit(renderedId);
  }, [swap, renderedId]);

  // Under reduced motion, contents change at once, like the popup jumps.
  React.useEffect(() => {
    if (reduce) swap.reset();
  }, [swap, reduce]);

  const setLayer = React.useCallback(
    (el: HTMLDivElement | null) => swap.setLayer(el),
    [swap],
  );
  const setViewport = React.useCallback(
    (el: HTMLDivElement | null) => swap.setViewport(el),
    [swap],
  );

  React.useLayoutEffect(() => {
    if (referenceElRef.current) {
      refs.setReference(referenceElRef.current);
      update();
    }
  }, [referenceElRef, refs, update, rendered.data]);

  const Component = rendered.data?.contentAsChild ? Slot : motion.div;
  const resolvedSide = getResolvedSide(context.placement);
  const resolvedAlign =
    (context.placement.split('-')[1] as Align | undefined) ?? 'center';

  // Grows from 0.7 out of the trigger. Under reduced motion it only fades,
  // and moving between triggers jumps.
  const origin = originFor(resolvedSide, resolvedAlign);
  React.useLayoutEffect(() => {
    swap.configure({
      anchor: [origin.originX, origin.originY],
      popupScale: () => popupScale.get(),
      timing: () => ({ out: swapOut, move: swapMove, in: swapIn }),
    });
  });

  // The content, in its layer (see ContentSwap), and the arrow apart from
  // it. With `asChild`, inside the child, which is the popup.
  const contentProps = rendered.data?.contentProps;
  const wrap = (children: React.ReactNode) => (
    <>
      {arrowProps && <TooltipArrowImpl {...arrowProps} />}
      <ArrowSlotContext value={registerArrow}>
        <div
          ref={setLayer}
          data-slot="tooltip-content-layer"
          style={LAYER_STYLE}
        >
          {children}
        </div>
      </ArrowSlotContext>
      <div
        ref={setViewport}
        data-slot="tooltip-content-swap"
        aria-hidden
        style={VIEWPORT_STYLE}
      />
    </>
  );
  const asChildElement =
    rendered.data?.contentAsChild &&
    React.isValidElement<{ children?: React.ReactNode }>(contentProps?.children)
      ? contentProps.children
      : null;
  const children = asChildElement
    ? React.cloneElement(
        asChildElement,
        undefined,
        wrap(asChildElement.props.children),
      )
    : wrap(contentProps?.children as React.ReactNode);

  const hidden = rendered.data
    ? { opacity: 0, scale: reduce ? 1 : motionTokens.scale.tooltip }
    : { opacity: 0 };

  return (
    <AnimatePresence mode="wait">
      {rendered.data && (
        <TooltipPortal>
          <div
            ref={refs.setFloating}
            data-slot="tooltip-overlay"
            data-side={resolvedSide}
            data-align={rendered.data.align}
            data-state={rendered.open ? 'open' : 'closed'}
            style={{
              position: strategy,
              top: 0,
              left: 0,
              zIndex: 50,
              transform: `translate3d(${x}px, ${y}px, 0)`,
              // Measured unseen until Floating UI has placed it.
              visibility: isPositioned ? undefined : 'hidden',
            }}
          >
            <FloatingProvider value={{ context, arrowRef }}>
              <RenderedTooltipProvider
                value={{
                  side: resolvedSide,
                  align: rendered.data.align,
                  open: rendered.open,
                  positioned: isPositioned,
                }}
              >
                <Component
                  // Floating UI renders the popup at 0, 0 before it has
                  // measured it. Until it's placed, the popup is measured
                  // without its layoutId (the shared layout animation would
                  // fly it in from the corner), then mounts afresh where it
                  // belongs and plays its entrance there. Moving between
                  // triggers keeps the same element: it glides.
                  key={isPositioned ? 'positioned' : 'measuring'}
                  id={contentIdOf(rendered.data.id)}
                  role="tooltip"
                  data-slot="tooltip-content"
                  data-side={resolvedSide}
                  data-align={rendered.data.align}
                  data-state={rendered.open ? 'open' : 'closed'}
                  layoutId={
                    isPositioned ? `tooltip-content-${globalId}` : undefined
                  }
                  initial={hidden}
                  // One spring for everything: the entrance, the exit and
                  // the shared layout move between triggers.
                  animate={
                    rendered.open
                      ? { opacity: 1, scale: 1, transition }
                      : { ...hidden, transition }
                  }
                  exit={{ ...hidden, transition }}
                  onAnimationComplete={() => {
                    if (!rendered.open)
                      setRendered({ data: null, open: false });
                  }}
                  transition={transition}
                  {...rendered.data.contentProps}
                  style={{
                    position: 'relative',
                    scale: popupScale,
                    ...origin,
                    ...(rendered.data.contentProps?.style || {}),
                  }}
                >
                  {children}
                </Component>
              </RenderedTooltipProvider>
            </FloatingProvider>
          </div>
        </TooltipPortal>
      )}
    </AnimatePresence>
  );
}

type TooltipProps = {
  children: React.ReactNode;
  side?: Side;
  sideOffset?: number;
  align?: Align;
  alignOffset?: number;
};

function Tooltip({
  children,
  side = 'top',
  sideOffset = 10,
  align = 'center',
  alignOffset = 0,
}: TooltipProps) {
  const id = React.useId();
  const [props, setProps] = React.useState<HTMLMotionProps<'div'>>({});
  const [asChild, setAsChild] = React.useState(false);

  return (
    <LocalTooltipProvider
      value={{
        props,
        setProps,
        asChild,
        setAsChild,
        side,
        sideOffset,
        align,
        alignOffset,
        id,
      }}
    >
      {children}
    </LocalTooltipProvider>
  );
}

type TooltipContentProps = WithAsChild<HTMLMotionProps<'div'>>;

function shallowEqualWithoutChildren(
  a?: HTMLMotionProps<'div'>,
  b?: HTMLMotionProps<'div'>,
) {
  if (a === b) return true;
  if (!a || !b) return false;
  const keysA = Object.keys(a).filter((k) => k !== 'children');
  const keysB = Object.keys(b).filter((k) => k !== 'children');
  if (keysA.length !== keysB.length) return false;
  for (const k of keysA) {
    // @ts-expect-error index
    if (a[k] !== b[k]) return false;
  }
  return true;
}

/**
 * Declares what the tooltip shows. It renders nothing in place: the
 * provider's shared popup renders its props.
 */
function TooltipContent({ asChild = false, ...props }: TooltipContentProps) {
  const { setProps, setAsChild } = useTooltip();
  const lastPropsRef = React.useRef<HTMLMotionProps<'div'> | undefined>(
    undefined,
  );

  React.useEffect(() => {
    if (!shallowEqualWithoutChildren(lastPropsRef.current, props)) {
      lastPropsRef.current = props;
      setProps(props);
    }
  }, [props, setProps]);

  React.useEffect(() => {
    setAsChild(asChild);
  }, [asChild, setAsChild]);

  return null;
}

type TooltipTriggerProps = WithAsChild<HTMLMotionProps<'div'>>;

function TooltipTrigger({
  ref,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onPointerDown,
  asChild = false,
  ...props
}: TooltipTriggerProps) {
  const {
    props: contentProps,
    asChild: contentAsChild,
    side,
    sideOffset,
    align,
    alignOffset,
    id,
  } = useTooltip();
  const {
    showTooltip,
    hideTooltip,
    hideImmediate,
    currentTooltip,
    setReferenceEl,
  } = useGlobalTooltip();

  const triggerRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => triggerRef.current as HTMLDivElement);

  const suppressNextFocusRef = React.useRef(false);

  const handleOpen = React.useCallback(() => {
    if (!triggerRef.current) return;
    setReferenceEl(triggerRef.current);
    const rect = triggerRef.current.getBoundingClientRect();
    showTooltip({
      contentProps,
      contentAsChild,
      rect,
      side,
      sideOffset,
      align,
      alignOffset,
      id,
    });
  }, [
    showTooltip,
    setReferenceEl,
    contentProps,
    contentAsChild,
    side,
    sideOffset,
    align,
    alignOffset,
    id,
  ]);

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      onPointerDown?.(e);
      if (currentTooltip?.id === id) {
        suppressNextFocusRef.current = true;
        hideImmediate();
        Promise.resolve().then(() => {
          suppressNextFocusRef.current = false;
        });
      }
    },
    [onPointerDown, currentTooltip?.id, id, hideImmediate],
  );

  const handleMouseEnter = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseEnter?.(e);
      handleOpen();
    },
    [handleOpen, onMouseEnter],
  );

  const handleMouseLeave = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseLeave?.(e);
      hideTooltip();
    },
    [hideTooltip, onMouseLeave],
  );

  const handleFocus = React.useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      onFocus?.(e);
      if (suppressNextFocusRef.current) return;
      handleOpen();
    },
    [handleOpen, onFocus],
  );

  const handleBlur = React.useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      onBlur?.(e);
      hideTooltip();
    },
    [hideTooltip, onBlur],
  );

  const Component = asChild ? Slot : motion.div;
  const open = currentTooltip?.id === id;

  return (
    <Component
      ref={triggerRef}
      onPointerDown={handlePointerDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-describedby={open ? contentIdOf(id) : undefined}
      data-slot="tooltip-trigger"
      data-side={side}
      data-align={align}
      data-state={open ? 'open' : 'closed'}
      {...props}
    />
  );
}

export {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipArrow,
  useGlobalTooltip,
  useTooltip,
  type TooltipProviderProps,
  type TooltipProps,
  type TooltipContentProps,
  type TooltipTriggerProps,
  type TooltipArrowProps,
  type TooltipPosition,
  type GlobalTooltipContextType,
  type TooltipContextType,
};
