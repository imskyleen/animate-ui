'use client';

import * as React from 'react';
import { ToggleButton } from '@animate-ui/react/primitives/react-aria';

export default function ReactAriaToggleFixture() {
  const [selected, setSelected] = React.useState(false);

  return (
    <div className="flex flex-col gap-10">
      <section data-testid="controlled">
        <p data-testid="controlled-value">{String(selected)}</p>
        <button type="button" onClick={() => setSelected(true)}>
          Press it
        </button>
        <ToggleButton
          isSelected={selected}
          onChange={setSelected}
          className={({ isSelected }) => (isSelected ? 'is-on' : 'is-off')}
        >
          {({ isSelected }) => `Controlled ${isSelected ? 'on' : 'off'}`}
        </ToggleButton>
      </section>

      <section data-testid="custom-render">
        <ToggleButton render={(props) => <button {...props} data-custom="" />}>
          Custom render
        </ToggleButton>
      </section>
    </div>
  );
}
