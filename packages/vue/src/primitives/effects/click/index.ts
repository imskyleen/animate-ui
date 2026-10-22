import {
  defineComponent,
  Fragment,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  Teleport,
  watch,
  type Component,
  type PropType,
  type VNode,
} from 'vue';
import { AnimatePresence, motion } from 'motion-v';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '../../../utils/motion';

type ClickVariant = 'ripple' | 'ring' | 'crosshair' | 'burst' | 'particles';

type Item = {
  id: string;
  x: number;
  y: number;
  variant: ClickVariant;
  color: string;
  size: number;
  duration: number;
};

type ClickProps = {
  variant?: ClickVariant;
  color?: string;
  size?: number;
  duration?: number;
  scope?: HTMLElement | null;
  disabled?: boolean;
};

const M = motion as unknown as Record<string, Component>;

function ripple(item: Item) {
  const r = item.size;
  return h(M.div!, {
    key: item.id,
    initial: { opacity: 1, scale: 0.2 },
    animate: { opacity: 0, scale: 1 },
    exit: { opacity: 0 },
    transition: { duration: item.duration / 1000, ease: 'easeOut' },
    style: {
      position: 'fixed',
      left: `${item.x - r / 2}px`,
      top: `${item.y - r / 2}px`,
      width: `${r}px`,
      height: `${r}px`,
      borderRadius: '9999px',
      background: item.color,
      boxShadow: `0 0 0 2px ${item.color} inset`,
      willChange: 'transform, opacity',
    },
  });
}

function svg(
  item: Item,
  half: number,
  extra: Record<string, unknown>,
  children: VNode[],
) {
  const box = half * 2;
  return h(
    M.svg!,
    {
      key: item.id,
      style: {
        position: 'fixed',
        left: `${item.x - half}px`,
        top: `${item.y - half}px`,
        width: `${box}px`,
        height: `${box}px`,
        display: 'block',
        overflow: 'visible',
        pointerEvents: 'none',
        ...extra,
      },
      viewBox: `0 0 ${box} ${box}`,
    },
    () => children,
  );
}

function ring(item: Item) {
  const d = item.duration / 1000;
  const rEnd = Math.max(item.size / 1.5, 50);
  const rStart = Math.max(Math.floor(rEnd * 0.2), 12);
  const strokeStart = Math.max(Math.floor(rEnd * 0.05), 2.5);
  return h(
    M.svg!,
    {
      key: item.id,
      style: {
        position: 'fixed',
        left: `${item.x - rEnd / 2}px`,
        top: `${item.y - rEnd / 2}px`,
        width: `${rEnd}px`,
        height: `${rEnd}px`,
        display: 'block',
        overflow: 'visible',
      },
      viewBox: `0 0 ${rEnd} ${rEnd}`,
    },
    () =>
      h(M.circle!, {
        cx: rEnd / 2,
        cy: rEnd / 2,
        fill: 'none',
        stroke: item.color,
        initial: { r: rStart, strokeWidth: strokeStart },
        animate: { r: rEnd, strokeWidth: 0 },
        transition: { duration: d, ease: 'easeOut' },
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }),
  );
}

function crosshair(item: Item) {
  const d = item.duration / 1000;
  const distanceEnd = Math.max(item.size * 0.65, 56);
  const gapStart = Math.max(item.size * 0.05, 3);
  const lenStart = Math.max(item.size * 0.26, 16);
  const lenEnd = Math.max(lenStart * 0.55, 6);
  const strokeWidth = Math.max(item.size * 0.065, 2);
  const half = distanceEnd + gapStart + lenStart;
  const cx = half;
  const cy = half;
  const dirs = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
  ];
  return svg(
    item,
    half,
    { rotate: '-25deg', strokeWidth: `${strokeWidth}px` },
    dirs.map((dir, i) =>
      h(M.line!, {
        key: i,
        x1: cx + dir.dx * gapStart,
        y1: cy + dir.dy * gapStart,
        x2: cx + dir.dx * (gapStart + lenStart),
        y2: cy + dir.dy * (gapStart + lenStart),
        initial: { pathLength: 1, scale: 1 },
        animate: {
          x1: cx + dir.dx * distanceEnd,
          y1: cy + dir.dy * distanceEnd,
          x2: cx + dir.dx * (distanceEnd + lenEnd),
          y2: cy + dir.dy * (distanceEnd + lenEnd),
          pathLength: 0,
          scale: 0,
        },
        transition: { duration: d, ease: [0, 0, 0.7, 1] },
        stroke: item.color,
      }),
    ),
  );
}

function burst(item: Item) {
  const d = item.duration / 1000;
  const rStart = Math.max(item.size * 0.4, 36);
  const rEnd = Math.max(item.size * 0.65, 56);
  const segCount = 4;
  const lenStart = Math.max(item.size * 0.2, 14);
  const lenEnd = Math.max(lenStart * 0.5, 6);
  const strokeWidth = Math.max(item.size * 0.05, 1.5);
  const startDeg = 180;
  const endDeg = 270;
  const half = rEnd + lenStart;
  const cx = half;
  const cy = half;
  return svg(
    item,
    half,
    { strokeWidth: `${strokeWidth}px` },
    Array.from({ length: segCount }, (_, i) => {
      const t = i / Math.max(1, segCount - 1);
      const th = ((startDeg + (endDeg - startDeg) * t) * Math.PI) / 180;
      const ux = Math.cos(th);
      const uy = Math.sin(th);
      const c0x = cx + ux * rStart;
      const c0y = cy + uy * rStart;
      const c1x = cx + ux * rEnd;
      const c1y = cy + uy * rEnd;
      return h(M.line!, {
        key: i,
        x1: c0x - ux * (lenStart / 2),
        y1: c0y - uy * (lenStart / 2),
        x2: c0x + ux * (lenStart / 2),
        y2: c0y + uy * (lenStart / 2),
        initial: { pathLength: 1, scale: 1 },
        animate: {
          x1: [
            c0x - ux * (lenStart / 2),
            c1x - ux * (lenEnd / 2),
            c1x - ux * (lenEnd / 2),
          ],
          y1: [
            c0y - uy * (lenStart / 2),
            c1y - uy * (lenEnd / 2),
            c1y - uy * (lenEnd / 2),
          ],
          x2: [
            c0x + ux * (lenStart / 2),
            c1x + ux * (lenEnd / 2),
            c1x + ux * (lenEnd / 2),
          ],
          y2: [
            c0y + uy * (lenStart / 2),
            c1y + uy * (lenEnd / 2),
            c1y + uy * (lenEnd / 2),
          ],
          pathLength: [1, 0.5, 0.5],
          scale: [1, 1, 0],
        },
        transition: { duration: d, ease: 'easeInOut', times: [0, 0.7, 1] },
        stroke: item.color,
      });
    }),
  );
}

function particles(item: Item) {
  const d = item.duration / 1000;
  const count = 6;
  const radius = item.size * 0.35;
  const r0 = Math.max(item.size * 0.025, 2);
  const half = radius + r0 * 2;
  const cx = half;
  const cy = half;
  const angleStep = (2 * Math.PI) / count;
  return svg(
    item,
    half,
    {},
    Array.from({ length: count }, (_, i) => {
      const angle = i * angleStep;
      return h(M.circle!, {
        key: i,
        cx,
        cy,
        r: r0,
        fill: item.color,
        initial: { scale: 0, opacity: 0 },
        animate: {
          cx: cx + Math.cos(angle) * radius,
          cy: cy + Math.sin(angle) * radius,
          scale: [0, 1, 0],
          opacity: [0, 1, 0],
        },
        transition: { duration: d, delay: i * (d * 0.08), ease: 'easeOut' },
      });
    }),
  );
}

const RENDERERS: Record<ClickVariant, (item: Item) => VNode> = {
  ripple,
  ring,
  crosshair,
  burst,
  particles,
};

const ClickInner = defineComponent({
  name: 'ClickInner',
  props: {
    variant: { type: String as PropType<ClickVariant>, default: 'ring' },
    color: { type: String, default: 'currentColor' },
    size: { type: Number, default: 100 },
    duration: { type: Number, default: 400 },
    scope: Object as PropType<HTMLElement | null>,
    disabled: Boolean,
  },
  setup(props, { slots }) {
    const items = ref<Item[]>([]);
    const mounted = ref(false);
    onMounted(() => (mounted.value = true));
    const reduce = useShouldReduceMotion();
    let nextId = 0;
    const timers = new Set<number>();
    onBeforeUnmount(() => timers.forEach((timer) => clearTimeout(timer)));

    watch(
      () =>
        [
          props.scope,
          props.variant,
          props.color,
          props.size,
          props.duration,
          props.disabled,
          reduce.value,
          mounted.value,
        ] as const,
      (
        [scope, variant, color, size, duration, disabled, isReduced, isMounted],
        _,
        onCleanup,
      ) => {
        if (disabled || isReduced || !isMounted) return;
        const target: Document | HTMLElement = scope ?? document;
        const onPointerUp = (event: PointerEvent) => {
          if (!(target instanceof Document)) {
            const rect = target.getBoundingClientRect();
            if (
              event.clientX < rect.left ||
              event.clientX > rect.right ||
              event.clientY < rect.top ||
              event.clientY > rect.bottom
            )
              return;
          }
          const id = String(nextId++);
          items.value = [
            ...items.value,
            {
              id,
              x: event.clientX,
              y: event.clientY,
              variant,
              color,
              size,
              duration,
            },
          ];
          const timer = window.setTimeout(() => {
            timers.delete(timer);
            items.value = items.value.filter((it) => it.id !== id);
          }, duration + 300);
          timers.add(timer);
        };
        target.addEventListener('pointerup', onPointerUp as EventListener, {
          passive: true,
        });
        onCleanup(() =>
          target.removeEventListener('pointerup', onPointerUp as EventListener),
        );
      },
      { immediate: true },
    );

    return () =>
      h(Fragment, [
        slots.default?.(),
        mounted.value
          ? h(Teleport, { to: 'body' }, [
              h(
                'div',
                {
                  style: {
                    position: 'fixed',
                    inset: '0',
                    pointerEvents: 'none',
                    zIndex: 9999999999,
                  },
                },
                h(AnimatePresence as Component, { initial: false }, () =>
                  items.value.map((item) => RENDERERS[item.variant](item)),
                ),
              ),
            ])
          : null,
      ]);
  },
});

/** A mark drawn where the pointer clicks: a ring, ripple, burst or particles. */
const Click = defineComponent({
  name: 'Click',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(ClickInner as Component, attrs, slots),
      );
  },
});

export { Click, type ClickProps, type ClickVariant };
