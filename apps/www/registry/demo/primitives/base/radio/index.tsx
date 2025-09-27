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
      <Label htmlFor="r1" className="flex items-center gap-x-3">
        <Radio value="default" id="r1" className={itemClassName}>
          <RadioIndicator className={indicatorClassName} />
        </Radio>
        Default
      </Label>
      <Label htmlFor="r2" className="flex items-center gap-x-3">
        <Radio value="comfortable" id="r2" className={itemClassName}>
          <RadioIndicator className={indicatorClassName} />
        </Radio>
        Comfortable
      </Label>
      <Label htmlFor="r3" className="flex items-center gap-x-3">
        <Radio value="compact" id="r3" className={itemClassName}>
          <RadioIndicator className={indicatorClassName} />
        </Radio>
        Compact
      </Label>
    </RadioGroup>
  );
}
