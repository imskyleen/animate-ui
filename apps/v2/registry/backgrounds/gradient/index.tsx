'use client';

import * as React from 'react';
import { motion, useInView, type HTMLMotionProps } from 'motion/react';

import { usePageVisible } from '@animate-ui/react/utils/use-page-visible';
import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '@animate-ui/react/utils/motion';
import { cn } from 'cn';

type GradientBackgroundProps = HTMLMotionProps<'div'>;

const STATIC_POSITION = '0% 50%';

function GradientBackgroundContent({
  ref,
  className,
  transition = { duration: 15, ease: 'easeInOut', repeat: Infinity },
  ...props
}: GradientBackgroundProps) {
  const localRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

  // The loop pauses off screen and in a hidden tab, and stops under reduced
  // motion (backgroundPosition is not covered by Motion's reduced motion).
  const inView = useInView(localRef);
  const pageVisible = usePageVisible();
  const reduce = useShouldReduceMotion();
  const playing = inView && pageVisible && !reduce;

  return (
    <motion.div
      ref={localRef}
      data-slot="gradient-background"
      className={cn(
        'size-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 bg-[length:400%_400%]',
        className,
      )}
      animate={{
        backgroundPosition: playing
          ? [STATIC_POSITION, '100% 50%', STATIC_POSITION]
          : STATIC_POSITION,
      }}
      transition={playing ? transition : { duration: 0 }}
      {...props}
    />
  );
}

// Under reduced motion the loops stop and `motion` skips its transforms.
function GradientBackground(props: GradientBackgroundProps) {
  return (
    <ReducedMotionConfig>
      <GradientBackgroundContent {...props} />
    </ReducedMotionConfig>
  );
}

export { GradientBackground, type GradientBackgroundProps };
