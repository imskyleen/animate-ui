import { PlusIcon } from 'lucide-react';
import {
  FlipButton,
  FlipButtonBack,
  FlipButtonFront,
  type FlipButtonProps,
} from '@/registry/components/buttons/flip';

interface ButtonDemoProps {
  frontVariant: FlipButtonProps['variant'];
  frontSize: FlipButtonProps['size'];
  backVariant: FlipButtonProps['variant'];
  backSize: FlipButtonProps['size'];
}

export default function ButtonDemo({
  frontVariant,
  frontSize,
  backVariant,
  backSize,
}: ButtonDemoProps) {
  return (
    <FlipButton>
      <FlipButtonFront variant={frontVariant} size={frontSize}>
        {frontSize === 'icon' ? <PlusIcon /> : 'Front Button'}
      </FlipButtonFront>
      <FlipButtonBack variant={backVariant} size={backSize}>
        {backSize === 'icon' ? <PlusIcon /> : 'Back Button'}
      </FlipButtonBack>
    </FlipButton>
  );
}
