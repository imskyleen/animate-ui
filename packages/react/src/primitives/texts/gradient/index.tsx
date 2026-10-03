'use client';

import * as React from 'react';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  type AnimationPlaybackControls,
  type Transition,
} from 'motion/react';

import { usePageVisible } from '../../../utils/use-page-visible';
import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '../../../utils/motion';

const DEFAULT_GRADIENT =
  'linear-gradient(90deg, #3b82f6 0%, #a855f7 20%, #ec4899 50%, #a855f7 80%, #3b82f6 100%)';

// Module-level so the default keeps a stable identity across renders.
const DEFAULT_TRANSITION: Transition = {
  duration: 50,
  repeat: Infinity,
  ease: 'linear',
};

const START_POSITION = '0% 0%';
const END_POSITION = '500% 100%';

type GradientTextProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  text: string;
  gradient?: string;
  neon?: boolean;
  transition?: Transition;
};

function GradientText(props: GradientTextProps) {
  return (
    <ReducedMotionConfig>
      <GradientTextContent {...props} />
    </ReducedMotionConfig>
  );
}

function GradientTextContent({
  ref,
  text,
  style,
  gradient = DEFAULT_GRADIENT,
  neon = false,
  transition = DEFAULT_TRANSITION,
  ...props
}: GradientTextProps) {
  const localRef = React.useRef<HTMLSpanElement>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLSpanElement);

  // The sweep pauses off screen and in a hidden tab, and stops under reduced
  // motion (backgroundPosition is not covered by Motion's reduced motion).
  const inView = useInView(localRef);
  const pageVisible = usePageVisible();
  const reduce = useShouldReduceMotion();
  const playing = inView && pageVisible;

  // Both layers (text and neon glow) share one motion value: one animation,
  // no React render per frame, and pausing keeps the current position.
  const backgroundPosition = useMotionValue(START_POSITION);
  const controlsRef = React.useRef<AnimationPlaybackControls | null>(null);

  // Inline transition objects get a new identity every render: restart the
  // loop only when their content changes.
  const transitionKey = JSON.stringify(transition);
  const transitionRef = React.useRef(transition);
  React.useEffect(() => {
    transitionRef.current = transition;
  });

  React.useEffect(() => {
    if (reduce) return;
    const controls = animate(
      backgroundPosition,
      [START_POSITION, END_POSITION],
      transitionRef.current,
    );
    controlsRef.current = controls;
    return () => {
      controls.stop();
      controlsRef.current = null;
      backgroundPosition.set(START_POSITION);
    };
  }, [backgroundPosition, reduce, transitionKey]);

  React.useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (playing) controls.play();
    else controls.pause();
  }, [playing, reduce, transitionKey]);

  const layerStyle = {
    backgroundImage: gradient,
    margin: 0,
    color: 'transparent',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    backgroundSize: '700% 100%',
    backgroundPosition,
  };

  return (
    <span
      ref={localRef}
      data-slot="gradient-text"
      style={{ position: 'relative', display: 'inline-block', ...style }}
      {...props}
    >
      <motion.span style={layerStyle}>{text}</motion.span>

      {neon && (
        // A blurred copy of the text: decorative, so screen readers read the
        // text once.
        <motion.span
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            mixBlendMode: 'plus-lighter',
            filter: 'blur(8px)',
            ...layerStyle,
          }}
        >
          {text}
        </motion.span>
      )}
    </span>
  );
}

export { GradientText, type GradientTextProps };
