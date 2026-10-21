import { defineComponent, h, type PropType } from 'vue';
import {
  AccordionContent as RekaAccordionContent,
  AccordionRoot as RekaAccordionRoot,
  injectAccordionItemContext,
  type AccordionContentProps as RekaAccordionContentProps,
} from 'reka-ui';
import { AnimatePresence, motion, type Transition } from 'motion-v';

import { ReducedMotionConfig } from '../../../utils/motion';
import {
  collapsed,
  expanded,
  measurePanel,
  panelStyle,
  releasePanel,
  useDisclosureTransitions,
} from '../../../internal/disclosure-panel';

type ContentAnimationProps = {
  transition?: Transition;
  exitTransition?: Transition;
};

type AccordionContentProps = RekaAccordionContentProps & ContentAnimationProps;

const AccordionRoot = defineComponent({
  name: 'AccordionRoot',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () => h(RekaAccordionRoot, attrs, slots));
  },
}) as unknown as typeof RekaAccordionRoot;

const AccordionContent = defineComponent({
  name: 'AccordionContent',
  inheritAttrs: false,
  props: {
    forceMount: Boolean,
    transition: Object as PropType<Transition>,
    exitTransition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    const item = injectAccordionItemContext();
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

    return () => {
      const open = item.open.value;
      return h(AnimatePresence, null, () =>
        open || props.forceMount
          ? h(
              RekaAccordionContent,
              { ...attrs, forceMount: true, asChild: true },
              () =>
                h(
                  motion.div,
                  {
                    ref: setElement,
                    initial: collapsed,
                    animate: open
                      ? { ...expanded, transition: enter.value }
                      : { ...collapsed, transition: exit.value },
                    exit: { ...collapsed, transition: exit.value },
                    onAnimationStart: () => measurePanel(element),
                    onAnimationComplete: () => {
                      if (item.open.value) releasePanel(element);
                    },
                    inert: !open || undefined,
                    style: {
                      ...panelStyle,
                      '--reka-accordion-content-height': 'auto',
                      '--reka-collapsible-content-height': 'auto',
                    },
                  },
                  slots,
                ),
            )
          : null,
      );
    };
  },
});

export {
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
  type AccordionHeaderProps,
  type AccordionItemProps,
  type AccordionRootEmits,
  type AccordionRootProps,
  type AccordionTriggerProps,
} from 'reka-ui';

export { AccordionRoot, AccordionContent, type AccordionContentProps };
