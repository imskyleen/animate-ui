import {
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  toRef,
  watch,
  type Component,
  type InjectionKey,
  type PropType,
  type Ref,
} from 'vue';
import {
  motion,
  useMotionValue,
  useSpring as useMotionSpring,
  type MotionValue,
  type SpringOptions,
} from 'motion-v';

import { ReducedMotionConfig, useShouldReduceMotion } from '../../utils/motion';
import { Slot } from '../slot';

type SpringPathConfig = {
  coilCount?: number;
  amplitudeMin?: number;
  amplitudeMax?: number;
  curveRatioMin?: number;
  curveRatioMax?: number;
  bezierOffset?: number;
};

function generateSpringPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  pathConfig: SpringPathConfig = {},
) {
  const {
    coilCount = 8,
    amplitudeMin = 8,
    amplitudeMax = 20,
    curveRatioMin = 0.5,
    curveRatioMax = 1,
    bezierOffset = 8,
  } = pathConfig;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 2) return `M${x1},${y1}`;
  const d = dist / coilCount;
  const h = Math.max(0.8, 1 - (dist - 40) / 200);
  const amplitude = Math.max(
    amplitudeMin,
    Math.min(amplitudeMax, amplitudeMax * h),
  );
  const curveRatio =
    dist <= 40
      ? curveRatioMax
      : dist <= 120
        ? curveRatioMax - ((dist - 40) / 80) * (curveRatioMax - curveRatioMin)
        : curveRatioMin;
  const ux = dx / dist,
    uy = dy / dist;
  const perpX = -uy,
    perpY = ux;

  const path: string[] = [];
  for (let i = 0; i < coilCount; i++) {
    const sx = x1 + ux * (i * d);
    const sy = y1 + uy * (i * d);
    const ex = x1 + ux * ((i + 1) * d);
    const ey = y1 + uy * ((i + 1) * d);

    const mx = x1 + ux * ((i + 0.5) * d) + perpX * amplitude;
    const my = y1 + uy * ((i + 0.5) * d) + perpY * amplitude;

    const c1x = sx + d * curveRatio * ux;
    const c1y = sy + d * curveRatio * uy;
    const c2x = mx + ux * bezierOffset;
    const c2y = my + uy * bezierOffset;
    const c3x = mx - ux * bezierOffset;
    const c3y = my - uy * bezierOffset;
    const c4x = ex - d * curveRatio * ux;
    const c4y = ey - d * curveRatio * uy;

    if (i === 0) path.push(`M${sx},${sy}`);
    else path.push(`L${sx},${sy}`);
    path.push(`C${c1x},${c1y} ${c2x},${c2y} ${mx},${my}`);
    path.push(`C${c3x},${c3y} ${c4x},${c4y} ${ex},${ey}`);
  }
  return path.join(' ');
}

type SpringContextType = {
  child: Ref<HTMLElement | null>;
  springX: MotionValue<number>;
  springY: MotionValue<number>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  isDragging: Ref<boolean>;
  path: () => string;
};

const SpringKey: InjectionKey<SpringContextType> = Symbol('AnimateUISpring');

function useSpring() {
  const context = inject(SpringKey, null);
  if (!context)
    throw new Error('useSpring must be used within a SpringProvider');
  return context;
}

type SpringProviderProps = {
  pathConfig?: SpringPathConfig;
  transition?: SpringOptions;
};

/** Holds the dragged element and the spring drawn back to its place. */
const SpringProvider = defineComponent({
  name: 'SpringProvider',
  props: {
    pathConfig: {
      type: Object as PropType<SpringPathConfig>,
      default: () => ({}),
    },
    transition: {
      type: Object as PropType<SpringOptions>,
      default: () => ({ stiffness: 200, damping: 16 }),
    },
  },
  setup(props, { slots }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useMotionSpring(x, toRef(props, 'transition'));
    const springY = useMotionSpring(y, toRef(props, 'transition'));

    const sx = ref(springX.get());
    const sy = ref(springY.get());
    const stopX = springX.on('change', (value) => (sx.value = value));
    const stopY = springY.on('change', (value) => (sy.value = value));

    const child = ref<HTMLElement | null>(null);
    const center = ref({ x: 0, y: 0 });
    const isDragging = ref(false);

    const update = () => {
      if (!child.value) return;
      const rect = child.value.getBoundingClientRect();
      center.value = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    };
    onMounted(() => {
      update();
      window.addEventListener('resize', update);
      window.addEventListener('scroll', update, true);
    });
    onBeforeUnmount(() => {
      stopX();
      stopY();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      document.body.style.cursor = previousCursor;
    });

    let previousCursor = '';
    watch(isDragging, (dragging) => {
      if (dragging) {
        previousCursor = document.body.style.cursor;
        document.body.style.cursor = 'grabbing';
      } else document.body.style.cursor = previousCursor;
    });

    provide(SpringKey, {
      child,
      springX,
      springY,
      x,
      y,
      isDragging,
      path: () =>
        generateSpringPath(
          center.value.x,
          center.value.y,
          center.value.x + sx.value,
          center.value.y + sy.value,
          props.pathConfig,
        ),
    });

    return () => h(ReducedMotionConfig, null, slots);
  },
});

/** The spring: a coil drawn from the element's place to where it is. */
const Spring = defineComponent({
  name: 'Spring',
  inheritAttrs: false,
  setup(_, { attrs }) {
    const { path } = useSpring();
    return () =>
      h(
        'svg',
        {
          width: '100vw',
          height: '100vh',
          ...attrs,
          style: [
            { position: 'fixed', inset: 0, pointerEvents: 'none' },
            attrs.style,
          ],
        },
        h('path', {
          d: path(),
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          stroke: 'currentColor',
          'stroke-width': 2,
          fill: 'none',
        }),
      );
  },
});

type SpringElementProps = {
  asChild?: boolean;
};

const elementOf = (node: unknown) => {
  const element = (node as { $el?: unknown } | null)?.$el ?? node;
  return element instanceof HTMLElement ? element : null;
};

/** The element you drag: let go, it springs back. */
const SpringElement = defineComponent({
  name: 'SpringElement',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
  },
  setup(props, { attrs, slots }) {
    const { child, isDragging, springX, springY, x, y } = useSpring();
    const reduce = useShouldReduceMotion();
    return () =>
      h(
        (props.asChild ? Slot : motion.div) as Component,
        {
          drag: true,
          dragMomentum: false,
          onDragStart: () => {
            isDragging.value = true;
          },
          onDrag: (_: unknown, info: { offset: { x: number; y: number } }) => {
            x.set(info.offset.x);
            y.set(info.offset.y);
          },
          onDragEnd: () => {
            x.set(0);
            y.set(0);
            if (reduce.value) {
              springX.jump(0);
              springY.jump(0);
            }
            isDragging.value = false;
          },
          ...attrs,
          ref: (node: unknown) => {
            child.value = elementOf(node);
          },
          style: [
            {
              cursor: isDragging.value ? 'grabbing' : 'grab',
              x: springX,
              y: springY,
            },
            attrs.style,
          ],
        },
        slots,
      );
  },
});

export {
  SpringProvider,
  Spring,
  SpringElement,
  useSpring,
  type SpringProviderProps,
  type SpringElementProps,
  type SpringPathConfig,
  type SpringContextType,
};
