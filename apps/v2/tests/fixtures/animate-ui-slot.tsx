'use client';

import * as React from 'react';
import { Slot } from '@animate-ui/react/primitives/slot';
import { Tabs, TabsList, TabsTrigger } from '@animate-ui/react/primitives/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@animate-ui/react/primitives/tooltip';

export default function AnimateUISlotFixture() {
  const [log, setLog] = React.useState<string[]>([]);
  const [show, setShow] = React.useState(false);
  const push = (entry: string) => setLog((l) => [...l, entry]);

  return (
    <div className="flex flex-col items-start gap-4">
      <Slot onClick={() => push('slot click')}>
        <button onClick={() => push('child click')}>Slotted</button>
      </Slot>
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b" asChild>
            <button onClick={() => push('tab child click')}>B</button>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onMouseEnter={() => push('trigger child enter')}
              onFocus={() => push('trigger child focus')}
            >
              Hover me
            </button>
          </TooltipTrigger>
          <TooltipContent>Tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Slot>{show && <span>Shown</span>}</Slot>
      <button onClick={() => setShow((s) => !s)}>Toggle</button>
      <output data-testid="log">{log.join(', ')}</output>
    </div>
  );
}
