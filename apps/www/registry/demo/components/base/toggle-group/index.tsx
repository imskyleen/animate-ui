import {
  Toggle,
  ToggleGroup,
  type ToggleGroupProps,
} from '@/registry/components/base/toggle-group';
import { Bold, Italic, Underline } from 'lucide-react';

interface BaseToggleGroupDemoProps {
  multiple: boolean;
  variant: ToggleGroupProps['variant'];
  size: ToggleGroupProps['size'];
}

export function BaseToggleGroupDemo({
  multiple,
  variant,
  size,
}: BaseToggleGroupDemoProps) {
  return (
    <ToggleGroup multiple={multiple} variant={variant} size={size}>
      <Toggle value="bold" aria-label="Toggle bold">
        <Bold />
      </Toggle>
      <Toggle value="italic" aria-label="Toggle italic">
        <Italic />
      </Toggle>
      <Toggle value="strikethrough" aria-label="Toggle strikethrough">
        <Underline />
      </Toggle>
    </ToggleGroup>
  );
}
