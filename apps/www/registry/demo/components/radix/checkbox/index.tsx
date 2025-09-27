import { useEffect, useState } from 'react';

import { Label } from '@workspace/ui/components/ui/label';
import {
  Checkbox,
  type CheckboxProps,
} from '@/registry/components/radix/checkbox';

interface RadixCheckboxDemoProps {
  checked: boolean | 'indeterminate';
  variant: CheckboxProps['variant'];
  size: CheckboxProps['size'];
}

export const RadixCheckboxDemo = ({
  checked,
  variant,
  size,
}: RadixCheckboxDemoProps) => {
  const [isChecked, setIsChecked] = useState(checked ?? false);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  return (
    <Label className="flex items-center gap-x-3">
      <Checkbox
        checked={isChecked}
        onCheckedChange={setIsChecked}
        variant={variant}
        size={size}
      />
      Accept terms and conditions
    </Label>
  );
};
