'use client';

import * as React from 'react';
import { Popover } from '@animate-ui/react/primitives/radix-ui/popover';
import * as PopoverStar from '@animate-ui/react/primitives/radix-ui/popover';

// API compatibility: the primitive must behave exactly like Radix's.
export default function RadixPopoverFixture() {
  const [open, setOpen] = React.useState(false);
  const [changes, setChanges] = React.useState(0);

  return (
    <div className="flex flex-col items-start gap-10">
      <section data-testid="controlled" className="flex items-center gap-4">
        <p data-testid="controlled-open">{open ? 'open' : 'closed'}</p>
        <p data-testid="changes">{changes}</p>
        <button type="button" onClick={() => setOpen(true)}>
          Open from outside
        </button>
        <Popover.Root
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            setChanges((count) => count + 1);
          }}
        >
          <Popover.Trigger>Controlled trigger</Popover.Trigger>
          <Popover.Portal>
            <Popover.Content data-testid="controlled-content" sideOffset={4}>
              Controlled content
              <Popover.Close>Close controlled</Popover.Close>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </section>

      <section data-testid="default-open">
        <Popover.Root defaultOpen>
          <Popover.Trigger>Default open trigger</Popover.Trigger>
          {/* Inline, without a Portal. */}
          <Popover.Content data-testid="default-open-content" side="right">
            Open on load
          </Popover.Content>
        </Popover.Root>
      </section>

      <section data-testid="force-mount">
        <Popover.Root>
          <Popover.Trigger>Force mounted trigger</Popover.Trigger>
          <Popover.Portal forceMount>
            <Popover.Content data-testid="force-mount-content" side="right">
              <button type="button">Hidden button</button>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </section>

      <section data-testid="star">
        {/* The `import * as` style of @radix-ui/react-popover. */}
        <PopoverStar.Root>
          <PopoverStar.Trigger>Star trigger</PopoverStar.Trigger>
          <PopoverStar.Portal>
            <PopoverStar.Content
              data-testid="star-content"
              className="custom-class"
              style={{ transformOrigin: 'left top' }}
              transition={{ duration: 0.2 }}
            >
              Star content
              <PopoverStar.Arrow />
            </PopoverStar.Content>
          </PopoverStar.Portal>
        </PopoverStar.Root>
      </section>
    </div>
  );
}
