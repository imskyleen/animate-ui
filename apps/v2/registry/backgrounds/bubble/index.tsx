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

/** Runs `keyframes` while playing, otherwise holds the `rest` frame. */
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

/**
 * A full turn from `from` degrees. The turns start apart so that the still
 * frame (reduced motion, paused) spreads the bubbles instead of stacking them.
 */
const spin = (from: number) => ({
  transform: [`rotate(${from}deg)`, `rotate(${from + 360}deg)`],
});

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

  // The loops (and the blurred layer they repaint) pause off screen and in a
  // hidden tab, and stop under reduced motion.
  const inView = useInView(containerRef);
  const pageVisible = usePageVisible();
  const reduce = useShouldReduceMotion();
  const playing = inView && pageVisible && !reduce;

  const filterId = `bubble-goo-${React.useId().replace(/[^\w-]/g, '')}`;

  // The follower tracks a mouse only: a tap would park it under the finger.
  React.useEffect(() => {
    if (!interactive || reduce) return;

    const el = containerRef.current;
    if (!el) return;

    let frameId: number | null = null;
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      if (frameId != null) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        frameId = null;
        const rect = el.getBoundingClientRect();
        mouseX.set(e.clientX - (rect.left + rect.width / 2));
        mouseY.set(e.clientY - (rect.top + rect.height / 2));
      });
    };

    el.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      el.removeEventListener('pointermove', handlePointerMove);
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
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-0 left-0 w-0 h-0"
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
        className="absolute inset-0"
        style={{ filter: `url(#${filterId}) blur(40px)` }}
      >
        <motion.div
          className="absolute rounded-full size-[80%] top-[10%] left-[10%] mix-blend-hard-light bg-[radial-gradient(circle_at_center,rgba(var(--first-color),0.8)_0%,rgba(var(--first-color),0)_50%)]"
          {...loop(
            playing,
            {
              transform: [
                'translateY(-50px)',
                'translateY(50px)',
                'translateY(-50px)',
              ],
            },
            { transform: 'translateY(-50px)' },
            { duration: 30, ease: 'easeInOut', repeat: Infinity },
          )}
          style={{ willChange: 'transform' }}
        />

        <motion.div
          className="absolute inset-0 flex justify-center items-center origin-[calc(50%-400px)]"
          {...loop(
            playing,
            spin(90),
            { transform: 'rotate(90deg)' },
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
            spin(180),
            { transform: 'rotate(180deg)' },
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
            {
              transform: [
                'translateX(-50px)',
                'translateX(50px)',
                'translateX(-50px)',
              ],
            },
            { transform: 'translateX(-50px)' },
            { duration: 40, ease: 'easeInOut', repeat: Infinity },
          )}
          style={{ willChange: 'transform' }}
        />

        <motion.div
          className="absolute inset-0 flex justify-center items-center origin-[calc(50%_-_800px)_calc(50%_+_200px)]"
          {...loop(
            playing,
            spin(45),
            { transform: 'rotate(45deg)' },
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

// Under reduced motion the loops stop and `motion` skips its transforms.
function BubbleBackground(props: BubbleBackgroundProps) {
  return (
    <ReducedMotionConfig>
      <BubbleBackgroundContent {...props} />
    </ReducedMotionConfig>
  );
}

export { BubbleBackground, type BubbleBackgroundProps };
