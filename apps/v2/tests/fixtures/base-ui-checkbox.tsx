'use client';

import * as React from 'react';
import { Checkbox } from '@animate-ui/react/primitives/base-ui/checkbox';

const box = 'grid size-5 place-content-center border';

export default function BaseCheckboxFixture() {
  const [shown, setShown] = React.useState(false);
  const [checked, setChecked] = React.useState(false);
  const [indeterminate, setIndeterminate] = React.useState(false);

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
        <button type="button" onClick={() => setIndeterminate(true)}>
          Set indeterminate
        </button>
        <Checkbox.Root
          aria-label="Controlled"
          className={(state: Checkbox.Root.State) =>
            `${box} ${state.checked ? 'is-checked' : 'is-unchecked'}`
          }
          checked={checked}
          indeterminate={indeterminate}
          onCheckedChange={(next) => {
            setIndeterminate(false);
            setChecked(next);
          }}
        >
          <Checkbox.Indicator data-testid="controlled-indicator">
            <span>✓</span>
          </Checkbox.Indicator>
        </Checkbox.Root>
      </section>

      <section data-testid="uncontrolled">
        <Checkbox.Root aria-label="Uncontrolled" className={box} defaultChecked>
          <Checkbox.Indicator data-testid="uncontrolled-indicator">
            <span>✓</span>
          </Checkbox.Indicator>
        </Checkbox.Root>
      </section>

      <section data-testid="keep-mounted">
        <Checkbox.Root aria-label="Kept mounted" className={box}>
          <Checkbox.Indicator keepMounted data-testid="kept-indicator">
            <span data-testid="kept-check">✓</span>
          </Checkbox.Indicator>
        </Checkbox.Root>
      </section>
    </div>
  );
}
