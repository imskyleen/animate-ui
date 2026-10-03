'use client';

import * as React from 'react';
import {
  Link,
  Popover,
  PreviewTrigger,
} from '@animate-ui/react/primitives/react-aria';

// API compatibility: React Aria's PreviewTrigger with the animated Popover.
export default function ReactAriaHoverCardFixture() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col items-start gap-16">
      <section data-testid="controlled" className="flex items-center gap-4">
        <p data-testid="controlled-open">{open ? 'open' : 'closed'}</p>
        <PreviewTrigger
          isOpen={open}
          onOpenChange={setOpen}
          delay={0}
          closeDelay={0}
        >
          <Link href="#controlled">Controlled link</Link>
          <Popover placement="end" data-testid="controlled-content">
            Controlled card
          </Popover>
        </PreviewTrigger>
      </section>

      <section data-testid="swap" className="flex items-center gap-6">
        {['First', 'Second'].map((name) => (
          <PreviewTrigger key={name} delay={100} closeDelay={0}>
            <Link href={`#${name}`}>{name} link</Link>
            <Popover placement="bottom" data-testid="swap-content">
              {name} card
            </Popover>
          </PreviewTrigger>
        ))}
      </section>
    </div>
  );
}
