import {
  defineComponent,
  h,
  inject,
  onMounted,
  provide,
  ref,
  shallowRef,
  toRef,
  watch,
  type Component,
  type InjectionKey,
  type PropType,
  type Ref,
} from 'vue';
import {
  AnimatePresence,
  cancelFrame,
  frame,
  motion,
  useMotionValue,
  useSpring,
  type MotionValue,
  type SpringOptions,
  type Transition,
} from 'motion-v';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';
import { Slot } from '../slot';

const OPACITY_TRANSITION: Transition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.35, 1],
};
const ENTER_TRANSITION: Transition = {
  scale: { type: 'spring', stiffness: 550, damping: 30, restSpeed: 10 },
  opacity: OPACITY_TRANSITION,
};
const EXIT_TRANSITION: Transition = {
  scale: {
    type: 'spring',
    stiffness: 550,
    damping: 2 * Math.sqrt(550),
    restSpeed: 10,
  },
  opacity: OPACITY_TRANSITION,
};
const FOLLOW_SPRING: SpringOptions = { stiffness: 500, damping: 50, bounce: 0 };

type CursorContextType = {
  cursorX: MotionValue<number>;
  cursorY: MotionValue<number>;
  active: Ref<boolean>;
  global: () => boolean;
  container: Ref<HTMLElement | null>;
  cursor: Ref<HTMLElement | null>;
};

const CursorKey: InjectionKey<CursorContextType> = Symbol('AnimateUICursor');

function useCursor() {
  const context = inject(CursorKey, null);
  if (!context)
    throw new Error('useCursor must be used within a CursorProvider');
  return context;
}

const elementOf = (node: unknown) => {
  const element = (node as { $el?: unknown } | null)?.$el ?? node;
  return element instanceof HTMLElement ? element : null;
};

type CursorProviderProps = {
  global?: boolean;
};

/** Follows the pointer, over its container's parent or the whole page. */
const CursorProvider = defineComponent({
  name: 'CursorProvider',
  props: {
    global: Boolean,
  },
  setup(props, { slots }) {
    const cursorX = useMotionValue(0);
    const cursorY = useMotionValue(0);
    const active = ref(false);
    const container = shallowRef<HTMLElement | null>(null);
    const cursor = shallowRef<HTMLElement | null>(null);
    const setActive = (next: boolean) => {
      if (active.value !== next) active.value = next;
    };

    onMounted(() => {
      const id = '__cursor_none_style__';
      if (document.getElementById(id)) return;
      const style = document.createElement('style');
      style.id = id;
      style.textContent = `
      .animate-ui-cursor-none, .animate-ui-cursor-none * { cursor: none !important; }
    `;
      document.head.appendChild(style);
    });

    watch(
      () => [props.global, container.value] as const,
      ([global, element], _, onCleanup) => {
        if (global) {
          const handlePointerMove = (e: PointerEvent) => {
            if (e.pointerType === 'touch') return;
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            setActive(true);
          };
          const handlePointerOut = (e: PointerEvent | MouseEvent) => {
            if (e instanceof PointerEvent && e.relatedTarget === null)
              setActive(false);
          };
          const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') setActive(false);
          };
          window.addEventListener('pointermove', handlePointerMove, {
            passive: true,
          });
          window.addEventListener('pointerout', handlePointerOut, {
            passive: true,
          });
          window.addEventListener('mouseout', handlePointerOut, {
            passive: true,
          });
          document.addEventListener('visibilitychange', handleVisibilityChange);
          onCleanup(() => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerout', handlePointerOut);
            window.removeEventListener('mouseout', handlePointerOut);
            document.removeEventListener(
              'visibilitychange',
              handleVisibilityChange,
            );
          });
          return;
        }

        const parent = element?.parentElement;
        if (!parent) return;
        if (getComputedStyle(parent).position === 'static')
          parent.style.position = 'relative';

        const handlePointerMove = (e: PointerEvent) => {
          if (e.pointerType === 'touch') return;
          const rect = parent.getBoundingClientRect();
          cursorX.set(e.clientX - rect.left);
          cursorY.set(e.clientY - rect.top);
          setActive(true);
        };
        const handlePointerOut = (e: PointerEvent | MouseEvent) => {
          if (
            e.relatedTarget === null ||
            !parent.contains(e.relatedTarget as Node)
          )
            setActive(false);
        };
        parent.addEventListener('pointermove', handlePointerMove, {
          passive: true,
        });
        parent.addEventListener('pointerout', handlePointerOut, {
          passive: true,
        });
        parent.addEventListener('mouseout', handlePointerOut, {
          passive: true,
        });
        onCleanup(() => {
          parent.removeEventListener('pointermove', handlePointerMove);
          parent.removeEventListener('pointerout', handlePointerOut);
          parent.removeEventListener('mouseout', handlePointerOut);
        });
      },
      { immediate: true, flush: 'post' },
    );

    provide(CursorKey, {
      cursorX,
      cursorY,
      active,
      global: () => props.global,
      container,
      cursor,
    });

    return () => h(ReducedMotionConfig, null, slots);
  },
});

type CursorContainerProps = {
  asChild?: boolean;
};

/** Marks the area: the cursor follows the pointer over its parent. */
const CursorContainer = defineComponent({
  name: 'CursorContainer',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
  },
  setup(props, { attrs, slots }) {
    const { container, global, active } = useCursor();
    return () =>
      h(
        (props.asChild ? Slot : motion.div) as Component,
        {
          'data-slot': 'cursor-container',
          'data-global': global(),
          'data-active': active.value,
          ...attrs,
          ref: (node: unknown) => {
            container.value = elementOf(node);
          },
        },
        slots,
      );
  },
});

type CursorProps = {
  asChild?: boolean;
  transition?: Transition;
};

/** The cursor drawn in place of the system one. */
const Cursor = defineComponent({
  name: 'Cursor',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    transition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    const { cursorX, cursorY, active, container, cursor, global } = useCursor();
    const enterTransition = useTempoTransition(() => ENTER_TRANSITION);
    const exitTransition = useTempoTransition(() => EXIT_TRANSITION);

    watch(
      () => [active.value, global(), container.value] as const,
      ([isActive, isGlobal, element], _, onCleanup) => {
        const target = isGlobal
          ? document.documentElement
          : element?.parentElement;
        if (!target) return;
        target.classList.toggle('animate-ui-cursor-none', isActive);
        onCleanup(() => target.classList.remove('animate-ui-cursor-none'));
      },
      { immediate: true, flush: 'post' },
    );

    return () =>
      h(AnimatePresence as Component, null, () =>
        active.value
          ? h(
              (props.asChild ? Slot : motion.div) as Component,
              {
                'data-slot': 'cursor',
                'data-global': global(),
                'data-active': active.value,
                initial: { scale: 0, opacity: 0 },
                animate: { scale: 1, opacity: 1 },
                exit: {
                  scale: 0,
                  opacity: 0,
                  ...(props.transition
                    ? {}
                    : { transition: exitTransition.value }),
                },
                transition: props.transition ?? enterTransition.value,
                ...attrs,
                ref: (node: unknown) => {
                  cursor.value = elementOf(node);
                },
                style: [
                  {
                    pointerEvents: 'none',
                    zIndex: 9999,
                    position: global() ? 'fixed' : 'absolute',
                    top: 0,
                    left: 0,
                    x: cursorX,
                    y: cursorY,
                  },
                  attrs.style,
                ],
              },
              slots,
            )
          : null,
      );
  },
});

type CursorFollowSide = 'top' | 'right' | 'bottom' | 'left';
type CursorFollowAlign = 'start' | 'center' | 'end';

type CursorFollowProps = {
  asChild?: boolean;
  side?: CursorFollowSide;
  sideOffset?: number;
  align?: CursorFollowAlign;
  alignOffset?: number;
  transition?: SpringOptions;
};

/** An element that trails the cursor, on a spring. */
const CursorFollow = defineComponent({
  name: 'CursorFollow',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    side: { type: String as PropType<CursorFollowSide>, default: 'bottom' },
    sideOffset: { type: Number, default: 0 },
    align: { type: String as PropType<CursorFollowAlign>, default: 'end' },
    alignOffset: { type: Number, default: 0 },
    transition: Object as PropType<SpringOptions>,
  },
  setup(props, { attrs, slots }) {
    const defaultTransition = useTempoTransition(() => FOLLOW_SPRING);
    const enterTransition = useTempoTransition(() => ENTER_TRANSITION);
    const exitTransition = useTempoTransition(() => EXIT_TRANSITION);
    const { cursorX, cursorY, active, cursor, global } = useCursor();
    const reduce = useShouldReduceMotion();
    const follow = shallowRef<HTMLElement | null>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const spring = toRef(
      () => props.transition ?? (defaultTransition.value as SpringOptions),
    );
    const springX = useSpring(x, spring);
    const springY = useSpring(y, spring);

    const calculateOffset = () => {
      const rect = follow.value?.getBoundingClientRect();
      const width = rect?.width ?? 0;
      const height = rect?.height ?? 0;
      const { side, align, sideOffset, alignOffset } = props;
      let offsetX = 0;
      let offsetY = 0;
      const along = (size: number) =>
        align === 'start'
          ? size + alignOffset
          : align === 'center'
            ? size / 2
            : -alignOffset;
      switch (side) {
        case 'top':
          offsetY = height + sideOffset;
          offsetX = along(width);
          break;
        case 'bottom':
          offsetY = -sideOffset;
          offsetX = along(width);
          break;
        case 'left':
          offsetX = width + sideOffset;
          offsetY = along(height);
          break;
        case 'right':
          offsetX = -sideOffset;
          offsetY = along(height);
          break;
      }
      return { x: offsetX, y: offsetY };
    };

    const update = () => {
      const offset = calculateOffset();
      const cursorRect = cursor.value?.getBoundingClientRect();
      const cursorWidth = cursorRect?.width ?? 20;
      const cursorHeight = cursorRect?.height ?? 20;
      x.set(cursorX.get() - offset.x + cursorWidth / 2);
      y.set(cursorY.get() - offset.y + cursorHeight / 2);
    };

    watch(
      () => [props.side, props.align, props.sideOffset, props.alignOffset],
      update,
      { immediate: true },
    );

    watch(
      active,
      (isActive, _, onCleanup) => {
        if (!isActive) return;
        frame.postRender(update);
        const unsubscribeX = cursorX.on('change', update);
        const unsubscribeY = cursorY.on('change', update);
        onCleanup(() => {
          cancelFrame(update);
          unsubscribeX();
          unsubscribeY();
        });
      },
      { immediate: true },
    );

    return () =>
      h(AnimatePresence as Component, null, () =>
        active.value
          ? h(
              (props.asChild ? Slot : motion.div) as Component,
              {
                'data-slot': 'cursor-follow',
                'data-global': global(),
                'data-active': active.value,
                initial: { scale: 0, opacity: 0 },
                animate: { scale: 1, opacity: 1 },
                exit: {
                  scale: 0,
                  opacity: 0,
                  transition: exitTransition.value,
                },
                transition: enterTransition.value,
                ...attrs,
                ref: (node: unknown) => {
                  follow.value = elementOf(node);
                },
                style: [
                  {
                    pointerEvents: 'none',
                    zIndex: 9998,
                    position: global() ? 'fixed' : 'absolute',
                    top: 0,
                    left: 0,
                    x: reduce.value ? x : springX,
                    y: reduce.value ? y : springY,
                  },
                  attrs.style,
                ],
              },
              slots,
            )
          : null,
      );
  },
});

export {
  CursorProvider,
  Cursor,
  CursorContainer,
  CursorFollow,
  useCursor,
  type CursorProviderProps,
  type CursorProps,
  type CursorContainerProps,
  type CursorFollowProps,
  type CursorFollowAlign,
  type CursorFollowSide,
  type CursorContextType,
};
