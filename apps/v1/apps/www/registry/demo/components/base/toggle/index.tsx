import { Toggle, type ToggleProps } from '@/registry/components/base/toggle';
import { Bold } from 'lucide-react';

interface BaseToggleDemoProps {
  variant: ToggleProps['variant'];
  size: ToggleProps['size'];
}

export function BaseToggleDemo({ variant, size }: BaseToggleDemoProps) {
  return (
    <Toggle aria-label="Toggle italic" variant={variant} size={size}>
      <Bold />
    </Toggle>
  );
}
