'use client';

import * as React from 'react';
import {
  ProgressBar as AriaProgressBar,
  type ProgressBarProps as AriaProgressBarProps,
} from 'react-aria-components';
import { animate, type Transition } from 'motion/react';

import {
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
} from '../../../utils/motion';
import { progressTransition, revealTransform } from '../../../internal/progress';

// Same API as React Aria's ProgressBar. React Aria only hands its children a
// `percentage`; the bar itself is your markup, sized with an inline
// percentage width (`style={{ width: `${percentage}%` }}`, as shadcn/ui and
// React Aria's docs do). The ProgressBar finds that element, keeps it full
// width and reveals the value with an animated transform instead (the track
// clips it, as shadcn/ui's `overflow-x-hidden` track does).

type ProgressBarProps = AriaProgressBarProps & {
  /**
   * Transition of the bar moving to a new value. Defaults to `spring.snappy`
   * without bounce (600ms), which retargets smoothly.
   */
  transition?: Transition;
};

// Our full width, told apart from a width React writes (`100%` is a value).
const FULL_WIDTH = 'calc(100%)';

function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') ref(node);
  else if (ref) ref.current = node;
}

function ProgressBar({
  transition,
  render,
  ...props
}: ProgressBarProps & React.RefAttributes<HTMLDivElement>) {
  return (
    <ReducedMotionConfig>
      <AriaProgressBar
        {...props}
        render={(domProps, renderProps) => (
          <ProgressBarMotion
            domProps={domProps}
            render={render ? (p) => render(p, renderProps) : undefined}
            moveTransition={transition}
          />
        )}
      />
    </ReducedMotionConfig>
  );
}

function ProgressBarMotion({
  domProps,
  render,
  moveTransition,
}: {
  domProps: React.JSX.IntrinsicElements['div'];
  render:
    | ((props: React.JSX.IntrinsicElements['div']) => React.ReactElement)
    | undefined;
  moveTransition: Transition | undefined;
}) {
  const tokens = useMotionTokens();
  const reduce = useShouldReduceMotion();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const shownRef = React.useRef(new WeakSet<HTMLElement>());
  const move = reduce
    ? tokens.transition.instant
    : (moveTransition ?? progressTransition(tokens));

  // After every commit: a bar whose percentage width React just wrote moves
  // to it with a transform.
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    for (const el of root.querySelectorAll<HTMLElement>('[style]')) {
      const width = el.style.width;
      if (!width.endsWith('%') || el.childElementCount > 0) continue;
      const percentage = parseFloat(width);
      if (!Number.isFinite(percentage)) continue;
      const rtl = getComputedStyle(el).direction === 'rtl';
      el.style.width = FULL_WIDTH;
      const transform = revealTransform(percentage, rtl);
      if (!shownRef.current.has(el)) {
        // First sight: start where the value is, no animation.
        shownRef.current.add(el);
        el.style.transform = transform;
        continue;
      }
      animate(el, { transform }, move);
    }
  });

  const props = {
    ...domProps,
    ref: (node: HTMLDivElement | null) => {
      rootRef.current = node;
      assignRef(domProps.ref as React.Ref<HTMLDivElement>, node);
    },
  };
  return render ? render(props) : <div {...props} />;
}

export { ProgressBar, type ProgressBarProps };
