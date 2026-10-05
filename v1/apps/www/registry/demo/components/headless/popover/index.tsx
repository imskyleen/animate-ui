import {
  Popover,
  PopoverButton,
  PopoverPanel,
} from '@/registry/components/headless/popover';
import { Button } from '@workspace/ui/components/ui/button';
import { Input } from '@workspace/ui/components/ui/input';
import { Label } from '@workspace/ui/components/ui/label';

interface HeadlessPopoverDemoProps {
  anchor?:
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top start'
    | 'top end'
    | 'bottom start'
    | 'bottom end'
    | 'left start'
    | 'left end'
    | 'right start'
    | 'right end';
  gap?: number;
}

export function HeadlessPopoverDemo({
  anchor = 'bottom',
  gap = 4,
}: HeadlessPopoverDemoProps) {
  return (
    <Popover>
      <PopoverButton as={Button} variant="outline">
        Open popover
      </PopoverButton>

      <PopoverPanel anchor={{ to: anchor, gap }} className="w-80">
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
}
