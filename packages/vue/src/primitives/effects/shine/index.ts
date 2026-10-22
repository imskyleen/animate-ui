import {
  computed,
  defineComponent,
  Fragment,
  h,
  isVNode,
  mergeProps,
  onBeforeUnmount,
  ref,
  watch,
  type Component,
  type VNode,
} from 'vue';
import { motion } from 'motion-v';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '../../../utils/motion';

type ShineProps = {
  color?: string;
  opacity?: number;
  delay?: number;
  duration?: number;
  loop?: boolean;
  loopDelay?: number;
  deg?: number;
  enable?: boolean;
  enableOnHover?: boolean;
  enableOnTap?: boolean;
  asChild?: boolean;
};

const shineProps = {
  color: { type: String, default: 'currentColor' },
  opacity: { type: Number, default: 0.3 },
  delay: { type: Number, default: 0 },
  duration: { type: Number, default: 1200 },
  loop: Boolean,
  loopDelay: { type: Number, default: 0 },
  deg: { type: Number, default: -15 },
  enable: { type: Boolean, default: true },
  enableOnHover: Boolean,
  enableOnTap: Boolean,
  asChild: Boolean,
} as const;

const call = (handler: unknown, event: Event) =>
  (handler as ((e: Event) => void) | undefined)?.(event);

function firstElement(nodes: VNode[] | undefined): VNode | null {
  for (const node of nodes ?? []) {
    if (!isVNode(node)) continue;
    if (node.type === Fragment && Array.isArray(node.children)) {
      const inner = firstElement(node.children as VNode[]);
      if (inner) return inner;
    } else if (typeof node.type !== 'symbol') return node;
  }
  return null;
}

/** The rebuilt child keeps the ref it was given. */
function keepRef(vnode: VNode, child: VNode) {
  if (child.ref) vnode.ref = child.ref;
  return vnode;
}

const ShineInner = defineComponent({
  name: 'ShineInner',
  inheritAttrs: false,
  props: shineProps,
  setup(props, { attrs, slots }) {
    const reduce = useShouldReduceMotion();
    const enable = computed(() => props.enable && !reduce.value);
    const isAlwaysOn = computed(
      () => enable.value && !props.enableOnHover && !props.enableOnTap,
    );
    const animateState = ref<'initial' | 'shine'>(
      isAlwaysOn.value ? 'shine' : 'initial',
    );
    const isHovered = ref(false);
    const currentDelay = ref(props.delay);
    let timeout: number | undefined;
    let frame: number | undefined;
    const clearLoop = () => {
      if (timeout !== undefined) window.clearTimeout(timeout);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      timeout = undefined;
      frame = undefined;
    };
    onBeforeUnmount(clearLoop);

    watch(
      () => [isAlwaysOn.value, props.delay] as const,
      ([alwaysOn, delay]) => {
        animateState.value = alwaysOn ? 'shine' : 'initial';
        if (alwaysOn) currentDelay.value = delay;
      },
    );

    const scheduleNextShine = (delayMs: number) => {
      clearLoop();
      if (delayMs > 0) {
        timeout = window.setTimeout(() => {
          animateState.value = 'shine';
          timeout = undefined;
        }, delayMs);
      } else {
        frame = window.requestAnimationFrame(() => {
          frame = window.requestAnimationFrame(() => {
            animateState.value = 'shine';
            frame = undefined;
          });
        });
      }
    };

    const restart = () => {
      animateState.value = 'initial';
      currentDelay.value = 0;
      scheduleNextShine(props.loopDelay);
    };
    const onAnimationComplete = () => {
      if (animateState.value !== 'shine') return;
      if (isAlwaysOn.value) {
        if (props.loop) restart();
        return;
      }
      if (props.enableOnHover) {
        if (isHovered.value && props.loop) restart();
        else animateState.value = 'initial';
        return;
      }
      if (props.enableOnTap) animateState.value = 'initial';
    };

    const onPointerdown = (event: PointerEvent) => {
      call(attrs.onPointerdown, event);
      if (!enable.value || !props.enableOnTap || isAlwaysOn.value) return;
      currentDelay.value = props.delay;
      animateState.value = 'shine';
    };
    const onMouseenter = (event: MouseEvent) => {
      call(attrs.onMouseenter, event);
      if (!enable.value || !props.enableOnHover || isAlwaysOn.value) return;
      isHovered.value = true;
      currentDelay.value = props.delay;
      animateState.value = 'shine';
    };
    const onMouseleave = (event: MouseEvent) => {
      call(attrs.onMouseleave, event);
      if (!enable.value || !props.enableOnHover || isAlwaysOn.value) return;
      isHovered.value = false;
      clearLoop();
    };

    const overlay = () =>
      h(motion.div as Component, {
        initial: 'initial',
        animate: animateState.value,
        variants: {
          initial: {
            x: '-100%',
            skewX: props.deg,
            transition: { duration: 0 },
          },
          shine: { x: '100%', skewX: props.deg },
        },
        transition: {
          duration: props.duration / 1000,
          ease: [0.4, 0, 0.2, 1],
          delay: currentDelay.value / 1000,
        },
        style: {
          position: 'absolute',
          inset: '0',
          zIndex: 10,
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          willChange: 'transform, opacity',
          background: `linear-gradient(to right, transparent, ${props.color}, transparent)`,
          opacity: props.opacity,
        },
        onAnimationComplete,
      });

    return () => {
      const own = {
        style: { position: 'relative', overflow: 'hidden' },
        onMouseenter,
        onMouseleave,
        onPointerdown,
      };
      if (props.asChild) {
        const child = firstElement(slots.default?.());
        if (!child) return null;
        const { style, ...rest } = attrs;
        const merged = mergeProps(child.props ?? {}, rest, {
          ...own,
          style: [
            child.props?.style,
            style,
            { position: 'relative', overflow: 'hidden' },
          ],
        });
        const shine = enable.value ? overlay() : null;
        if (typeof child.type === 'string') {
          const childChildren = Array.isArray(child.children)
            ? (child.children as VNode[])
            : typeof child.children === 'string'
              ? [child.children]
              : [];
          return keepRef(
            h(child.type, merged, [...childChildren, shine]),
            child,
          );
        }
        const childSlots = (child.children ?? {}) as Record<
          string,
          ((...args: unknown[]) => VNode[]) | undefined
        >;
        return keepRef(
          h(child.type as Component, merged, {
            ...childSlots,
            default: (...args: unknown[]) => [
              ...(childSlots.default?.(...args) ?? []),
              shine,
            ],
          }),
          child,
        );
      }
      return h(
        'div',
        {
          ...attrs,
          ...own,
          style: [{ position: 'relative', overflow: 'hidden' }, attrs.style],
        },
        [slots.default?.(), enable.value ? overlay() : null],
      );
    };
  },
});

/** A band of light that sweeps across its content, always or on hover/tap. */
const Shine = defineComponent({
  name: 'Shine',
  inheritAttrs: false,
  props: shineProps,
  setup(props, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(ShineInner, { ...attrs, ...props }, slots),
      );
  },
});

export { Shine, type ShineProps };
