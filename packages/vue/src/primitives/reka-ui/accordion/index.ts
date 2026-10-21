import { defineComponent, h } from 'vue';
import {
  AccordionContent as RekaAccordionContent,
  AccordionRoot as RekaAccordionRoot,
  injectAccordionItemContext,
  type AccordionContentProps as RekaAccordionContentProps,
} from 'reka-ui';

import { ReducedMotionConfig } from '../../../utils/motion';
import {
  createDisclosureContent,
  type PanelAnimationProps,
} from '../../../internal/disclosure-panel';

type AccordionContentProps = RekaAccordionContentProps & PanelAnimationProps;

const AccordionRoot = defineComponent({
  name: 'AccordionRoot',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () => h(RekaAccordionRoot, attrs, slots));
  },
}) as unknown as typeof RekaAccordionRoot;

const AccordionContent = createDisclosureContent(
  'AccordionContent',
  RekaAccordionContent,
  () => injectAccordionItemContext().open,
  ['--reka-accordion-content-height', '--reka-collapsible-content-height'],
);

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
