'use client';

import { Dialog } from '@animate-ui/react/primitives/base-ui/dialog';
import { Tabs } from '@animate-ui/react/primitives/base-ui/tabs';

function Example({ id, keepMounted }: { id: string; keepMounted?: boolean }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>{`Open ${id}`}</Dialog.Trigger>
      <Dialog.Portal keepMounted={keepMounted}>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/20" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-80 -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6">
          <Tabs.Root defaultValue="a">
            <Tabs.List className="flex h-9 w-full">
              <Tabs.Tab value="a">A</Tabs.Tab>
              <Tabs.Tab value="b">B</Tabs.Tab>
            </Tabs.List>
          </Tabs.Root>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function BaseTabsInDialogFixture() {
  return (
    <div className="flex gap-4">
      <Example id="unmounted" />
      <Example id="kept" keepMounted />
    </div>
  );
}
