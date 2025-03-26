'use client';

import * as React from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

import { cn } from '@/lib/utils';

interface BubbleBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  stiffness?: number;
  damping?: number;
  colors?: {
    first: string;
    second: string;
    third: string;
    fourth: string;
    fifth: string;
    sixth: string;
  };
}

const BubbleBackground = React.forwardRef<
  HTMLDivElement,
  BubbleBackgroundProps
>(
  (
    {
      className,
      children,
      interactive = false,
      stiffness = 100,
      damping = 20,
      colors = {
        first: '18,113,255',
        second: '221,74,255',
        third: '0,220,255',
        fourth: '200,50,50',
        fifth: '180,180,50',
        sixth: '140,100,255',
      },
      ...props
    },
    ref,
  ) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(
      ref,
      () => containerRef.current as HTMLDivElement,
    );

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness, damping });
    const springY = useSpring(mouseY, { stiffness, damping });

    React.useEffect(() => {
      if (!interactive) return;

      const handleMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        mouseX.set(e.clientX - centerX);
        mouseY.set(e.clientY - centerY);
      };

      containerRef.current?.addEventListener('mousemove', handleMouseMove);
      return () =>
        containerRef.current?.removeEventListener('mousemove', handleMouseMove);
    }, [interactive, mouseX, mouseY]);

    return (
      <div
        ref={containerRef}
        className={cn(
          'relative w-full h-full overflow-hidden bg-gradient-to-br from-violet-900 to-blue-900',
          className,
        )}
        {...props}
      >
        <style>
          {`
            :root {
              --first-color: ${colors.first};
              --second-color: ${colors.second};
              --third-color: ${colors.third};
              --fourth-color: ${colors.fourth};
              --fifth-color: ${colors.fifth};
              --sixth-color: ${colors.sixth};
            }
          `}
        </style>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute top-0 left-0 w-0 h-0"
        >
          <defs>
            <filter id="goo">
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="10"
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
          style={{ filter: 'url(#goo) blur(40px)' }}
        >
          <motion.div
            className="absolute rounded-full size-[80%] top-[10%] left-[10%] mix-blend-hard-light bg-[radial-gradient(circle_at_center,rgba(var(--first-color),0.8)_0%,rgba(var(--first-color),0)_50%)]"
            animate={{ y: [-50, 50, -50] }}
            transition={{ duration: 30, ease: 'easeInOut', repeat: Infinity }}
          />

          <motion.div
            className="absolute inset-0 flex justify-center items-center origin-[calc(50%-400px)]"
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'loop',
              reverse: true,
            }}
          >
            <div className="rounded-full size-[80%] top-[10%] left-[10%] mix-blend-hard-light bg-[radial-gradient(circle_at_center,rgba(var(--second-color),0.8)_0%,rgba(var(--second-color),0)_50%)]" />
          </motion.div>

          <motion.div
            className="absolute inset-0 flex justify-center items-center origin-[calc(50%+400px)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
          >
            <div className="absolute rounded-full size-[80%] bg-[radial-gradient(circle_at_center,rgba(var(--third-color),0.8)_0%,rgba(var(--third-color),0)_50%)] mix-blend-hard-light top-[calc(50%+200px)] left-[calc(50%-500px)]" />
          </motion.div>

          <motion.div
            className="absolute rounded-full size-[80%] top-[10%] left-[10%] mix-blend-hard-light bg-[radial-gradient(circle_at_center,rgba(var(--fourth-color),0.8)_0%,rgba(var(--fourth-color),0)_50%)] opacity-70"
            animate={{ x: [-50, 50, -50] }}
            transition={{ duration: 40, ease: 'easeInOut', repeat: Infinity }}
          />

          <motion.div
            className="absolute inset-0 flex justify-center items-center origin-[calc(50%_-_800px)_calc(50%_+_200px)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
          >
            <div className="absolute rounded-full size-[160%] mix-blend-hard-light bg-[radial-gradient(circle_at_center,rgba(var(--fifth-color),0.8)_0%,rgba(var(--fifth-color),0)_50%)] top-[calc(50%-80%)] left-[calc(50%-80%)]" />
          </motion.div>

          {interactive && (
            <motion.div
              className="absolute rounded-full size-full mix-blend-hard-light bg-[radial-gradient(circle_at_center,rgba(var(--sixth-color),0.8)_0%,rgba(var(--sixth-color),0)_50%)] opacity-70"
              style={{
                x: springX,
                y: springY,
              }}
            />
          )}
        </div>

        {children}
      </div>
    );
  },
);

BubbleBackground.displayName = 'BubbleBackground';

export { BubbleBackground, type BubbleBackgroundProps };
