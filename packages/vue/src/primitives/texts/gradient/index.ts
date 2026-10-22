import {
  computed,
  defineComponent,
  h,
  shallowRef,
  watch,
  type PropType,
} from 'vue';
import {
  animate,
  motion,
  motionValue,
  useInView,
  type AnimationPlaybackControls,
  type Transition,
} from 'motion-v';

import { usePageVisible } from '../../../utils/use-page-visible';
import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';

const DEFAULT_GRADIENT =
  'linear-gradient(90deg, #3b82f6 0%, #a855f7 20%, #ec4899 50%, #a855f7 80%, #3b82f6 100%)';

const DEFAULT_TRANSITION: Transition = {
  duration: 50,
  repeat: Infinity,
  ease: 'linear',
};

const START_POSITION = '0% 0%';
const END_POSITION = '500% 100%';

const gradientTextProps = {
  text: { type: String, required: true },
  gradient: { type: String, default: DEFAULT_GRADIENT },
  neon: Boolean,
  transition: Object as PropType<Transition>,
} as const;

type GradientTextProps = {
  text: string;
  gradient?: string;
  neon?: boolean;
  transition?: Transition;
};

const GradientTextContent = defineComponent({
  name: 'GradientTextContent',
  inheritAttrs: false,
  props: gradientTextProps,
  setup(props, { attrs }) {
    const defaultTransition = useTempoTransition(() => DEFAULT_TRANSITION);
    const transition = computed(
      () => props.transition ?? defaultTransition.value,
    );
    const element = shallowRef<HTMLElement | null>(null);
    const inView = useInView(element);
    const pageVisible = usePageVisible();
    const reduce = useShouldReduceMotion();
    const playing = computed(() => inView.value && pageVisible.value);
    const backgroundPosition = motionValue(START_POSITION);
    let controls: AnimationPlaybackControls | null = null;

    watch(
      () => [reduce.value, JSON.stringify(transition.value)] as const,
      ([isReduced], _, onCleanup) => {
        if (isReduced) return;
        const own = animate(
          backgroundPosition,
          [START_POSITION, END_POSITION],
          transition.value,
        );
        controls = own;
        if (!playing.value) own.pause();
        onCleanup(() => {
          own.stop();
          controls = null;
          backgroundPosition.set(START_POSITION);
        });
      },
      { immediate: true },
    );
    watch(playing, (now) => {
      if (!controls) return;
      if (now) controls.play();
      else controls.pause();
    });

    return () => {
      const layerStyle = {
        backgroundImage: props.gradient,
        margin: '0',
        color: 'transparent',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        backgroundSize: '700% 100%',
        backgroundPosition,
      };
      return h(
        'span',
        {
          ...attrs,
          ref: element,
          'data-slot': 'gradient-text',
          style: [
            { position: 'relative', display: 'inline-block' },
            attrs.style,
          ],
        },
        [
          h(motion.span, { style: layerStyle }, () => props.text),
          props.neon
            ? h(
                motion.span,
                {
                  'aria-hidden': 'true',
                  style: {
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    mixBlendMode: 'plus-lighter',
                    filter: 'blur(8px)',
                    ...layerStyle,
                  },
                },
                () => props.text,
              )
            : null,
        ],
      );
    };
  },
});

/** Text filled with a gradient that keeps sweeping across it. */
const GradientText = defineComponent({
  name: 'GradientText',
  inheritAttrs: false,
  props: gradientTextProps,
  setup(props, { attrs }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(GradientTextContent, { ...attrs, ...props }),
      );
  },
});

export { GradientText, type GradientTextProps };
