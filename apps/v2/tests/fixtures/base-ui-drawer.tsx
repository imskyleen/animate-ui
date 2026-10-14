'use client';

import * as React from 'react';
import { Drawer } from '@animate-ui/react/primitives/base-ui/drawer';

const backdrop = 'fixed inset-0 z-50 bg-black/20';
const viewport = 'fixed inset-0 z-50';

export default function BaseDrawerFixture() {
  const [open, setOpen] = React.useState(false);
  const [changes, setChanges] = React.useState<string[]>([]);

  return (
    <div className="flex flex-col items-start gap-6">
      <section data-testid="controlled">
        <p data-testid="controlled-state">{open ? 'open' : 'closed'}</p>
        <p data-testid="controlled-changes">{changes.join(',')}</p>
        <button type="button" onClick={() => setOpen(true)}>
          Open from outside
        </button>
        <Drawer.Root
          open={open}
          onOpenChange={(next, details) => {
            setOpen(next);
            setChanges((list) => [...list, `${next}:${details.reason}`]);
          }}
        >
          <Drawer.Portal>
            <Drawer.Backdrop
              className={backdrop}
              data-testid="bottom-backdrop"
            />
            <Drawer.Viewport className={viewport}>
              <Drawer.Popup
                className="fixed inset-x-0 bottom-0 h-64 rounded-t-xl border bg-background p-6"
                data-testid="bottom-popup"
              >
                <Drawer.Title>Bottom drawer</Drawer.Title>
                <Drawer.Description>Controlled.</Drawer.Description>
                <Drawer.Close>Close bottom</Drawer.Close>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      </section>

      <section data-testid="themed">
        <Drawer.Root>
          <Drawer.Trigger>Open themed drawer</Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Backdrop
              className="fixed inset-0 z-50 bg-black/20 dark:bg-white/30"
              data-testid="themed-backdrop"
            />
            <Drawer.Viewport className={viewport}>
              <Drawer.Popup className="fixed inset-x-0 bottom-0 border bg-background p-6">
                <Drawer.Title>Themed drawer</Drawer.Title>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      </section>

      <section data-testid="right">
        <Drawer.Root swipeDirection="right">
          <Drawer.Trigger>Open right drawer</Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Backdrop className={backdrop} />
            <Drawer.Viewport className={viewport}>
              <Drawer.Popup
                className="fixed inset-y-0 right-0 w-80 border bg-background p-6"
                data-testid="right-popup"
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                exitTransition={{ duration: 0.1 }}
              >
                <Drawer.Title>Right drawer</Drawer.Title>
                <Drawer.Description>Custom timing.</Drawer.Description>
                <Drawer.Close>Close right</Drawer.Close>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      </section>

      <section data-testid="gradient">
        <Drawer.Root>
          <Drawer.Trigger>Open gradient drawer</Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Backdrop
              className="fixed inset-0 z-50 bg-linear-to-t from-black/40 to-transparent"
              data-testid="gradient-backdrop"
            />
            <Drawer.Viewport className={viewport}>
              <Drawer.Popup
                className="fixed inset-x-0 bottom-0 h-64 rounded-t-xl border bg-background p-6"
                data-testid="gradient-popup"
              >
                <Drawer.Title>Gradient backdrop</Drawer.Title>
                <Drawer.Description>It fades.</Drawer.Description>
                <Drawer.Close>Close gradient</Drawer.Close>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      </section>
    </div>
  );
}
