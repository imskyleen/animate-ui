'use client';

import * as React from 'react';
import { Switch } from '@animate-ui/react/primitives/base-ui/switch';

const track = 'inline-flex h-5 w-9 items-center rounded-full border';
const thumb = 'block size-4 rounded-full bg-current data-checked:translate-x-4';

export default function BaseSwitchFixture() {
  const [checked, setChecked] = React.useState(false);

  return (
    <div className="flex flex-col gap-10">
      <section data-testid="controlled">
        <p data-testid="controlled-value">{String(checked)}</p>
        <button type="button" onClick={() => setChecked(true)}>
          Turn on
        </button>
        <Switch.Root
          aria-label="Controlled"
          className={track}
          checked={checked}
          onCheckedChange={(next) => setChecked(next)}
        >
          <Switch.Thumb
            data-testid="controlled-thumb"
            className={(state: Switch.Thumb.State) =>
              `${thumb} ${state.checked ? 'is-on' : 'is-off'}`
            }
          />
        </Switch.Root>
      </section>

      <section data-testid="uncontrolled">
        <Switch.Root aria-label="Uncontrolled" className={track} defaultChecked>
          <Switch.Thumb data-testid="uncontrolled-thumb" className={thumb} />
        </Switch.Root>
      </section>

      <section data-testid="disabled">
        <Switch.Root aria-label="Disabled" className={track} disabled>
          <Switch.Thumb className={thumb} />
        </Switch.Root>
      </section>
    </div>
  );
}
