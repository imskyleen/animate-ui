'use client';

import * as React from 'react';
import { ArrowDown } from 'lucide-react';
import { motion } from 'motion/react';

import {
  ScrollProgressProvider,
  ScrollProgress,
  ScrollProgressContainer,
  type ScrollProgressDirection,
} from '@/registry/primitives/animate/scroll-progress';
import { cn } from '@workspace/ui/lib/utils';

interface ScrollProgressDemoProps {
  global?: boolean;
  direction?: ScrollProgressDirection;
}

export const ScrollProgressDemo = ({
  global = false,
  direction = 'vertical',
}: ScrollProgressDemoProps) => {
  return (
    <div className="absolute inset-0" key={String(global) + direction}>
      <div className="relative h-full w-full overflow-hidden">
        <ScrollProgressProvider global={global} direction={direction}>
          <div
            className={cn(
              'z-50 ',
              global
                ? 'fixed top-0 left-0 right-0'
                : 'absolute bottom-3 left-3 right-3',
            )}
          >
            <ScrollProgress className="bg-foreground h-1.5 data-[global=false]:rounded-full" />
          </div>

          {global ? (
            <div className="size-full flex items-center justify-center">
              <p className="flex items-center gap-2 font-medium">
                Scroll the page to see the progress bar
              </p>
            </div>
          ) : (
            <ScrollProgressContainer className="w-full h-full data-[direction=vertical]:overflow-y-auto data-[direction=horizontal]:overflow-x-auto">
              <div
                className={cn('flex', direction === 'vertical' && 'flex-col')}
              >
                <div className="w-full h-[400px] shrink-0 flex items-center justify-center">
                  <p className="flex items-center gap-2 font-medium">
                    Scroll to see the progress bar{' '}
                    <motion.span
                      className={direction === 'horizontal' ? '-rotate-90' : ''}
                      animate={{ y: [3, -3, 3] }}
                      transition={{
                        duration: 1.25,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        type: 'keyframes',
                      }}
                    >
                      <ArrowDown className="size-5" />
                    </motion.span>
                  </p>
                </div>
                <div className="w-full h-[400px] shrink-0 p-3">
                  <div className="size-full bg-accent rounded-xl" />
                </div>
                <div className="w-full h-[400px] shrink-0" />
                <div className="w-full h-[400px] shrink-0 p-3">
                  <div className="size-full bg-accent rounded-xl" />
                </div>
                <div className="w-full h-[400px] shrink-0" />
              </div>
            </ScrollProgressContainer>
          )}
        </ScrollProgressProvider>
      </div>
    </div>
  );
};
