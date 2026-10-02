'use client';

import * as React from 'react';
import { motion, useInView, type HTMLMotionProps } from 'motion/react';

import { useShouldReduceMotion } from '@/registry/lib/motion';
import { cn } from '@workspace/ui/lib/utils';

type GradientBackgroundProps = HTMLMotionProps<'div'>;

function subscribeToVisibility(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
}

/** False while the tab is hidden. */
function usePageVisible() {
  return React.useSyncExternalStore(
    subscribeToVisibility,
    () => document.visibilityState === 'visible',
    () => true,
  );
}

const STATIC_POSITION = '0% 50%';

function GradientBackground({
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

export { GradientBackground, type GradientBackgroundProps };
