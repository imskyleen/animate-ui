'use client';

import * as React from 'react';
import { Checkbox } from '@animate-ui/react/primitives/radix-ui/checkbox';
import * as CheckboxStar from '@animate-ui/react/primitives/radix-ui/checkbox';

const box = 'grid size-5 place-content-center border';

// API compatibility: the primitive must behave exactly like Radix's.
export default function RadixCheckboxFixture() {
  // Mounted checked after the page has loaded, as a dialog's would be.
  const [shown, setShown] = React.useState(false);
  const [checked, setChecked] = React.useState<Checkbox.CheckedState>(false);

  return (
    <div className="flex flex-col gap-10">
      <section data-testid="mounted">
        <button type="button" onClick={() => setShown(true)}>
          Show checked
        </button>
        {shown && (
          <Checkbox.Root
            aria-label="Mounted checked"
            className={box}
            defaultChecked
          >
            <Checkbox.Indicator data-testid="mounted-indicator">
              <svg
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M5 12l5 5L20 7" />
              </svg>
            </Checkbox.Indicator>
          </Checkbox.Root>
        )}
      </section>

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
