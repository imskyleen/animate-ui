'use client';

import * as React from 'react';
import { Checkbox } from '@animate-ui/react/primitives/radix-ui/checkbox';
import * as CheckboxStar from '@animate-ui/react/primitives/radix-ui/checkbox';

const box = 'grid size-5 place-content-center border';

// API compatibility: the primitive must behave exactly like Radix's.
export default function RadixCheckboxFixture() {
  const [checked, setChecked] = React.useState<Checkbox.CheckedState>(false);

  return (
    <div className="flex flex-col gap-10">
      <section data-testid="controlled">
        <p data-testid="controlled-value">{String(checked)}</p>
        <button type="button" onClick={() => setChecked('indeterminate')}>
          Set indeterminate
        </button>
        <Checkbox.Root
          aria-label="Controlled"
          className={box}
          checked={checked}
          onCheckedChange={setChecked}
        >
          <Checkbox.Indicator data-testid="controlled-indicator">
            <span>✓</span>
          </Checkbox.Indicator>
        </Checkbox.Root>
      </section>

      <section data-testid="star">
        {/* The `import * as` style of @radix-ui/react-checkbox. */}
        <CheckboxStar.Root aria-label="Star" className={box} defaultChecked>
          <CheckboxStar.Indicator data-testid="star-indicator">
            <span>✓</span>
          </CheckboxStar.Indicator>
        </CheckboxStar.Root>
      </section>

      <section data-testid="force-mount">
        <Checkbox.Root aria-label="Force mounted" className={box}>
          <Checkbox.Indicator forceMount data-testid="forced-indicator">
            <span data-testid="forced-check">✓</span>
          </Checkbox.Indicator>
        </Checkbox.Root>
      </section>

      <form data-testid="form">
        <Checkbox.Root
          aria-label="In a form"
          className={box}
          name="newsletter"
          value="yes"
        >
          <Checkbox.Indicator>
            <span>✓</span>
          </Checkbox.Indicator>
        </Checkbox.Root>
      </form>
    </div>
  );
}
