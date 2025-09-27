import * as React from 'react';

import {
  RadioGroup,
  RadioGroupItem,
} from '@/registry/components/radix/radio-group';
import { Label } from '@workspace/ui/components/ui/label';

export const RadixRadioGroupDemo = () => {
  return (
    <RadioGroup defaultValue="default">
      <Label htmlFor="r1" className="flex items-center gap-x-3">
        <RadioGroupItem value="default" id="r1" />
        Default
      </Label>
      <Label htmlFor="r2" className="flex items-center gap-x-3">
        <RadioGroupItem value="comfortable" id="r2" />
        Comfortable
      </Label>
      <Label htmlFor="r3" className="flex items-center gap-x-3">
        <RadioGroupItem value="compact" id="r3" />
        Compact
      </Label>
    </RadioGroup>
  );
};
