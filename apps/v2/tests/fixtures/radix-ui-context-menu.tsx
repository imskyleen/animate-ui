'use client';

import * as React from 'react';
import { ContextMenu } from '@animate-ui/react/primitives/radix-ui/context-menu';
import * as ContextMenuStar from '@animate-ui/react/primitives/radix-ui/context-menu';

const area = 'flex h-24 w-64 items-center justify-center rounded-md border';
const content = 'min-w-40 rounded-md border bg-white p-1 shadow-md';

export default function RadixContextMenuFixture() {
  const [open, setOpen] = React.useState(false);
  const [pinned, setPinned] = React.useState(false);

  return (
    <div className="flex flex-col items-start gap-10">
      <section className="flex items-center gap-4">
        <p data-testid="open">{open ? 'open' : 'closed'}</p>
        <ContextMenu.Root open={open} onOpenChange={setOpen}>
          <ContextMenu.Trigger className={area}>
            Controlled area
          </ContextMenu.Trigger>
          <ContextMenu.Portal>
            <ContextMenu.Content className={content}>
              <ContextMenu.Item>Controlled item</ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu.Root>
      </section>

      <section className="flex items-center gap-4">
        <p data-testid="pinned">{String(pinned)}</p>
        <ContextMenuStar.Root>
          <ContextMenuStar.Trigger className={area}>
            Star area
          </ContextMenuStar.Trigger>
          <ContextMenuStar.Portal>
            <ContextMenuStar.Content className={content}>
              <ContextMenuStar.CheckboxItem
                checked={pinned}
                onCheckedChange={setPinned}
              >
                <ContextMenuStar.ItemIndicator>✓</ContextMenuStar.ItemIndicator>
                Pinned
              </ContextMenuStar.CheckboxItem>
            </ContextMenuStar.Content>
          </ContextMenuStar.Portal>
        </ContextMenuStar.Root>
      </section>
    </div>
  );
}
