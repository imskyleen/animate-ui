'use client';

import * as React from 'react';
import { Collapsible } from '@animate-ui/react/primitives/radix-ui/collapsible';
import * as CollapsibleStar from '@animate-ui/react/primitives/radix-ui/collapsible';

export default function RadixCollapsibleFixture() {
  const [open, setOpen] = React.useState(true);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <p data-testid="controlled-open">{String(open)}</p>
        <Collapsible.Root open={open} onOpenChange={setOpen}>
          <Collapsible.Trigger>Controlled</Collapsible.Trigger>
          <Collapsible.Content>Controlled content</Collapsible.Content>
        </Collapsible.Root>
        <button type="button" onClick={() => setOpen((o) => !o)}>
          Toggle from outside
        </button>
      </section>

      <section>
        <CollapsibleStar.Root defaultOpen>
          <CollapsibleStar.CollapsibleTrigger>
            Uncontrolled
          </CollapsibleStar.CollapsibleTrigger>
          <CollapsibleStar.CollapsibleContent>
            Uncontrolled content
          </CollapsibleStar.CollapsibleContent>
        </CollapsibleStar.Root>
      </section>

      <section>
        <Collapsible.Root>
          <Collapsible.Trigger>Force mounted</Collapsible.Trigger>
          <Collapsible.Content forceMount>
            <button type="button">Hidden button</button>
          </Collapsible.Content>
        </Collapsible.Root>
      </section>

      <section>
        <Collapsible.Collapsible disabled>
          <Collapsible.Trigger>Disabled</Collapsible.Trigger>
          <Collapsible.Content>Disabled content</Collapsible.Content>
        </Collapsible.Collapsible>
      </section>
    </div>
  );
}
