import { Label } from '@workspace/ui/components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupIndicator,
} from '@/registry/primitives/radix/radio-group';

const itemClassName =
  'size-5 rounded-full flex items-center justify-center border';
const indicatorClassName = 'size-3 bg-primary rounded-full';

export function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="default" className="flex flex-col gap-2">
      <Label className="flex items-center gap-x-3">
        <RadioGroupItem value="default" className={itemClassName}>
          <RadioGroupIndicator className={indicatorClassName} />
        </RadioGroupItem>
        Default
      </Label>
      <Label className="flex items-center gap-x-3">
        <RadioGroupItem value="comfortable" className={itemClassName}>
          <RadioGroupIndicator className={indicatorClassName} />
        </RadioGroupItem>
        Comfortable
      </Label>
      <Label className="flex items-center gap-x-3">
        <RadioGroupItem value="compact" className={itemClassName}>
          <RadioGroupIndicator className={indicatorClassName} />
        </RadioGroupItem>
        Compact
      </Label>
    </RadioGroup>
  );
}
