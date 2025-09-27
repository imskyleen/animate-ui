'use client';

import {
  Checkbox,
  CheckboxIndicator,
} from '@/registry/primitives/radix/checkbox';
import { Label } from '@workspace/ui/components/ui/label';
import { useEffect, useState } from 'react';

type RadixCheckboxDemoProps = {
  checked: boolean | 'indeterminate';
};

export const RadixCheckboxDemo = ({ checked }: RadixCheckboxDemoProps) => {
  const [isChecked, setIsChecked] = useState(checked ?? false);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  return (
    <Label htmlFor="terms" className="flex items-center gap-x-3">
      <Checkbox
        id="terms"
        checked={isChecked}
        onCheckedChange={setIsChecked}
        className="size-5 flex justify-center items-center border [&[data-state=checked],&[data-state=indeterminate]]:bg-primary [&[data-state=checked],&[data-state=indeterminate]]:text-primary-foreground transition-colors duration-500"
      >
        <CheckboxIndicator className="size-3.5" />
      </Checkbox>
      Accept terms and conditions
    </Label>
  );
};
