'use client';

import * as React from 'react';
import {
  type HTMLMotionProps,
  motion,
  useInView,
  useMotionValue,
  useSpring,
  type SpringOptions,
  type Transition,
} from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '@animate-ui/react/utils/motion';
import { usePageVisible } from '@animate-ui/react/utils/use-page-visible';
import { cn } from 'cn';

/**
 * Whether the StarsBackground is on screen. A StarLayer moves outside its own
 * box while it loops, so it reads the background's visibility instead of
 * observing itself. Standalone layers default to visible.
 */
const StarsInViewContext = React.createContext(true);

type StarLayerProps = HTMLMotionProps<'div'> & {
  count: number;
  size: number;
  transition: Transition;
  starColor: string;
};

function generateStars(count: number, starColor: string) {
  const shadows: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 4000) - 2000;
    const y = Math.floor(Math.random() * 4000) - 2000;
    shadows.push(`${x}px ${y}px ${starColor}`);
  }
  return shadows.join(', ');
}

function StarLayerContent({
  count = 1000,
  size = 1,
  transition = { repeat: Infinity, duration: 50, ease: 'linear' },
  starColor = '#fff',
  className,
  ...props
}: StarLayerProps) {
  const firstRef = React.useRef<HTMLDivElement>(null);
  const secondRef = React.useRef<HTMLDivElement>(null);

  // The loop pauses off screen and in a hidden tab, and stops under reduced
  // motion.
  const inView = React.use(StarsInViewContext);
  const pageVisible = usePageVisible();
  const reduce = useShouldReduceMotion();
  const playing = inView && pageVisible && !reduce;

  // Random, so generated on the client only (no hydration mismatch), and
  // written to the DOM directly: no extra render.
  React.useEffect(() => {
    const boxShadow = generateStars(count, starColor);
    if (firstRef.current) firstRef.current.style.boxShadow = boxShadow;
    if (secondRef.current) secondRef.current.style.boxShadow = boxShadow;
  }, [count, starColor]);

  return (
    <motion.div
      data-slot="star-layer"
      initial={{ transform: 'translateY(0px)' }}
      animate={{
        transform: playing
          ? ['translateY(0px)', 'translateY(-2000px)']
          : 'translateY(0px)',
      }}
      transition={playing ? transition : { duration: 0 }}
      className={cn('absolute top-0 left-0 w-full h-[2000px]', className)}
      {...props}
    >
      <div
        ref={firstRef}
        className="absolute bg-transparent rounded-full"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
      <div
        ref={secondRef}
        className="absolute bg-transparent rounded-full top-[2000px]"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </motion.div>
  );
}

// Under reduced motion the loops stop and `motion` skips its transforms.
function StarLayer(props: StarLayerProps) {
  return (
    <ReducedMotionConfig>
      <StarLayerContent {...props} />
    </ReducedMotionConfig>
  );
}

type StarsBackgroundProps = React.ComponentProps<'div'> & {
  factor?: number;
  speed?: number;
  transition?: SpringOptions;
  starColor?: string;
  pointerEvents?: boolean;
};

function StarsBackgroundContent({
  ref,
  children,
  className,
  factor = 0.05,
  speed = 50,
  transition = { stiffness: 50, damping: 20 },
  starColor = '#fff',
  pointerEvents = true,
  onMouseMove,
  ...props
}: StarsBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);
  const inView = useInView(containerRef);
  const reduce = useShouldReduceMotion();

  const offsetX = useMotionValue(1);
  const offsetY = useMotionValue(1);

  const springX = useSpring(offsetX, transition);
  const springY = useSpring(offsetY, transition);

  // The sky shifts away from the mouse (and from a tap, which browsers report
  // as a mousemove), relative to the center of the container. No parallax
  // under reduced motion.
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseMove?.(e);
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    offsetX.set(-(e.clientX - centerX) * factor);
    offsetY.set(-(e.clientY - centerY) * factor);
  };

  return (
    <div
      ref={containerRef}
      data-slot="stars-background"
      className={cn(
        'relative size-full overflow-hidden bg-[radial-gradient(ellipse_at_bottom,_#262626_0%,_#000_100%)]',
        className,
      )}
      {...props}
      onMouseMove={handleMouseMove}
    >
      <StarsInViewContext value={inView}>
        <motion.div
          style={{ x: springX, y: springY }}
          className={cn({ 'pointer-events-none': !pointerEvents })}
        >
          <StarLayer
            count={1000}
            size={1}
            transition={{ repeat: Infinity, duration: speed, ease: 'linear' }}
            starColor={starColor}
          />
          <StarLayer
            count={400}
            size={2}
            transition={{
              repeat: Infinity,
              duration: speed * 2,
              ease: 'linear',
            }}
            starColor={starColor}
          />
          <StarLayer
            count={200}
            size={3}
            transition={{
              repeat: Infinity,
              duration: speed * 3,
              ease: 'linear',
            }}
            starColor={starColor}
          />
        </motion.div>
      </StarsInViewContext>
      {children}
    </div>
  );
}

// Under reduced motion the loops stop and `motion` skips its transforms.
function StarsBackground(props: StarsBackgroundProps) {
  return (
    <ReducedMotionConfig>
      <StarsBackgroundContent {...props} />
    </ReducedMotionConfig>
  );
}

export {
  StarLayer,
  StarsBackground,
  type StarLayerProps,
  type StarsBackgroundProps,
};
