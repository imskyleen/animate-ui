import { PlusIcon } from 'lucide-react';
import { Button, type ButtonProps } from '@/registry/components/buttons/button';

interface ButtonDemoProps {
  variant: ButtonProps['variant'];
  size: ButtonProps['size'];
}

export default function ButtonDemo({ variant, size }: ButtonDemoProps) {
  return (
    <Button variant={variant} size={size}>
      {size === 'icon' ? <PlusIcon /> : 'Click me'}
    </Button>
  );
}
