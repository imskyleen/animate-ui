import * as React from 'react';

import { RadioGroup, Radio } from '@/registry/components/base/radio';
import { Label } from '@workspace/ui/components/ui/label';

export const BaseRadioDemo = () => {
  return (
    <RadioGroup defaultValue="default">
      <Label className="flex items-center gap-x-3">
        <Radio value="default" />
        Default
      </Label>
      <Label className="flex items-center gap-x-3">
        <Radio value="comfortable" />
        Comfortable
      </Label>
      <Label className="flex items-center gap-x-3">
        <Radio value="compact" />
        Compact
      </Label>
    </RadioGroup>
  );
};
