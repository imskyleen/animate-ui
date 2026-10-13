'use client';

import * as React from 'react';
import { Drawer } from '@animate-ui/react/primitives/radix-ui/drawer';
import * as Vaul from '@animate-ui/react/primitives/radix-ui/drawer';

const overlay = 'fixed inset-0 z-50 bg-black/40';
const bottom =
  'fixed inset-x-0 bottom-0 z-50 flex max-h-[80vh] flex-col rounded-t-xl border bg-white p-6';
const sides = {
  top: 'fixed inset-x-0 top-0 z-50 h-64 border bg-white p-6',
  right: 'fixed inset-y-0 right-0 z-50 w-80 border bg-white p-6 shadow-xl',
  left: 'fixed inset-y-0 left-0 z-50 w-80 border bg-white p-6',
} as const;

export default function RadixDrawerFixture() {
  const [open, setOpen] = React.useState(false);
  const [log, setLog] = React.useState<string[]>([]);
  const add = (entry: string) => setLog((list) => [...list, entry]);
  const [lastDrag, setLastDrag] = React.useState(0);
  const [snap, setSnap] = React.useState<number | string | null>(0.4);
  const [locked, setLocked] = React.useState(false);

  return (
    <div data-vaul-drawer-wrapper="" className="bg-white">
      <div className="flex flex-col items-start gap-4">
        <section data-testid="controlled">
          <p data-testid="controlled-state">{open ? 'open' : 'closed'}</p>
          <p data-testid="log">{log.join(',')}</p>
          <p data-testid="last-drag">{lastDrag.toFixed(2)}</p>
          <button type="button" onClick={() => setOpen(true)}>
            Open from outside
          </button>
          <Drawer.Root
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              add(`change:${next}`);
            }}
            onClose={() => add('close')}
            onAnimationEnd={(next) => add(`end:${next}`)}
            onDrag={(_, percentage) => setLastDrag(percentage)}
            onRelease={(_, stayOpen) => add(`release:${stayOpen}`)}
            shouldScaleBackground
          >
            <Drawer.Trigger>Controlled trigger</Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay
                className={overlay}
                data-testid="bottom-overlay"
              />
              <Drawer.Content className={bottom} data-testid="bottom-content">
                <Drawer.Title>Bottom drawer</Drawer.Title>
                <Drawer.Description>Controlled.</Drawer.Description>
                <div className="h-40" />
                <Drawer.Close>Close bottom</Drawer.Close>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </section>

        <section data-testid="directions" className="flex gap-2">
          {(['top', 'right', 'left'] as const).map((direction) => (
            <Vaul.Root key={direction} direction={direction}>
              <Vaul.Drawer.Trigger>Open {direction}</Vaul.Drawer.Trigger>
              <Vaul.Portal>
                <Vaul.Overlay className={overlay} />
                <Vaul.Content
                  className={sides[direction]}
                  data-testid={`${direction}-content`}
                >
                  <Vaul.Drawer.Title>{direction} drawer</Vaul.Drawer.Title>
                  <Vaul.Drawer.Description>
                    From the {direction}.
                  </Vaul.Drawer.Description>
                </Vaul.Content>
              </Vaul.Portal>
            </Vaul.Root>
          ))}
        </section>

        <section data-testid="snap">
          <p data-testid="snap-state">{String(snap)}</p>
          <Drawer.Root
            snapPoints={[0.4, '600px', 1]}
            activeSnapPoint={snap}
            setActiveSnapPoint={setSnap}
          >
            <Drawer.Trigger>Open snap points</Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className={overlay} data-testid="snap-overlay" />
              <Drawer.Content
                className="fixed inset-x-0 bottom-0 z-50 flex h-full max-h-[97%] flex-col rounded-t-xl border bg-white p-6"
                data-testid="snap-content"
              >
                <Drawer.Handle data-testid="snap-handle" />
                <Drawer.Title>Snap points</Drawer.Title>
                <Drawer.Description>40%, 600px, full.</Drawer.Description>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </section>

        <section data-testid="handle-only">
          <Drawer.Root handleOnly>
            <Drawer.Trigger>Open handle only</Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className={overlay} />
              <Drawer.Content className={bottom} data-testid="handle-content">
                <Drawer.Handle className="my-2" data-testid="handle" />
                <Drawer.Title>Handle only</Drawer.Title>
                <Drawer.Description>Drag the handle.</Drawer.Description>
                <div className="h-40" data-testid="handle-body" />
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </section>

        <section data-testid="scroll">
          <Drawer.Root>
            <Drawer.Trigger>Open scrollable</Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className={overlay} />
              <Drawer.Content className={bottom} data-testid="scroll-content">
                <Drawer.Title>Scrollable</Drawer.Title>
                <Drawer.Description>A long list.</Drawer.Description>
                <ul
                  className="mt-4 h-64 overflow-y-auto"
                  data-testid="scroll-list"
                >
                  {Array.from({ length: 40 }, (_, i) => (
                    <li key={i} className="py-2">
                      Item {i + 1}
                    </li>
                  ))}
                </ul>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </section>

        <section data-testid="locked">
          <Drawer.Root
            open={locked}
            onOpenChange={setLocked}
            dismissible={false}
          >
            <Drawer.Trigger>Open locked</Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className={overlay} />
              <Drawer.Content className={bottom} data-testid="locked-content">
                <Drawer.Title>Not dismissible</Drawer.Title>
                <Drawer.Description>
                  Only the button closes it.
                </Drawer.Description>
                <div className="h-40" />
                <button type="button" onClick={() => setLocked(false)}>
                  Unlock
                </button>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </section>

        <section data-testid="nested">
          <Drawer.Root>
            <Drawer.Trigger>Open parent</Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className={overlay} />
              <Drawer.Content className={bottom} data-testid="parent-content">
                <Drawer.Title>Parent</Drawer.Title>
                <Drawer.Description>Holds a nested drawer.</Drawer.Description>
                <div className="h-40" />
                <Drawer.NestedRoot>
                  <Drawer.Trigger>Open nested</Drawer.Trigger>
                  <Drawer.Portal>
                    <Drawer.Overlay className={overlay} />
                    <Drawer.Content
                      className={bottom}
                      data-testid="nested-content"
                    >
                      <Drawer.Title>Nested</Drawer.Title>
                      <Drawer.Description>On top.</Drawer.Description>
                      <Drawer.Close>Close nested</Drawer.Close>
                    </Drawer.Content>
                  </Drawer.Portal>
                </Drawer.NestedRoot>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </section>

        <section data-testid="non-modal">
          <Drawer.Root modal={false}>
            <Drawer.Trigger>Open non-modal</Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay
                className={overlay}
                data-testid="non-modal-overlay"
              />
              <Drawer.Content
                className={bottom}
                data-testid="non-modal-content"
              >
                <Drawer.Title>Non-modal</Drawer.Title>
                <Drawer.Description>The page stays usable.</Drawer.Description>
                <Drawer.Close>Close non-modal</Drawer.Close>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </section>

        <section data-testid="gradient">
          <Drawer.Root>
            <Drawer.Trigger>Open gradient</Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay
                className="fixed inset-0 z-50 bg-linear-to-t from-black/40 to-transparent"
                data-testid="gradient-overlay"
              />
              <Drawer.Content className={bottom} data-testid="gradient-content">
                <Drawer.Title>Gradient overlay</Drawer.Title>
                <Drawer.Description>It fades.</Drawer.Description>
                <Drawer.Close>Close gradient</Drawer.Close>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </section>

        <section data-testid="default-open">
          <Drawer.Root defaultOpen direction="right">
            <Drawer.Trigger>Open default</Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Content
                className={sides.right}
                data-testid="default-content"
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                exitTransition={{ duration: 0.1 }}
              >
                <Drawer.Title>Default open</Drawer.Title>
                <Drawer.Description>No entrance.</Drawer.Description>
                <Drawer.Close>Close default</Drawer.Close>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </section>
      </div>
    </div>
  );
}
