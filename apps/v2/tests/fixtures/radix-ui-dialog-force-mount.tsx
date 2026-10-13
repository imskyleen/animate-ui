'use client';

import { Dialog } from '@animate-ui/react/primitives/radix-ui/dialog';

const content =
  'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6';
const overlay = 'fixed inset-0 z-50 bg-black/20';

export default function RadixDialogForceMountFixture() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Force mounted trigger</Dialog.Trigger>
      <Dialog.Portal forceMount>
        <Dialog.Overlay className={overlay} data-testid="kept-overlay" />
        <Dialog.Content
          className={content}
          data-testid="kept-content"
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <Dialog.Title>Kept dialog</Dialog.Title>
          <Dialog.Description>Always in the DOM.</Dialog.Description>
          <Dialog.Close>Close kept</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
