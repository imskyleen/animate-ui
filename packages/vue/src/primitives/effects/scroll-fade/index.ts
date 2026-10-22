import {
  cloneVNode,
  defineComponent,
  h,
  isVNode,
  Fragment,
  mergeProps,
  shallowRef,
  watch,
  type PropType,
  type Ref,
  type VNode,
} from 'vue';
import {
  animate,
  cancelFrame,
  frame,
  motionValue,
  type MotionValue,
  type Transition,
} from 'motion-v';

import { screenScale } from '../../../internal/screen-scale';
import {
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';

const SETTLE = motionTokens.transition.fade;

type ScrollFadeOrientation = 'vertical' | 'horizontal' | 'both';

type ScrollFadeEdge = 'top' | 'bottom' | 'left' | 'right';

type UseScrollFadeOptions = {
  orientation?: ScrollFadeOrientation;
  size?: number;
  shrink?: number;
  blur?: number;
  transition?: Transition;
  enabled?: boolean;
};

type ScrollFadeValues = Record<ScrollFadeEdge, MotionValue<number>>;

const EDGES: ScrollFadeEdge[] = ['top', 'bottom', 'left', 'right'];

const VAR = {
  top: '--scroll-fade-top',
  bottom: '--scroll-fade-bottom',
  left: '--scroll-fade-left',
  right: '--scroll-fade-right',
  size: '--scroll-fade-size',
} as const;

const edgeStop = (edge: ScrollFadeEdge) =>
  `rgb(0 0 0 / calc(1 - var(${VAR[edge]}, 0)))`;
const depth = (edge: ScrollFadeEdge) =>
  `calc(var(${VAR.size}) * min(1, var(${VAR[edge]}, 0) * 1000))`;

const GRADIENT_Y = `linear-gradient(to bottom, ${edgeStop('top')} 0, #000 ${depth('top')}, #000 calc(100% - ${depth('bottom')}), ${edgeStop('bottom')} 100%)`;
const GRADIENT_X = `linear-gradient(to right, ${edgeStop('left')} 0, #000 ${depth('left')}, #000 calc(100% - ${depth('right')}), ${edgeStop('right')} 100%)`;

const MASKS: Record<ScrollFadeOrientation, string> = {
  vertical: GRADIENT_Y,
  horizontal: GRADIENT_X,
  both: `${GRADIENT_Y}, ${GRADIENT_X}`,
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => value * value * (3 - 2 * value);

const ZONE = 1.75;
const GESTURE_GAP = 150;

type ItemSlot = { item: HTMLElement; x: number; y: number; ownFilter: boolean };

const GROUP = 'ul, ol, [role="list"], [role="group"]';

function collectItems(parent: Element, items: HTMLElement[]) {
  for (const child of parent.children) {
    if (!(child instanceof HTMLElement)) continue;
    const isGroup =
      child.matches(GROUP) ||
      Array.from(child.children).some((inner) => inner.matches(GROUP));
    if (isGroup) collectItems(child, items);
    else items.push(child);
  }
  return items;
}

function itemsOf(el: HTMLElement) {
  let parent: Element = el;
  while (parent.children.length === 1) parent = parent.children[0]!;
  return collectItems(parent, []);
}

function setMask(el: HTMLElement, mask: string | null) {
  const style = el.style;
  if (mask) {
    style.setProperty('mask-image', mask);
    style.setProperty('-webkit-mask-image', mask);
    style.setProperty('mask-composite', 'intersect');
    style.setProperty('-webkit-mask-composite', 'source-in');
  } else {
    for (const property of [
      'mask-image',
      '-webkit-mask-image',
      'mask-composite',
      '-webkit-mask-composite',
    ])
      style.removeProperty(property);
  }
}

/** Fades (and shrinks, and blurs) the edges where a scroll area overflows. */
function useScrollFade(
  element: Ref<HTMLElement | null>,
  options: () => UseScrollFadeOptions = () => ({}),
): ScrollFadeValues {
  const reduce = useShouldReduceMotion();
  const settle = useTempoTransition(() => options().transition ?? SETTLE);
  const values: ScrollFadeValues = {
    top: motionValue(0),
    bottom: motionValue(0),
    left: motionValue(0),
    right: motionValue(0),
  };

  watch(
    () => {
      const o = options();
      return [
        element.value,
        o.enabled ?? true,
        o.orientation ?? 'vertical',
        o.size ?? 40,
        o.shrink ?? 0.03,
        o.blur ?? 4,
      ] as const;
    },
    ([el, enabled, orientation, size, shrink, blur], _, onCleanup) => {
      if (!el || !enabled) return;
      const vertical = orientation !== 'horizontal';
      const horizontal = orientation !== 'vertical';
      const mask = MASKS[orientation];
      let masked = false;

      el.style.setProperty(VAR.size, `${size}px`);

      const shrunk = new Set<HTMLElement>();
      const blurred = new Set<HTMLElement>();
      const restore = () => {
        for (const item of shrunk) item.style.removeProperty('scale');
        for (const item of blurred) item.style.removeProperty('filter');
        shrunk.clear();
        blurred.clear();
      };

      let slots: ItemSlot[] = [];
      let width = 0;
      let height = 0;
      const measureItems = () => {
        if (!shrink && !blur) {
          slots = [];
          return;
        }
        const box = el.getBoundingClientRect();
        const [sx, sy] = screenScale(el);
        width = el.clientWidth;
        height = el.clientHeight;
        slots = itemsOf(el).map((item) => {
          const rect = item.getBoundingClientRect();
          return {
            item,
            x: (rect.left + rect.width / 2 - box.left) / sx + el.scrollLeft,
            y: (rect.top + rect.height / 2 - box.top) / sy + el.scrollTop,
            ownFilter:
              !blurred.has(item) && getComputedStyle(item).filter !== 'none',
          };
        });
      };

      const zone = size * ZONE;
      const reach = (distance: number) =>
        zone > 0 ? smooth(clamp01(1 - distance / zone)) : 0;

      let dirty = true;
      const paintItems = () => {
        if (dirty) {
          dirty = false;
          measureItems();
        }
        const scale = reduce.value ? 0 : shrink;
        if (!slots.length || (!scale && !blur)) return restore();
        const scrollX = el.scrollLeft;
        const scrollY = el.scrollTop;
        for (const { item, x, y, ownFilter } of slots) {
          let depth = 0;
          if (vertical) {
            const center = y - scrollY;
            depth = Math.max(
              reach(center) * values.top.get(),
              reach(height - center) * values.bottom.get(),
            );
          }
          if (horizontal) {
            const center = x - scrollX;
            depth = Math.max(
              depth,
              reach(center) * values.left.get(),
              reach(width - center) * values.right.get(),
            );
          }
          if (depth > 0.001 && scale) {
            item.style.scale = String(1 - scale * depth);
            shrunk.add(item);
          } else if (shrunk.delete(item)) item.style.removeProperty('scale');
          if (depth > 0.001 && blur && !ownFilter) {
            item.style.filter = `blur(${(blur * depth).toFixed(2)}px)`;
            blurred.add(item);
          } else if (blurred.delete(item)) item.style.removeProperty('filter');
        }
      };

      let scheduled = false;
      const runPaint = () => {
        scheduled = false;
        paintItems();
      };
      const shrinkItems = () => {
        if (scheduled) return;
        scheduled = true;
        frame.render(runPaint);
      };

      const write = () => {
        let any = false;
        for (const edge of EDGES) {
          const amount = clamp01(values[edge].get());
          if (amount > 0.001) any = true;
          el.style.setProperty(VAR[edge], amount.toFixed(4));
        }
        if (any !== masked) {
          masked = any;
          setMask(el, any ? mask : null);
        }
        shrinkItems();
      };

      const unsubscribe = EDGES.map((edge) => values[edge].on('change', write));

      const ramp = size / 2;
      const amount = (distance: number) =>
        ramp > 0 ? clamp01(distance / ramp) : distance > 0.5 ? 1 : 0;

      const measure = (follow: boolean) => {
        const targets: Record<ScrollFadeEdge, number> = {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        };

        if (vertical) {
          const max = el.scrollHeight - el.clientHeight;
          if (max > 1) {
            targets.top = amount(el.scrollTop);
            targets.bottom = amount(max - el.scrollTop);
          }
        }

        if (horizontal) {
          const max = el.scrollWidth - el.clientWidth;
          if (max > 1) {
            const fromStart = Math.abs(el.scrollLeft);
            const fromEnd = max - fromStart;
            const rtl = getComputedStyle(el).direction === 'rtl';
            targets.left = amount(rtl ? fromEnd : fromStart);
            targets.right = amount(rtl ? fromStart : fromEnd);
          }
        }

        for (const edge of EDGES) {
          if (follow || reduce.value) values[edge].jump(targets[edge]);
          else if (Math.abs(values[edge].get() - targets[edge]) > 0.001)
            animate(values[edge], targets[edge], settle.value);
        }
        write();
      };

      measure(true);

      let lastScroll = 0;
      const onScroll = () => {
        const now = performance.now();
        if (now - lastScroll > GESTURE_GAP) dirty = true;
        lastScroll = now;
        measure(true);
      };
      el.addEventListener('scroll', onScroll, { passive: true });

      const resizeObserver = new ResizeObserver(() => {
        dirty = true;
        measure(false);
      });
      const observeChildren = () => {
        resizeObserver.disconnect();
        resizeObserver.observe(el);
        for (const child of el.children) resizeObserver.observe(child);
      };
      observeChildren();
      const mutationObserver = new MutationObserver((records) => {
        if (records.some((record) => record.target === el)) observeChildren();
        dirty = true;
        measure(false);
      });
      mutationObserver.observe(el, { childList: true, subtree: true });

      onCleanup(() => {
        el.removeEventListener('scroll', onScroll);
        cancelFrame(runPaint);
        resizeObserver.disconnect();
        mutationObserver.disconnect();
        unsubscribe.forEach((off) => off());
        setMask(el, null);
        restore();
        for (const name of Object.values(VAR)) el.style.removeProperty(name);
        for (const edge of EDGES) values[edge].jump(0);
      });
    },
    { flush: 'post', immediate: true },
  );

  return values;
}

type ScrollFadeProps = UseScrollFadeOptions & { asChild?: boolean };

const OVERFLOW: Record<ScrollFadeOrientation, Record<string, string>> = {
  vertical: { overflowY: 'auto' },
  horizontal: { overflowX: 'auto' },
  both: { overflow: 'auto' },
};

function firstElement(nodes: VNode[] | undefined): VNode | null {
  for (const node of nodes ?? []) {
    if (!isVNode(node)) continue;
    if (node.type === Fragment && Array.isArray(node.children)) {
      const inner = firstElement(node.children as VNode[]);
      if (inner) return inner;
    } else if (typeof node.type !== 'symbol') return node;
  }
  return null;
}

const elementOf = (node: unknown) => {
  const el = (node as { $el?: unknown } | null)?.$el ?? node;
  return el instanceof HTMLElement ? el : null;
};

/** A scroll area whose overflowing edges fade out. */
const ScrollFade = defineComponent({
  name: 'ScrollFade',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    orientation: {
      type: String as PropType<ScrollFadeOrientation>,
      default: 'vertical',
    },
    size: Number,
    shrink: Number,
    blur: Number,
    transition: Object as PropType<Transition>,
    enabled: { type: Boolean, default: true },
  },
  setup(props, { attrs, slots }) {
    const element = shallowRef<HTMLElement | null>(null);
    useScrollFade(element, () => ({
      orientation: props.orientation,
      size: props.size,
      shrink: props.shrink,
      blur: props.blur,
      transition: props.transition,
      enabled: props.enabled,
    }));
    const ref = (node: unknown) => {
      element.value = elementOf(node);
    };
    return () => {
      const shared = {
        'data-slot': 'scroll-fade',
        'data-orientation': props.orientation,
      };
      if (props.asChild) {
        const child = firstElement(slots.default?.());
        if (child) {
          const { style, ...rest } = attrs;
          return cloneVNode(
            child,
            mergeProps(shared, rest, {
              style: [OVERFLOW[props.orientation], child.props?.style, style],
              ref,
            }),
            true,
          );
        }
      }
      return h(
        'div',
        {
          ...shared,
          ...attrs,
          ref,
          style: [OVERFLOW[props.orientation], attrs.style],
        },
        slots.default?.(),
      );
    };
  },
});

export {
  ScrollFade,
  useScrollFade,
  type ScrollFadeProps,
  type ScrollFadeOrientation,
  type ScrollFadeValues,
  type UseScrollFadeOptions,
};
