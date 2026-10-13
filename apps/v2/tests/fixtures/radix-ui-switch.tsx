'use client';

import * as React from 'react';
import { Switch } from '@animate-ui/react/primitives/radix-ui/switch';
import * as SwitchStar from '@animate-ui/react/primitives/radix-ui/switch';

const track = 'inline-flex h-5 w-9 items-center rounded-full border';
const thumb =
  'block size-4 rounded-full bg-current data-[state=checked]:translate-x-4';

export default function RadixSwitchFixture() {
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
          onCheckedChange={setChecked}
        >
          <Switch.Thumb data-testid="controlled-thumb" className={thumb} />
        </Switch.Root>
      </section>

      <section data-testid="star">
        <SwitchStar.Root aria-label="Star" className={track} defaultChecked>
          <SwitchStar.Thumb data-testid="star-thumb" className={thumb} />
        </SwitchStar.Root>
      </section>

      <section data-testid="leftover-transition">
        <Switch.Root aria-label="Leftover transition" className={track}>
          <Switch.Thumb className={`${thumb} transition-transform`} />
        </Switch.Root>
      </section>

      <form data-testid="form">
        <Switch.Root
          aria-label="In a form"
          className={track}
          name="wifi"
          disabled
        >
          <Switch.Thumb className={thumb} />
        </Switch.Root>
      </form>
    </div>
  );
}
