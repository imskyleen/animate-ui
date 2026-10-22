import {
  defineComponent,
  h,
  onBeforeUnmount,
  shallowRef,
  watch,
  type PropType,
} from 'vue';
import {
  animate,
  motionValue,
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

const DEFAULT_TRANSITION: SpringOptions = {
  stiffness: motionTokens.spring.number.stiffness,
  damping: motionTokens.spring.number.damping,
};

function resolveTransition(transition: SpringOptions | Transition): Transition {
  if ('type' in transition || 'ease' in transition) {
    return transition as Transition;
  }
  return {
    type: 'spring',
    restDelta: 0.001,
    restSpeed: 0.01,
    ...transition,
  } as Transition;
}

type FormatOptions = {
  decimals: number;
  decimalSeparator: string;
  thousandSeparator: string | undefined;
  padLength: number;
};

function formatNumber(
  value: number,
  { decimals, decimalSeparator, thousandSeparator, padLength }: FormatOptions,
) {
  const fixed = Math.abs(value).toFixed(decimals);
  const sign = value < 0 && Number(fixed) !== 0 ? '-' : '';
  const [intPart = '0', fracPart] = fixed.split('.');
  const padded = intPart.padStart(padLength, '0');
  const paddedInt =
    thousandSeparator === undefined
      ? padded
      : padded.replace(/\B(?=(\d{3})+$)/g, thousandSeparator);
  return fracPart
    ? `${sign}${paddedInt}${decimalSeparator}${fracPart}`
    : `${sign}${paddedInt}`;
}

const countingNumberProps = {
  number: { type: Number, required: true },
  fromNumber: { type: Number, default: 0 },
  padStart: Boolean,
  decimalSeparator: { type: String, default: '.' },
  decimalPlaces: { type: Number, default: 0 },
  thousandSeparator: String,
  transition: Object as PropType<SpringOptions | Transition>,
  delay: { type: Number, default: 0 },
  initiallyStable: Boolean,
  inView: Boolean,
  inViewMargin: { type: String, default: '0px' },
  inViewOnce: { type: Boolean, default: true },
} as const;

type CountingNumberProps = {
  number: number;
  fromNumber?: number;
  padStart?: boolean;
  decimalSeparator?: string;
  decimalPlaces?: number;
  thousandSeparator?: string;
  transition?: SpringOptions | Transition;
  delay?: number;
  initiallyStable?: boolean;
  inView?: boolean;
  inViewMargin?: string;
  inViewOnce?: boolean;
};

const CountingNumberContent = defineComponent({
  name: 'CountingNumberContent',
  inheritAttrs: false,
  props: countingNumberProps,
  setup(props, { attrs }) {
    const { element, isInView } = useIsInView(() => props);
    const visual = shallowRef<HTMLElement | null>(null);
    const reduce = useShouldReduceMotion();
    const defaultTransition = useTempoTransition(
      () => DEFAULT_TRANSITION as Transition,
    );
    const formatOptions = (): FormatOptions => ({
      decimals: props.decimalPlaces,
      decimalSeparator: props.decimalSeparator,
      thousandSeparator: props.thousandSeparator,
      padLength: props.padStart
        ? Math.floor(Math.abs(props.number)).toString().length
        : 0,
    });
    const value = motionValue(
      props.initiallyStable ? props.number : props.fromNumber,
    );
    value.on('change', (latest) => {
      const node = visual.value;
      if (!node) return;
      const text = formatNumber(latest, formatOptions());
      if (node.firstChild instanceof Text) node.firstChild.nodeValue = text;
      else node.textContent = text;
    });

    watch(
      () => [isInView.value, props.number, props.delay, reduce.value] as const,
      ([inView, number, delay, isReduced], _, onCleanup) => {
        if (!inView) return;
        if (isReduced) {
          value.jump(number);
          return;
        }
        const timeoutId = setTimeout(() => {
          animate(
            value,
            number,
            resolveTransition(props.transition ?? defaultTransition.value),
          );
        }, delay);
        onCleanup(() => clearTimeout(timeoutId));
      },
      { immediate: true, flush: 'post' },
    );
    onBeforeUnmount(() => value.stop());

    return () =>
      h('span', { ...attrs, ref: element, 'data-slot': 'counting-number' }, [
        h(
          'span',
          { 'aria-hidden': 'true', ref: visual },
          formatNumber(value.get(), formatOptions()),
        ),
        h(
          'span',
          { class: 'sr-only', style: VISUALLY_HIDDEN },
          formatNumber(props.number, formatOptions()),
        ),
      ]);
  },
});

/** A number that counts up (or down) to its value on a spring. */
const CountingNumber = defineComponent({
  name: 'CountingNumber',
  inheritAttrs: false,
  props: countingNumberProps,
  setup(props, { attrs }) {
    return () =>
      h(ReducedMotionConfig, { remount: true }, () =>
        h(CountingNumberContent, { ...attrs, ...props }),
      );
  },
});

export { CountingNumber, type CountingNumberProps };
