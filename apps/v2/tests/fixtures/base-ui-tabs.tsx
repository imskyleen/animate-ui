'use client';

import * as React from 'react';
import { Tabs } from '@animate-ui/react/primitives/base-ui/tabs';

// API compatibility: the primitive must behave exactly like Base UI's.
export default function BaseTabsFixture() {
  const [value, setValue] = React.useState('a');

  return (
    <div className="flex flex-col gap-10">
      <section data-testid="controlled">
        <p data-testid="controlled-value">{value}</p>
        <button type="button" onClick={() => setValue('a')}>
          Select a
        </button>
        <Tabs.Root value={value} onValueChange={(next) => setValue(next)}>
          <Tabs.List aria-label="Controlled">
            <Tabs.Tab value="a">Controlled a</Tabs.Tab>
            <Tabs.Tab value="b">Controlled b</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="a">Controlled panel a</Tabs.Panel>
          <Tabs.Panel value="b">Controlled panel b</Tabs.Panel>
        </Tabs.Root>
      </section>

      <section data-testid="uncontrolled">
        {/* No defaultValue: Base UI selects the first tab (value 0). */}
        <Tabs.Root>
          <Tabs.List aria-label="Uncontrolled">
            <Tabs.Tab value={0}>Uncontrolled 0</Tabs.Tab>
            <Tabs.Tab value={1}>Uncontrolled 1</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value={0}>Uncontrolled panel 0</Tabs.Panel>
          <Tabs.Panel value={1}>Uncontrolled panel 1</Tabs.Panel>
        </Tabs.Root>
      </section>

      <section data-testid="keep-mounted">
        <Tabs.Root defaultValue="1">
          <Tabs.List aria-label="Kept">
            <Tabs.Tab value="1">Kept 1</Tabs.Tab>
            <Tabs.Tab value="2">Kept 2</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="1" keepMounted data-testid="kept-1">
            Kept panel 1
          </Tabs.Panel>
          <Tabs.Panel value="2" keepMounted data-testid="kept-2">
            Kept panel 2
          </Tabs.Panel>
        </Tabs.Root>
      </section>

      <section data-testid="own-indicator">
        <Tabs.Root defaultValue="1">
          <Tabs.List aria-label="Own indicator">
            <Tabs.Tab value="1">Own 1</Tabs.Tab>
            <Tabs.Tab value="2">Own 2</Tabs.Tab>
            <Tabs.Indicator data-testid="base-indicator" />
          </Tabs.List>
        </Tabs.Root>
      </section>

      <section data-testid="activate-on-focus">
        <Tabs.Root defaultValue="1">
          <Tabs.List aria-label="Focus" activateOnFocus>
            <Tabs.Tab value="1">Focus 1</Tabs.Tab>
            <Tabs.Tab value="2">Focus 2</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="1">Focus panel 1</Tabs.Panel>
          <Tabs.Panel value="2">Focus panel 2</Tabs.Panel>
        </Tabs.Root>
      </section>
    </div>
  );
}
