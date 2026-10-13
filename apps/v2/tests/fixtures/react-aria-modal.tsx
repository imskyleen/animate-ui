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

const sheets = {
  top: 'fixed inset-x-0 top-0 z-50 border-b bg-background p-6',
  bottom: 'fixed inset-x-0 bottom-0 z-50 border-t bg-background p-6',
  left: 'fixed inset-y-0 left-0 z-50 h-full w-3/4 border-r bg-background p-6 sm:max-w-sm',
} as const;

export default function ReactAriaModalFixture() {
  const [open, setOpen] = React.useState(false);
  const [changes, setChanges] = React.useState<boolean[]>([]);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const [refTag, setRefTag] = React.useState('');

  return (
    <div className="flex flex-col items-start gap-6">
      <section data-testid="standalone">
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

      <section data-testid="sheets">
        {(Object.keys(sheets) as (keyof typeof sheets)[]).map((side) => (
          <DialogTrigger key={side}>
            <Button>{`Sheet ${side}`}</Button>
            <ModalOverlay
              isDismissable
              className={overlay}
              data-testid={`${side}-sheet-overlay`}
            >
              <Modal
                data-side={side}
                data-testid={`${side}-sheet`}
                className={sheets[side]}
              >
                <Dialog>
                  <Heading slot="title">{`Sheet from the ${side}`}</Heading>
                  <Button slot="close">{`Close ${side} sheet`}</Button>
                </Dialog>
              </Modal>
            </ModalOverlay>
          </DialogTrigger>
        ))}
      </section>
    </div>
  );
}
