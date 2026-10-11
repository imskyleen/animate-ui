'use client';

import * as React from 'react';
import { Tabs } from '@animate-ui/react/primitives/base-ui/tabs';

/** A box a panel holds (a frame): a border, a background. */
const BOX = {
  border: '1px solid rgb(212, 212, 212)',
  borderRadius: 8,
  background: 'white',
  padding: 12,
};
/** A box that looks different (its border). */
const OTHER_BOX = { ...BOX, border: '2px solid rgb(239, 68, 68)' };

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

      <section data-testid="heights">
        {/* Panels of different heights: the height springs between them. */}
        <Tabs.Root defaultValue="short">
          <Tabs.List aria-label="Heights">
            <Tabs.Tab value="short">Short</Tabs.Tab>
            <Tabs.Tab value="tall">Tall</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="short">Short panel</Tabs.Panel>
          <Tabs.Panel value="tall">
            <p>Tall panel</p>
            <p>Its second line</p>
            <p>Its third line</p>
            <p>Its fourth line</p>
          </Tabs.Panel>
        </Tabs.Root>
      </section>
      <section data-testid="frames">
        {/* Panels holding a box: it stays, its content fades, unless the
            boxes look different or hold text right inside. */}
        <Tabs.Root defaultValue="boxed">
          <Tabs.List aria-label="Frames">
            <Tabs.Tab value="boxed">Boxed</Tabs.Tab>
            <Tabs.Tab value="boxed-tall">Boxed tall</Tabs.Tab>
            <Tabs.Tab value="other">Other box</Tabs.Tab>
            <Tabs.Tab value="text">Text box</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="boxed">
            <div data-box style={BOX}>
              <p>Boxed panel</p>
            </div>
          </Tabs.Panel>
          <Tabs.Panel value="boxed-tall">
            <div data-box style={BOX}>
              <p>Boxed tall panel</p>
              <p>Its second line</p>
              <p>Its third line</p>
              <p>Its fourth line</p>
            </div>
          </Tabs.Panel>
          <Tabs.Panel value="other">
            <div data-box style={OTHER_BOX}>
              <p>Other box panel</p>
            </div>
          </Tabs.Panel>
          <Tabs.Panel value="text">
            <div data-box style={BOX}>
              Text box panel
            </div>
          </Tabs.Panel>
        </Tabs.Root>
      </section>
    </div>
  );
}
