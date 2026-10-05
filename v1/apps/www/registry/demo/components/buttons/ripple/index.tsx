import { PlusIcon } from 'lucide-react';
import {
  RippleButton,
  RippleButtonRipples,
  type RippleButtonProps,
} from '@/registry/components/buttons/ripple';

interface RippleButtonDemoProps {
  variant: RippleButtonProps['variant'];
  size: RippleButtonProps['size'];
}

export default function RippleButtonDemo({
  variant,
  size,
}: RippleButtonDemoProps) {
  return (
    <RippleButton variant={variant} size={size}>
      {size === 'icon' ? <PlusIcon /> : 'Click me'}
      <RippleButtonRipples />
    </RippleButton>
  );
}
