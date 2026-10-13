'use client';

import * as React from 'react';
import { Collapsible } from '@animate-ui/react/primitives/base-ui/collapsible';

export default function BaseCollapsibleFixture() {
  const [open, setOpen] = React.useState(true);
  const [changes, setChanges] = React.useState(0);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <p data-testid="controlled-open">{String(open)}</p>
        <Collapsible.Root open={open} onOpenChange={setOpen}>
          <Collapsible.Trigger>Controlled</Collapsible.Trigger>
          <Collapsible.Panel>Controlled content</Collapsible.Panel>
        </Collapsible.Root>
      </section>

      <section>
        <p data-testid="canceled-changes">{changes}</p>
        <Collapsible.Root
          onOpenChange={(_, details) => {
            setChanges((c) => c + 1);
            details.cancel();
          }}
        >
          <Collapsible.Trigger>Canceled</Collapsible.Trigger>
          <Collapsible.Panel>Canceled content</Collapsible.Panel>
        </Collapsible.Root>
      </section>

      <section>
        <Collapsible.Root defaultOpen>
          <Collapsible.Trigger>Kept mounted</Collapsible.Trigger>
          <Collapsible.Panel keepMounted data-testid="kept">
            <button type="button">Kept button</button>
          </Collapsible.Panel>
        </Collapsible.Root>
      </section>

      <section>
        <Collapsible.Root>
          <Collapsible.Trigger>Until found</Collapsible.Trigger>
          <Collapsible.Panel
            hiddenUntilFound
            data-testid="until-found"
            className={(state) => (state.open ? 'is-open' : 'is-closed')}
          >
            Findable content
          </Collapsible.Panel>
        </Collapsible.Root>
      </section>

      <section>
        <Collapsible.Root defaultOpen>
          <Collapsible.Trigger>Custom render</Collapsible.Trigger>
          <Collapsible.Panel
            render={<section data-testid="custom-render" />}
            style={{ color: 'rgb(255, 0, 0)' }}
          >
            Custom render content
          </Collapsible.Panel>
        </Collapsible.Root>
      </section>
    </div>
  );
}
