import {
  ToggleGroup,
  Toggle,
  ToggleGroupHighlight,
  ToggleHighlight,
} from '@/registry/primitives/base/toggle-group';
import { Bold, Italic, Underline } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BaseToggleGroupDemoProps {
  toggleMultiple: boolean;
}

export const BaseToggleGroupDemo = ({
  toggleMultiple,
}: BaseToggleGroupDemoProps) => {
  const [value, setValue] = useState<any[]>([]);

  useEffect(() => {
    setValue(['bold']);
  }, [toggleMultiple]);

  return !toggleMultiple ? (
    <ToggleGroup value={value} onValueChange={setValue} className="flex gap-2">
      <ToggleGroupHighlight className="bg-accent">
        <ToggleHighlight value="bold">
          <Toggle
            value="bold"
            aria-label="Toggle bold"
            className="size-8 flex items-center justify-center"
          >
            <Bold className="h-4 w-4" />
          </Toggle>
        </ToggleHighlight>
        <ToggleHighlight value="italic">
          <Toggle
            value="italic"
            aria-label="Toggle italic"
            className="size-8 flex items-center justify-center"
          >
            <Italic className="h-4 w-4" />
          </Toggle>
        </ToggleHighlight>
        <ToggleHighlight value="underline">
          <Toggle
            value="underline"
            aria-label="Toggle underline"
            className="size-8 flex items-center justify-center"
          >
            <Underline className="h-4 w-4" />
          </Toggle>
        </ToggleHighlight>
      </ToggleGroupHighlight>
    </ToggleGroup>
  ) : (
    <ToggleGroup
      multiple
      value={value}
      onValueChange={setValue}
      className="flex gap-2"
    >
      <ToggleHighlight value="bold" className="bg-accent">
        <Toggle
          value="bold"
          aria-label="Toggle bold"
          className="size-8 flex items-center justify-center"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
      </ToggleHighlight>
      <ToggleHighlight value="italic" className="bg-accent">
        <Toggle
          value="italic"
          aria-label="Toggle italic"
          className="size-8 flex items-center justify-center"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
      </ToggleHighlight>
      <ToggleHighlight value="underline" className="bg-accent">
        <Toggle
          value="underline"
          aria-label="Toggle underline"
          className="size-8 flex items-center justify-center"
        >
          <Underline className="h-4 w-4" />
        </Toggle>
      </ToggleHighlight>
    </ToggleGroup>
  );
};
