import {
  defineComponent,
  Comment,
  Fragment,
  h,
  inject,
  isVNode,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  provide,
  shallowRef,
  Teleport,
  useId,
  watch,
  type Component,
  type InjectionKey,
  type PropType,
  type Ref,
  type Slot as VueSlot,
  type VNode,
} from 'vue';
import {
  animate,
  cancelFrame,
  frame,
  LayoutGroup,
  motion,
  motionValue,
  useMotionValue,
  type AnimationPlaybackControls,
  type MotionValue,
  type Transition,
} from 'motion-v';
import {
  arrow as floatingArrow,
  autoUpdate,
  flip,
  offset as floatingOffset,
  shift,
  useFloating,
} from '@floating-ui/vue';

import {
  motionTokens,
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';
import { Slot } from '../slot';
import { callHandler } from '../../internal/handlers';

type Side = 'top' | 'bottom' | 'left' | 'right';
type Align = 'start' | 'center' | 'end';

type ContentProps = Record<string, unknown>;

type TooltipData = {
  contentProps: ContentProps;
  contentSlot: VueSlot | undefined;
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
  currentTooltip: Ref<TooltipData | null>;
  transition: Ref<Transition>;
  globalId: () => string;
  referenceEl: Ref<HTMLElement | null>;
};

const GlobalTooltipKey: InjectionKey<GlobalTooltipContextType> = Symbol(
  'AnimateUIGlobalTooltip',
);

function useGlobalTooltip() {
  const context = inject(GlobalTooltipKey, null);
  if (!context)
    throw new Error('useGlobalTooltip must be used within a TooltipProvider');
  return context;
}

type TooltipContent = {
  props: ContentProps;
  slot: VueSlot | undefined;
  asChild: boolean;
};

type TooltipContextType = {
  content: Ref<TooltipContent>;
  side: () => Side;
  sideOffset: () => number;
  align: () => Align;
  alignOffset: () => number;
  id: string;
};

const TooltipKey: InjectionKey<TooltipContextType> = Symbol('AnimateUITooltip');

function useTooltip() {
  const context = inject(TooltipKey, null);
  if (!context) throw new Error('useTooltip must be used within a Tooltip');
  return context;
}

type TooltipPosition = { x: number; y: number };

const contentIdOf = (id: string) => `${id}-tooltip`;

function getResolvedSide(placement: Side | `${Side}-${Align}`) {
  if (placement.includes('-')) {
    return placement.split('-')[0] as Side;
  }
  return placement as Side;
}

const TOOLTIP_TRANSITION = motionTokens.spring.tooltip;

function originFor(side: Side, align: Align) {
  const along = align === 'start' ? 0 : align === 'end' ? 1 : 0.5;
  if (side === 'top') return { originX: along, originY: 1 };
  if (side === 'bottom') return { originX: along, originY: 0 };
  if (side === 'left') return { originX: 1, originY: along };
  return { originX: 0, originY: along };
}

type Way = { axis: 'x' | 'y'; sign: number };

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

const SWAP_BLUR = Number.parseFloat(
  motionTokens.blur.tooltip.replace(/[^\d.]/g, ''),
);

type SwapTimings = { out: Transition; move: Transition; in: Transition };

const SWAP_TIMINGS: SwapTimings = {
  out: motionTokens.transition.tooltipOut,
  move: motionTokens.transition.tooltipIn,
  in: motionTokens.transition.tooltipIn,
};

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

const LAYER_STYLE: Record<string, string> = Object.fromEntries(
  LAYOUT_KEYS.map((key) => [key, 'inherit']),
);

const VIEWPORT_STYLE = {
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  borderRadius: 'inherit',
  pointerEvents: 'none',
};

class ContentSwap {
  private layer: HTMLElement | null = null;
  private viewport: HTMLElement | null = null;
  private anchor: [number, number] = [0.5, 1];
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

  setLayer(el: HTMLElement | null) {
    if (!el) this.reset();
    this.layer = el;
  }

  setViewport(el: HTMLElement | null) {
    this.viewport = el;
  }

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
      frame.postRender(this.tick, true);
    }
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
    const [sx, sy] = this.layoutScale(popup);
    const values = readValues(this.current.values);
    this.draw(layer, values, sx, sy);
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

  private layoutScale(popup: HTMLElement): [number, number] {
    const transform = popup.style.transform;
    if (!transform || transform === 'none') return [1, 1];
    const rect = popup.getBoundingClientRect();
    const own = this.popupScale() || 1;
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

type TooltipProviderProps = {
  id?: string;
  openDelay?: number;
  closeDelay?: number;
  transition?: Transition;
};

/** Shares one tooltip between its triggers: it moves from one to the next. */
const TooltipProvider = defineComponent({
  name: 'TooltipProvider',
  props: {
    id: String,
    openDelay: { type: Number, default: 0 },
    closeDelay: { type: Number, default: 300 },
    transition: {
      type: Object as PropType<Transition>,
      default: () => TOOLTIP_TRANSITION,
    },
  },
  setup(props, { slots }) {
    const transition = useTempoTransition(() => props.transition);
    const globalId = useId();
    const currentTooltip = shallowRef<TooltipData | null>(null);
    let timeout: number | null = null;
    let lastCloseTime = 0;
    const referenceEl = shallowRef<HTMLElement | null>(null);

    const showTooltip = (data: TooltipData) => {
      if (timeout) clearTimeout(timeout);
      if (currentTooltip.value !== null) {
        currentTooltip.value = data;
        return;
      }
      const delay =
        Date.now() - lastCloseTime < props.closeDelay ? 0 : props.openDelay;
      timeout = window.setTimeout(() => (currentTooltip.value = data), delay);
    };

    const hideTooltip = () => {
      if (timeout) clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        currentTooltip.value = null;
        lastCloseTime = Date.now();
      }, props.closeDelay);
    };

    const hideImmediate = () => {
      if (timeout) clearTimeout(timeout);
      currentTooltip.value = null;
      lastCloseTime = Date.now();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hideImmediate();
    };
    onMounted(() => {
      window.addEventListener('keydown', onKeyDown, true);
      window.addEventListener('scroll', hideImmediate, true);
      window.addEventListener('resize', hideImmediate, true);
    });
    onBeforeUnmount(() => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('scroll', hideImmediate, true);
      window.removeEventListener('resize', hideImmediate, true);
      if (timeout) clearTimeout(timeout);
    });

    provide(GlobalTooltipKey, {
      showTooltip,
      hideTooltip,
      hideImmediate,
      currentTooltip,
      transition,
      globalId: () => props.id ?? globalId,
      referenceEl,
    });

    return () =>
      h(ReducedMotionConfig, null, () => [
        h(LayoutGroup as Component, null, slots),
        h(TooltipOverlay),
      ]);
  },
});

type RenderedTooltipContextType = {
  side: () => Side;
  align: () => Align;
  open: () => boolean;
  positioned: () => boolean;
  placement: () => string;
  arrow: () => { x?: number; y?: number } | undefined;
  shifted: () => { x?: number; y?: number } | undefined;
  arrowEl: Ref<SVGSVGElement | null>;
};

const RenderedTooltipKey: InjectionKey<RenderedTooltipContextType> = Symbol(
  'AnimateUIRenderedTooltip',
);

type ArrowProps = Record<string, unknown> & { withTransition?: boolean };

const ArrowSlotKey: InjectionKey<(props: ArrowProps | null) => void> = Symbol(
  'AnimateUITooltipArrowSlot',
);

const ARROW_WIDTH = 14;
const ARROW_HEIGHT = 7;
const ARROW_PATH = `M0,0 H${ARROW_WIDTH} L${ARROW_WIDTH / 2},${ARROW_HEIGHT} Q${ARROW_WIDTH / 2},${ARROW_HEIGHT} ${ARROW_WIDTH / 2},${ARROW_HEIGHT} Z`;
const ARROW_ROTATION = { top: 0, right: 90, bottom: 180, left: -90 } as const;

const TooltipArrowImpl = defineComponent({
  name: 'TooltipArrowImpl',
  inheritAttrs: false,
  props: {
    withTransition: { type: Boolean, default: true },
  },
  setup(props, { attrs }) {
    const rendered = inject(RenderedTooltipKey)!;
    const { transition } = useGlobalTooltip();
    return () => {
      const [side, alignment] = rendered.placement().split('-') as [
        Side,
        Align | undefined,
      ];
      const shifted = rendered.shifted();
      const vertical = side === 'top' || side === 'bottom';
      const staticOffset =
        (vertical && shifted?.x) || (!vertical && shifted?.y)
          ? null
          : undefined;
      const arrow = rendered.arrow();
      const xOffsetProp =
        staticOffset && alignment === 'end' ? 'right' : 'left';
      const yOffsetProp =
        staticOffset && alignment === 'end' ? 'bottom' : 'top';
      return h(
        motion.svg as Component,
        {
          'aria-hidden': 'true',
          width: ARROW_WIDTH,
          height: ARROW_WIDTH,
          viewBox: `0 0 ${ARROW_WIDTH} ${ARROW_WIDTH}`,
          'data-state': rendered.open() ? 'open' : 'closed',
          'data-side': rendered.side(),
          'data-align': rendered.align(),
          'data-slot': 'tooltip-arrow',
          transition: props.withTransition ? transition.value : undefined,
          ...attrs,
          ref: (node: unknown) => {
            const element =
              (node as { $el?: unknown } | null)?.$el ?? node ?? null;
            rendered.arrowEl.value =
              element instanceof SVGSVGElement ? element : null;
          },
          style: [
            {
              position: 'absolute',
              pointerEvents: 'none',
              [xOffsetProp]: arrow?.x != null ? `${arrow.x}px` : '',
              [yOffsetProp]: arrow?.y != null ? `${arrow.y}px` : '',
              [side]: vertical ? '100%' : 'calc(100% - 0px)',
              rotate: ARROW_ROTATION[rendered.side()],
            },
            attrs.style,
          ],
        },
        h('path', { d: ARROW_PATH }),
      );
    };
  },
});

type TooltipArrowProps = {
  withTransition?: boolean;
};

/** An arrow pointing at the trigger. Put it in `TooltipContent`. */
const TooltipArrow = defineComponent({
  name: 'TooltipArrow',
  inheritAttrs: false,
  props: {
    withTransition: { type: Boolean, default: true },
  },
  setup(props, { attrs }) {
    const register = inject(ArrowSlotKey, null);
    const push = () =>
      register?.({ ...attrs, withTransition: props.withTransition });
    onMounted(push);
    onUpdated(push);
    onBeforeUnmount(() => register?.(null));
    return () =>
      register
        ? null
        : h(TooltipArrowImpl, {
            ...attrs,
            withTransition: props.withTransition,
          });
  },
});

const elementOf = (node: unknown) => {
  const element = (node as { $el?: unknown } | null)?.$el ?? node;
  return element instanceof HTMLElement ? element : null;
};

const TooltipOverlay = defineComponent({
  name: 'TooltipOverlay',
  setup() {
    const { currentTooltip, transition, globalId, referenceEl } =
      useGlobalTooltip();
    const reduce = useShouldReduceMotion();
    const rendered = shallowRef<{ data: TooltipData | null; open: boolean }>({
      data: null,
      open: false,
    });
    const arrowEl = shallowRef<SVGSVGElement | null>(null);
    const arrowProps = shallowRef<ArrowProps | null>(null);
    const registerArrow = (props: ArrowProps | null) => {
      if (!shallowEqualProps(arrowProps.value, props)) arrowProps.value = props;
    };

    const popupScale = useMotionValue(motionTokens.scale.tooltip);
    const swapOut = useTempoTransition(() => SWAP_TIMINGS.out);
    const swapMove = useTempoTransition(() => SWAP_TIMINGS.move);
    const swapIn = useTempoTransition(() => SWAP_TIMINGS.in);
    const swap = new ContentSwap();

    const reference = shallowRef<HTMLElement | null>(null);
    const floating = shallowRef<HTMLElement | null>(null);
    const side = () => rendered.value.data?.side ?? 'top';
    const align = () => rendered.value.data?.align ?? 'center';
    const { x, y, strategy, placement, middlewareData, isPositioned, update } =
      useFloating(reference, floating, {
        open: () => rendered.value.data !== null,
        placement: () =>
          (align() === 'center' ? side() : `${side()}-${align()}`) as Side,
        whileElementsMounted: autoUpdate,
        middleware: () => [
          floatingOffset({
            mainAxis: rendered.value.data?.sideOffset ?? 0,
            crossAxis: rendered.value.data?.alignOffset ?? 0,
          }),
          flip(),
          shift({ padding: 8 }),
          floatingArrow({ element: arrowEl }),
        ],
      });

    watch(currentTooltip, (next) => {
      const previous = rendered.value;
      if (next) {
        if (
          previous.data &&
          previous.data.id !== next.id &&
          isPositioned.value &&
          !reduce.value
        )
          swap.capture(
            previous.data.id,
            wayBetween(previous.data.rect, next.rect),
          );
        rendered.value = { data: next, open: true };
      } else if (previous.data) rendered.value = { ...previous, open: false };
    });

    watch(
      () => rendered.value.data?.id,
      (id) => swap.commit(id),
      { flush: 'post' },
    );

    watch(reduce, (value) => {
      if (value) swap.reset();
    });

    watch(
      () => rendered.value.data,
      () => {
        if (referenceEl.value) {
          reference.value = referenceEl.value;
          update();
        }
      },
      { flush: 'post' },
    );

    provide(ArrowSlotKey, registerArrow);
    provide(RenderedTooltipKey, {
      side: () => getResolvedSide(placement.value as Side),
      align: () => rendered.value.data?.align ?? 'center',
      open: () => rendered.value.open,
      positioned: () => isPositioned.value,
      placement: () => placement.value,
      arrow: () => middlewareData.value.arrow,
      shifted: () => middlewareData.value.shift,
      arrowEl,
    });

    const setLayer = (node: unknown) => swap.setLayer(elementOf(node));
    const setViewport = (node: unknown) => swap.setViewport(elementOf(node));

    return () => {
      const data = rendered.value.data;
      if (!data) return null;
      const resolvedSide = getResolvedSide(placement.value as Side);
      const resolvedAlign =
        (placement.value.split('-')[1] as Align | undefined) ?? 'center';
      const origin = originFor(resolvedSide, resolvedAlign);
      swap.configure({
        anchor: [origin.originX, origin.originY],
        popupScale: () => popupScale.get(),
        timing: () => ({
          out: swapOut.value,
          move: swapMove.value,
          in: swapIn.value,
        }),
      });

      const {
        onAnimationComplete: onContentAnimationComplete,
        style: contentStyle,
        ...restContentProps
      } = data.contentProps;
      const wrap = (children: unknown) => [
        arrowProps.value ? h(TooltipArrowImpl, arrowProps.value) : null,
        h(
          'div',
          {
            ref: setLayer,
            'data-slot': 'tooltip-content-layer',
            style: LAYER_STYLE,
          },
          children as VNode[],
        ),
        h('div', {
          ref: setViewport,
          'data-slot': 'tooltip-content-swap',
          'aria-hidden': 'true',
          style: VIEWPORT_STYLE,
        }),
      ];
      const slotted = data.contentSlot?.() ?? [];
      const asChildElement = data.contentAsChild
        ? slotted.find(
            (node) =>
              isVNode(node) &&
              node.type !== Comment &&
              node.type !== Fragment &&
              typeof node.type !== 'symbol',
          )
        : undefined;
      const children = asChildElement
        ? h(
            asChildElement.type as Component,
            asChildElement.props,
            wrap(asChildElement.children),
          )
        : wrap(slotted);

      const hidden = {
        opacity: 0,
        scale: reduce.value ? 1 : motionTokens.scale.tooltip,
      };
      const open = rendered.value.open;

      return h(Teleport, { to: 'body' }, [
        h(
          'div',
          {
            ref: (node: unknown) => {
              floating.value = elementOf(node);
            },
            'data-slot': 'tooltip-overlay',
            'data-side': resolvedSide,
            'data-align': data.align,
            'data-state': open ? 'open' : 'closed',
            style: {
              position: strategy.value,
              top: 0,
              left: 0,
              zIndex: 50,
              transform: `translate3d(${x.value}px, ${y.value}px, 0)`,
              visibility: isPositioned.value ? undefined : 'hidden',
            },
          },
          [
            h(
              (asChildElement ? Slot : motion.div) as Component,
              {
                key: isPositioned.value ? 'positioned' : 'measuring',
                id: contentIdOf(data.id),
                role: 'tooltip',
                'data-slot': 'tooltip-content',
                'data-side': resolvedSide,
                'data-align': data.align,
                'data-state': open ? 'open' : 'closed',
                layoutId: isPositioned.value
                  ? `tooltip-content-${globalId()}`
                  : undefined,
                initial: hidden,
                animate: open
                  ? { opacity: 1, scale: 1, transition: transition.value }
                  : { ...hidden, transition: transition.value },
                exit: { ...hidden, transition: transition.value },
                transition: transition.value,
                ...restContentProps,
                onAnimationComplete: (definition: unknown) => {
                  callHandler(onContentAnimationComplete, definition as Event);
                  if (!rendered.value.open)
                    rendered.value = { data: null, open: false };
                },
                style: [
                  { position: 'relative', scale: popupScale, ...origin },
                  contentStyle,
                ],
              },
              () => children,
            ),
          ],
        ),
      ]);
    };
  },
});

type TooltipProps = {
  side?: Side;
  sideOffset?: number;
  align?: Align;
  alignOffset?: number;
};

/** One tooltip: its trigger and its content. */
const Tooltip = defineComponent({
  name: 'Tooltip',
  props: {
    side: { type: String as PropType<Side>, default: 'top' },
    sideOffset: { type: Number, default: 10 },
    align: { type: String as PropType<Align>, default: 'center' },
    alignOffset: { type: Number, default: 0 },
  },
  setup(props, { slots }) {
    const id = useId();
    const content = shallowRef<TooltipContent>({
      props: {},
      slot: undefined,
      asChild: false,
    });
    provide(TooltipKey, {
      content,
      side: () => props.side,
      sideOffset: () => props.sideOffset,
      align: () => props.align,
      alignOffset: () => props.alignOffset,
      id,
    });
    return () => slots.default?.();
  },
});

type TooltipContentProps = {
  asChild?: boolean;
};

/** What the tooltip shows. It renders in the provider's shared tooltip. */
const TooltipContent = defineComponent({
  name: 'TooltipContent',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
  },
  setup(props, { attrs, slots }) {
    const { content } = useTooltip();
    const push = () => {
      const next = { ...attrs };
      const current = content.value;
      if (
        shallowEqualProps(current.props, next) &&
        current.slot === slots.default &&
        current.asChild === props.asChild
      )
        return;
      content.value = {
        props: next,
        slot: slots.default,
        asChild: props.asChild,
      };
    };
    push();
    onUpdated(push);
    return () => null;
  },
});

type TooltipTriggerProps = {
  asChild?: boolean;
};

/** What opens the tooltip, on hover or focus. */
const TooltipTrigger = defineComponent({
  name: 'TooltipTrigger',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
  },
  setup(props, { attrs, slots }) {
    const tooltip = useTooltip();
    const {
      showTooltip,
      hideTooltip,
      hideImmediate,
      currentTooltip,
      referenceEl,
    } = useGlobalTooltip();
    const trigger = shallowRef<HTMLElement | null>(null);
    let suppressNextFocus = false;

    const handleOpen = () => {
      if (!trigger.value) return;
      referenceEl.value = trigger.value;
      const { props: contentProps, slot, asChild } = tooltip.content.value;
      showTooltip({
        contentProps,
        contentSlot: slot,
        contentAsChild: asChild,
        rect: trigger.value.getBoundingClientRect(),
        side: tooltip.side(),
        sideOffset: tooltip.sideOffset(),
        align: tooltip.align(),
        alignOffset: tooltip.alignOffset(),
        id: tooltip.id,
      });
    };

    const isOpen = () => currentTooltip.value?.id === tooltip.id;

    watch(
      () => [
        tooltip.content.value,
        tooltip.side(),
        tooltip.sideOffset(),
        tooltip.align(),
        tooltip.alignOffset(),
      ],
      () => {
        if (isOpen()) handleOpen();
      },
    );

    onBeforeUnmount(() => {
      if (isOpen()) hideImmediate();
    });

    return () => {
      const open = isOpen();
      return h(
        (props.asChild ? Slot : motion.div) as Component,
        {
          'aria-describedby': open ? contentIdOf(tooltip.id) : undefined,
          'data-slot': 'tooltip-trigger',
          'data-side': tooltip.side(),
          'data-align': tooltip.align(),
          'data-state': open ? 'open' : 'closed',
          ...attrs,
          ref: (node: unknown) => {
            trigger.value = elementOf(node);
          },
          onPointerdown: (e: PointerEvent) => {
            callHandler(attrs.onPointerdown, e);
            if (isOpen()) {
              suppressNextFocus = true;
              hideImmediate();
              Promise.resolve().then(() => {
                suppressNextFocus = false;
              });
            }
          },
          onMouseenter: (e: MouseEvent) => {
            callHandler(attrs.onMouseenter, e);
            handleOpen();
          },
          onMouseleave: (e: MouseEvent) => {
            callHandler(attrs.onMouseleave, e);
            hideTooltip();
          },
          // focusin/focusout: a focus inside the trigger counts, as in React.
          onFocusin: (e: FocusEvent) => {
            callHandler(attrs.onFocusin, e);
            if (suppressNextFocus) return;
            handleOpen();
          },
          onFocusout: (e: FocusEvent) => {
            callHandler(attrs.onFocusout, e);
            hideTooltip();
          },
        },
        slots,
      );
    };
  },
});

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
