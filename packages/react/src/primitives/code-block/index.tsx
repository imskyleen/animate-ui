'use client';

import * as React from 'react';

import { mergeRefs } from '../../internal/anchored';
import { ReducedMotionConfig, useShouldReduceMotion } from '../../utils/motion';
import {
  useIsInView,
  type UseIsInViewOptions,
} from '../../utils/use-is-in-view';
import {
  CONTENT_CSS,
  followWriting,
  glideLines,
  lineLayout,
  type Layout,
  type Trail,
} from './content-effects';

type CodeWritingInfo = { index: number; length: number; done: boolean };

type CodeWritingCadence = 'natural' | 'even';

type UseCodeWritingOptions = {
  writing?: boolean;
  duration?: number;
  delay?: number;
  cadence?: CodeWritingCadence;
  onDone?: () => void;
  onWrite?: (info: CodeWritingInfo) => void;
} & UseIsInViewOptions;

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
function useCodeWriting<T extends HTMLElement = HTMLElement>(
  code: string,
  {
    writing = true,
    duration = 5000,
    delay = 0,
    cadence = 'even',
    onDone,
    onWrite,
    inView = false,
    inViewOnce = true,
    inViewMargin = '0px',
  }: UseCodeWritingOptions = {},
  ref: React.Ref<T> = null,
) {
  const { ref: localRef, isInView } = useIsInView(ref, {
    inView,
    inViewOnce,
    inViewMargin,
  });
  const reduce = useShouldReduceMotion();
  const animated = writing && !reduce;

  const [visibleCode, setVisibleCode] = React.useState(animated ? '' : code);
  const [isDone, setIsDone] = React.useState(!animated);

  const onDoneRef = React.useRef(onDone);
  const onWriteRef = React.useRef(onWrite);
  const doneCodeRef = React.useRef<string | null>(null);
  React.useLayoutEffect(() => {
    onDoneRef.current = onDone;
    onWriteRef.current = onWrite;
  });

  React.useEffect(() => {
    if (!animated) {
      if (doneCodeRef.current === code) return;
      doneCodeRef.current = code;
      setVisibleCode(code);
      setIsDone(true);
      onDoneRef.current?.();
      onWriteRef.current?.({
        index: code.length,
        length: code.length,
        done: true,
      });
      return;
    }

    if (!code.length || !isInView) return;

    doneCodeRef.current = null;
    setVisibleCode('');
    setIsDone(false);

    const characters = Array.from(code);
    const times = writingTimes(characters, duration, cadence);
    let index = 0;
    let start = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = () => {
      const elapsed = performance.now() - start;
      const from = index;
      while (index < characters.length && times[index]! <= elapsed) index++;
      if (index > from) {
        setVisibleCode(characters.slice(0, index).join(''));
        onWriteRef.current?.({
          index,
          length: characters.length,
          done: false,
        });
      }
      if (index < characters.length) {
        timer = setTimeout(tick, times[index]! - elapsed);
        return;
      }
      setIsDone(true);
      onDoneRef.current?.();
      onWriteRef.current?.({
        index: characters.length,
        length: characters.length,
        done: true,
      });
    };

    timer = setTimeout(() => {
      start = performance.now();
      tick();
    }, delay);

    return () => clearTimeout(timer);
  }, [code, duration, delay, cadence, isInView, animated]);

  return {
    ref: localRef,
    code: visibleCode,
    done: isDone,
    writing: animated && !isDone,
    isInView,
  };
}

type CodeBlockProps = React.ComponentProps<'div'> & {
  code: string;
  lang: string;
  theme?: 'light' | 'dark';
  themes?: { light: string; dark: string };
  writing?: boolean;
  duration?: number;
  delay?: number;
  onDone?: () => void;
  onWrite?: (info: CodeWritingInfo) => void;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
} & UseIsInViewOptions;

const DEFAULT_THEMES = { light: 'github-light', dark: 'github-dark' };

function CodeBlock(props: CodeBlockProps) {
  return (
    <ReducedMotionConfig>
      <CodeBlockContent {...props} />
    </ReducedMotionConfig>
  );
}

function CodeBlockContent({
  ref,
  code,
  lang,
  theme = 'light',
  themes = DEFAULT_THEMES,
  writing = false,
  duration = 5000,
  delay = 0,
  onDone,
  onWrite,
  scrollContainerRef,
  inView = false,
  inViewOnce = true,
  inViewMargin = '0px',
  ...props
}: CodeBlockProps) {
  const {
    ref: localRef,
    code: visibleCode,
    done: isDone,
    isInView,
  } = useCodeWriting<HTMLDivElement>(
    code,
    {
      writing,
      duration,
      delay,
      inView,
      inViewOnce,
      inViewMargin,
      onDone,
      onWrite: (info) => {
        onWrite?.(info);
        if (!info.done)
          localRef.current?.scrollTo({
            top: localRef.current?.scrollHeight,
            behavior: 'smooth',
          });
      },
    },
    ref as React.Ref<HTMLDivElement>,
  );
  const reduce = useShouldReduceMotion();
  const animated = writing && !reduce;
  const [highlightedCode, setHighlightedCode] = React.useState('');

  const lightTheme = themes.light;
  const darkTheme = themes.dark;

  React.useEffect(() => {
    if (!visibleCode.length || !isInView) return;
    let cancelled = false;

    const loadHighlightedCode = async () => {
      try {
        const { codeToHtml } = await import('shiki');

        const highlighted = await codeToHtml(visibleCode, {
          lang,
          themes: { light: lightTheme, dark: darkTheme },
          defaultColor: theme,
        });

        if (!cancelled) setHighlightedCode(highlighted);
      } catch (e) {
        console.error(`Language "${lang}" could not be loaded.`, e);
      }
    };

    loadHighlightedCode();
    return () => {
      cancelled = true;
    };
  }, [lang, lightTheme, darkTheme, isInView, visibleCode, theme]);

  React.useEffect(() => {
    if (!animated || !isInView) return;
    const el =
      scrollContainerRef?.current ??
      (localRef.current?.parentElement as HTMLElement | null) ??
      (localRef.current as unknown as HTMLElement | null);

    if (!el) return;

    const frame = requestAnimationFrame(() => {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth',
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [highlightedCode, animated, isInView, scrollContainerRef, localRef]);

  return (
    <div
      ref={localRef}
      data-slot="code-block"
      data-writing={writing}
      data-done={isDone}
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
      {...props}
    />
  );
}

type ContentProps = React.ComponentProps<'pre'> & {
  /** The code is being written: the block follows its last line. */
  writing?: boolean;
  /** A cursor at the end of the code while it's written. */
  cursor?: boolean;
};

/**
 * shadcn/ui's code block content (`pre`), animated: while `writing`, it
 * follows the last line, a cursor ends the code and the last characters fade
 * in behind it; wrapping on or off, the lines glide to their new place.
 */
function Content({
  ref,
  writing = false,
  cursor = true,
  children,
  ...props
}: ContentProps) {
  const localRef = React.useRef<HTMLPreElement>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, localRef), [ref]);
  const reduce = useShouldReduceMotion();
  const typing = writing && cursor;
  const wrap = Boolean((props as Record<string, unknown>)['data-wrap']);

  React.useEffect(() => {
    const pre = localRef.current;
    if (!writing || !pre) return;
    const frame = requestAnimationFrame(() =>
      pre.scrollTo({ top: pre.scrollHeight, behavior: 'smooth' }),
    );
    return () => cancelAnimationFrame(frame);
  });

  const trailRef = React.useRef<Trail>({ last: null });
  React.useLayoutEffect(() => {
    const pre = localRef.current;
    if (!pre) return;
    const trail = trailRef.current;
    followWriting(pre, typing, trail);
    return () => clearTimeout(trail.idle);
  });

  const layoutRef = React.useRef<Layout | null>(null);
  const wrapRef = React.useRef(wrap);
  React.useLayoutEffect(() => {
    const pre = localRef.current;
    if (!pre) return;
    const before = layoutRef.current;
    if (wrapRef.current !== wrap && before && !reduce) glideLines(pre, before);
    wrapRef.current = wrap;
    layoutRef.current = lineLayout(pre);
  });

  return (
    <>
      <style href="animate-ui-code-block" precedence="animate-ui">
        {CONTENT_CSS}
      </style>
      <pre
        ref={mergedRef}
        data-writing={writing || undefined}
        {...props}
      >
        {children}
      </pre>
    </>
  );
}

export {
  CodeBlock,
  Content,
  type ContentProps,
  useCodeWriting,
  type CodeBlockProps,
  type CodeWritingCadence,
  type CodeWritingInfo,
  type UseCodeWritingOptions,
};
