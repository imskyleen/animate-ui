import {
  IconButton,
  type IconButtonProps,
} from '@/registry/components/buttons/icon';
import { StarIcon } from 'lucide-react';

interface IconButtonDemoProps {
  variant: IconButtonProps['variant'];
  size: IconButtonProps['size'];
}

export default function IconButtonDemo({ variant, size }: IconButtonDemoProps) {
  return (
    <IconButton variant={variant} size={size}>
      <StarIcon />
    </IconButton>
  );
}
