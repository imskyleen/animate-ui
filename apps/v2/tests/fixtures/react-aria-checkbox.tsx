'use client';

import * as React from 'react';
import { Checkbox } from '@animate-ui/react/primitives/react-aria';

const Indicator = ({ show }: { show: boolean }) => (
  <span data-slot="checkbox-indicator" className="grid size-5 border">
    {show && (
      <span data-testid="check" aria-hidden>
        ✓
      </span>
    )}
  </span>
);

// API compatibility: the component must behave exactly like React Aria's.
export default function ReactAriaCheckboxFixture() {
  const [selected, setSelected] = React.useState(false);
  const [indeterminate, setIndeterminate] = React.useState(false);

  return (
    <div className="flex flex-col gap-10">
      <section data-testid="controlled">
        <p data-testid="controlled-value">{String(selected)}</p>
        <button type="button" onClick={() => setIndeterminate(true)}>
          Set indeterminate
        </button>
        <Checkbox
          isSelected={selected}
          isIndeterminate={indeterminate}
          onChange={(next) => {
            setIndeterminate(false);
            setSelected(next);
          }}
          className={({ isSelected }) =>
            `flex gap-2 ${isSelected ? 'is-selected' : 'is-unselected'}`
          }
          style={({ isIndeterminate }) => ({
            outline: isIndeterminate ? '1px solid red' : undefined,
          })}
        >
          {({ isSelected, isIndeterminate }) => (
            <>
              <Indicator show={isSelected || isIndeterminate} />
              Controlled
            </>
          )}
        </Checkbox>
      </section>

      <section data-testid="custom-render">
        <Checkbox
          defaultSelected
          className="flex gap-2"
          render={(props) => <label {...props} data-custom="" />}
        >
          {({ isSelected }) => (
            <>
              <Indicator show={isSelected} />
              Custom render
            </>
          )}
        </Checkbox>
      </section>

      <section data-testid="plain-children">
        <Checkbox defaultSelected className="flex">
          Plain children
        </Checkbox>
      </section>
    </div>
  );
}
