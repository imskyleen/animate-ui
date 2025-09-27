import {
  Checkbox,
  CheckboxIndicator,
} from '@/registry/primitives/base/checkbox';
import { Label } from '@workspace/ui/components/ui/label';

interface BaseCheckboxDemoProps {
  indeterminate: boolean;
}

export const BaseCheckboxDemo = ({ indeterminate }: BaseCheckboxDemoProps) => {
  return (
    <Label htmlFor="terms" className="flex items-center gap-x-3">
      <Checkbox
        id="terms"
        indeterminate={indeterminate}
        className="size-5 flex justify-center items-center border [&[data-checked],&[data-indeterminate]]:bg-primary [&[data-checked],&[data-indeterminate]]:text-primary-foreground transition-colors duration-500"
      >
        <CheckboxIndicator className="size-3.5" />
      </Checkbox>
      Accept terms and conditions
    </Label>
  );
};
