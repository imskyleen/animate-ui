import {
  computed,
  defineComponent,
  h,
  inject,
  provide,
  ref,
  shallowRef,
  watch,
  type Component,
  type InjectionKey,
  type PropType,
} from 'vue';
import { motion, useInView } from 'motion-v';

import { useIsInView } from '../../../utils/use-is-in-view';
import { usePageVisible } from '../../../utils/use-page-visible';
import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '../../../utils/motion';
import { VISUALLY_HIDDEN, splitGraphemes } from '../_text';

type TypingPhase = 'typing' | 'holding' | 'erasing' | 'done';

type TypingState = {
  index: number;
  count: number;
  phase: TypingPhase;
};

const INITIAL_STATE: TypingState = { index: 0, count: 0, phase: 'typing' };

type TypingTextContextType = {
  isTyping: () => boolean;
  canBlink: () => boolean;
};

const TypingTextKey: InjectionKey<TypingTextContextType> = Symbol(
  'AnimateUITypingText',
);

const typingTextProps = {
  text: {
    type: [String, Array] as PropType<string | string[]>,
    required: true,
  },
  duration: { type: Number, default: 100 },
  delay: { type: Number, default: 0 },
  loop: Boolean,
  holdDelay: { type: Number, default: 1000 },
  inView: Boolean,
  inViewMargin: { type: String, default: '0px' },
  inViewOnce: { type: Boolean, default: true },
} as const;

type TypingTextProps = {
  text: string | string[];
  duration?: number;
  delay?: number;
  loop?: boolean;
  holdDelay?: number;
  inView?: boolean;
  inViewMargin?: string;
  inViewOnce?: boolean;
};

const TypingTextContent = defineComponent({
  name: 'TypingTextContent',
  inheritAttrs: false,
  props: typingTextProps,
  setup(props, { attrs, slots }) {
    const { element, isInView } = useIsInView(() => props);
    const reduce = useShouldReduceMotion();
    const pageVisible = usePageVisible();
    const onScreen = useInView(element, { initial: true } as never);

    const texts = computed(() =>
      typeof props.text === 'string' ? [props.text] : props.text,
    );
    const textsKey = computed(() => JSON.stringify(texts.value));
    const segments = computed(() =>
      (JSON.parse(textsKey.value) as string[]).map(splitGraphemes),
    );

    const isTyping = ref(false);
    const started = ref(false);
    watch(
      () => [isInView.value, props.delay] as const,
      ([inView, delay], _, onCleanup) => {
        if (!inView) return;
        const timeoutId = setTimeout(() => (started.value = true), delay);
        onCleanup(() => clearTimeout(timeoutId));
      },
      { immediate: true },
    );

    const textElement = shallowRef<HTMLElement | null>(null);
    let state: TypingState = { ...INITIAL_STATE };
    const write = () => {
      const el = textElement.value;
      if (!el) return;
      el.textContent = (segments.value[state.index] ?? [])
        .slice(0, state.count)
        .join('');
    };

    watch(
      () =>
        [segments.value, props.loop, reduce.value, textElement.value] as const,
      ([parts, loop, isReduced]) => {
        if (isReduced) {
          const last = parts.length - 1;
          const index = loop ? 0 : last;
          state = { index, count: parts[index]?.length ?? 0, phase: 'done' };
        } else {
          state = { ...INITIAL_STATE };
        }
        write();
      },
      { immediate: true, flush: 'post' },
    );

    const paused = computed(
      () => !pageVisible.value || (props.loop && !onScreen.value),
    );

    watch(
      () =>
        [
          segments.value,
          props.loop,
          reduce.value,
          started.value,
          paused.value,
        ] as const,
      ([parts, loop, isReduced, isStarted, isPaused], _, onCleanup) => {
        if (isReduced || !isStarted || isPaused) return;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        const schedule = (ms: number) => {
          timeoutId = setTimeout(step, ms);
        };
        function step() {
          const length = parts[state.index]?.length ?? 0;
          const isLast = state.index === parts.length - 1;
          switch (state.phase) {
            case 'typing':
              if (state.count < length) {
                state.count++;
                write();
                schedule(props.duration);
              } else if (isLast && !loop) {
                isTyping.value = false;
                state.phase = 'done';
              } else {
                isTyping.value = false;
                state.phase = 'holding';
                schedule(props.holdDelay);
              }
              break;
            case 'holding':
              isTyping.value = true;
              state.phase = 'erasing';
              schedule(props.duration);
              break;
            case 'erasing':
              if (state.count > 0) {
                state.count--;
                write();
              } else {
                state.index = isLast ? 0 : state.index + 1;
                state.phase = 'typing';
              }
              schedule(props.duration);
              break;
            case 'done':
              break;
          }
        }
        if (state.phase === 'typing' && state.count === 0)
          isTyping.value = true;
        if (state.phase !== 'done')
          schedule(
            state.phase === 'holding' ? props.holdDelay : props.duration,
          );
        onCleanup(() => clearTimeout(timeoutId));
      },
      { immediate: true, flush: 'post' },
    );

    provide(TypingTextKey, {
      isTyping: () => isTyping.value && !reduce.value,
      canBlink: () => !reduce.value && pageVisible.value && onScreen.value,
    });

    return () =>
      h('span', { ...attrs, ref: element, 'data-slot': 'typing-text' }, [
        h(
          'span',
          { class: 'sr-only', style: VISUALLY_HIDDEN },
          texts.value.join(', '),
        ),
        h('span', { ref: textElement, 'aria-hidden': 'true' }),
        slots.default?.(),
      ]);
  },
});

/** Text typed out letter by letter, then erased for the next one in a loop. */
const TypingText = defineComponent({
  name: 'TypingText',
  inheritAttrs: false,
  props: typingTextProps,
  setup(props, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(TypingTextContent, { ...attrs, ...props }, slots),
      );
  },
});

type TypingTextCursorProps = { variants?: Record<string, unknown> };

/** A cursor that blinks while the text waits, and holds still as it types. */
const TypingTextCursor = defineComponent({
  name: 'TypingTextCursor',
  inheritAttrs: false,
  props: { variants: Object as PropType<Record<string, unknown>> },
  setup(props, { attrs }) {
    const context = inject(TypingTextKey, null);
    if (!context)
      throw new Error('TypingTextCursor must be used within TypingText');
    return () =>
      h(motion.span as Component, {
        'data-slot': 'typing-text-cursor',
        'aria-hidden': 'true',
        variants: {
          blinking: {
            opacity: [0, 0, 1, 1],
            transition: {
              duration: 1,
              repeat: Infinity,
              repeatDelay: 0,
              ease: 'linear',
              times: [0, 0.5, 0.5, 1],
            },
          },
          visible: { opacity: 1 },
          ...props.variants,
        },
        animate:
          context.isTyping() || !context.canBlink() ? 'visible' : 'blinking',
        ...attrs,
        style: [
          {
            display: 'inline-block',
            height: '16px',
            transform: 'translateY(2px)',
            width: '1px',
            backgroundColor: 'currentColor',
          },
          attrs.style,
        ],
      });
  },
});

export {
  TypingText,
  TypingTextCursor,
  type TypingTextProps,
  type TypingTextCursorProps,
};
