import * as React from 'react';

import { RadioGroup, Radio } from '@/registry/components/base/radio';
import { Label } from '@workspace/ui/components/ui/label';

export const BaseRadioDemo = () => {
  return (
    <RadioGroup defaultValue="default">
      <Label htmlFor="r1" className="flex items-center gap-x-3">
        <Radio value="default" id="r1" />
        Default
      </Label>
      <Label htmlFor="r2" className="flex items-center gap-x-3">
        <Radio value="comfortable" id="r2" />
        Comfortable
      </Label>
      <Label htmlFor="r3" className="flex items-center gap-x-3">
        <Radio value="compact" id="r3" />
        Compact
      </Label>
    </RadioGroup>
  );
};
