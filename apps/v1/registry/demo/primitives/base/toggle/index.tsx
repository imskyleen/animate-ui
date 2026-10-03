import {
  Toggle,
  ToggleHighlight,
  ToggleItem,
} from '@/registry/primitives/base/toggle';
import { Bold } from 'lucide-react';

export const BaseToggleDemo = () => {
  return (
    <Toggle className="relative size-8 flex items-center justify-center">
      <ToggleHighlight className="bg-accent" />
      <ToggleItem>
        <Bold className="h-4 w-4" />
      </ToggleItem>
    </Toggle>
  );
};
