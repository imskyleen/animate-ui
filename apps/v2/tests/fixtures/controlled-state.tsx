'use client';

import * as React from 'react';
import { CopyButton } from '@animate-ui/react/primitives/buttons/copy';
import { Highlight } from '@animate-ui/react/primitives/effects/highlight';
import {
  Dialog,
  Heading,
  Modal,
  ModalOverlay,
} from '@animate-ui/react/primitives/react-aria';

export default function ControlledStateFixture() {
  const [log, setLog] = React.useState<string[]>([]);
  const push = (entry: string) => setLog((l) => [...l, entry]);

  return (
    <div className="flex flex-col items-start gap-6">
      <CopyButton
        content="Hello"
        copied={false}
        onCopiedChange={(copied) => push(`copied ${copied}`)}
        aria-label="Copy"
      >
        Copy
      </CopyButton>
      <div className="flex">
        <Highlight
          click
          value="one"
          onValueChange={(value) => push(`highlight ${value}`)}
          className="inset-0 bg-accent"
        >
          {['one', 'two'].map((value) => (
            <button key={value} type="button" data-value={value}>
              {value}
            </button>
          ))}
        </Highlight>
      </div>
      <ModalOverlay
        isOpen
        isDismissable
        onOpenChange={(open) => push(`modal ${open}`)}
        className="fixed inset-0 bg-black/20"
      >
        <Modal className="fixed top-10 left-10 bg-white p-6">
          <Dialog>
            <Heading slot="title">Kept open</Heading>
          </Dialog>
        </Modal>
      </ModalOverlay>
      <output data-testid="log">{log.join(', ')}</output>
    </div>
  );
}
