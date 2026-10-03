'use client';

import * as React from 'react';
import { ContextMenu } from '@animate-ui/react/primitives/base-ui/context-menu';

const area = 'flex h-24 w-64 items-center justify-center rounded-md border';
const popup = 'min-w-40 rounded-md border bg-white p-1 shadow-md outline-none';

// API compatibility: the primitive must behave exactly like Base UI's.
export default function BaseContextMenuFixture() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-4">
      <p data-testid="open">{open ? 'open' : 'closed'}</p>
      <ContextMenu.Root open={open} onOpenChange={setOpen}>
        <ContextMenu.Trigger className={area}>
          Controlled area
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Positioner>
            <ContextMenu.Popup className={popup}>
              <ContextMenu.Item>Controlled item</ContextMenu.Item>
              <ContextMenu.SubmenuRoot>
                <ContextMenu.SubmenuTrigger>More</ContextMenu.SubmenuTrigger>
                <ContextMenu.Portal>
                  <ContextMenu.Positioner>
                    <ContextMenu.Popup className={popup}>
                      <ContextMenu.Item>Nested item</ContextMenu.Item>
                    </ContextMenu.Popup>
                  </ContextMenu.Positioner>
                </ContextMenu.Portal>
              </ContextMenu.SubmenuRoot>
            </ContextMenu.Popup>
          </ContextMenu.Positioner>
        </ContextMenu.Portal>
      </ContextMenu.Root>
    </div>
  );
}
