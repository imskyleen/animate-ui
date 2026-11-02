'use client';

import * as React from 'react';
import { Tabs } from '@animate-ui/react/primitives/base-ui/tabs';

export default function BaseTabsHiddenListFixture() {
  const [shown, setShown] = React.useState(true);
  const [value, setValue] = React.useState('a');

  return (
    <div>
      <button type="button" onClick={() => setShown(!shown)}>
        Toggle
      </button>
      <button type="button" onClick={() => setValue('b')}>
        Select b
      </button>
      <div className="w-80" style={{ display: shown ? undefined : 'none' }}>
        <Tabs.Root value={value} onValueChange={(next) => setValue(next)}>
          <Tabs.List className="flex h-9 w-full">
            <Tabs.Tab value="a">A</Tabs.Tab>
            <Tabs.Tab value="b">B</Tabs.Tab>
          </Tabs.List>
        </Tabs.Root>
      </div>
    </div>
  );
}
