import { PlusIcon } from 'lucide-react';
import {
  LiquidButton,
  type LiquidButtonProps,
} from '@/registry/components/buttons/liquid';

interface LiquidButtonDemoProps {
  variant: LiquidButtonProps['variant'];
  size: LiquidButtonProps['size'];
}

export default function LiquidButtonDemo({
  variant,
  size,
}: LiquidButtonDemoProps) {
  return (
    <LiquidButton variant={variant} size={size}>
      {size === 'icon' ? <PlusIcon /> : 'Hover me'}
    </LiquidButton>
  );
}
