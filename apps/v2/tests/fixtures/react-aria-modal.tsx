'use client';

import * as React from 'react';
import {
  Button,
  Dialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
} from '@animate-ui/react/primitives/react-aria';

const modal =
  'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6';
const overlay = 'fixed inset-0 z-50 bg-black/20';

// API compatibility: Modal and ModalOverlay must behave exactly like React
// Aria's.
export default function ReactAriaModalFixture() {
  const [open, setOpen] = React.useState(false);
  const [changes, setChanges] = React.useState<boolean[]>([]);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const [refTag, setRefTag] = React.useState('');

  return (
    <div className="flex flex-col items-start gap-6">
      <section data-testid="standalone">
        {/* A Modal on its own, opened by a DialogTrigger. */}
        <DialogTrigger>
          <Button>Standalone trigger</Button>
          <Modal isDismissable className={modal} data-testid="standalone-modal">
            <Dialog>
              <Heading slot="title">Standalone modal</Heading>
              <Button slot="close">Close standalone</Button>
            </Dialog>
          </Modal>
        </DialogTrigger>
      </section>

      <section data-testid="controlled">
        <p data-testid="controlled-state">{open ? 'open' : 'closed'}</p>
        <p data-testid="controlled-changes">{changes.join(',')}</p>
        <p data-testid="ref-tag">{refTag}</p>
        <Button onPress={() => setOpen(true)}>Open controlled</Button>
        {/* Controlled ModalOverlay, with render-prop className and style. */}
        <ModalOverlay
          ref={overlayRef}
          isOpen={open}
          onOpenChange={(next) => {
            setOpen(next);
            setChanges((list) => [...list, next]);
          }}
          isDismissable
          className={({ isExiting }) =>
            `${overlay} ${isExiting ? 'is-exiting' : 'is-shown'}`
          }
          style={({ isExiting }) => ({ outlineWidth: isExiting ? 3 : 1 })}
          data-testid="controlled-overlay"
        >
          <Modal className={modal}>
            <Dialog>
              {({ close }) => (
                <>
                  <Heading slot="title">Controlled modal</Heading>
                  <Button
                    onPress={() =>
                      setRefTag(overlayRef.current?.tagName.toLowerCase() ?? '')
                    }
                  >
                    Read ref
                  </Button>
                  <Button onPress={close}>Close controlled</Button>
                </>
              )}
            </Dialog>
          </Modal>
        </ModalOverlay>
      </section>

      <section data-testid="default-open">
        <ModalOverlay defaultOpen className={overlay}>
          <Modal className={modal}>
            <Dialog>
              <Heading slot="title">Default open modal</Heading>
              <Button slot="close">Close default</Button>
            </Dialog>
          </Modal>
        </ModalOverlay>
      </section>
    </div>
  );
}
