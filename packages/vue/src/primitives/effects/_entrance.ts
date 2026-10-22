import {
  defineComponent,
  Fragment,
  h,
  isVNode,
  type Component,
  type ComponentObjectPropsOptions,
  type ComputedRef,
  type PropType,
  type VNode,
} from 'vue';
import { motion, type Transition } from 'motion-v';

import {
  motionTokens,
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';
import { useIsInView } from '../../utils/use-is-in-view';
import { Slot } from '../slot';

const DEFAULT_TRANSITION: Transition = motionTokens.spring.entrance;

const entranceProps = {
  transition: Object as PropType<Transition>,
  delay: { type: Number, default: 0 },
  inView: Boolean,
  inViewMargin: { type: String, default: '0px' },
  inViewOnce: { type: Boolean, default: true },
  asChild: Boolean,
} as const;

type EntranceProps = {
  transition?: Transition;
  delay?: number;
  inView?: boolean;
  inViewMargin?: string;
  inViewOnce?: boolean;
  asChild?: boolean;
};

type Variants = {
  hidden: Record<string, unknown>;
  visible: Record<string, unknown>;
};

const elementOf = (node: unknown) => {
  const element = (node as { $el?: unknown } | null)?.$el ?? node;
  return element instanceof HTMLElement ? element : null;
};

function flatten(nodes: VNode[] | undefined): VNode[] {
  return (nodes ?? []).flatMap((node) =>
    isVNode(node) && node.type === Fragment && Array.isArray(node.children)
      ? flatten(node.children as VNode[])
      : isVNode(node) && typeof node.type === 'symbol'
        ? []
        : [node],
  );
}

/**
 * An entrance effect (and its list, whose children come in `hold-delay`
 * apart): hidden, then visible once in view if asked.
 */
function createEntrance<P extends ComponentObjectPropsOptions>(
  name: string,
  own: P,
  variants: (
    props: Record<string, unknown>,
    reduce: ComputedRef<boolean>,
  ) => Variants,
  { remount = true }: { remount?: boolean } = {},
) {
  const props = { ...entranceProps, ...own };
  const Inner = defineComponent({
    name: `${name}Inner`,
    inheritAttrs: false,
    props,
    setup(rawProps, { attrs, slots }) {
      const p = rawProps as unknown as EntranceProps & Record<string, unknown>;
      const defaultTransition = useTempoTransition(() => DEFAULT_TRANSITION);
      const { element, isInView } = useIsInView(() => p);
      const reduce = useShouldReduceMotion();
      return () => {
        const base = p.transition ?? defaultTransition.value;
        return h(
          (p.asChild ? Slot : motion.div) as Component,
          {
            ref: (node: unknown) => {
              element.value = elementOf(node);
            },
            initial: 'hidden',
            animate: isInView.value ? 'visible' : 'hidden',
            exit: 'hidden',
            variants: variants(p, reduce),
            transition: {
              ...base,
              delay: (base.delay ?? 0) + (p.delay ?? 0) / 1000,
            },
            ...attrs,
          },
          slots,
        );
      };
    },
  });
  const Single = defineComponent({
    name,
    inheritAttrs: false,
    props,
    setup(p, { attrs, slots }) {
      return () =>
        remount
          ? h(ReducedMotionConfig, { remount: true }, () =>
              h(Inner as Component, { ...attrs, ...p }, slots),
            )
          : h(Inner as Component, { ...attrs, ...p }, slots);
    },
  });
  const List = defineComponent({
    name: `${name}s`,
    inheritAttrs: false,
    props: { ...props, holdDelay: { type: Number, default: 0 } },
    setup(p, { attrs, slots }) {
      return () => {
        const { holdDelay, delay, ...rest } = p as unknown as {
          holdDelay: number;
          delay: number;
        } & Record<string, unknown>;
        return flatten(slots.default?.()).map((child, index) =>
          h(
            Single as Component,
            {
              ...attrs,
              ...rest,
              key: child.key ?? index,
              delay: delay + index * holdDelay,
            },
            () => child,
          ),
        );
      };
    },
  });
  return { Single, List };
}

export { createEntrance, type EntranceProps };
