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
  useTempoTransition,
} from '../../../utils/motion';

const DEFAULT_GRADIENT =
  'linear-gradient(90deg, #3b82f6 0%, #a855f7 20%, #ec4899 50%, #a855f7 80%, #3b82f6 100%)';

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
  transition: transitionProp,
  ...props
}: GradientTextProps) {
  const defaultTransition = useTempoTransition(DEFAULT_TRANSITION);
  const transition = transitionProp ?? defaultTransition;
  const localRef = React.useRef<HTMLSpanElement>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLSpanElement);

  const inView = useInView(localRef);
  const pageVisible = usePageVisible();
  const reduce = useShouldReduceMotion();
  const playing = inView && pageVisible;

  const backgroundPosition = useMotionValue(START_POSITION);
  const controlsRef = React.useRef<AnimationPlaybackControls | null>(null);

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
