import {
  computed,
  defineComponent,
  h,
  ref,
  watch,
  type Component,
  type PropType,
} from 'vue';

import { ReducedMotionConfig, useShouldReduceMotion } from '../../utils/motion';
import { useIsInView } from '../../utils/use-is-in-view';

type CodeBlockWriteInfo = { index: number; length: number; done: boolean };

type CodeBlockProps = {
  code: string;
  lang: string;
  theme?: 'light' | 'dark';
  themes?: { light: string; dark: string };
  writing?: boolean;
  duration?: number;
  delay?: number;
  scrollContainer?: HTMLElement | null;
  inView?: boolean;
  inViewOnce?: boolean;
  inViewMargin?: string;
};

const DEFAULT_THEMES = { light: 'github-light', dark: 'github-dark' };

const CodeBlockContent = defineComponent({
  name: 'CodeBlockContent',
  inheritAttrs: false,
  props: {
    code: { type: String, required: true },
    lang: { type: String, required: true },
    theme: { type: String as PropType<'light' | 'dark'>, default: 'light' },
    themes: {
      type: Object as PropType<{ light: string; dark: string }>,
      default: () => DEFAULT_THEMES,
    },
    writing: Boolean,
    duration: { type: Number, default: 5000 },
    delay: { type: Number, default: 0 },
    scrollContainer: Object as PropType<HTMLElement | null>,
    inView: Boolean,
    inViewOnce: { type: Boolean, default: true },
    inViewMargin: { type: String, default: '0px' },
  },
  emits: {
    done: () => true,
    write: (_info: CodeBlockWriteInfo) => true,
  },
  setup(props, { attrs, emit }) {
    const { element, isInView } = useIsInView(() => props);
    const reduce = useShouldReduceMotion();
    const animated = computed(() => props.writing && !reduce.value);

    const visibleCode = ref('');
    const highlightedCode = ref('');
    const isDone = ref(false);
    let doneCode: string | null = null;

    watch(
      [
        () => props.lang,
        () => props.themes.light,
        () => props.themes.dark,
        isInView,
        visibleCode,
        () => props.theme,
      ],
      (_, __, onCleanup) => {
        if (!visibleCode.value.length || !isInView.value) return;
        let cancelled = false;
        onCleanup(() => {
          cancelled = true;
        });
        void (async () => {
          try {
            const { codeToHtml } = await import('shiki');
            const highlighted = await codeToHtml(visibleCode.value, {
              lang: props.lang,
              themes: { light: props.themes.light, dark: props.themes.dark },
              defaultColor: props.theme,
            });
            if (!cancelled) highlightedCode.value = highlighted;
          } catch (error) {
            console.error(
              `Language "${props.lang}" could not be loaded.`,
              error,
            );
          }
        })();
      },
      { immediate: true },
    );

    watch(
      [
        () => props.code,
        () => props.duration,
        () => props.delay,
        isInView,
        animated,
      ],
      (_, __, onCleanup) => {
        const code = props.code;
        if (!animated.value) {
          if (doneCode === code) return;
          doneCode = code;
          visibleCode.value = code;
          isDone.value = true;
          emit('done');
          emit('write', {
            index: code.length,
            length: code.length,
            done: true,
          });
          return;
        }

        if (!code.length || !isInView.value) return;

        doneCode = null;
        visibleCode.value = '';
        isDone.value = false;

        const characters = Array.from(code);
        let index = 0;
        const interval = props.duration / characters.length;
        let intervalId: ReturnType<typeof setInterval> | undefined;

        const timeout = setTimeout(() => {
          intervalId = setInterval(() => {
            if (index < characters.length) {
              index += 1;
              visibleCode.value = characters.slice(0, index).join('');
              emit('write', { index, length: characters.length, done: false });
              element.value?.scrollTo({
                top: element.value.scrollHeight,
                behavior: 'smooth',
              });
            } else {
              clearInterval(intervalId);
              isDone.value = true;
              emit('done');
              emit('write', {
                index: characters.length,
                length: characters.length,
                done: true,
              });
            }
          }, interval);
        }, props.delay);

        onCleanup(() => {
          clearTimeout(timeout);
          clearInterval(intervalId);
        });
      },
      { immediate: true },
    );

    watch(
      [highlightedCode, animated, isInView, () => props.scrollContainer],
      (_, __, onCleanup) => {
        if (!animated.value || !isInView.value) return;
        const el =
          props.scrollContainer ??
          element.value?.parentElement ??
          element.value;
        if (!el) return;
        const frame = requestAnimationFrame(() => {
          el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        });
        onCleanup(() => cancelAnimationFrame(frame));
      },
      { flush: 'post' },
    );

    return () =>
      h('div', {
        ref: (node: unknown) => {
          element.value = node instanceof HTMLElement ? node : null;
        },
        'data-slot': 'code-block',
        'data-writing': String(props.writing),
        'data-done': String(isDone.value),
        innerHTML: highlightedCode.value,
        ...attrs,
      });
  },
});

/** Code highlighted with Shiki, typed out character by character when `writing`. */
const CodeBlock = defineComponent({
  name: 'CodeBlock',
  inheritAttrs: false,
  setup(_, { attrs }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(CodeBlockContent as Component, attrs),
      );
  },
});

export { CodeBlock, type CodeBlockProps, type CodeBlockWriteInfo };
