'use client';

import * as React from 'react';
import { Switch } from '@animate-ui/react/primitives/react-aria';

const Track = ({ isSelected }: { isSelected: boolean }) => (
  <span className="inline-flex h-5 w-9 items-center rounded-full border">
    <span
      data-slot="switch-thumb"
      data-selected={isSelected || undefined}
      className="block size-4 rounded-full bg-current data-selected:translate-x-4"
    />
  </span>
);

// API compatibility: the component must behave exactly like React Aria's.
export default function ReactAriaSwitchFixture() {
  const [selected, setSelected] = React.useState(false);

  return (
    <div className="flex flex-col gap-10">
      <section data-testid="controlled">
        <p data-testid="controlled-value">{String(selected)}</p>
        <button type="button" onClick={() => setSelected(true)}>
          Turn on
        </button>
        <Switch
          isSelected={selected}
          onChange={setSelected}
          className={({ isSelected }) =>
            `flex gap-2 ${isSelected ? 'is-on' : 'is-off'}`
          }
          style={({ isSelected }) => ({
            color: isSelected ? 'green' : undefined,
          })}
        >
          {({ isSelected }) => (
            <>
              <Track isSelected={isSelected} />
              Controlled
            </>
          )}
        </Switch>
      </section>

      <section data-testid="disabled">
        <Switch isDisabled>
          {({ isSelected }) => (
            <>
              <Track isSelected={isSelected} />
              Disabled
            </>
          )}
        </Switch>
      </section>
    </div>
  );
}
