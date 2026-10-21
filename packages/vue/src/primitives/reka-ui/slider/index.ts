import {
  defineComponent,
  h,
  mergeProps,
  ref,
  watch,
  type PropType,
} from 'vue';
import {
  SliderRange as RekaSliderRange,
  SliderRoot as RekaSliderRoot,
  SliderThumb as RekaSliderThumb,
  type SliderRangeProps as RekaSliderRangeProps,
  type SliderThumbProps as RekaSliderThumbProps,
} from 'reka-ui';
import type { Transition } from 'motion-v';

import { ReducedMotionConfig, useTempoTransition } from '../../../utils/motion';
import {
  SLIDER_TRANSITION,
  useSliderMotion,
  useSliderPartMotion,
  useSliderRootMotion,
  useThumbStretch,
} from '../../../internal/slider';

type SliderRangeProps = RekaSliderRangeProps & { transition?: Transition };
type SliderThumbProps = RekaSliderThumbProps & { transition?: Transition };

const elementOf = (node: unknown) =>
  ((node as { $el?: unknown } | null)?.$el ?? node) as HTMLElement | null;

const RootMotion = defineComponent({
  name: 'SliderRootMotion',
  inheritAttrs: false,
  props: {
    modelValue: { type: Array as PropType<number[] | null>, default: undefined },
    defaultValue: Array as PropType<number[]>,
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit, slots }) {
    const own = ref<number[]>(
      props.defaultValue ?? [Number(attrs.min ?? 0)],
    );
    const controlled = () => props.modelValue !== undefined;
    const values = () => (controlled() ? props.modelValue : own.value);
    watch(controlled, (now) => {
      const [from, to] = now
        ? ['uncontrolled', 'controlled']
        : ['controlled', 'uncontrolled'];
      console.warn(
        `Slider is changing from ${from} to ${to}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`,
      );
    });

    const motion = useSliderRootMotion(() => ({
      disabled: attrs.disabled === '' || Boolean(attrs.disabled),
      valuesKey: String(values()),
    }));

    return () =>
      h(
        RekaSliderRoot,
        mergeProps(attrs, {
          modelValue: values(),
          'onUpdate:modelValue': (next: number[] | undefined) => {
            if (!controlled() && next) own.value = next;
            emit('update:modelValue', next);
          },
          onPointerdownCapture: (event: PointerEvent) =>
            motion.startPress(event),
        }),
        slots,
      );
  },
});

/** The slider: a press on the track springs the thumb and range to the value. */
const SliderRoot = defineComponent({
  name: 'SliderRoot',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () => h(RootMotion, attrs, slots));
  },
}) as unknown as typeof RekaSliderRoot;

const SliderRange = defineComponent({
  name: 'SliderRange',
  inheritAttrs: false,
  props: { transition: Object as PropType<Transition> },
  setup(props, { attrs, slots }) {
    const spring = useTempoTransition(
      () => props.transition ?? SLIDER_TRANSITION,
    );
    const element = useSliderPartMotion('range', () => spring.value);
    return () =>
      h(
        RekaSliderRange,
        {
          ...attrs,
          style: [attrs.style, { transformOrigin: '0 0' }],
          ref: (node: unknown) => {
            element.value = elementOf(node);
          },
        },
        slots,
      );
  },
}) as unknown as typeof RekaSliderRange;

/** A thumb: springs to a pressed value, and stretches along the track while held. */
const SliderThumb = defineComponent({
  name: 'SliderThumb',
  inheritAttrs: false,
  props: { transition: Object as PropType<Transition> },
  setup(props, { attrs, slots }) {
    const spring = useTempoTransition(
      () => props.transition ?? SLIDER_TRANSITION,
    );
    const { isPressing } = useSliderMotion();
    const isFocused = ref(false);
    const element = useSliderPartMotion('thumb', () => spring.value);
    const isPressed = () => isPressing.value && isFocused.value;
    useThumbStretch(element, isPressed, () => spring.value);

    return () =>
      h(
        RekaSliderThumb,
        mergeProps(
          { 'data-pressed': isPressed() || undefined },
          attrs,
          {
            onFocus: () => (isFocused.value = true),
            onBlur: () => (isFocused.value = false),
            ref: (node: unknown) => {
              element.value = elementOf(node);
            },
          },
        ),
        slots,
      );
  },
}) as unknown as typeof RekaSliderThumb;

export {
  SliderTrack,
  type SliderRootProps,
  type SliderRootEmits,
  type SliderTrackProps,
} from 'reka-ui';

export {
  SliderRoot,
  SliderRange,
  SliderThumb,
  type SliderRangeProps,
  type SliderThumbProps,
};
