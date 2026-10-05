import {
  ToggleGroup,
  ToggleGroupItem,
  type ToggleGroupProps,
} from '@/registry/components/radix/toggle-group';
import { Bold, Italic, Underline } from 'lucide-react';

interface RadixToggleGroupDemoProps {
  type: 'single' | 'multiple';
  variant: ToggleGroupProps['variant'];
  size: ToggleGroupProps['size'];
}

export function RadixToggleGroupDemo({
  type,
  variant,
  size,
}: RadixToggleGroupDemoProps) {
  return (
    <ToggleGroup type={type} variant={variant} size={size}>
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <Bold />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <Italic />
      </ToggleGroupItem>
      <ToggleGroupItem value="strikethrough" aria-label="Toggle strikethrough">
        <Underline />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
