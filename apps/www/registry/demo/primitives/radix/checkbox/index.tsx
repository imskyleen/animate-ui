'use client';

import {
  Checkbox,
  CheckboxIndicator,
} from '@/registry/primitives/radix/checkbox';
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
    <div className="flex items-center space-x-2">
      <Checkbox
        id="terms"
        checked={isChecked}
        onCheckedChange={setIsChecked}
        className="size-5 flex justify-center items-center border [&[data-state=checked],&[data-state=indeterminate]]:bg-primary [&[data-state=checked],&[data-state=indeterminate]]:text-primary-foreground transition-colors duration-500"
      >
        <CheckboxIndicator className="size-3.5" />
      </Checkbox>
      <label htmlFor="terms">Accept terms and conditions</label>
    </div>
  );
};
