'use client';

import * as React from 'react';
import { Toggle } from '@animate-ui/react/primitives/base-ui/toggle';
import { ToggleGroup } from '@animate-ui/react/primitives/base-ui/toggle-group';

// API compatibility: the primitives must behave exactly like Base UI's.
export default function BaseToggleGroupFixture() {
  const [value, setValue] = React.useState<string[]>(['a']);

  return (
    <div className="flex flex-col gap-10">
      <section data-testid="controlled">
        <p data-testid="controlled-value">{value.join(',') || 'none'}</p>
        <button type="button" onClick={() => setValue(['a'])}>
          Select a
        </button>
        <ToggleGroup
          aria-label="Controlled"
          value={value}
          onValueChange={(next) => setValue(next)}
        >
          <Toggle value="a">Controlled a</Toggle>
          <Toggle value="b">Controlled b</Toggle>
        </ToggleGroup>
      </section>

      <section data-testid="multiple">
        <ToggleGroup multiple aria-label="Multiple" defaultValue={['x']}>
          <Toggle value="x">Multiple x</Toggle>
          <Toggle value="y">Multiple y</Toggle>
        </ToggleGroup>
      </section>
    </div>
  );
}
