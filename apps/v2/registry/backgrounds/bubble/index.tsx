'use client';

import * as React from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  type SpringOptions,
  type TargetAndTransition,
  type Transition,
} from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '@animate-ui/react/utils/motion';
import { usePageVisible } from '@animate-ui/react/utils/use-page-visible';
import { cn } from 'cn';

function loop(
  playing: boolean,
  keyframes: TargetAndTransition,
  rest: TargetAndTransition,
  transition: Transition,
) {
  return playing
    ? { initial: rest, animate: keyframes, transition }
    : { initial: rest, animate: rest, transition: { duration: 0 } };
}

const spin = (from: number) => ({ rotate: [from, from + 360] });

type BubbleColors = {
  first: string;
  second: string;
  third: string;
  fourth: string;
  fifth: string;
  sixth: string;
};

type BubbleBackgroundProps = React.ComponentProps<'div'> & {
  interactive?: boolean;
  transition?: SpringOptions;
  colors?: BubbleColors;
};

function BubbleBackgroundContent({
  ref,
  className,
  children,
  interactive = false,
  transition = { stiffness: 100, damping: 20 },
  colors = {
    first: '18,113,255',
    second: '221,74,255',
    third: '0,220,255',
    fourth: '200,50,50',
    fifth: '180,180,50',
    sixth: '140,100,255',
  },
  ...props
}: BubbleBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, transition);
  const springY = useSpring(mouseY, transition);

  const inView = useInView(containerRef);
  const pageVisible = usePageVisible();
  const reduce = useShouldReduceMotion();
  const playing = inView && pageVisible && !reduce;

  const filterId = `bubble-goo-${React.useId().replace(/[^\w-]/g, '')}`;

  React.useEffect(() => {
    if (!interactive || reduce) return;

    const el = containerRef.current;
    if (!el) return;

    let frameId: number | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      if (frameId != null) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        frameId = null;
        const rect = el.getBoundingClientRect();
        mouseX.set(e.clientX - (rect.left + rect.width / 2));
        mouseY.set(e.clientY - (rect.top + rect.height / 2));
      });
    };

    el.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      if (frameId != null) cancelAnimationFrame(frameId);
    };
  }, [interactive, reduce, mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      data-slot="bubble-background"
      className={cn(
        'relative size-full overflow-hidden bg-gradient-to-br from-violet-900 to-blue-900',
        className,
      )}
      {...props}
      style={
        {
          '--first-color': colors.first,
          '--second-color': colors.second,
          '--third-color': colors.third,
          '--fourth-color': colors.fourth,
          '--fifth-color': colors.fifth,
          '--sixth-color': colors.sixth,
          ...props.style,
        } as React.CSSProperties
      }
    >
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute top-0 left-0 w-0 h-0"
      >
        <defs>
          <filter id={filterId}>
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="16"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ filter: `url(#${filterId}) blur(40px)` }}
      >
        <motion.div
          className="absolute rounded-full size-[80%] top-[10%] left-[10%] mix-blend-hard-light bg-[radial-gradient(circle_at_center,rgba(var(--first-color),0.8)_0%,rgba(var(--first-color),0)_50%)]"
          {...loop(
            playing,
            { y: [-50, 50, -50] },
            { y: -50 },
            { duration: 30, ease: 'easeInOut', repeat: Infinity },
          )}
          style={{ willChange: 'transform' }}
        />

        <motion.div
          className="absolute inset-0 flex justify-center items-center origin-[calc(50%-400px)]"
          {...loop(
            playing,
            spin(0),
            { rotate: reduce ? 90 : 0 },
            {
              duration: 20,
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'loop',
            },
          )}
          style={{ willChange: 'transform' }}
        >
          <div className="rounded-full size-[80%] top-[10%] left-[10%] mix-blend-hard-light bg-[radial-gradient(circle_at_center,rgba(var(--second-color),0.8)_0%,rgba(var(--second-color),0)_50%)]" />
        </motion.div>

        <motion.div
          className="absolute inset-0 flex justify-center items-center origin-[calc(50%+400px)]"
          {...loop(
            playing,
            spin(0),
            { rotate: reduce ? 180 : 0 },
            { duration: 40, ease: 'linear', repeat: Infinity },
          )}
          style={{ willChange: 'transform' }}
        >
          <div className="absolute rounded-full size-[80%] bg-[radial-gradient(circle_at_center,rgba(var(--third-color),0.8)_0%,rgba(var(--third-color),0)_50%)] mix-blend-hard-light top-[calc(50%+200px)] left-[calc(50%-500px)]" />
        </motion.div>

        <motion.div
          className="absolute rounded-full size-[80%] top-[10%] left-[10%] mix-blend-hard-light bg-[radial-gradient(circle_at_center,rgba(var(--fourth-color),0.8)_0%,rgba(var(--fourth-color),0)_50%)] opacity-70"
          {...loop(
            playing,
            { x: [-50, 50, -50] },
            { x: -50 },
            { duration: 40, ease: 'easeInOut', repeat: Infinity },
          )}
          style={{ willChange: 'transform' }}
        />

        <motion.div
          className="absolute inset-0 flex justify-center items-center origin-[calc(50%_-_800px)_calc(50%_+_200px)]"
          {...loop(
            playing,
            spin(0),
            { rotate: reduce ? 45 : 0 },
            { duration: 20, ease: 'linear', repeat: Infinity },
          )}
          style={{ willChange: 'transform' }}
        >
          <div className="absolute rounded-full size-[160%] mix-blend-hard-light bg-[radial-gradient(circle_at_center,rgba(var(--fifth-color),0.8)_0%,rgba(var(--fifth-color),0)_50%)] top-[calc(50%-80%)] left-[calc(50%-80%)]" />
        </motion.div>

        {interactive && (
          <motion.div
            className="absolute rounded-full size-full mix-blend-hard-light bg-[radial-gradient(circle_at_center,rgba(var(--sixth-color),0.8)_0%,rgba(var(--sixth-color),0)_50%)] opacity-70"
            style={{
              x: springX,
              y: springY,
              willChange: 'transform',
            }}
          />
        )}
      </div>

      {children}
    </div>
  );
}

function BubbleBackground(props: BubbleBackgroundProps) {
  return (
    <ReducedMotionConfig>
      <BubbleBackgroundContent {...props} />
    </ReducedMotionConfig>
  );
}

export { BubbleBackground, type BubbleBackgroundProps };
