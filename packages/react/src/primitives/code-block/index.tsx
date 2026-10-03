'use client';

import * as React from 'react';

import { ReducedMotionConfig, useShouldReduceMotion } from '../../utils/motion';
import {
  useIsInView,
  type UseIsInViewOptions,
} from '../../utils/use-is-in-view';

// Highlights code with Shiki (loaded on demand) and, with `writing`, types it
// out character by character over `duration`. Under reduced motion the code
// is shown at once.

type CodeBlockProps = React.ComponentProps<'div'> & {
  code: string;
  lang: string;
  theme?: 'light' | 'dark';
  themes?: { light: string; dark: string };
  writing?: boolean;
  duration?: number;
  delay?: number;
  onDone?: () => void;
  onWrite?: (info: { index: number; length: number; done: boolean }) => void;
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
  const { ref: localRef, isInView } = useIsInView(
    ref as React.Ref<HTMLDivElement>,
    {
      inView,
      inViewOnce,
      inViewMargin,
    },
  );
  const reduce = useShouldReduceMotion();
  const animated = writing && !reduce;

  const [visibleCode, setVisibleCode] = React.useState('');
  const [highlightedCode, setHighlightedCode] = React.useState('');
  const [isDone, setIsDone] = React.useState(false);

  // Callbacks in refs: passing new functions on each render doesn't restart
  // the writing.
  const onDoneRef = React.useRef(onDone);
  const onWriteRef = React.useRef(onWrite);
  React.useLayoutEffect(() => {
    onDoneRef.current = onDone;
    onWriteRef.current = onWrite;
  });

  const lightTheme = themes.light;
  const darkTheme = themes.dark;

  React.useEffect(() => {
    if (!visibleCode.length || !isInView) return;
    // Highlighting is async: a slower result must not replace a newer one.
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
    if (!animated) {
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

    setVisibleCode('');
    setIsDone(false);

    const characters = Array.from(code);
    let index = 0;
    const interval = duration / characters.length;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const timeout = setTimeout(() => {
      intervalId = setInterval(() => {
        if (index < characters.length) {
          index += 1;
          setVisibleCode(characters.slice(0, index).join(''));
          onWriteRef.current?.({
            index,
            length: characters.length,
            done: false,
          });
          localRef.current?.scrollTo({
            top: localRef.current?.scrollHeight,
            behavior: 'smooth',
          });
        } else {
          clearInterval(intervalId);
          setIsDone(true);
          onDoneRef.current?.();
          onWriteRef.current?.({
            index: characters.length,
            length: characters.length,
            done: true,
          });
        }
      }, interval);
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(intervalId);
    };
  }, [code, duration, delay, isInView, animated, localRef]);

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

export { CodeBlock, type CodeBlockProps };
