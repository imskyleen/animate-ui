'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/registry/components/animate/tooltip';
import { Button } from '@workspace/ui/components/ui/button';

interface TooltipDemoProps {
  openDelay?: number;
  closeDelay?: number;
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
}

export const AnimateTooltipDemo = ({
  openDelay,
  closeDelay,
  side,
  sideOffset,
  align,
  alignOffset,
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
            <TooltipTrigger>
              <Button variant="accent">Docs</Button>
            </TooltipTrigger>

            <TooltipContent>
              <p>Documentation</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip
            side={side}
            sideOffset={sideOffset}
            align={align}
            alignOffset={alignOffset}
          >
            <TooltipTrigger>
              <Button variant="accent">Lorem</Button>
            </TooltipTrigger>

            <TooltipContent>
              <p>Lorem ipsum dolor sit amet</p>
              <p>consectetur adipisicing elit</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip
            side={side}
            sideOffset={sideOffset}
            align={align}
            alignOffset={alignOffset}
          >
            <TooltipTrigger>
              <Button variant="accent">Guide</Button>
            </TooltipTrigger>

            <TooltipContent>
              <p>User Guide</p>
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
            <TooltipTrigger>
              <Button variant="accent">Repo</Button>
            </TooltipTrigger>

            <TooltipContent>
              <p>GitHub</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};
