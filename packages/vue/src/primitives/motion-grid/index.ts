import {
  computed,
  defineComponent,
  Fragment,
  h,
  inject,
  provide,
  ref,
  watchEffect,
  type Component,
  type InjectionKey,
  type PropType,
} from 'vue';
import { motion, useInView } from 'motion-v';

import { usePageVisible } from '../../utils/use-page-visible';
import { Slot } from '../slot';

type FrameDot = [number, number];
type Frame = FrameDot[];
type Frames = Frame[];

type MotionGridContextType = {
  index: () => number;
  cols: () => number;
  rows: () => number;
  frames: () => Frames;
  duration: () => number;
  animate: () => boolean;
};

const MotionGridKey: InjectionKey<MotionGridContextType> =
  Symbol('AnimateUIMotionGrid');

function useMotionGrid() {
  const context = inject(MotionGridKey, null);
  if (!context)
    throw new Error('MotionGridCells must be used within a MotionGrid');
  return context;
}

type MotionGridProps = {
  gridSize: [number, number];
  frames: Frames;
  duration?: number;
  animate?: boolean;
  asChild?: boolean;
};

const elementOf = (node: unknown) => {
  const element = (node as { $el?: unknown } | null)?.$el ?? node;
  return element instanceof HTMLElement ? element : null;
};

/** A grid of cells that lights up one frame after another. */
const MotionGrid = defineComponent({
  name: 'MotionGrid',
  inheritAttrs: false,
  props: {
    gridSize: {
      type: Array as unknown as PropType<[number, number]>,
      required: true,
    },
    frames: { type: Array as PropType<Frames>, required: true },
    duration: { type: Number, default: 200 },
    animate: { type: Boolean, default: true },
    asChild: Boolean,
  },
  setup(props, { attrs, slots }) {
    const index = ref(0);
    const element = ref<HTMLElement | null>(null);
    const inView = useInView(element);
    const pageVisible = usePageVisible();
    const playing = computed(
      () => props.animate && inView.value && pageVisible.value,
    );

    watchEffect((onCleanup) => {
      const count = props.frames.length;
      if (!playing.value || count === 0) return;
      const interval = setInterval(
        () => (index.value = (index.value + 1) % count),
        props.duration,
      );
      onCleanup(() => clearInterval(interval));
    });

    provide(MotionGridKey, {
      index: () => index.value,
      cols: () => props.gridSize[0],
      rows: () => props.gridSize[1],
      frames: () => props.frames,
      duration: () => props.duration,
      animate: () => props.animate,
    });

    return () =>
      h(
        (props.asChild ? Slot : motion.div) as Component,
        {
          'data-animate': props.animate,
          ...attrs,
          ref: (node: unknown) => {
            element.value = elementOf(node);
          },
          style: [
            {
              display: 'grid',
              gridTemplateColumns: `repeat(${props.gridSize[0]}, minmax(0, 1fr))`,
              gridAutoRows: '1fr',
            },
            attrs.style,
          ],
        },
        slots,
      );
  },
});

type CellProps = Record<string, unknown>;

type MotionGridCellsProps = {
  activeProps?: CellProps;
  inactiveProps?: CellProps;
};

/** The grid's cells: `data-active` on the ones the current frame lights. */
const MotionGridCells = defineComponent({
  name: 'MotionGridCells',
  inheritAttrs: false,
  props: {
    activeProps: Object as PropType<CellProps>,
    inactiveProps: Object as PropType<CellProps>,
  },
  setup(props, { attrs }) {
    const grid = useMotionGrid();
    return () => {
      const cols = grid.cols();
      const active = new Set<number>(
        grid.frames()[grid.index()]?.map(([x, y]) => y * cols + x) ?? [],
      );
      return h(
        Fragment,
        Array.from({ length: cols * grid.rows() }, (_, i) => {
          const isActive = active.has(i);
          const own = (isActive ? props.activeProps : props.inactiveProps) ?? {};
          return h(motion.div as Component, {
            key: i,
            'data-active': isActive,
            'data-animate': grid.animate(),
            transition: { duration: grid.duration() / 1000, ease: 'easeInOut' },
            ...attrs,
            ...own,
            class: [attrs.class, own.class],
            style: [attrs.style, own.style],
          });
        }),
      );
    };
  },
});

export {
  MotionGrid,
  MotionGridCells,
  type MotionGridProps,
  type MotionGridCellsProps,
  type FrameDot,
  type Frame,
  type Frames,
};
