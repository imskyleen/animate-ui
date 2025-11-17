import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipPortal,
  TooltipTrigger,
} from '@/registry/primitives/radix/tooltip';

interface RadixTooltipDemoProps {
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  followCursor?: boolean | 'x' | 'y';
}

export const RadixTooltipDemo = ({
  side,
  sideOffset,
  align,
  alignOffset,
  followCursor,
}: RadixTooltipDemoProps) => {
  return (
    <TooltipProvider>
      <Tooltip followCursor={followCursor}>
        <TooltipTrigger>Hover</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent
            side={side}
            sideOffset={sideOffset}
            align={align}
            alignOffset={alignOffset}
            className="bg-primary origin-(--radix-tooltip-content-transform-origin) text-primary-foreground px-2 py-1 text-sm z-50"
          >
            <p>Add to library</p>
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
};
