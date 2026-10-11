'use client';

import * as React from 'react';
import { Tabs } from '@animate-ui/react/primitives/radix-ui/tabs';
import * as TabsStar from '@animate-ui/react/primitives/radix-ui/tabs';

/** A box a panel holds (a frame): a border, a background. */
const BOX = {
  border: '1px solid rgb(212, 212, 212)',
  borderRadius: 8,
  background: 'white',
  padding: 12,
};
/** A box that looks different (its border). */
const OTHER_BOX = { ...BOX, border: '2px solid rgb(239, 68, 68)' };

// API compatibility: the primitive must behave exactly like Radix's.
export default function RadixTabsFixture() {
  const [value, setValue] = React.useState('a');

  return (
    <div className="flex flex-col gap-10">
      <section data-testid="controlled">
        <p data-testid="controlled-value">{value}</p>
        <button type="button" onClick={() => setValue('a')}>
          Select a
        </button>
        <Tabs.Root value={value} onValueChange={setValue}>
          <Tabs.List aria-label="Controlled">
            <Tabs.Trigger value="a">Controlled a</Tabs.Trigger>
            <Tabs.Trigger value="b">Controlled b</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="a">Controlled panel a</Tabs.Content>
          <Tabs.Content value="b">Controlled panel b</Tabs.Content>
        </Tabs.Root>
      </section>

      <section data-testid="star">
        {/* The `import * as` style of @radix-ui/react-tabs. */}
        <TabsStar.Root defaultValue="y">
          <TabsStar.List aria-label="Star">
            <TabsStar.Trigger value="x">Star x</TabsStar.Trigger>
            <TabsStar.Trigger value="y">Star y</TabsStar.Trigger>
          </TabsStar.List>
          <TabsStar.Content value="x">Star panel x</TabsStar.Content>
          <TabsStar.Content value="y">Star panel y</TabsStar.Content>
        </TabsStar.Root>
      </section>

      <section data-testid="force-mount">
        <Tabs.Root defaultValue="1">
          <Tabs.List aria-label="Forced">
            <Tabs.Trigger value="1">Forced 1</Tabs.Trigger>
            <Tabs.Trigger value="2">Forced 2</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="1" forceMount data-testid="forced-1">
            Forced panel 1
          </Tabs.Content>
          <Tabs.Content value="2" forceMount data-testid="forced-2">
            Forced panel 2
          </Tabs.Content>
        </Tabs.Root>
      </section>

      <section data-testid="manual">
        <Tabs.Root defaultValue="1" activationMode="manual">
          <Tabs.List aria-label="Manual">
            <Tabs.Trigger value="1">Manual 1</Tabs.Trigger>
            <Tabs.Trigger value="2">Manual 2</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="1">Manual panel 1</Tabs.Content>
          <Tabs.Content value="2">Manual panel 2</Tabs.Content>
        </Tabs.Root>
      </section>

      <section data-testid="heights">
        {/* Panels of different heights: the height springs between them. */}
        <Tabs.Root defaultValue="short">
          <Tabs.List aria-label="Heights">
            <Tabs.Trigger value="short">Short</Tabs.Trigger>
            <Tabs.Trigger value="tall">Tall</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="short">Short panel</Tabs.Content>
          <Tabs.Content value="tall">
            <p>Tall panel</p>
            <p>Its second line</p>
            <p>Its third line</p>
            <p>Its fourth line</p>
          </Tabs.Content>
        </Tabs.Root>
      </section>
      <section data-testid="frames">
        {/* Panels holding a box: it stays, its content fades, unless the
            boxes look different or hold text right inside. */}
        <Tabs.Root defaultValue="boxed">
          <Tabs.List aria-label="Frames">
            <Tabs.Trigger value="boxed">Boxed</Tabs.Trigger>
            <Tabs.Trigger value="boxed-tall">Boxed tall</Tabs.Trigger>
            <Tabs.Trigger value="other">Other box</Tabs.Trigger>
            <Tabs.Trigger value="text">Text box</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="boxed">
            <div data-box style={BOX}>
              <p>Boxed panel</p>
            </div>
          </Tabs.Content>
          <Tabs.Content value="boxed-tall">
            <div data-box style={BOX}>
              <p>Boxed tall panel</p>
              <p>Its second line</p>
              <p>Its third line</p>
              <p>Its fourth line</p>
            </div>
          </Tabs.Content>
          <Tabs.Content value="other">
            <div data-box style={OTHER_BOX}>
              <p>Other box panel</p>
            </div>
          </Tabs.Content>
          <Tabs.Content value="text">
            <div data-box style={BOX}>
              Text box panel
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </section>
    </div>
  );
}
