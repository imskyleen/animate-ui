import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  watch,
  type Component,
  type InjectionKey,
  type PropType,
  type SlotsType,
} from 'vue';
import {
  motion,
  useAnimationControls,
  useInView,
  type LegacyAnimationControls,
  type Options,
  type Variants,
} from 'motion-v';

import { Slot } from '../primitives/slot';
import {
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
} from '../utils/motion';

const settleVelocity = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );

const staticAnimations = {
  path: {
    initial: { pathLength: 1 },
    animate: {
      pathLength: [0.05, 1],
      transition: {
        duration: 0.8,
        ease: 'easeInOut',
      },
    },
  } as Variants,
  'path-loop': {
    initial: { pathLength: 1 },
    animate: {
      pathLength: [1, 0.05, 1],
      transition: {
        duration: 1.6,
        ease: 'easeInOut',
      },
    },
  } as Variants,
} as const;

type StaticAnimations = keyof typeof staticAnimations;
type TriggerProp<T = string> = boolean | StaticAnimations | T;
type Trigger = TriggerProp<string>;

type AnimateIconContextValue = {
  controls: LegacyAnimationControls | undefined;
  animation: StaticAnimations | string;
  loop: boolean | undefined;
  loopDelay: number | undefined;
  active: boolean | undefined;
  animate?: Trigger;
  initialOnAnimateEnd?: boolean;
  completeOnStop?: boolean;
  persistOnAnimateEnd?: boolean;
  delay?: number;
  speed?: number;
  startsAnimated?: boolean;
};

type IconProps<T = string> = {
  animate?: TriggerProp<T>;
  animateOnHover?: TriggerProp<T>;
  animateOnTap?: TriggerProp<T>;
  animateOnView?: TriggerProp<T>;
  animateOnViewMargin?: string;
  animateOnViewOnce?: boolean;
  animation?: T | StaticAnimations;
  loop?: boolean;
  loopDelay?: number;
  initialOnAnimateEnd?: boolean;
  completeOnStop?: boolean;
  persistOnAnimateEnd?: boolean;
  delay?: number;
  speed?: number;
  size?: number;
};

type AnimateIconProps<T = string> = Omit<IconProps<T>, 'size'> & {
  asChild?: boolean;
};

const AnimateIconKey: InjectionKey<() => AnimateIconContextValue> = Symbol(
  'AnimateUIAnimateIcon',
);

const NO_CONTEXT: AnimateIconContextValue = {
  controls: undefined,
  animation: 'default',
  loop: undefined,
  loopDelay: undefined,
  active: undefined,
  animate: undefined,
  initialOnAnimateEnd: undefined,
  completeOnStop: undefined,
  persistOnAnimateEnd: undefined,
  delay: undefined,
  speed: undefined,
};

/** The animation state of the nearest `AnimateIcon` (or of an icon on its own). */
function useAnimateIconContext(): () => AnimateIconContextValue {
  const context = inject(AnimateIconKey, null);
  return context ?? (() => NO_CONTEXT);
}

const trigger = {
  type: [Boolean, String] as PropType<Trigger>,
  default: undefined,
};

const triggerProps = {
  animate: trigger,
  animateOnHover: trigger,
  animateOnTap: trigger,
  animateOnView: trigger,
  animateOnViewMargin: { type: String, default: undefined },
  animateOnViewOnce: { type: Boolean, default: undefined },
  animation: { type: String, default: undefined },
  loop: { type: Boolean, default: undefined },
  loopDelay: { type: Number, default: undefined },
  initialOnAnimateEnd: { type: Boolean, default: undefined },
  completeOnStop: { type: Boolean, default: undefined },
  persistOnAnimateEnd: { type: Boolean, default: undefined },
  delay: { type: Number, default: undefined },
  speed: { type: Number, default: undefined },
  initial: { type: Boolean, default: undefined },
} as const;

/** An icon's own props, with every option left unset until it's given. */
const iconProps = {
  ...triggerProps,
  size: { type: Number, default: undefined },
} as const;

const elementOf = (node: unknown) => {
  const element = (node as { $el?: unknown } | null)?.$el ?? node;
  return element instanceof Element ? element : null;
};

type Handler = (event: Event) => void;
const call = (handler: unknown, event: Event) => {
  if (Array.isArray(handler)) handler.forEach((h) => (h as Handler)(event));
  else if (typeof handler === 'function') (handler as Handler)(event);
};

const AnimateIconRoot = defineComponent({
  name: 'AnimateIconRoot',
  inheritAttrs: false,
  props: {
    ...triggerProps,
    asChild: Boolean,
  },
  setup(props, { attrs, slots }) {
    const o = {
      animate: () => props.animate ?? false,
      animateOnHover: () => props.animateOnHover ?? false,
      animateOnTap: () => props.animateOnTap ?? false,
      animateOnView: () => props.animateOnView ?? false,
      animation: () => props.animation ?? 'default',
      loop: () => props.loop ?? false,
      loopDelay: () => props.loopDelay ?? 0,
      initialOnAnimateEnd: () => props.initialOnAnimateEnd ?? false,
      completeOnStop: () => props.completeOnStop ?? false,
      persistOnAnimateEnd: () => props.persistOnAnimateEnd ?? false,
      delay: () => props.delay ?? 0,
    };
    const controls = useAnimationControls();
    const reduceMotion = useShouldReduceMotion();

    const initialAnimate = o.animate();
    const localAnimate = ref(initialAnimate === false ? false : o.delay() <= 0);
    const currentAnimation = ref<string>(
      typeof initialAnimate === 'string' ? initialAnimate : o.animation(),
    );
    let status: 'initial' | 'animate' = 'initial';

    const playing = computed(() => localAnimate.value && !reduceMotion.value);

    let delayTimer: ReturnType<typeof setTimeout> | null = null;
    let loopDelayTimer: ReturnType<typeof setTimeout> | null = null;
    let isAnimateInProgress = false;
    let animateEndPromise: Promise<void> | null = null;
    let resolveAnimateEnd: (() => void) | null = null;
    let active = playing.value;
    let runGen = 0;
    let cancelled = false;

    const bumpGeneration = () => {
      runGen++;
    };

    const startAnimation = (value: Trigger) => {
      const next = typeof value === 'string' ? value : o.animation();
      bumpGeneration();
      if (delayTimer) {
        clearTimeout(delayTimer);
        delayTimer = null;
      }
      currentAnimation.value = next;
      if (o.delay() > 0) {
        localAnimate.value = false;
        delayTimer = setTimeout(() => (localAnimate.value = true), o.delay());
      } else localAnimate.value = true;
    };

    const stopAnimation = () => {
      bumpGeneration();
      if (delayTimer) {
        clearTimeout(delayTimer);
        delayTimer = null;
      }
      if (loopDelayTimer) {
        clearTimeout(loopDelayTimer);
        loopDelayTimer = null;
      }
      localAnimate.value = false;
    };

    watch(playing, (value) => (active = value));

    watch(
      () => props.animate,
      (value) => {
        const animate = value ?? false;
        currentAnimation.value =
          typeof animate === 'string' ? animate : o.animation();
        if (animate) startAnimation(animate);
        else stopAnimation();
      },
      { immediate: true },
    );

    onBeforeUnmount(() => {
      if (delayTimer) clearTimeout(delayTimer);
      if (loopDelayTimer) clearTimeout(loopDelayTimer);
    });

    const element = shallowRef<Element | null>(null);
    const viewOnce = props.animateOnViewOnce ?? true;
    const inView = useInView(element as never, {
      once: viewOnce,
      margin: (props.animateOnViewMargin ?? '0px') as never,
    });
    const onScreen = useInView(element as never);
    let resume: (() => void) | null = null;
    watch(onScreen, (value) => {
      if (value) {
        resume?.();
        resume = null;
      }
    });

    const startAnim = async (
      anim: 'initial' | 'animate',
      method: 'start' | 'set' | 'jump' = 'start',
    ) => {
      try {
        if (method === 'jump') await controls.start(anim, { duration: 0 });
        else await controls[method](anim);
        status = anim;
      } catch {
        return;
      }
    };

    watch(
      () => [inView.value, o.animateOnView()] as const,
      ([isInView, onView]) => {
        if (!onView) return;
        if (isInView) startAnimation(onView);
        else stopAnimation();
      },
    );

    let mounted = false;
    let instant = props.initial === false;
    const startsAnimated = ref(instant && playing.value);
    const run = async (gen: number): Promise<void> => {
      const stale = () => cancelled || gen !== runGen;
      if (stale()) {
        await startAnim('initial');
        return;
      }
      if (!playing.value) {
        if (reduceMotion.value) {
          await startAnim('initial', 'set');
          return;
        }
        if (o.completeOnStop() && isAnimateInProgress && animateEndPromise) {
          try {
            await animateEndPromise;
          } catch {
            // the animation was replaced
          }
        }
        if (!o.persistOnAnimateEnd()) await startAnim('initial');
        return;
      }
      if (o.loop()) {
        if (stale()) {
          await startAnim('initial');
          return;
        }
        await startAnim('initial', 'set');
        await settleVelocity();
      }
      isAnimateInProgress = true;
      animateEndPromise = new Promise<void>((resolve) => {
        resolveAnimateEnd = resolve;
      });
      const finish = () => {
        isAnimateInProgress = false;
        resolveAnimateEnd?.();
        resolveAnimateEnd = null;
        animateEndPromise = null;
      };
      if (stale()) {
        finish();
        await startAnim('initial');
        return;
      }
      await startAnim('animate', instant ? 'jump' : 'start');
      startsAnimated.value = false;
      if (stale()) {
        finish();
        await startAnim('initial');
        return;
      }
      finish();
      if (o.initialOnAnimateEnd()) {
        if (stale()) {
          await startAnim('initial');
          return;
        }
        await startAnim('initial', 'set');
      }
      if (!o.loop()) return;
      if (o.loopDelay() > 0)
        await new Promise<void>((resolve) => {
          loopDelayTimer = setTimeout(() => {
            loopDelayTimer = null;
            resolve();
          }, o.loopDelay());
        });
      if (stale()) {
        await startAnim('initial');
        return;
      }
      if (!active) {
        if (status !== 'initial' && !o.persistOnAnimateEnd())
          await startAnim('initial');
        return;
      }
      const target = element.value;
      if (target && target.getClientRects().length > 0 && !onScreen.value) {
        await new Promise<void>((resolve) => {
          resume = resolve;
        });
        if (stale()) return;
      }
      await run(gen);
    };

    const start = () => {
      runGen++;
      cancelled = false;
      void run(runGen);
      instant = false;
    };
    // The controls need the icon's elements: the first run waits for the mount.
    onMounted(() => {
      mounted = true;
      start();
    });
    watch(playing, () => {
      if (!mounted) return;
      cancelled = true;
      resume?.();
      resume = null;
      if (delayTimer) {
        clearTimeout(delayTimer);
        delayTimer = null;
      }
      if (loopDelayTimer) {
        clearTimeout(loopDelayTimer);
        loopDelayTimer = null;
      }
      start();
    });

    provide(AnimateIconKey, () => ({
      controls,
      animation: currentAnimation.value,
      loop: o.loop(),
      loopDelay: o.loopDelay(),
      active: playing.value,
      animate: props.animate ?? false,
      initialOnAnimateEnd: o.initialOnAnimateEnd(),
      completeOnStop: o.completeOnStop(),
      persistOnAnimateEnd: o.persistOnAnimateEnd(),
      delay: o.delay(),
      speed: props.speed,
      startsAnimated: startsAnimated.value,
    }));

    const handlers = {
      onPointerenter: (event: PointerEvent) => {
        call(attrs.onPointerenter, event);
        const hover = o.animateOnHover();
        if (hover && event.pointerType !== 'touch') startAnimation(hover);
      },
      onPointerleave: (event: PointerEvent) => {
        call(attrs.onPointerleave, event);
        if (o.animateOnHover() || o.animateOnTap()) stopAnimation();
      },
      onPointerdown: (event: PointerEvent) => {
        call(attrs.onPointerdown, event);
        const tap = o.animateOnTap();
        if (tap) startAnimation(tap);
      },
      onPointerup: (event: PointerEvent) => {
        call(attrs.onPointerup, event);
        if (o.animateOnTap()) stopAnimation();
      },
      onPointercancel: (event: PointerEvent) => {
        call(attrs.onPointercancel, event);
        if (o.animateOnTap()) stopAnimation();
      },
    };

    return () =>
      h(
        (props.asChild ? Slot : motion.span) as Component,
        {
          ...attrs,
          ...handlers,
          ref: (node: unknown) => {
            element.value = elementOf(node);
          },
        },
        slots,
      );
  },
});

/** Animates the icons inside it: hovered, tapped, in view, or while `animate` is on. */
const AnimateIcon = defineComponent({
  name: 'AnimateIcon',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(AnimateIconRoot as Component, attrs, slots),
      );
  },
});

const pathClassName = 'animate-ui-icon-path';

const PATH_STYLE = `.${pathClassName} [stroke-dasharray='1 1'],.${pathClassName} [stroke-dasharray='1px 1px']{stroke-dasharray:1px 0px!important}`;

function injectPathStyle() {
  const id = 'animate-ui-icon-path';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = PATH_STYLE;
  document.head.appendChild(style);
}

/** Adds the style the path animations need: for an icon that always draws its paths. */
function usePathStyle() {
  onMounted(injectPathStyle);
}

type IconAnimations = { default: Record<string, Variants> } & Record<
  string,
  Record<string, Variants>
>;

function resolveVariants(
  animations: IconAnimations,
  animationType: string,
): Record<string, Variants> {
  if (!(animationType in staticAnimations))
    return animations[animationType] ?? animations.default;
  const variant = staticAnimations[animationType as StaticAnimations];
  const result: Record<string, Variants> = {};
  for (const key in animations.default) {
    if (
      (animationType === 'path' || animationType === 'path-loop') &&
      key.includes('group')
    )
      continue;
    result[key] = variant;
  }
  return result;
}

const TIME_KEYS = new Set([
  'duration',
  'delay',
  'repeatDelay',
  'delayChildren',
  'staggerChildren',
]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProps = Record<string, any>;

function isPlainObject(value: unknown): value is AnyProps {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function scaleTiming(transition: AnyProps, factor: number) {
  const result: AnyProps = {};
  for (const key in transition) {
    const value = transition[key];
    if (typeof value === 'number' && TIME_KEYS.has(key))
      result[key] = value * factor;
    else if (typeof value === 'number' && key === 'stiffness')
      result[key] = value / (factor * factor);
    else if (typeof value === 'number' && key === 'damping')
      result[key] = value / factor;
    else if (isPlainObject(value)) result[key] = scaleTiming(value, factor);
    else result[key] = value;
  }
  return result;
}

function scaleTarget(target: unknown, factor: number): unknown {
  if (typeof target === 'function')
    return (...args: unknown[]) =>
      scaleTarget((target as (...a: unknown[]) => unknown)(...args), factor);
  if (!isPlainObject(target) || !isPlainObject(target.transition))
    return target;
  return { ...target, transition: scaleTiming(target.transition, factor) };
}

function scaleVariants(
  variants: Record<string, Variants>,
  factor: number,
): Record<string, Variants> {
  const result: AnyProps = {};
  for (const element in variants) {
    const elementVariants = variants[element] as AnyProps;
    const scaled: AnyProps = {};
    for (const name in elementVariants)
      scaled[name] = scaleTarget(elementVariants[name], factor);
    result[element] = scaled;
  }
  return result;
}

/** The variants of an icon's elements for the animation playing, paced by `speed` and `tempo`. */
function useIconVariants(animations: IconAnimations) {
  const context = useAnimateIconContext();
  const tokens = useMotionTokens();
  return computed(() => {
    const { animation, speed = 1 } = context();
    const factor = tokens.value.tempo / speed;
    const variants = resolveVariants(animations, animation);
    return factor === 1 ? variants : scaleVariants(variants, factor);
  });
}

const getVariants = useIconVariants;

type IconSlotProps = {
  variants: Record<string, NonNullable<Options['variants']>>;
  controls: LegacyAnimationControls | undefined;
  size: number;
  attrs: Record<string, unknown>;
};

type IconSlots = SlotsType<{ default: (props: IconSlotProps) => unknown }>;

const IconContent = defineComponent({
  name: 'IconContent',
  props: {
    animations: { type: Object as PropType<IconAnimations>, required: true },
    size: { type: Number, default: 28 },
    pathClass: Boolean,
  },
  slots: Object as IconSlots,
  setup(props, { attrs, slots }) {
    const context = useAnimateIconContext();
    const variants = useIconVariants(props.animations);
    // Mounted animated (`initial` false): each part starts where `animate` takes it.
    const shown = computed(() =>
      context().startsAnimated
        ? Object.fromEntries(
            Object.entries(variants.value).map(([part, v]) => {
              const target = (v as Record<string, unknown>).animate;
              if (!target || typeof target !== 'object') return [part, v];
              const { transition: _, ...at } = target as Record<
                string,
                unknown
              >;
              return [part, { ...v, initial: at }];
            }),
          )
        : variants.value,
    );
    return () =>
      slots.default?.({
        variants: shown.value as IconSlotProps['variants'],
        controls: context().controls,
        size: props.size,
        attrs: {
          ...attrs,
          class: [attrs.class, props.pathClass && pathClassName],
        },
      });
  },
});

const OverrideContext = defineComponent({
  name: 'IconContext',
  props: {
    value: {
      type: Function as PropType<() => AnimateIconContextValue>,
      required: true,
    },
  },
  setup(props, { slots }) {
    provide(AnimateIconKey, () => props.value());
    return () => slots.default?.();
  },
});

/**
 * An icon: it animates on its own (`animate`, `animate-on-hover`…) or with
 * the nearest `AnimateIcon`. Its default slot draws it from `variants`,
 * `controls`, `size` and `attrs`.
 */
const IconWrapper = defineComponent({
  name: 'IconWrapper',
  inheritAttrs: false,
  props: {
    ...iconProps,
    animations: { type: Object as PropType<IconAnimations>, required: true },
  },
  slots: Object as IconSlots,
  setup(props, { attrs, slots }) {
    const inherited = inject(AnimateIconKey, null);
    onMounted(() => {
      const animation = props.animation ?? inherited?.().animation;
      if (animation === 'path' || animation === 'path-loop') injectPathStyle();
    });

    return () => {
      const size = props.size ?? 28;
      const drawsPaths = (animation: string | undefined) =>
        animation === 'path' || animation === 'path-loop';
      const content = (pathClass: boolean) =>
        h(
          IconContent,
          { ...attrs, animations: props.animations, size, pathClass },
          slots,
        );

      if (inherited) {
        const parent = inherited();
        const hasOverrides =
          props.animate !== undefined ||
          props.animateOnHover !== undefined ||
          props.animateOnTap !== undefined ||
          props.animateOnView !== undefined ||
          props.loop !== undefined ||
          props.loopDelay !== undefined ||
          props.initialOnAnimateEnd !== undefined ||
          props.persistOnAnimateEnd !== undefined ||
          props.delay !== undefined ||
          props.speed !== undefined ||
          props.completeOnStop !== undefined;
        const animation = props.animation ?? parent.animation;
        if (hasOverrides) {
          const inheritedAnimate: Trigger = parent.active
            ? (props.animation ?? parent.animation ?? 'default')
            : false;
          return h(
            AnimateIcon,
            {
              animate: props.animate ?? inheritedAnimate,
              animateOnHover: props.animateOnHover,
              animateOnTap: props.animateOnTap,
              animateOnView: props.animateOnView,
              animateOnViewMargin: props.animateOnViewMargin,
              animateOnViewOnce: props.animateOnViewOnce,
              animation,
              loop: props.loop ?? parent.loop,
              loopDelay: props.loopDelay ?? parent.loopDelay,
              persistOnAnimateEnd:
                props.persistOnAnimateEnd ?? parent.persistOnAnimateEnd,
              initialOnAnimateEnd:
                props.initialOnAnimateEnd ?? parent.initialOnAnimateEnd,
              delay: props.delay,
              speed: props.speed ?? parent.speed,
              completeOnStop: props.completeOnStop ?? parent.completeOnStop,
              initial: props.initial,
              asChild: true,
            },
            () => content(drawsPaths(animation)),
          );
        }
        return h(
          OverrideContext,
          { value: () => ({ ...inherited(), animation }) },
          () => content(drawsPaths(animation)),
        );
      }

      if (
        props.animate !== undefined ||
        props.animateOnHover !== undefined ||
        props.animateOnTap !== undefined ||
        props.animateOnView !== undefined ||
        props.animation !== undefined
      )
        return h(
          AnimateIcon,
          {
            animate: props.animate,
            animateOnHover: props.animateOnHover,
            animateOnTap: props.animateOnTap,
            animateOnView: props.animateOnView,
            animateOnViewMargin: props.animateOnViewMargin,
            animateOnViewOnce: props.animateOnViewOnce,
            animation: props.animation,
            loop: props.loop,
            loopDelay: props.loopDelay,
            delay: props.delay,
            speed: props.speed,
            completeOnStop: props.completeOnStop,
            persistOnAnimateEnd: props.persistOnAnimateEnd,
            initialOnAnimateEnd: props.initialOnAnimateEnd,
            initial: props.initial,
            asChild: true,
          },
          () => content(drawsPaths(props.animation)),
        );

      return content(drawsPaths(props.animation));
    };
  },
});

export {
  pathClassName,
  usePathStyle,
  staticAnimations,
  iconProps,
  AnimateIcon,
  IconWrapper,
  useAnimateIconContext,
  useIconVariants,
  getVariants,
  type IconProps,
  type AnimateIconProps,
  type AnimateIconContextValue,
  type IconAnimations,
  type IconSlotProps,
  type StaticAnimations,
};
