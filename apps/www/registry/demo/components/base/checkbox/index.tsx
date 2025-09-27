import { Label } from '@workspace/ui/components/ui/label';
import {
  Checkbox,
  type CheckboxProps,
} from '@/registry/components/base/checkbox';

interface BaseCheckboxDemoProps {
  indeterminate: boolean;
  variant: CheckboxProps['variant'];
  size: CheckboxProps['size'];
}

export const BaseCheckboxDemo = ({
  indeterminate,
  variant,
  size,
}: BaseCheckboxDemoProps) => {
  return (
    <Label className="flex items-center gap-x-3">
      <Checkbox indeterminate={indeterminate} variant={variant} size={size} />
      Accept terms and conditions
    </Label>
  );
};
