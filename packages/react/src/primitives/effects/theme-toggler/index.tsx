'use client';

import * as React from 'react';
import { flushSync } from 'react-dom';

import {
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
} from '../../../utils/motion';

type ThemeSelection = 'light' | 'dark' | 'system';
type Resolved = 'light' | 'dark';
type Direction = 'btt' | 'ttb' | 'ltr' | 'rtl';

type ChildrenRender =
  | React.ReactNode
  | ((state: {
      resolved: Resolved;
      effective: ThemeSelection;
      toggleTheme: (theme: ThemeSelection) => void;
    }) => React.ReactNode);

function getSystemEffective(): Resolved {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getClipKeyframes(direction: Direction): [string, string] {
  switch (direction) {
    case 'ltr':
      return ['inset(0 100% 0 0)', 'inset(0 0 0 0)'];
    case 'rtl':
      return ['inset(0 0 0 100%)', 'inset(0 0 0 0)'];
    case 'ttb':
      return ['inset(0 0 100% 0)', 'inset(0 0 0 0)'];
    case 'btt':
      return ['inset(100% 0 0 0)', 'inset(0 0 0 0)'];
    default:
      return ['inset(0 100% 0 0)', 'inset(0 0 0 0)'];
  }
}

type ThemeTogglerProps = {
  theme: ThemeSelection;
  resolvedTheme: Resolved;
  setTheme: (theme: ThemeSelection) => void;
  direction?: Direction;
  onImmediateChange?: (theme: ThemeSelection) => void;
  children?: ChildrenRender;
};

/** Wipe duration in ms at tempo 1. */
const WIPE_DURATION = 700;
const WIPE_EASING = 'ease-in-out';

function subscribeToNothing() {
  return () => {};
}

/**
 * False during SSR and hydration, true afterwards. Theme libraries (e.g.
 * next-themes) only know the theme on the client, so rendering it on the
 * first pass makes the server HTML and the hydrating client disagree.
 */
function useIsMounted() {
  return React.useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

/** Rendered on the server and while hydrating, before the theme is known. */
const PLACEHOLDER_STATE = {
  effective: 'system',
  resolved: 'light',
} as const satisfies { effective: ThemeSelection; resolved: Resolved };

function ThemeToggler(props: ThemeTogglerProps) {
  return (
    <ReducedMotionConfig>
      <ThemeTogglerInner {...props} />
    </ReducedMotionConfig>
  );
}

function ThemeTogglerInner({
  theme,
  resolvedTheme,
  setTheme,
  onImmediateChange,
  direction = 'ltr',
  children,
  ...props
}: ThemeTogglerProps) {
  const mounted = useIsMounted();
  const reduce = useShouldReduceMotion();
  const tokens = useMotionTokens();
  const wipeDuration = WIPE_DURATION * tokens.tempo;
  const [preview, setPreview] = React.useState<null | {
    effective: ThemeSelection;
    resolved: Resolved;
  }>(null);
  const [current, setCurrent] = React.useState<{
    effective: ThemeSelection;
    resolved: Resolved;
  }>({
    effective: theme,
    resolved: resolvedTheme,
  });

  React.useEffect(() => {
    if (
      preview &&
      theme === preview.effective &&
      resolvedTheme === preview.resolved
    ) {
      setPreview(null);
    }
  }, [theme, resolvedTheme, preview]);

  const [fromClip, toClip] = getClipKeyframes(direction);

  const toggleTheme = React.useCallback(
    async (theme: ThemeSelection) => {
      const resolved = theme === 'system' ? getSystemEffective() : theme;

      setCurrent({ effective: theme, resolved });
      onImmediateChange?.(theme);

      if (theme === 'system' && resolved === resolvedTheme) {
        setTheme(theme);
        return;
      }

      // Reduced motion: swap instantly, no wipe.
      if (reduce || !document.startViewTransition) {
        flushSync(() => {
          setPreview({ effective: theme, resolved });
        });
        setTheme(theme);
        return;
      }

      await document.startViewTransition(() => {
        flushSync(() => {
          setPreview({ effective: theme, resolved });
          document.documentElement.classList.toggle(
            'dark',
            resolved === 'dark',
          );
        });
      }).ready;

      document.documentElement
        .animate(
          { clipPath: [fromClip, toClip] },
          {
            duration: wipeDuration,
            easing: WIPE_EASING,
            pseudoElement: '::view-transition-new(root)',
          },
        )
        .finished.finally(() => {
          setTheme(theme);
        });
    },
    [
      onImmediateChange,
      resolvedTheme,
      fromClip,
      toClip,
      setTheme,
      reduce,
      wipeDuration,
    ],
  );

  const state = mounted ? current : PLACEHOLDER_STATE;

  return (
    <React.Fragment {...props}>
      {typeof children === 'function'
        ? children({
            effective: state.effective,
            resolved: state.resolved,
            toggleTheme,
          })
        : children}
      <style>{`::view-transition-old(root), ::view-transition-new(root){animation:none;mix-blend-mode:normal;}`}</style>
    </React.Fragment>
  );
}

export {
  ThemeToggler,
  type ThemeTogglerProps,
  type ThemeSelection,
  type Resolved,
  type Direction,
};
