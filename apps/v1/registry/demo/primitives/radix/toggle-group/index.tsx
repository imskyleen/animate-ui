import {
  ToggleGroup,
  ToggleGroupItem,
  ToggleGroupHighlight,
  ToggleGroupHighlightItem,
} from '@/registry/primitives/radix/toggle-group';
import { Bold, Italic, Underline } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RadixToggleGroupDemoProps {
  type: 'single' | 'multiple';
}

export const RadixToggleGroupDemo = ({ type }: RadixToggleGroupDemoProps) => {
  const [value, setValue] = useState<string | string[] | undefined>(undefined);

  useEffect(() => {
    if (type === 'single') {
      setValue('bold');
    } else {
      setValue(['bold']);
    }
  }, [type]);

  return type === 'single' ? (
    <ToggleGroup
      type="single"
      value={value as string}
      onValueChange={(value) => setValue(value as string)}
      className="flex gap-2"
    >
      <ToggleGroupHighlight className="bg-accent">
        <ToggleGroupHighlightItem value="bold">
          <ToggleGroupItem
            value="bold"
            aria-label="Toggle bold"
            className="size-8 flex items-center justify-center"
          >
            <Bold className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroupHighlightItem>
        <ToggleGroupHighlightItem value="italic">
          <ToggleGroupItem
            value="italic"
            aria-label="Toggle italic"
            className="size-8 flex items-center justify-center"
          >
            <Italic className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroupHighlightItem>
        <ToggleGroupHighlightItem value="underline">
          <ToggleGroupItem
            value="underline"
            aria-label="Toggle underline"
            className="size-8 flex items-center justify-center"
          >
            <Underline className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroupHighlightItem>
      </ToggleGroupHighlight>
    </ToggleGroup>
  ) : (
    <ToggleGroup
      type="multiple"
      value={value as string[]}
      onValueChange={(value) => setValue(value as string[])}
      className="flex gap-2"
    >
      <ToggleGroupHighlightItem value="bold" className="bg-accent">
        <ToggleGroupItem
          value="bold"
          aria-label="Toggle bold"
          className="size-8 flex items-center justify-center"
        >
          <Bold className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroupHighlightItem>
      <ToggleGroupHighlightItem value="italic" className="bg-accent">
        <ToggleGroupItem
          value="italic"
          aria-label="Toggle italic"
          className="size-8 flex items-center justify-center"
        >
          <Italic className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroupHighlightItem>
      <ToggleGroupHighlightItem value="underline" className="bg-accent">
        <ToggleGroupItem
          value="underline"
          aria-label="Toggle underline"
          className="size-8 flex items-center justify-center"
        >
          <Underline className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroupHighlightItem>
    </ToggleGroup>
  );
};
