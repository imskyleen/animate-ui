'use client';

import * as React from 'react';
import {
  ProgressBar as AriaProgressBar,
  type ProgressBarProps as AriaProgressBarProps,
} from 'react-aria-components';
import {
  animate,
  motionValue,
  type AnimationPlaybackControls,
  type MotionValue,
  type Transition,
} from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { PROGRESS_TRANSITION } from '../../../internal/progress';

// Same API as React Aria's ProgressBar, animated like Animate UI's Base UI
// progress (v1 had no React Aria one): the bar's width springs to a new value
// like Motion UI's progress bar (stiffness 300, damping 35). React Aria only hands its children a
// `percentage`; the bar itself is your markup, sized with an inline
// percentage width (`style={{ width: `${percentage}%` }}`, as shadcn/ui and
// React Aria's docs do). The ProgressBar finds that element and springs its
// width from the previous value instead of jumping to it.

type ProgressBarProps = AriaProgressBarProps & {
  /**
   * Transition of the bar moving to a new value. Defaults to a spring
   * (stiffness 300, damping 35).
   */
  transition?: Transition;
};

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

type Bar = {
  /** The width we show, in percent. */
  width: MotionValue<number>;
  /** The inline width we last wrote (React's own until it animates). */
  written: string;
  controls: AnimationPlaybackControls | null;
};

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
  const reduce = useShouldReduceMotion();
  const spring = useTempoTransition(moveTransition ?? PROGRESS_TRANSITION);
  const [root, setRoot] = React.useState<HTMLDivElement | null>(null);
  const barsRef = React.useRef(new WeakMap<HTMLElement, Bar>());

  // After every commit: a bar whose percentage width React just changed
  // springs to it from the width it shows.
  React.useLayoutEffect(() => {
    if (!root) return;
    for (const el of root.querySelectorAll<HTMLElement>('[style]')) {
      const inline = el.style.width;
      if (!inline.endsWith('%') || el.childElementCount > 0) continue;
      const bar = barsRef.current.get(el);
      // Ours, unchanged: React didn't write a new value.
      if (bar?.written === inline) continue;
      const percentage = parseFloat(inline);
      if (!Number.isFinite(percentage)) continue;
      if (!bar) {
        // First sight: it starts where the value is, no animation.
        const next: Bar = {
          width: motionValue(percentage),
          written: inline,
          controls: null,
        };
        next.width.on('change', (w) => {
          next.written = `${w}%`;
          el.style.width = next.written;
        });
        barsRef.current.set(el, next);
        continue;
      }
      // React wrote a new value: back where it was on this very frame, then
      // to the new value.
      el.style.width = bar.written;
      bar.controls?.stop();
      if (reduce) {
        bar.controls = null;
        bar.width.jump(percentage);
        continue;
      }
      bar.controls = animate(bar.width, percentage, spring);
    }
  });

  const props = {
    ...domProps,
    ref: (node: HTMLDivElement | null) => {
      setRoot(node);
      assignRef(domProps.ref as React.Ref<HTMLDivElement>, node);
    },
  };
  return render ? render(props) : <div {...props} />;
}

export { ProgressBar, type ProgressBarProps };
