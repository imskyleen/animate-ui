import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  onUpdated,
  ref,
  shallowRef,
  toValue,
  watch,
  type Component,
  type MaybeRefOrGetter,
  type PropType,
} from 'vue';

import { ReducedMotionConfig, useShouldReduceMotion } from '../../utils/motion';
import { useIsInView } from '../../utils/use-is-in-view';
import {
  CONTENT_CSS,
  followWriting,
  glideLines,
  lineLayout,
  type Layout,
  type Trail,
} from './content-effects';

type CodeBlockWriteInfo = { index: number; length: number; done: boolean };

type CodeWritingCadence = 'natural' | 'even';

type UseCodeWritingOptions = {
  writing?: boolean;
  duration?: number;
  delay?: number;
  cadence?: CodeWritingCadence;
  onDone?: () => void;
  onWrite?: (info: CodeBlockWriteInfo) => void;
  inView?: boolean;
  inViewOnce?: boolean;
  inViewMargin?: string;
};

const PAUSES: Record<string, number> = {
  ',': 3,
  ';': 3,
  ':': 2,
  '.': 2.5,
  '!': 3,
  '?': 3,
  '(': 1.4,
  '{': 1.6,
  '[': 1.4,
};

/**
 * When each character lands, from 0 to `duration`: like someone typing,
 * quicker inside a word, pausing after punctuation and at the end of a line,
 * the indentation of the next one coming at once.
 */
function writingTimes(
  characters: string[],
  duration: number,
  cadence: CodeWritingCadence,
) {
  let indenting = false;
  const weights = characters.map((character, index) => {
    if (cadence === 'even') return 1;
    const previous = characters[index - 1];
    if (previous === '\n') {
      indenting = true;
      return 6;
    }
    if (indenting && (character === ' ' || character === '\t')) return 0.15;
    indenting = false;
    if (previous && previous in PAUSES) return PAUSES[previous]!;
    if (character === ' ') return 1.5;
    if (/\w/.test(character) && previous && /\w/.test(previous)) return 0.8;
    return 1;
  });
  const total = weights.reduce((sum, weight) => sum + weight, 0) || 1;
  let elapsed = 0;
  return weights.map((weight) => (elapsed += (weight / total) * duration));
}

/** Types `code` out, one character at a time, over `duration`. */
function useCodeWriting(
  code: MaybeRefOrGetter<string>,
  options: () => UseCodeWritingOptions = () => ({}),
) {
  const { element, isInView } = useIsInView(() => ({
    inView: options().inView ?? false,
    inViewOnce: options().inViewOnce ?? true,
    inViewMargin: options().inViewMargin ?? '0px',
  }));
  const reduce = useShouldReduceMotion();
  const animated = computed(() => (options().writing ?? true) && !reduce.value);

  const visibleCode = ref(animated.value ? '' : toValue(code));
  const isDone = ref(!animated.value);
  let doneCode: string | null = null;

  watch(
    [
      () => toValue(code),
      () => options().duration ?? 5000,
      () => options().delay ?? 0,
      () => options().cadence ?? 'even',
      isInView,
      animated,
    ],
    ([text, duration, delay, cadence], _, onCleanup) => {
      if (!animated.value) {
        if (doneCode === text) return;
        doneCode = text;
        visibleCode.value = text;
        isDone.value = true;
        options().onDone?.();
        options().onWrite?.({
          index: text.length,
          length: text.length,
          done: true,
        });
        return;
      }

      if (!text.length || !isInView.value) return;

      doneCode = null;
      visibleCode.value = '';
      isDone.value = false;

      const characters = Array.from(text);
      const times = writingTimes(characters, duration, cadence);
      let index = 0;
      let start = 0;
      let timer: ReturnType<typeof setTimeout> | undefined;

      const tick = () => {
        const elapsed = performance.now() - start;
        const from = index;
        while (index < characters.length && times[index]! <= elapsed) index++;
        if (index > from) {
          visibleCode.value = characters.slice(0, index).join('');
          options().onWrite?.({
            index,
            length: characters.length,
            done: false,
          });
        }
        if (index < characters.length) {
          timer = setTimeout(tick, times[index]! - elapsed);
          return;
        }
        isDone.value = true;
        options().onDone?.();
        options().onWrite?.({
          index: characters.length,
          length: characters.length,
          done: true,
        });
      };

      timer = setTimeout(() => {
        start = performance.now();
        tick();
      }, delay);

      onCleanup(() => clearTimeout(timer));
    },
    { immediate: true },
  );

  return {
    element,
    /** A function ref (`:ref`) for an element or a component. */
    ref: (node: unknown) => {
      const el = (node as { $el?: unknown } | null)?.$el ?? node;
      element.value = el instanceof HTMLElement ? el : null;
    },
    code: visibleCode,
    done: isDone,
    writing: computed(() => animated.value && !isDone.value),
    isInView,
  };
}

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

function addStyle() {
  if (
    typeof document === 'undefined' ||
    document.getElementById('animate-ui-code-block')
  )
    return;
  const style = document.createElement('style');
  style.id = 'animate-ui-code-block';
  style.textContent = CONTENT_CSS;
  document.head.append(style);
}

/**
 * shadcn-vue's code block content (`pre`), animated: while `writing`, it
 * follows the last line, a cursor ends the code and the last characters fade
 * in behind it; wrapping on or off, the lines glide to their new place.
 */
const WritingContent = defineComponent({
  name: 'CodeBlockContentPrimitive',
  props: {
    /** The code is being written: the block follows its last line. */
    writing: { type: Boolean, default: false },
    /** A cursor at the end of the code while it's written. */
    cursor: { type: Boolean, default: true },
    as: { type: String, default: 'pre' },
  },
  setup(props, { attrs, slots }) {
    const pre = shallowRef<HTMLElement | null>(null);
    const reduce = useShouldReduceMotion();
    const trail: Trail = { last: null };
    const wrapped = () => Boolean(attrs['data-wrap']);
    let wrap = wrapped();
    let before: Layout | null = null;

    const follow = () => {
      const el = pre.value;
      if (!el) return;
      if (props.writing)
        requestAnimationFrame(() =>
          el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }),
        );
      followWriting(el, props.writing && props.cursor, trail);
    };

    onBeforeUpdate(() => {
      if (pre.value) before = lineLayout(pre.value);
    });
    // The code is rendered deeper down (shadcn-vue's own `code`): its changes
    // are watched in the DOM.
    let observer: MutationObserver | undefined;
    onMounted(() => {
      addStyle();
      follow();
      if (!pre.value) return;
      observer = new MutationObserver(follow);
      observer.observe(pre.value, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    });
    watch(() => [props.writing, props.cursor], follow, { flush: 'post' });
    onUpdated(() => {
      const el = pre.value;
      if (el && wrapped() !== wrap && before && !reduce.value)
        glideLines(el, before);
      wrap = wrapped();
    });
    onBeforeUnmount(() => {
      observer?.disconnect();
      clearTimeout(trail.idle);
    });

    return () =>
      h(
        props.as,
        {
          ref: pre,
          'data-writing': props.writing || undefined,
        },
        slots.default?.(),
      );
  },
});

export {
  CodeBlock,
  WritingContent as Content,
  useCodeWriting,
  type CodeWritingCadence,
  type CodeBlockProps,
  type CodeBlockWriteInfo,
  type UseCodeWritingOptions,
};
