'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipArrow,
} from '@/registry/primitives/animate/tooltip';
import { motion } from 'motion/react';

interface TooltipDemoProps {
  openDelay?: number;
  closeDelay?: number;
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  withTransition?: boolean;
}

export const AnimateTooltipDemo = ({
  openDelay,
  closeDelay,
  side,
  sideOffset,
  align,
  alignOffset,
  withTransition,
}: TooltipDemoProps) => {
  return (
    <TooltipProvider
      key={`${side}-${align}-${sideOffset}-${alignOffset}-${openDelay}-${closeDelay}`}
      openDelay={openDelay}
      closeDelay={closeDelay}
    >
      <div className="flex flex-col gap-5 justify-center items-center">
        <div className="flex flex-row gap-2 border p-2">
          <Tooltip
            side={side}
            sideOffset={sideOffset}
            align={align}
            alignOffset={alignOffset}
          >
            <TooltipTrigger className="bg-accent select-none px-4 py-2">
              Docs
            </TooltipTrigger>

            <TooltipContent className="bg-primary px-3 py-1.5 text-sm text-primary-foreground">
              <TooltipArrow
                className="fill-primary size-2.5"
                withTransition={withTransition}
              />
              <motion.p layout="preserve-aspect">Documentation</motion.p>
            </TooltipContent>
          </Tooltip>

          <Tooltip
            side={side}
            sideOffset={sideOffset}
            align={align}
            alignOffset={alignOffset}
          >
            <TooltipTrigger className="bg-accent select-none px-4 py-2">
              Lorem
            </TooltipTrigger>

            <TooltipContent className="bg-primary max-w-[200px] px-3 py-1.5 text-sm text-primary-foreground">
              <TooltipArrow
                className="fill-primary size-2.5"
                withTransition={withTransition}
              />
              <motion.div layout="preserve-aspect">
                <p>Lorem ipsum dolor sit amet</p>
                <p>consectetur adipisicing elit</p>
              </motion.div>
            </TooltipContent>
          </Tooltip>

          <Tooltip
            side={side}
            sideOffset={sideOffset}
            align={align}
            alignOffset={alignOffset}
          >
            <TooltipTrigger className="bg-accent select-none px-4 py-2">
              Guide
            </TooltipTrigger>

            <TooltipContent className="bg-primary px-3 py-1.5 text-sm text-primary-foreground">
              <TooltipArrow
                className="fill-primary size-2.5"
                withTransition={withTransition}
              />
              <motion.p layout="preserve-aspect">User Guide</motion.p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex flex-row gap-5">
          <Tooltip
            side={side}
            sideOffset={sideOffset}
            align={align}
            alignOffset={alignOffset}
          >
            <TooltipTrigger className="bg-accent select-none px-4 py-2">
              Repo
            </TooltipTrigger>

            <TooltipContent className="bg-primary px-3 py-1.5 text-sm text-primary-foreground">
              <TooltipArrow
                className="fill-primary size-2.5"
                withTransition={withTransition}
              />
              <motion.p layout="preserve-aspect">GitHub</motion.p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};
