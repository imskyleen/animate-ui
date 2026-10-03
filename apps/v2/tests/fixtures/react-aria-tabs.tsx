'use client';

import * as React from 'react';
import {
  Tab,
  TabList,
  TabPanel,
  Tabs,
  type Key,
} from '@animate-ui/react/primitives/react-aria';

// API compatibility: the components must behave exactly like React Aria's.
export default function ReactAriaTabsFixture() {
  const [selected, setSelected] = React.useState<Key>('a');

  return (
    <div className="flex flex-col gap-10">
      <section data-testid="controlled">
        <p data-testid="controlled-value">{String(selected)}</p>
        <button type="button" onClick={() => setSelected('a')}>
          Select a
        </button>
        <Tabs selectedKey={selected} onSelectionChange={setSelected}>
          <TabList aria-label="Controlled">
            <Tab id="a">Controlled a</Tab>
            <Tab id="b">Controlled b</Tab>
          </TabList>
          <TabPanel id="a">Controlled panel a</TabPanel>
          <TabPanel id="b">Controlled panel b</TabPanel>
        </Tabs>
      </section>

      <section data-testid="uncontrolled">
        <Tabs disabledKeys={['two']}>
          <TabList aria-label="Uncontrolled">
            <Tab id="one">One</Tab>
            <Tab id="two">Two</Tab>
            <Tab id="three">Three</Tab>
          </TabList>
          <TabPanel id="one">Panel one</TabPanel>
          <TabPanel id="two">Panel two</TabPanel>
          <TabPanel id="three">Panel three</TabPanel>
        </Tabs>
      </section>

      <section data-testid="force-mount">
        <Tabs>
          <TabList aria-label="Forced">
            <Tab id="1">Forced 1</Tab>
            <Tab id="2">Forced 2</Tab>
          </TabList>
          <TabPanel id="1" shouldForceMount data-testid="forced-1">
            Forced panel 1
          </TabPanel>
          <TabPanel id="2" shouldForceMount data-testid="forced-2">
            Forced panel 2
          </TabPanel>
        </Tabs>
      </section>

      <section data-testid="manual">
        <Tabs keyboardActivation="manual">
          <TabList aria-label="Manual">
            <Tab id="1">Manual 1</Tab>
            <Tab id="2">Manual 2</Tab>
          </TabList>
          <TabPanel id="1">Manual panel 1</TabPanel>
          <TabPanel id="2">Manual panel 2</TabPanel>
        </Tabs>
      </section>

      <section data-testid="render-props">
        <Tabs>
          <TabList aria-label="Render props">
            <Tab
              id="1"
              className={({ isSelected }) => (isSelected ? 'is-selected' : '')}
            >
              Props 1
            </Tab>
            <Tab id="2">Props 2</Tab>
          </TabList>
          <TabPanel
            id="1"
            style={({ isFocusVisible }) => ({
              outline: isFocusVisible ? '2px solid red' : '1px dashed gray',
            })}
          >
            Props panel 1
          </TabPanel>
          <TabPanel id="2">Props panel 2</TabPanel>
        </Tabs>
      </section>
    </div>
  );
}
