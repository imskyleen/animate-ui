import {
  Toggle,
  ToggleHighlight,
  ToggleItem,
} from '@/registry/primitives/radix/toggle';
import { Bold } from 'lucide-react';

export const RadixToggleDemo = () => {
  return (
    <Toggle className="relative size-8 flex items-center justify-center">
      <ToggleHighlight className="bg-accent" />
      <ToggleItem>
        <Bold className="h-4 w-4" />
      </ToggleItem>
    </Toggle>
  );
};
