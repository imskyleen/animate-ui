import {
  Popover,
  PopoverTrigger,
  PopoverPanel,
} from '@/registry/components/base/popover';
import { Button } from '@workspace/ui/components/ui/button';
import { Input } from '@workspace/ui/components/ui/input';
import { Label } from '@workspace/ui/components/ui/label';

interface BasePopoverDemoProps {
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
}

export const BasePopoverDemo = ({
  side,
  sideOffset,
  align,
  alignOffset,
}: BasePopoverDemoProps) => {
  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="outline">Open popover</Button>}
      />
      <PopoverPanel
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className="w-80"
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Dimensions</h4>
            <p className="text-muted-foreground text-sm">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                defaultValue="100%"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxWidth">Max. width</Label>
              <Input
                id="maxWidth"
                defaultValue="300px"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxHeight">Max. height</Label>
              <Input
                id="maxHeight"
                defaultValue="none"
                className="col-span-2 h-8"
              />
            </div>
          </div>
        </div>
      </PopoverPanel>
    </Popover>
  );
};
