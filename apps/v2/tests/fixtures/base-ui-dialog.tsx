'use client';

import * as React from 'react';
import { Dialog } from '@animate-ui/react/primitives/base-ui/dialog';
import { AlertDialog } from '@animate-ui/react/primitives/base-ui/alert-dialog';

const popup =
  'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6';
const backdrop = 'fixed inset-0 z-50 bg-black/20';

const sheets = {
  top: 'fixed inset-x-0 top-0 z-50 border-b bg-background p-6',
  bottom: 'fixed inset-x-0 bottom-0 z-50 border-t bg-background p-6',
  left: 'fixed inset-y-0 left-0 z-50 h-full w-3/4 border-r bg-background p-6 sm:max-w-sm',
} as const;

const handle = Dialog.createHandle<{ label: string }>();

export default function BaseDialogFixture() {
  const [open, setOpen] = React.useState(false);
  const [reasons, setReasons] = React.useState<string[]>([]);
  const [alertOpen, setAlertOpen] = React.useState(false);

  return (
    <div className="flex flex-col items-start gap-6">
      <section data-testid="controlled">
        <p data-testid="controlled-state">{open ? 'open' : 'closed'}</p>
        <p data-testid="controlled-reasons">{reasons.join(',')}</p>
        <button type="button" onClick={() => setOpen(true)}>
          Open from outside
        </button>
        <Dialog.Root
          open={open}
          onOpenChange={(next, details) => {
            setOpen(next);
            setReasons((list) => [...list, details.reason]);
          }}
        >
          <Dialog.Trigger>Controlled trigger</Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop className={backdrop} />
            <Dialog.Popup className={popup}>
              <Dialog.Title>Controlled dialog</Dialog.Title>
              <Dialog.Description>Opened from state.</Dialog.Description>
              <Dialog.Close>Close controlled</Dialog.Close>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </section>

      <section data-testid="cancel">
        <Dialog.Root
          onOpenChange={(next, details) => {
            if (!next && details.reason === 'escape-key') details.cancel();
          }}
        >
          <Dialog.Trigger>Sticky trigger</Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop className={backdrop} />
            <Dialog.Popup className={popup}>
              <Dialog.Title>Sticky dialog</Dialog.Title>
              <Dialog.Description>Escape does nothing.</Dialog.Description>
              <Dialog.Close>Close sticky</Dialog.Close>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </section>

      <section data-testid="handle">
        <Dialog.Trigger handle={handle} payload={{ label: 'from the handle' }}>
          Detached trigger
        </Dialog.Trigger>
        <Dialog.Root handle={handle}>
          {({ payload }) => (
            <Dialog.Portal>
              <Dialog.Backdrop className={backdrop} />
              <Dialog.Popup className={popup}>
                <Dialog.Title>Handle dialog</Dialog.Title>
                <Dialog.Description>
                  Opened {payload?.label}.
                </Dialog.Description>
                <Dialog.Close>Close handle</Dialog.Close>
              </Dialog.Popup>
            </Dialog.Portal>
          )}
        </Dialog.Root>
      </section>

      <section data-testid="keep-mounted">
        <Dialog.Root>
          <Dialog.Trigger>Kept trigger</Dialog.Trigger>
          <Dialog.Portal keepMounted>
            <Dialog.Backdrop className={backdrop} data-testid="kept-backdrop" />
            <Dialog.Popup className={popup} data-testid="kept-popup">
              <Dialog.Title>Kept dialog</Dialog.Title>
              <Dialog.Description>Always in the DOM.</Dialog.Description>
              <Dialog.Close>Close kept</Dialog.Close>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </section>

      <section data-testid="alert">
        <p data-testid="alert-state">{alertOpen ? 'open' : 'closed'}</p>
        <AlertDialog.Root open={alertOpen} onOpenChange={setAlertOpen}>
          <AlertDialog.Trigger>Alert trigger</AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Backdrop className={backdrop} />
            <AlertDialog.Popup className={popup}>
              <AlertDialog.Title>Discard changes?</AlertDialog.Title>
              <AlertDialog.Description>
                Your edits will be lost.
              </AlertDialog.Description>
              <AlertDialog.Close>Keep editing</AlertDialog.Close>
            </AlertDialog.Popup>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </section>

      <section data-testid="sheets">
        {(Object.keys(sheets) as (keyof typeof sheets)[]).map((side) => (
          <Dialog.Root key={side}>
            <Dialog.Trigger>{`Sheet ${side}`}</Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop className={backdrop} />
              <Dialog.Popup
                data-side={side}
                data-testid={`${side}-sheet`}
                className={sheets[side]}
              >
                <Dialog.Title>{`Sheet from the ${side}`}</Dialog.Title>
                <Dialog.Description>Slides from its edge.</Dialog.Description>
                <Dialog.Close>{`Close ${side} sheet`}</Dialog.Close>
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        ))}
      </section>
    </div>
  );
}
