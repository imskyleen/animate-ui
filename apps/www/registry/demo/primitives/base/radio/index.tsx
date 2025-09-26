import { Label } from '@workspace/ui/components/ui/label';
import {
  RadioGroup,
  Radio,
  RadioIndicator,
} from '@/registry/primitives/base/radio';

const itemClassName =
  'size-5 rounded-full flex items-center justify-center border';
const indicatorClassName = 'size-3 bg-primary rounded-full';

export function BaseRadioDemo() {
  return (
    <RadioGroup defaultValue="default" className="flex flex-col gap-2">
      <div className="flex items-center space-x-2">
        <Radio value="default" id="r1" className={itemClassName}>
          <RadioIndicator className={indicatorClassName} />
        </Radio>
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Radio value="comfortable" id="r2" className={itemClassName}>
          <RadioIndicator className={indicatorClassName} />
        </Radio>
        <Label htmlFor="r2">Comfortable</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Radio value="compact" id="r3" className={itemClassName}>
          <RadioIndicator className={indicatorClassName} />
        </Radio>
        <Label htmlFor="r3">Compact</Label>
      </div>
    </RadioGroup>
  );
}
