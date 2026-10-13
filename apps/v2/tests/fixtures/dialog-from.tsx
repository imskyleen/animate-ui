'use client';

import { Dialog as RadixDialog } from '@animate-ui/react/primitives/radix-ui/dialog';
import { Dialog as BaseDialog } from '@animate-ui/react/primitives/base-ui/dialog';
import {
  Button,
  Dialog as AriaDialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
} from '@animate-ui/react/primitives/react-aria';

const content =
  'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6';
const overlay = 'fixed inset-0 z-50 bg-black/20';

type From = 'left' | 'bottom';

export default function DialogFromFixture() {
  return (
    <div className="flex flex-col items-start gap-6">
      {(['left', 'bottom'] as From[]).map((from) => (
        <section key={from} className="flex gap-3">
          <RadixDialog.Root>
            <RadixDialog.Trigger>Radix from {from}</RadixDialog.Trigger>
            <RadixDialog.Portal>
              <RadixDialog.Overlay className={overlay} />
              <RadixDialog.Content
                className={content}
                from={from}
                data-testid={`radix-${from}`}
              >
                <RadixDialog.Title>Radix dialog</RadixDialog.Title>
                <RadixDialog.Description>From {from}.</RadixDialog.Description>
              </RadixDialog.Content>
            </RadixDialog.Portal>
          </RadixDialog.Root>

          <BaseDialog.Root>
            <BaseDialog.Trigger>Base from {from}</BaseDialog.Trigger>
            <BaseDialog.Portal>
              <BaseDialog.Backdrop className={overlay} />
              <BaseDialog.Popup
                className={content}
                from={from}
                data-testid={`base-${from}`}
              >
                <BaseDialog.Title>Base dialog</BaseDialog.Title>
                <BaseDialog.Description>From {from}.</BaseDialog.Description>
              </BaseDialog.Popup>
            </BaseDialog.Portal>
          </BaseDialog.Root>

          <DialogTrigger>
            <Button>Aria from {from}</Button>
            <ModalOverlay className={overlay}>
              <Modal
                className={content}
                from={from}
                data-testid={`aria-${from}`}
              >
                <AriaDialog>
                  <Heading slot="title">Aria dialog</Heading>
                </AriaDialog>
              </Modal>
            </ModalOverlay>
          </DialogTrigger>
        </section>
      ))}
    </div>
  );
}
