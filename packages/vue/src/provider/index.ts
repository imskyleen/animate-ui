import { computed, defineComponent, inject, provide, ref, type PropType } from 'vue';

import {
  CheckAnimationKey,
  createMotionTokens,
  MotionTokensKey,
  motionTokens,
  ReducedMotionKey,
  type CheckAnimation,
  type ReducedMotion,
} from '../utils/motion';

type AnimateUIProviderProps = {
  tempo?: number;
  checkAnimation?: CheckAnimation;
  reducedMotion?: ReducedMotion;
};

const AnimateUIProvider = defineComponent({
  name: 'AnimateUIProvider',
  props: {
    tempo: Number,
    checkAnimation: String as PropType<CheckAnimation>,
    reducedMotion: String as PropType<ReducedMotion>,
  },
  setup(props, { slots }) {
    const outer = inject(MotionTokensKey, ref(motionTokens));
    const outerCheck = inject(CheckAnimationKey, ref<CheckAnimation>('draw'));
    const outerReduced = inject(ReducedMotionKey, ref<ReducedMotion>('user'));

    provide(
      MotionTokensKey,
      computed(() => {
        const pace = props.tempo ?? outer.value.tempo;
        return pace === outer.value.tempo
          ? outer.value
          : createMotionTokens(pace);
      }),
    );
    provide(
      CheckAnimationKey,
      computed(() => props.checkAnimation ?? outerCheck.value),
    );
    provide(
      ReducedMotionKey,
      computed(() => props.reducedMotion ?? outerReduced.value),
    );

    return () => slots.default?.();
  },
});

export {
  AnimateUIProvider,
  type AnimateUIProviderProps,
  type CheckAnimation,
  type ReducedMotion,
};
