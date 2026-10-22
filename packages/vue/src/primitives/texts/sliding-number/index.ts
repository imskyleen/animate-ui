import {
  computed,
  defineComponent,
  Fragment,
  h,
  onBeforeUnmount,
  ref,
  watch,
  type Component,
  type PropType,
} from 'vue';
import {
  animate,
  motion,
  motionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type SpringOptions,
  type Transition,
} from 'motion-v';

import { useIsInView } from '../../../utils/use-is-in-view';
import {
  motionTokens,
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { VISUALLY_HIDDEN } from '../_text';

const ROLLER_TRANSITION: SpringOptions = {
  stiffness: 200,
  damping: 20,
  mass: 0.4,
};

const COUNT_TRANSITION: Transition = {
  ...motionTokens.spring.number,
  restDelta: 0.001,
  restSpeed: 0.01,
};

function intLength(units: number, factor: number) {
  return Math.floor(Math.abs(units) / factor).toString().length;
}

const SlidingNumberDisplay = defineComponent({
  name: 'SlidingNumberDisplay',
  props: {
    position: { type: Object as PropType<MotionValue<number>>, required: true },
    number: { type: Number, required: true },
  },
  setup(props) {
    const transform = useTransform(props.position, (latest: number) => {
      const current = ((latest % 10) + 10) % 10;
      let offset = (10 + props.number - current) % 10;
      if (offset > 5) offset -= 10;
      return `translateY(${offset * 100}%)`;
    });
    return () =>
      h(
        motion.span as Component,
        {
          'data-slot': 'sliding-number-display',
          style: {
            transform,
            position: 'absolute',
            inset: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        },
        () => props.number,
      );
  },
});

const SlidingNumberRoller = defineComponent({
  name: 'SlidingNumberRoller',
  props: {
    units: { type: Object as PropType<MotionValue<number>>, required: true },
    place: { type: Number, required: true },
    reduce: Boolean,
    transition: { type: Object as PropType<SpringOptions>, required: true },
  },
  setup(props) {
    const digitOf = (value: number) =>
      Math.floor(Math.abs(value) / props.place) % 10;
    const position = useSpring(
      digitOf(props.units.getPrevious() ?? props.units.get()),
      props.transition,
    );
    const roll = (value: number) => {
      const digit = digitOf(value);
      if (props.reduce) position.jump(digit);
      else position.set(digit);
    };
    const off = props.units.on('change', roll);
    onBeforeUnmount(off);
    roll(props.units.get());
    return () =>
      h(
        'span',
        {
          'aria-hidden': 'true',
          'data-slot': 'sliding-number-roller',
          style: {
            position: 'relative',
            display: 'inline-block',
            width: '1ch',
            overflowX: 'visible',
            overflowY: 'clip',
            lineHeight: '1',
            fontVariantNumeric: 'tabular-nums',
          },
        },
        [
          h('span', { style: { visibility: 'hidden' } }, '0'),
          ...Array.from({ length: 10 }, (_, i) =>
            h(SlidingNumberDisplay, { key: i, position, number: i }),
          ),
        ],
      );
  },
});

type FormatOptions = {
  decimals: number;
  decimalSeparator: string;
  thousandSeparator?: string;
  padLength: number;
};

function formatNumber(
  value: number,
  { decimals, decimalSeparator, thousandSeparator, padLength }: FormatOptions,
) {
  const fixed = Math.abs(value).toFixed(decimals);
  const sign = value < 0 && Number(fixed) !== 0 ? '-' : '';
  const [intPart = '0', fracPart] = fixed.split('.');
  let int = intPart.padStart(padLength, '0');
  if (thousandSeparator !== undefined) {
    int = int.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
  }
  return fracPart
    ? `${sign}${int}${decimalSeparator}${fracPart}`
    : `${sign}${int}`;
}

const slidingNumberProps = {
  number: { type: Number, required: true },
  fromNumber: { type: Number, default: undefined },
  padStart: Boolean,
  decimalSeparator: { type: String, default: '.' },
  decimalPlaces: { type: Number, default: 0 },
  thousandSeparator: String,
  transition: Object as PropType<SpringOptions>,
  delay: { type: Number, default: 0 },
  initiallyStable: Boolean,
  inView: Boolean,
  inViewMargin: { type: String, default: '0px' },
  inViewOnce: { type: Boolean, default: true },
} as const;

type SlidingNumberProps = {
  number: number;
  fromNumber?: number;
  padStart?: boolean;
  decimalSeparator?: string;
  decimalPlaces?: number;
  thousandSeparator?: string;
  transition?: SpringOptions;
  delay?: number;
  initiallyStable?: boolean;
  inView?: boolean;
  inViewMargin?: string;
  inViewOnce?: boolean;
};

const SlidingNumberContent = defineComponent({
  name: 'SlidingNumberContent',
  inheritAttrs: false,
  props: slidingNumberProps,
  emits: ['numberChange'],
  setup(props, { attrs, emit }) {
    const { element, isInView } = useIsInView(() => props);
    const reduce = useShouldReduceMotion();
    const defaultRollerTransition = useTempoTransition(
      () => ROLLER_TRANSITION as Transition,
    );
    const countTransition = useTempoTransition(() => COUNT_TRANSITION);
    const isCounting = () => props.fromNumber !== undefined;
    const factor = () => Math.pow(10, props.decimalPlaces);
    const toUnits = (value: number) => Math.round(value * factor());

    const initialValue = props.initiallyStable
      ? props.number
      : (props.fromNumber ?? 0);
    const value = motionValue(initialValue);
    const units = motionValue(toUnits(initialValue));
    const layout = ref({
      intLength: intLength(toUnits(initialValue), factor()),
      negative: toUnits(initialValue) < 0,
    });

    value.on('change', (latest) => units.set(toUnits(latest)));
    units.on('change', (latest) => {
      const next = {
        intLength: intLength(latest, factor()),
        negative: latest < 0,
      };
      if (
        layout.value.intLength !== next.intLength ||
        layout.value.negative !== next.negative
      )
        layout.value = next;
      emit('numberChange', latest / factor());
    });
    watch(factor, (f) => units.set(Math.round(value.get() * f)));

    watch(
      () =>
        [
          isInView.value,
          props.number,
          props.delay,
          reduce.value,
          props.initiallyStable,
        ] as const,
      ([inView, number, delay, isReduced, stable], _, onCleanup) => {
        if (!inView) {
          if (!isCounting() && !stable) value.jump(0);
          return;
        }
        const timeoutId = setTimeout(
          () => {
            if (isCounting() && !isReduced)
              animate(value, number, countTransition.value);
            else value.jump(number);
          },
          isReduced ? 0 : delay,
        );
        onCleanup(() => clearTimeout(timeoutId));
      },
      { immediate: true },
    );
    onBeforeUnmount(() => value.stop());

    const shownIntLength = computed(() =>
      props.padStart
        ? Math.max(
            Math.floor(Math.abs(props.number)).toString().length,
            layout.value.intLength,
          )
        : layout.value.intLength,
    );

    return () => {
      const decimals = props.decimalPlaces;
      const f = factor();
      const length = shownIntLength.value;
      const intPlaces = Array.from(
        { length },
        (_, i) => Math.pow(10, length - i - 1) * f,
      );
      const decPlaces = Array.from({ length: decimals }, (_, i) =>
        Math.pow(10, decimals - i - 1),
      );
      const rolling = {
        units,
        reduce: reduce.value,
        transition: (props.transition ??
          defaultRollerTransition.value) as SpringOptions,
      };
      return h(
        'span',
        {
          ...attrs,
          ref: element,
          'data-slot': 'sliding-number',
          style: [
            { display: 'inline-flex', alignItems: 'center' },
            attrs.style,
          ],
        },
        [
          h(
            'span',
            { class: 'sr-only', style: VISUALLY_HIDDEN },
            formatNumber(props.number, {
              decimals,
              decimalSeparator: props.decimalSeparator,
              thousandSeparator: props.thousandSeparator,
              padLength: props.padStart ? length : 0,
            }),
          ),
          layout.value.negative
            ? h(
                'span',
                { 'aria-hidden': 'true', style: { marginRight: '0.25rem' } },
                '-',
              )
            : null,
          ...intPlaces.map((place, idx) => {
            const digitsToRight = intPlaces.length - idx - 1;
            const isSeparatorPosition =
              props.thousandSeparator !== undefined &&
              digitsToRight > 0 &&
              digitsToRight % 3 === 0;
            return h(Fragment, { key: `int-${place}` }, [
              h(SlidingNumberRoller, { place, ...rolling }),
              isSeparatorPosition
                ? h('span', { 'aria-hidden': 'true' }, props.thousandSeparator)
                : null,
            ]);
          }),
          decimals > 0
            ? h(Fragment, [
                h('span', { 'aria-hidden': 'true' }, props.decimalSeparator),
                ...decPlaces.map((place) =>
                  h(SlidingNumberRoller, {
                    key: `dec-${place}`,
                    place,
                    ...rolling,
                  }),
                ),
              ])
            : null,
        ],
      );
    };
  },
});

/** A number whose digits roll to their value, each on its own spring. */
const SlidingNumber = defineComponent({
  name: 'SlidingNumber',
  inheritAttrs: false,
  props: slidingNumberProps,
  emits: ['numberChange'],
  setup(props, { attrs, emit }) {
    return () =>
      h(ReducedMotionConfig, { remount: true }, () =>
        h(SlidingNumberContent, {
          ...attrs,
          ...props,
          onNumberChange: (value: number) => emit('numberChange', value),
        }),
      );
  },
});

export { SlidingNumber, type SlidingNumberProps };
