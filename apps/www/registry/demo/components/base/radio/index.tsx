import * as React from 'react';

import { RadioGroup, Radio } from '@/registry/components/base/radio';
import { Label } from '@workspace/ui/components/ui/label';

export const BaseRadioDemo = () => {
  return (
    <RadioGroup defaultValue="default">
      <div className="flex items-center space-x-2">
        <Radio value="default" id="r1" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Radio value="comfortable" id="r2" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Radio value="compact" id="r3" />
        <Label htmlFor="r3">Compact</Label>
      </div>
    </RadioGroup>
  );
};
