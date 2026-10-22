import {
  defineComponent,
  h,
  normalizeStyle,
  type Component,
  type PropType,
} from 'vue';
import {
  ProgressIndicator as RekaProgressIndicator,
  type ProgressIndicatorProps as RekaProgressIndicatorProps,
} from 'reka-ui';
import { Motion, motion, type Transition } from 'motion-v';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { PROGRESS_TRANSITION } from '../../../internal/progress';

type ProgressIndicatorProps = RekaProgressIndicatorProps & {
  transition?: Transition;
};

const TRANSLATE_X = /^\s*translateX\((-?[\d.]+%)\)\s*$/;

/** shadcn-vue writes the indicator's style as a string. */
function styleObject(style: unknown): Record<string, unknown> {
  const normalized = normalizeStyle(style as never);
  if (typeof normalized !== 'string') return { ...(normalized ?? {}) };
  const out: Record<string, unknown> = {};
  for (const declaration of normalized.split(';')) {
    const colon = declaration.indexOf(':');
    if (colon < 0) continue;
    const name = declaration.slice(0, colon).trim();
    if (name) out[name] = declaration.slice(colon + 1).trim();
  }
  return out;
}

const IndicatorMotion = defineComponent({
  name: 'ProgressIndicatorMotion',
  inheritAttrs: false,
  props: { transition: Object as PropType<Transition> },
  setup(props, { attrs, slots }) {
    const reduce = useShouldReduceMotion();
    const spring = useTempoTransition(
      () => props.transition ?? PROGRESS_TRANSITION,
    );

    return () => {
      const { style, ...rest } = attrs;
      const { transform, ...others } = styleObject(style);
      const x =
        typeof transform === 'string'
          ? TRANSLATE_X.exec(transform)?.[1]
          : undefined;
      const target = x !== undefined ? { x } : transform ? { transform } : null;
      const move = reduce.value ? { duration: 0 } : spring.value;
      const asChild =
        rest.asChild === '' ||
        rest.asChild === true ||
        rest['as-child'] === '' ||
        rest['as-child'] === true;
      return h(RekaProgressIndicator, { ...rest, asChild: true }, () =>
        h(
          asChild ? (Motion as Component) : motion.div,
          {
            ...(asChild && { asChild: true }),
            style: others,
            initial: false,
            animate: target ? { ...target, transition: move } : undefined,
          } as Record<string, unknown>,
          slots,
        ),
      );
    };
  },
});

const ProgressIndicator = defineComponent({
  name: 'ProgressIndicator',
  inheritAttrs: false,
  props: { transition: Object as PropType<Transition> },
  setup(props, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(IndicatorMotion, { ...attrs, transition: props.transition }, slots),
      );
  },
});

export {
  ProgressRoot,
  type ProgressRootEmits,
  type ProgressRootProps,
} from 'reka-ui';

export { ProgressIndicator, type ProgressIndicatorProps };
