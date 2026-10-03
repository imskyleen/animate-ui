'use client';

import * as React from 'react';
import { Toggle } from '@animate-ui/react/primitives/base-ui/toggle';

// API compatibility: the primitive must behave exactly like Base UI's.
export default function BaseToggleFixture() {
  const [pressed, setPressed] = React.useState(false);

  return (
    <div className="flex flex-col gap-10">
      <section data-testid="controlled">
        <p data-testid="controlled-value">{String(pressed)}</p>
        <button type="button" onClick={() => setPressed(true)}>
          Press it
        </button>
        <Toggle
          pressed={pressed}
          onPressedChange={(next) => setPressed(next)}
          className={(state: Toggle.State) =>
            state.pressed ? 'is-on' : 'is-off'
          }
        >
          Controlled
        </Toggle>
      </section>

      <section data-testid="uncontrolled">
        <Toggle defaultPressed>Uncontrolled</Toggle>
      </section>
    </div>
  );
}
