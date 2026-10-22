import {
  defineComponent,
  h,
  onBeforeUnmount,
  ref,
  watch,
  type Component,
  type PropType,
} from 'vue';
import { AnimatePresence, motion, type Transition } from 'motion-v';

import {
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';

const SWAP_TRANSITION: Transition = motionTokens.transition.swap;

const HIDDEN = {
  opacity: 0,
  scale: motionTokens.scale.icon,
  filter: motionTokens.blur.icon,
};
const SHOWN = { opacity: 1, scale: 1, filter: 'blur(0px)' };

type IconSwapProps = {
  swapKey: string;
  instant?: boolean;
  rotate?: number;
  transition?: Transition;
};

const IconSwap = defineComponent({
  name: 'IconSwap',
  inheritAttrs: false,
  props: {
    swapKey: { type: String, required: true },
    instant: Boolean,
    rotate: Number,
    transition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    const reduce = useShouldReduceMotion();
    // The new icon is painted once as it enters, then animates, even after a long frame.
    const painted = ref(true);
    let frame = 0;
    watch(
      () => props.swapKey,
      () => {
        painted.value = false;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          frame = requestAnimationFrame(() => (painted.value = true));
        });
      },
      { flush: 'sync' },
    );
    onBeforeUnmount(() => cancelAnimationFrame(frame));
    const defaultTransition = useTempoTransition(() =>
      props.rotate ? motionTokens.transition.spin : SWAP_TRANSITION,
    );
    return () => {
      const turn = reduce.value || !props.rotate ? undefined : props.rotate;
      const entering = reduce.value
        ? { opacity: 0, filter: HIDDEN.filter }
        : turn
          ? { ...HIDDEN, rotate: -turn }
          : HIDDEN;
      const leaving = reduce.value
        ? { opacity: 0, filter: HIDDEN.filter }
        : turn
          ? { ...HIDDEN, rotate: turn }
          : HIDDEN;
      const shown = reduce.value
        ? { opacity: 1, filter: SHOWN.filter }
        : turn
          ? { ...SHOWN, rotate: 0 }
          : SHOWN;
      return h(
        'span',
        {
          ...attrs,
          style: [
            {
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
            attrs.style,
          ],
        },
        h(
          AnimatePresence as Component,
          { mode: 'popLayout', initial: false },
          () =>
            h(
              motion.span as Component,
              {
                key: props.swapKey,
                'data-icon': props.swapKey,
                'aria-hidden': 'true',
                initial: props.instant ? false : entering,
                animate: painted.value || props.instant ? shown : entering,
                exit: props.instant ? undefined : leaving,
                transition: props.transition ?? defaultTransition.value,
                style: { display: 'inline-flex' },
              },
              slots,
            ),
        ),
      );
    };
  },
});

export { IconSwap, type IconSwapProps };
