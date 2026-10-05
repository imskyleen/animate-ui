import {
  Tooltip,
  TooltipPositioner,
  TooltipPopup,
  TooltipProvider,
  TooltipPortal,
  TooltipTrigger,
} from '@/registry/primitives/base/tooltip';

interface RadixTooltipDemoProps {
  side?: 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  followCursor?: boolean | 'x' | 'y';
}

export const BaseTooltipDemo = ({
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
          <TooltipPositioner
            side={side}
            sideOffset={sideOffset}
            align={align}
            alignOffset={alignOffset}
            className="z-50"
          >
            <TooltipPopup className="bg-primary text-primary-foreground px-2 py-1 text-sm">
              <p>Add to library</p>
            </TooltipPopup>
          </TooltipPositioner>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
};
