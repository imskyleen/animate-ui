'use client';

import * as React from 'react';
import { Popover } from '@animate-ui/react/primitives/base-ui/popover';

// API compatibility: the primitive must behave exactly like Base UI's.
export default function BaseUIPopoverFixture() {
  const [open, setOpen] = React.useState(false);
  const [completed, setCompleted] = React.useState<string[]>([]);
  const [blocked, setBlocked] = React.useState(0);

  return (
    <div className="flex flex-col items-start gap-10">
      <section data-testid="controlled" className="flex items-center gap-4">
        <p data-testid="controlled-open">{open ? 'open' : 'closed'}</p>
        <p data-testid="completed">{completed.join(',')}</p>
        <button type="button" onClick={() => setOpen(true)}>
          Open from outside
        </button>
        <Popover.Root
          open={open}
          onOpenChange={setOpen}
          onOpenChangeComplete={(next) =>
            setCompleted((list) => [...list, next ? 'opened' : 'closed'])
          }
        >
          <Popover.Trigger>Controlled trigger</Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner sideOffset={4}>
              <Popover.Popup data-testid="controlled-content">
                Controlled content
                <Popover.Close>Close controlled</Popover.Close>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </section>

      <section data-testid="cancel" className="flex items-center gap-4">
        <p data-testid="blocked">{blocked}</p>
        <Popover.Root
          onOpenChange={(next, details) => {
            if (!next && details.reason === 'escape-key') {
              details.cancel();
              setBlocked((count) => count + 1);
            }
          }}
        >
          <Popover.Trigger>Sticky trigger</Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner side="right">
              <Popover.Popup data-testid="cancel-content">
                Escape can't close me
                <Popover.Close>Close sticky</Popover.Close>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </section>

      <section data-testid="keep-mounted">
        <Popover.Root>
          <Popover.Trigger>Kept mounted trigger</Popover.Trigger>
          <Popover.Portal keepMounted>
            <Popover.Positioner side="right">
              <Popover.Popup data-testid="keep-mounted-content">
                <button type="button">Hidden button</button>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </section>

      <section data-testid="render">
        <Popover.Root>
          <Popover.Trigger>Render trigger</Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner side="right">
              <Popover.Popup
                data-testid="render-content"
                className={(state) => `custom-${state.side}`}
                render={<section />}
                transition={{ duration: 0.2 }}
              >
                Rendered as a section
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </section>
    </div>
  );
}
