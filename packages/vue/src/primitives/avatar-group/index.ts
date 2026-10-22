import {
  Comment,
  defineComponent,
  Fragment,
  h,
  type Component,
  type PropType,
  type VNode,
} from 'vue';
import { motion, type Transition } from 'motion-v';

import { motionTokens, useTempoTransition } from '../../utils/motion';
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  type TooltipArrowProps,
  type TooltipContentProps,
  type TooltipProps,
  type TooltipProviderProps,
} from '../tooltip';

const DEFAULT_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 17,
};
const DEFAULT_TOOLTIP_TRANSITION: Transition = motionTokens.spring.pop;

type Side = NonNullable<TooltipProps['side']>;
type Align = NonNullable<TooltipProps['align']>;

const flatten = (nodes: VNode[] = []): VNode[] =>
  nodes.flatMap((node) =>
    node.type === Fragment
      ? flatten(node.children as VNode[])
      : node.type === Comment
        ? []
        : [node],
  );

type AvatarGroupProps = {
  invertOverlap?: boolean;
  translate?: string | number;
  transition?: Transition;
  tooltipTransition?: Transition;
} & TooltipProviderProps &
  TooltipProps;

/** Overlapping avatars: the hovered one rises and shows its name. */
const AvatarGroup = defineComponent({
  name: 'AvatarGroup',
  inheritAttrs: false,
  props: {
    id: String,
    invertOverlap: Boolean,
    translate: { type: [String, Number], default: '-30%' },
    transition: Object as PropType<Transition>,
    tooltipTransition: Object as PropType<Transition>,
    openDelay: { type: Number, default: 0 },
    closeDelay: { type: Number, default: 0 },
    side: { type: String as PropType<Side>, default: 'top' },
    sideOffset: { type: Number, default: 25 },
    align: { type: String as PropType<Align>, default: 'center' },
    alignOffset: { type: Number, default: 0 },
  },
  setup(props, { attrs, slots }) {
    const defaultTransition = useTempoTransition(() => DEFAULT_TRANSITION);
    return () => {
      const children = flatten(slots.default?.());
      return h(
        TooltipProvider as Component,
        {
          id: props.id,
          openDelay: props.openDelay,
          closeDelay: props.closeDelay,
          transition: props.tooltipTransition ?? DEFAULT_TOOLTIP_TRANSITION,
        },
        () =>
          h(
            'div',
            {
              'data-slot': 'avatar-group',
              ...attrs,
              style: [{ display: 'flex', alignItems: 'center' }, attrs.style],
            },
            children.map((child, index) =>
              h(
                Tooltip as Component,
                {
                  key: index,
                  side: props.side,
                  sideOffset: props.sideOffset,
                  align: props.align,
                  alignOffset: props.alignOffset,
                },
                () =>
                  h(TooltipTrigger as Component, { asChild: true }, () =>
                    h(
                      motion.div as Component,
                      {
                        'data-slot': 'avatar-container',
                        initial: 'initial',
                        whileHover: 'hover',
                        whilePress: 'hover',
                        style: {
                          position: 'relative',
                          zIndex: props.invertOverlap
                            ? children.length - index
                            : index,
                        },
                      },
                      () =>
                        h(
                          motion.div as Component,
                          {
                            variants: {
                              initial: { y: 0 },
                              hover: { y: props.translate },
                            },
                            transition:
                              props.transition ?? defaultTransition.value,
                          },
                          () => child,
                        ),
                    ),
                  ),
              ),
            ),
          ),
      );
    };
  },
});

type AvatarGroupTooltipProps = TooltipContentProps;

/** An avatar's name, shown in the group's tooltip. */
const AvatarGroupTooltip = TooltipContent;

type AvatarGroupTooltipArrowProps = TooltipArrowProps;

/** The tooltip's arrow. */
const AvatarGroupTooltipArrow = TooltipArrow;

export {
  AvatarGroup,
  AvatarGroupTooltip,
  AvatarGroupTooltipArrow,
  type AvatarGroupProps,
  type AvatarGroupTooltipProps,
  type AvatarGroupTooltipArrowProps,
};
