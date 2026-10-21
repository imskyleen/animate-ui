import {
  computed,
  defineComponent,
  h,
  type Component,
  type ComputedRef,
  type PropType,
} from 'vue';
import { AnimatePresence, motion, type Transition } from 'motion-v';

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

type PanelAnimationProps = {
  transition?: Transition;
  exitTransition?: Transition;
};

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

/**
 * A reka-ui content part whose panel unfolds: mounted while open (or with
 * `forceMount`), the library's content rendered `asChild` onto a motion element.
 */
function createDisclosureContent(
  name: string,
  Content: Component,
  useOpen: () => ComputedRef<boolean> | { value: boolean },
  sizeVars: readonly string[],
) {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: {
      forceMount: Boolean,
      transition: Object as PropType<Transition>,
      exitTransition: Object as PropType<Transition>,
    },
    setup(props, { attrs, slots }) {
      const open = useOpen();
      const { enter, exit } = useDisclosureTransitions(
        () => props.transition,
        () => props.exitTransition,
      );
      let element: HTMLElement | null = null;
      const setElement = (instance: unknown) => {
        element =
          (instance as { $el?: HTMLElement } | null)?.$el ??
          (instance as HTMLElement | null);
      };
      const auto = Object.fromEntries(sizeVars.map((name) => [name, 'auto']));

      return () => {
        const isOpen = open.value;
        return h(AnimatePresence, null, () =>
          isOpen || props.forceMount
            ? h(Content, { ...attrs, forceMount: true, asChild: true }, () =>
                h(
                  motion.div,
                  {
                    ref: setElement,
                    initial: collapsed,
                    animate: isOpen
                      ? { ...expanded, transition: enter.value }
                      : { ...collapsed, transition: exit.value },
                    exit: { ...collapsed, transition: exit.value },
                    onAnimationStart: () => measurePanel(element),
                    onAnimationComplete: () => {
                      if (open.value) releasePanel(element);
                    },
                    inert: !isOpen || undefined,
                    style: { ...panelStyle, ...auto },
                  },
                  slots,
                ),
              )
            : null,
        );
      };
    },
  });
}

export {
  createDisclosureContent,
  collapsed,
  expanded,
  panelStyle,
  measurePanel,
  releasePanel,
  useDisclosureTransitions,
  type PanelAnimationProps,
};
