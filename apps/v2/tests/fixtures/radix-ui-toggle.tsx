'use client';

import * as React from 'react';
import { Toggle } from '@animate-ui/react/primitives/radix-ui/toggle';
import * as ToggleStar from '@animate-ui/react/primitives/radix-ui/toggle';

export default function RadixToggleFixture() {
  const [pressed, setPressed] = React.useState(false);

  return (
    <div className="flex flex-col gap-10">
      <section data-testid="controlled">
        <p data-testid="controlled-value">{String(pressed)}</p>
        <button type="button" onClick={() => setPressed(true)}>
          Press it
        </button>
        <Toggle.Root pressed={pressed} onPressedChange={setPressed}>
          Controlled
        </Toggle.Root>
      </section>

      <section data-testid="star">
        <ToggleStar.Root defaultPressed>Star</ToggleStar.Root>
      </section>

      <section data-testid="as-child">
        <Toggle.Root asChild>
          <a href="#as-child" role="button">
            As child
          </a>
        </Toggle.Root>
      </section>
    </div>
  );
}
