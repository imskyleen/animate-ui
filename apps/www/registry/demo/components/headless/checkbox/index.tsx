import { Label } from '@workspace/ui/components/ui/label';
import {
  Checkbox,
  type CheckboxProps,
} from '@/registry/components/headless/checkbox';

interface HeadlessCheckboxDemoProps {
  indeterminate: boolean;
  variant: CheckboxProps['variant'];
  size: CheckboxProps['size'];
}

export const HeadlessCheckboxDemo = ({
  indeterminate,
  variant,
  size,
}: HeadlessCheckboxDemoProps) => {
  return (
    <Label className="flex items-center gap-x-3">
      <Checkbox indeterminate={indeterminate} variant={variant} size={size} />
      Accept terms and conditions
    </Label>
  );
};
