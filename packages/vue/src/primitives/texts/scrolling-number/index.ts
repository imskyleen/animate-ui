import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  provide,
  watch,
  type Component,
  type InjectionKey,
  type PropType,
} from 'vue';
import { animate, motion, motionValue, type Transition } from 'motion-v';

import { useIsInView } from '../../../utils/use-is-in-view';
import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { VISUALLY_HIDDEN } from '../_text';

const formatter = new Intl.NumberFormat('en-US');

function generateRange(
  max: number,
  step: number,
  sideItemsCount: number,
): number[] {
  const result: number[] = [];
  const end = max + sideItemsCount * step;
  for (let value = end; value >= 0; value -= step) {
    result.push(value);
  }
  return result;
}

type ScrollingNumberDirection = 'ltr' | 'rtl' | 'ttb' | 'btt';

type ScrollingNumberContextType = {
  number: () => number;
  step: () => number;
  itemsSize: () => number;
  sideItemsCount: () => number;
  displayedItemsCount: () => number;
  isInView: () => boolean;
  direction: () => ScrollingNumberDirection;
  isVertical: () => boolean;
  range: () => number[];
  onNumberChange: (value: number) => void;
};

const ScrollingNumberKey: InjectionKey<ScrollingNumberContextType> = Symbol(
  'AnimateUIScrollingNumber',
);

function useScrollingNumber() {
  const context = inject(ScrollingNumberKey, null);
  if (!context)
    throw new Error(
      'ScrollingNumber parts must be used within ScrollingNumberContainer',
    );
  return context;
}

type ScrollingNumberContainerProps = {
  number: number;
  step: number;
  itemsSize?: number;
  sideItemsCount?: number;
  direction?: ScrollingNumberDirection;
  inView?: boolean;
  inViewMargin?: string;
  inViewOnce?: boolean;
};

/** Holds the number, its step and how the numbers scroll by. */
const ScrollingNumberContainer = defineComponent({
  name: 'ScrollingNumberContainer',
  inheritAttrs: false,
  props: {
    number: { type: Number, required: true },
    step: { type: Number, required: true },
    itemsSize: { type: Number, default: 30 },
    sideItemsCount: { type: Number, default: 2 },
    direction: {
      type: String as PropType<ScrollingNumberDirection>,
      default: 'btt',
    },
    inView: Boolean,
    inViewMargin: { type: String, default: '0px' },
    inViewOnce: { type: Boolean, default: true },
  },
  emits: ['numberChange'],
  setup(props, { attrs, emit, slots }) {
    const step = computed(() => (props.step > 0 ? props.step : 1));
    const { element, isInView } = useIsInView(() => props);
    const displayedItemsCount = computed(() => 1 + props.sideItemsCount * 2);
    const isVertical = computed(
      () => props.direction === 'btt' || props.direction === 'ttb',
    );
    const range = computed(() =>
      generateRange(props.number, step.value, props.sideItemsCount),
    );
    provide(ScrollingNumberKey, {
      number: () => props.number,
      step: () => step.value,
      itemsSize: () => props.itemsSize,
      sideItemsCount: () => props.sideItemsCount,
      displayedItemsCount: () => displayedItemsCount.value,
      isInView: () => isInView.value,
      direction: () => props.direction,
      isVertical: () => isVertical.value,
      range: () => range.value,
      onNumberChange: (value) => emit('numberChange', value),
    });
    return () =>
      h(
        'div',
        {
          ...attrs,
          ref: element,
          'data-slot': 'scrolling-number-container',
          'data-direction': props.direction,
          style: [
            {
              position: 'relative',
              overflow: 'hidden',
              height: isVertical.value
                ? `${props.itemsSize * displayedItemsCount.value}px`
                : undefined,
              width: !isVertical.value
                ? `${props.itemsSize * displayedItemsCount.value}px`
                : undefined,
            },
            attrs.style,
          ],
        },
        [
          slots.default?.(),
          h(
            'span',
            { class: 'sr-only', style: VISUALLY_HIDDEN },
            formatter.format(props.number),
          ),
        ],
      );
  },
});

/** The frame around the number in the middle. */
const ScrollingNumberHighlight = defineComponent({
  name: 'ScrollingNumberHighlight',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const context = useScrollingNumber();
    return () => {
      const vertical = context.isVertical();
      const size = `${context.itemsSize()}px`;
      return h(
        'div',
        {
          ...attrs,
          'data-slot': 'scrolling-number-highlight',
          'data-direction': context.direction(),
          style: [
            {
              position: 'absolute',
              height: vertical ? size : undefined,
              width: !vertical ? size : undefined,
              left: !vertical ? '50%' : undefined,
              top: vertical ? '50%' : undefined,
              transform: !vertical ? 'translateX(-50%)' : 'translateY(-50%)',
              zIndex: 0,
            },
            attrs.style,
          ],
        },
        slots.default?.(),
      );
    };
  },
});

type ScrollingNumberProps = { transition?: Transition; delay?: number };

const DEFAULT_TRANSITION: Transition = { stiffness: 90, damping: 30 };

function resolveTransition(transition: Transition): Transition {
  if ('type' in transition || 'ease' in transition) return transition;
  return {
    type: 'spring',
    restDelta: 0.001,
    restSpeed: 0.01,
    ...transition,
  } as Transition;
}

const DIRECTION_FLEX: Record<ScrollingNumberDirection, string> = {
  btt: 'column',
  ttb: 'column-reverse',
  rtl: 'row',
  ltr: 'row-reverse',
};

const ScrollingNumberContent = defineComponent({
  name: 'ScrollingNumberContent',
  inheritAttrs: false,
  props: {
    transition: Object as PropType<Transition>,
    delay: { type: Number, default: 0 },
  },
  emits: ['completed'],
  setup(props, { attrs, emit, slots }) {
    const context = useScrollingNumber();
    const reduce = useShouldReduceMotion();
    const defaultTransition = useTempoTransition(() => DEFAULT_TRANSITION);
    const sign = () =>
      context.direction() === 'ttb' || context.direction() === 'ltr' ? -1 : 1;
    const initialPosition = () =>
      -sign() * context.itemsSize() * context.sideItemsCount();
    const finalPosition = () =>
      sign() *
      context.itemsSize() *
      (context.range().length - context.displayedItemsCount());

    const position = motionValue(initialPosition());
    const transform = motionValue('');
    const place = (p: number) =>
      transform.set(
        context.isVertical() ? `translateY(${p}px)` : `translateX(${p}px)`,
      );
    place(position.get());

    watch(
      () =>
        [
          context.isInView(),
          finalPosition(),
          props.delay,
          reduce.value,
        ] as const,
      ([inView, end, delay, isReduced], _, onCleanup) => {
        if (!inView) return;
        if (isReduced) {
          position.jump(end);
          place(end);
          return;
        }
        const timer = setTimeout(() => {
          animate(
            position,
            end,
            resolveTransition(props.transition ?? defaultTransition.value),
          );
        }, delay);
        onCleanup(() => clearTimeout(timer));
      },
      { immediate: true },
    );
    onBeforeUnmount(() => position.stop());

    let lastNumber: number | null = null;
    let completed = false;
    watch(
      () => context.number(),
      () => (completed = false),
    );
    position.on('change', (p) => {
      place(p);
      const index =
        (sign() * p) / context.itemsSize() + context.sideItemsCount();
      const snapped = Math.min(
        Math.max(Math.round(index) * context.step(), 0),
        context.number(),
      );
      if (snapped !== lastNumber) {
        lastNumber = snapped;
        context.onNumberChange(snapped);
      }
      const start = initialPosition();
      const total = finalPosition() - start;
      const progress = total === 0 ? 1 : (p - start) / total;
      if (!completed && progress >= 0.99) {
        completed = true;
        emit('completed');
      }
    });

    return () => {
      const direction = context.direction();
      const vertical = context.isVertical();
      return h(
        motion.div as Component,
        {
          'aria-hidden': 'true',
          'data-slot': 'scrolling-number',
          ...attrs,
          style: [
            {
              position: 'absolute',
              top: direction === 'ttb' ? '0' : undefined,
              bottom: direction === 'btt' ? '0' : undefined,
              left: direction === 'ltr' ? '0' : undefined,
              right: direction === 'rtl' ? '0' : undefined,
              width: vertical ? '100%' : undefined,
              height: !vertical ? '100%' : undefined,
              display: 'flex',
              zIndex: 1,
              flexDirection: DIRECTION_FLEX[direction],
              transform,
            },
            attrs.style,
          ],
        },
        slots,
      );
    };
  },
});

/** The numbers scrolling by, from 0 up to the number. */
const ScrollingNumber = defineComponent({
  name: 'ScrollingNumber',
  inheritAttrs: false,
  props: {
    transition: Object as PropType<Transition>,
    delay: { type: Number, default: 0 },
  },
  emits: ['completed'],
  setup(props, { attrs, slots, emit }) {
    return () =>
      h(ReducedMotionConfig, { remount: true }, () =>
        h(
          ScrollingNumberContent,
          { ...attrs, ...props, onCompleted: () => emit('completed') },
          slots,
        ),
      );
  },
});

type ScrollingNumberItemsProps = Record<string, unknown>;

/** One item per number in the range. */
const ScrollingNumberItems = defineComponent({
  name: 'ScrollingNumberItems',
  inheritAttrs: false,
  setup(_, { attrs }) {
    const context = useScrollingNumber();
    return () => {
      const vertical = context.isVertical();
      const size = `${context.itemsSize()}px`;
      return context.range().map((value) =>
        h(
          'div',
          {
            ...attrs,
            key: value,
            'data-slot': 'scrolling-number-item',
            'data-value': value,
            'data-direction': context.direction(),
            style: [
              {
                height: vertical ? size : undefined,
                width: !vertical ? size : undefined,
              },
              attrs.style,
            ],
          },
          formatter.format(value),
        ),
      );
    };
  },
});

type ScrollingNumberHighlightProps = Record<string, unknown>;

export {
  ScrollingNumberContainer,
  ScrollingNumber,
  ScrollingNumberHighlight,
  ScrollingNumberItems,
  useScrollingNumber,
  type ScrollingNumberContainerProps,
  type ScrollingNumberProps,
  type ScrollingNumberHighlightProps,
  type ScrollingNumberItemsProps,
  type ScrollingNumberDirection,
  type ScrollingNumberContextType,
};
