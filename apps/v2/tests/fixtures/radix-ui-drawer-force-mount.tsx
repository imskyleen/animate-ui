'use client';

import { Drawer } from '@animate-ui/react/primitives/radix-ui/drawer';

export default function RadixDrawerForceMountFixture() {
  return (
    <Drawer.Root>
      <Drawer.Trigger>Open kept</Drawer.Trigger>
      <Drawer.Portal forceMount>
        <Drawer.Overlay
          className="fixed inset-0 z-50 bg-black/40"
          data-testid="kept-overlay"
        />
        <Drawer.Content
          className="fixed inset-x-0 bottom-0 z-50 rounded-t-xl border bg-white p-6"
          data-testid="kept-content"
        >
          <Drawer.Close>Close kept</Drawer.Close>
          <Drawer.Title>Force mounted</Drawer.Title>
          <Drawer.Description>Stays in the DOM.</Drawer.Description>
          <div className="h-40" />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
