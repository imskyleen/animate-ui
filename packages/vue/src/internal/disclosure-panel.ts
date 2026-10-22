import {
  computed,
  defineComponent,
  h,
  shallowRef,
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
import { useSubmenuStagger } from './stagger';

const collapsed = {
  height: 0,
  marginTop: 'var(--animate-ui-panel-shut-margin, 0px)',
  opacity: 0,
  filter: motionTokens.blur.disclosure,
};
const expanded = {
  height: 'auto',
  marginTop: 'var(--animate-ui-panel-margin, 0px)',
  opacity: 1,
  filter: 'blur(0px)',
  transitionEnd: { filter: 'none' },
};

const CONTENT_VAR = '--animate-ui-panel-content';
const OPEN_MARGIN_VAR = '--animate-ui-panel-margin';
const SHUT_MARGIN_VAR = '--animate-ui-panel-shut-margin';

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

/** A closed panel takes back the gap its parent's column leaves for it, so the gap shrinks with it. */
function fitGap(element: HTMLElement | null | undefined) {
  const parent = element?.parentElement;
  if (!element || !parent) return;
  const style = getComputedStyle(parent);
  const column =
    style.display.endsWith('grid') ||
    (style.display.endsWith('flex') &&
      style.flexDirection.startsWith('column'));
  const gap =
    column && parent.childElementCount > 1 ? parseFloat(style.rowGap) || 0 : 0;
  const inline = element.style.marginTop;
  element.style.marginTop = '';
  const own = parseFloat(getComputedStyle(element).marginTop) || 0;
  element.style.marginTop = inline;
  element.style.setProperty(OPEN_MARGIN_VAR, `${own}px`);
  element.style.setProperty(SHUT_MARGIN_VAR, `${own - gap}px`);
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
    () =>
      exitTransition() ?? transition() ?? motionTokens.transition.disclosure,
  );
  const instantMoves = (value: Transition): Transition =>
    reduce.value ? { ...value, height: INSTANT, marginTop: INSTANT } : value;
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
      const node = shallowRef<HTMLElement | null>(null);
      const setElement = (instance: unknown) => {
        element =
          (instance as { $el?: HTMLElement } | null)?.$el ??
          (instance as HTMLElement | null);
        fitGap(element);
        node.value = element instanceof HTMLElement ? element : null;
      };
      useSubmenuStagger(
        () => node.value,
        () => open.value,
      );
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
  fitGap,
  collapsed,
  expanded,
  panelStyle,
  measurePanel,
  releasePanel,
  useDisclosureTransitions,
  type PanelAnimationProps,
};
