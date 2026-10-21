import { defineComponent, h } from 'vue';
import {
  CollapsibleContent as RekaCollapsibleContent,
  CollapsibleRoot as RekaCollapsibleRoot,
  injectCollapsibleRootContext,
  type CollapsibleContentProps as RekaCollapsibleContentProps,
} from 'reka-ui';

import { ReducedMotionConfig } from '../../../utils/motion';
import {
  createDisclosureContent,
  type PanelAnimationProps,
} from '../../../internal/disclosure-panel';

type CollapsibleContentProps = RekaCollapsibleContentProps &
  PanelAnimationProps;

const CollapsibleRoot = defineComponent({
  name: 'CollapsibleRoot',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () => h(RekaCollapsibleRoot, attrs, slots));
  },
}) as unknown as typeof RekaCollapsibleRoot;

const CollapsibleContent = createDisclosureContent(
  'CollapsibleContent',
  RekaCollapsibleContent,
  () => injectCollapsibleRootContext().open,
  ['--reka-collapsible-content-height', '--reka-collapsible-content-width'],
);

export {
  CollapsibleTrigger,
  type CollapsibleRootEmits,
  type CollapsibleRootProps,
  type CollapsibleTriggerProps,
} from 'reka-ui';

export { CollapsibleRoot, CollapsibleContent, type CollapsibleContentProps };
