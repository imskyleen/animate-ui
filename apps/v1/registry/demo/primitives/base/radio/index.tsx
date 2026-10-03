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
      <Label className="flex items-center gap-x-3">
        <Radio value="default" className={itemClassName}>
          <RadioIndicator className={indicatorClassName} />
        </Radio>
        Default
      </Label>
      <Label className="flex items-center gap-x-3">
        <Radio value="comfortable" className={itemClassName}>
          <RadioIndicator className={indicatorClassName} />
        </Radio>
        Comfortable
      </Label>
      <Label className="flex items-center gap-x-3">
        <Radio value="compact" className={itemClassName}>
          <RadioIndicator className={indicatorClassName} />
        </Radio>
        Compact
      </Label>
    </RadioGroup>
  );
}
