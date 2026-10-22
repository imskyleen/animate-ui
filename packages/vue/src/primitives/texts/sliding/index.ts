import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  watch,
  type Component,
  type PropType,
} from 'vue';
import {
  animate,
  motion,
  motionValue,
  type AnimationPlaybackControls,
  type Transition,
} from 'motion-v';

import {
  ReducedMotionConfig,
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';

type SlidingTextDirection = 'up' | 'down';

type SlidingTextTrigger = 'hover' | 'click';

const BLEED = '0.25em';

const GAP = '0.6em';

// Inside a link or a button, the whole control slides it, not just its text.
const HOST = 'a, button, [role="button"], [role="link"]';

const DEFAULT_TRANSITION: Transition = {
  duration: 0.25,
  ease: motionTokens.ease.fill,
};

const slidingTextProps = {
  text: { type: String, required: true },
  direction: {
    type: String as PropType<SlidingTextDirection>,
    default: 'down',
  },
  trigger: { type: String as PropType<SlidingTextTrigger>, default: 'hover' },
  transition: Object as PropType<Transition>,
} as const;

type SlidingTextProps = {
  text: string;
  direction?: SlidingTextDirection;
  trigger?: SlidingTextTrigger;
  transition?: Transition;
};

const SlidingTextContent = defineComponent({
  name: 'SlidingTextContent',
  inheritAttrs: false,
  props: slidingTextProps,
  setup(props, { attrs }) {
    const reduce = useShouldReduceMotion();
    const defaultTransition = useTempoTransition(() => DEFAULT_TRANSITION);
    const progress = motionValue(0);
    const y = motionValue('0%');
    const sign = () => (props.direction === 'down' ? 1 : -1);
    const place = (value: number) => {
      const lap = sign() * (value - Math.floor(value));
      y.set(lap === 0 ? '0%' : `calc(${lap * 100}% + ${lap} * ${GAP})`);
    };
    progress.on('change', place);
    let target = 0;
    let controls: AnimationPlaybackControls | null = null;
    onBeforeUnmount(() => controls?.stop());

    const slideTo = (next: number) => {
      target = next;
      controls?.stop();
      if (reduce.value) {
        progress.jump(next);
        place(next);
        return;
      }
      controls = animate(
        progress,
        next,
        props.transition ?? defaultTransition.value,
      );
    };
    const call = (handler: unknown, ...args: unknown[]) =>
      (handler as ((...a: unknown[]) => void) | undefined)?.(...args);

    const element = shallowRef<Element | null>(null);
    const host = shallowRef<Element | null>(null);
    onMounted(() => {
      host.value = element.value?.parentElement?.closest(HOST) ?? null;
    });
    watch([host, () => props.trigger], ([node, trigger], _, onCleanup) => {
      if (!node) return;
      const enter = (event: Event) => {
        if (
          trigger === 'hover' &&
          (event as PointerEvent).pointerType !== 'touch'
        )
          slideTo(1);
      };
      const leave = (event: Event) => {
        if (
          trigger === 'hover' &&
          (event as PointerEvent).pointerType !== 'touch'
        )
          slideTo(0);
      };
      const click = () => {
        if (trigger === 'click') slideTo(Math.round(target) + 1);
      };
      node.addEventListener('pointerenter', enter);
      node.addEventListener('pointerleave', leave);
      node.addEventListener('click', click);
      onCleanup(() => {
        node.removeEventListener('pointerenter', enter);
        node.removeEventListener('pointerleave', leave);
        node.removeEventListener('click', click);
      });
    });

    return () => {
      const s = sign();
      return h(
        motion.span as Component,
        {
          ref: (node: unknown) => {
            const el = (node as { $el?: unknown } | null)?.$el ?? node;
            element.value = el instanceof Element ? el : null;
          },
          'data-slot': 'sliding-text',
          'data-direction': props.direction,
          'data-trigger': props.trigger,
          ...attrs,
          style: [
            {
              position: 'relative',
              display: 'inline-block',
              overflow: 'clip',
              paddingBlock: BLEED,
              marginBlock: `calc(-1 * ${BLEED})`,
            },
            attrs.style,
          ],
          onHoverStart: (event: MouseEvent, info: unknown) => {
            if (props.trigger === 'hover' && !host.value) slideTo(1);
            call(attrs.onHoverStart, event, info);
          },
          onHoverEnd: (event: MouseEvent, info: unknown) => {
            if (props.trigger === 'hover' && !host.value) slideTo(0);
            call(attrs.onHoverEnd, event, info);
          },
          onClick: (event: MouseEvent) => {
            if (props.trigger === 'click' && !host.value)
              slideTo(Math.round(target) + 1);
            call(attrs.onClick, event);
          },
        },
        () =>
          h(
            motion.span as Component,
            {
              'data-slot': 'sliding-text-track',
              style: { position: 'relative', display: 'inline-block', y },
            },
            () => [
              props.text,
              h(
                'span',
                {
                  'data-slot': 'sliding-text-copy',
                  'aria-hidden': 'true',
                  style: {
                    position: 'absolute',
                    left: '0',
                    top: `calc(${-s * 100}% - ${s} * ${GAP})`,
                    width: '100%',
                  },
                },
                props.text,
              ),
            ],
          ),
      );
    };
  },
});

/** Text that slides out as a copy of it slides in, on hover or click. */
const SlidingText = defineComponent({
  name: 'SlidingText',
  inheritAttrs: false,
  props: slidingTextProps,
  setup(props, { attrs }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(SlidingTextContent, { ...attrs, ...props }),
      );
  },
});

export {
  SlidingText,
  type SlidingTextProps,
  type SlidingTextDirection,
  type SlidingTextTrigger,
};
