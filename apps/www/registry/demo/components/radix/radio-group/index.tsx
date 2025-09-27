import * as React from 'react';

import {
  RadioGroup,
  RadioGroupItem,
} from '@/registry/components/radix/radio-group';
import { Label } from '@workspace/ui/components/ui/label';

export const RadixRadioGroupDemo = () => {
  return (
    <RadioGroup defaultValue="default">
      <Label className="flex items-center gap-x-3">
        <RadioGroupItem value="default" />
        Default
      </Label>
      <Label className="flex items-center gap-x-3">
        <RadioGroupItem value="comfortable" />
        Comfortable
      </Label>
      <Label className="flex items-center gap-x-3">
        <RadioGroupItem value="compact" />
        Compact
      </Label>
    </RadioGroup>
  );
};
