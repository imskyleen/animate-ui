import {
  Tooltip,
  TooltipTrigger,
  TooltipPanel,
  type TooltipPanelProps,
} from '@/registry/components/base/tooltip';
import { Button } from '@workspace/ui/components/ui/button';

interface BaseTooltipDemoProps {
  side: TooltipPanelProps['side'];
  sideOffset: TooltipPanelProps['sideOffset'];
  align: TooltipPanelProps['align'];
  alignOffset: TooltipPanelProps['alignOffset'];
  followCursor?: boolean | 'x' | 'y';
}

export function BaseTooltipDemo({
  side,
  sideOffset,
  align,
  alignOffset,
  followCursor,
}: BaseTooltipDemoProps) {
  return (
    <Tooltip followCursor={followCursor}>
      <TooltipTrigger render={<Button variant="outline">Hover</Button>} />
      <TooltipPanel
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
      >
        <p>Add to library</p>
      </TooltipPanel>
    </Tooltip>
  );
}
