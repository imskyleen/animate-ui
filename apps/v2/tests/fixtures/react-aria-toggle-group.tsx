'use client';

import * as React from 'react';
import {
  ToggleButton,
  ToggleButtonGroup,
  type Key,
} from '@animate-ui/react/primitives/react-aria';

import ToggleGroupDemo from '@/demos/react-aria/toggle-group';

export default function ReactAriaToggleGroupFixture() {
  const [selected, setSelected] = React.useState<Set<Key>>(
    () => new Set(['a']),
  );

  return (
    <div className="flex flex-col gap-10">
      <section data-testid="controlled">
        <p data-testid="controlled-value">
          {[...selected].join(',') || 'none'}
        </p>
        <button type="button" onClick={() => setSelected(new Set(['a']))}>
          Select a
        </button>
        <ToggleButtonGroup
          aria-label="Controlled"
          selectedKeys={selected}
          onSelectionChange={setSelected}
        >
          <ToggleButton id="a">Controlled a</ToggleButton>
          <ToggleButton id="b">Controlled b</ToggleButton>
        </ToggleButtonGroup>
      </section>

      <section data-testid="multiple">
        <ToggleButtonGroup
          selectionMode="multiple"
          aria-label="Multiple"
          defaultSelectedKeys={['x']}
        >
          <ToggleButton id="x">Multiple x</ToggleButton>
          <ToggleButton id="y">Multiple y</ToggleButton>
        </ToggleButtonGroup>
      </section>

      <section data-testid="demo-single">
        <ToggleGroupDemo multiple={false} />
      </section>
    </div>
  );
}
