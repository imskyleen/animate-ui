'use client';

import * as React from 'react';
import { HoverCard } from '@animate-ui/react/primitives/radix-ui/hover-card';
import * as HoverCardStar from '@animate-ui/react/primitives/radix-ui/hover-card';

// API compatibility: the primitive must behave exactly like Radix's.
export default function RadixHoverCardFixture() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col items-start gap-16">
      <section data-testid="controlled" className="flex items-center gap-4">
        <p data-testid="controlled-open">{open ? 'open' : 'closed'}</p>
        <button type="button" onClick={() => setOpen((value) => !value)}>
          Toggle from outside
        </button>
        <HoverCard.Root
          open={open}
          onOpenChange={setOpen}
          openDelay={0}
          closeDelay={0}
        >
          <HoverCard.Trigger href="#controlled">
            Controlled link
          </HoverCard.Trigger>
          <HoverCard.Portal>
            <HoverCard.Content data-testid="controlled-content" side="right">
              Controlled card
            </HoverCard.Content>
          </HoverCard.Portal>
        </HoverCard.Root>
      </section>

      <section data-testid="force-mount">
        <HoverCard.Root openDelay={0} closeDelay={0}>
          <HoverCard.Trigger href="#force">
            Force mounted link
          </HoverCard.Trigger>
          <HoverCard.Portal>
            <HoverCard.Content
              forceMount
              data-testid="force-mount-content"
              side="right"
            >
              Kept mounted
            </HoverCard.Content>
          </HoverCard.Portal>
        </HoverCard.Root>
      </section>

      <section data-testid="star">
        {/* The `import * as` style of @radix-ui/react-hover-card. */}
        <HoverCardStar.Root openDelay={0} closeDelay={0}>
          <HoverCardStar.Trigger href="#star">Star link</HoverCardStar.Trigger>
          <HoverCardStar.Portal>
            <HoverCardStar.Content data-testid="star-content" side="right">
              Star card
              <HoverCardStar.Arrow />
            </HoverCardStar.Content>
          </HoverCardStar.Portal>
        </HoverCardStar.Root>
      </section>
    </div>
  );
}
