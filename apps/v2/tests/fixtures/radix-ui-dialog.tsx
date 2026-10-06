'use client';

import * as React from 'react';
import { Dialog } from '@animate-ui/react/primitives/radix-ui/dialog';
import * as DialogStar from '@animate-ui/react/primitives/radix-ui/dialog';
import { AlertDialog } from '@animate-ui/react/primitives/radix-ui/alert-dialog';

const content =
  'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6';
const overlay = 'fixed inset-0 z-50 bg-black/20';

/**
 * Sheets from the edges the sheet demo doesn't use (it opens from the right):
 * a Content with `data-side`, placed like shadcn/ui's Sheet.
 */
const sheets = {
  top: 'fixed inset-x-0 top-0 z-50 border-b bg-background p-6',
  bottom: 'fixed inset-x-0 bottom-0 z-50 border-t bg-background p-6',
  left: 'fixed inset-y-0 left-0 z-50 h-full w-3/4 border-r bg-background p-6 sm:max-w-sm',
} as const;

// API compatibility: the primitives must behave exactly like Radix's.
export default function RadixDialogFixture() {
  const [open, setOpen] = React.useState(false);
  const [changes, setChanges] = React.useState<boolean[]>([]);
  const [alertOpen, setAlertOpen] = React.useState(false);

  return (
    <div className="flex flex-col items-start gap-6">
      <section data-testid="controlled">
        <p data-testid="controlled-state">{open ? 'open' : 'closed'}</p>
        <p data-testid="controlled-changes">{changes.join(',')}</p>
        <button type="button" onClick={() => setOpen(true)}>
          Open from outside
        </button>
        <Dialog.Root
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            setChanges((list) => [...list, next]);
          }}
        >
          <Dialog.Trigger>Controlled trigger</Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className={overlay} />
            <Dialog.Content className={content}>
              <Dialog.Title>Controlled dialog</Dialog.Title>
              <Dialog.Description>Opened from state.</Dialog.Description>
              <Dialog.Close>Close controlled</Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </section>

      <section data-testid="star">
        {/* The `import * as` style of @radix-ui/react-dialog. */}
        <DialogStar.Root defaultOpen>
          <DialogStar.Trigger>Star trigger</DialogStar.Trigger>
          <DialogStar.Portal>
            <DialogStar.Overlay className={overlay} />
            <DialogStar.Content className={content}>
              <DialogStar.Title>Default open dialog</DialogStar.Title>
              <DialogStar.Description>Uncontrolled.</DialogStar.Description>
              <DialogStar.Close>Close star</DialogStar.Close>
            </DialogStar.Content>
          </DialogStar.Portal>
        </DialogStar.Root>
      </section>

      <section data-testid="inline">
        {/* Radix allows a Content without a Portal. */}
        <Dialog.Root modal={false}>
          <Dialog.Trigger>Inline trigger</Dialog.Trigger>
          <Dialog.Content
            className="rounded-lg border p-4"
            data-testid="inline-content"
          >
            <Dialog.Title>Inline dialog</Dialog.Title>
            <Dialog.Description>No portal.</Dialog.Description>
            <Dialog.Close>Close inline</Dialog.Close>
          </Dialog.Content>
        </Dialog.Root>
      </section>

      <section data-testid="alert">
        <p data-testid="alert-state">{alertOpen ? 'open' : 'closed'}</p>
        <AlertDialog.Root open={alertOpen} onOpenChange={setAlertOpen}>
          <AlertDialog.Trigger>Alert trigger</AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Overlay
              className={overlay}
              data-testid="alert-overlay"
            />
            <AlertDialog.Content className={content}>
              <AlertDialog.Title>Discard changes?</AlertDialog.Title>
              <AlertDialog.Description>
                Your edits will be lost.
              </AlertDialog.Description>
              <AlertDialog.Cancel>Keep editing</AlertDialog.Cancel>
              <AlertDialog.Action>Discard</AlertDialog.Action>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </section>

      <section data-testid="sheets">
        {(Object.keys(sheets) as (keyof typeof sheets)[]).map((side) => (
          <Dialog.Root key={side}>
            <Dialog.Trigger>{`Sheet ${side}`}</Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className={overlay} />
              <Dialog.Content
                data-side={side}
                data-testid={`${side}-sheet`}
                className={sheets[side]}
              >
                <Dialog.Title>{`Sheet from the ${side}`}</Dialog.Title>
                <Dialog.Description>Slides from its edge.</Dialog.Description>
                <Dialog.Close>{`Close ${side} sheet`}</Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        ))}
      </section>
    </div>
  );
}
