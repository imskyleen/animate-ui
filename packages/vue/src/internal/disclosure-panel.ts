import { computed, type ComputedRef } from 'vue';
import type { Transition } from 'motion-v';

import {
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../utils/motion';

const collapsed = {
  height: 0,
  opacity: 0,
  filter: motionTokens.blur.disclosure,
};
const expanded = {
  height: 'auto',
  opacity: 1,
  filter: 'blur(0px)',
  transitionEnd: { filter: 'none' },
};

const CONTENT_VAR = '--animate-ui-panel-content';

const EDGE_MASK = `linear-gradient(to bottom, black max(100% - 16px, 200% - var(${CONTENT_VAR}, 100%)), transparent)`;

const panelStyle = {
  overflow: 'hidden',
  maskImage: EDGE_MASK,
  WebkitMaskImage: EDGE_MASK,
} as const;

function measurePanel(element: HTMLElement | null | undefined) {
  element?.style.setProperty(CONTENT_VAR, `${element.scrollHeight}px`);
}

function releasePanel(element: HTMLElement | null | undefined) {
  element?.style.removeProperty(CONTENT_VAR);
}

const INSTANT: Transition = { duration: 0 };

/** Enter and exit transitions of a panel; under reduced motion it fades without growing. */
function useDisclosureTransitions(
  transition: () => Transition | undefined,
  exitTransition: () => Transition | undefined,
): { enter: ComputedRef<Transition>; exit: ComputedRef<Transition> } {
  const reduce = useShouldReduceMotion();
  const enter = useTempoTransition(
    () => transition() ?? motionTokens.transition.disclosure,
  );
  const exit = useTempoTransition(
    () => exitTransition() ?? transition() ?? motionTokens.transition.disclosure,
  );
  const instantMoves = (value: Transition): Transition =>
    reduce.value ? { ...value, height: INSTANT } : value;
  return {
    enter: computed(() => instantMoves(enter.value)),
    exit: computed(() => instantMoves(exit.value)),
  };
}

export {
  collapsed,
  expanded,
  panelStyle,
  measurePanel,
  releasePanel,
  useDisclosureTransitions,
};
