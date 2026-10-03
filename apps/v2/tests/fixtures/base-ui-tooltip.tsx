'use client';

import * as React from 'react';
import { Tooltip } from '@animate-ui/react/primitives/base-ui/tooltip';

// API compatibility: the primitive must behave exactly like Base UI's.
export default function BaseUITooltipFixture() {
  const [open, setOpen] = React.useState(false);

  return (
    <Tooltip.Provider delay={0}>
      <div className="flex flex-col items-start gap-16">
        <section data-testid="controlled" className="flex items-center gap-4">
          <p data-testid="controlled-open">{open ? 'open' : 'closed'}</p>
          <button type="button" onClick={() => setOpen((value) => !value)}>
            Toggle from outside
          </button>
          <Tooltip.Root open={open} onOpenChange={setOpen}>
            <Tooltip.Trigger>Controlled trigger</Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner side="right">
                <Tooltip.Popup data-testid="controlled-content">
                  Controlled tip
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        </section>

        <section data-testid="default-open">
          <Tooltip.Root defaultOpen>
            <Tooltip.Trigger>Default open trigger</Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner side="right">
                <Tooltip.Popup data-testid="default-open-content">
                  Open on load
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        </section>

        <section data-testid="keep-mounted">
          <Tooltip.Root>
            <Tooltip.Trigger>Kept mounted trigger</Tooltip.Trigger>
            <Tooltip.Portal keepMounted>
              <Tooltip.Positioner side="right">
                <Tooltip.Popup data-testid="keep-mounted-content">
                  Kept mounted
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        </section>
      </div>
    </Tooltip.Provider>
  );
}
