import { computed, type ComputedRef } from 'vue';
import type { Transition } from 'motion-v';

import {
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';

const PRESS_TRANSITION: Transition = motionTokens.spring.press;

const PRESSED_SCALE = motionTokens.scale.press;

type PressOptions = {
  disabled?: () => boolean;
  transition?: () => Transition | undefined;
  scale?: number;
};

/** Motion props that scale an element down while it's pressed. */
function usePressMotion({
  disabled = () => false,
  transition = () => undefined,
  scale = PRESSED_SCALE,
}: PressOptions = {}): ComputedRef<Record<string, unknown>> {
  const reduce = useShouldReduceMotion();
  const spring = useTempoTransition(() => transition() ?? PRESS_TRANSITION);
  return computed(() => {
    if (reduce.value || disabled()) return {};
    return {
      initial: { transform: 'scale(1)' },
      whilePress: { transform: `scale(${scale})` },
      transition: spring.value,
    };
  });
}

export { PRESS_TRANSITION, PRESSED_SCALE, usePressMotion };
