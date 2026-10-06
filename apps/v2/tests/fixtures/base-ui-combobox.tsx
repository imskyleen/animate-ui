'use client';

import * as React from 'react';
import { Combobox } from '@animate-ui/react/primitives/base-ui/combobox';
// The barrel, like `import { Combobox } from '@base-ui/react'` (the import
// shadcn/ui's Radix and Base UI comboboxes use).
import { Combobox as BarrelCombobox } from '@animate-ui/react/primitives/base-ui';

const FRUITS = ['Apple', 'Banana', 'Cherry', 'Grape'];
const FRAMEWORKS = ['Next.js', 'SvelteKit', 'Nuxt.js', 'Remix', 'Astro'];

// API compatibility: the primitive must behave exactly like Base UI's.
export default function BaseComboboxFixture() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<string | null>('Banana');
  const [completed, setCompleted] = React.useState<string[]>([]);
  const [multiple, setMultiple] = React.useState<string[]>(['Apple']);
  const chipsRef = React.useRef<HTMLDivElement | null>(null);
  const fieldRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <div className="flex flex-col items-start gap-10">
      <section data-testid="controlled" className="flex items-center gap-4">
        <p data-testid="controlled-open">{open ? 'open' : 'closed'}</p>
        <p data-testid="controlled-value">{value ?? 'none'}</p>
        <p data-testid="completed">{completed.join(',')}</p>
        <Combobox.Root
          items={FRUITS}
          open={open}
          onOpenChange={setOpen}
          onOpenChangeComplete={(next) =>
            setCompleted((list) => [...list, String(next)])
          }
          value={value}
          onValueChange={setValue}
        >
          <Combobox.Input aria-label="Controlled" />
          <Combobox.Portal>
            <Combobox.Positioner sideOffset={4}>
              <Combobox.Popup
                data-testid="controlled-popup"
                className="bg-white"
              >
                <Combobox.Empty>Nothing found</Combobox.Empty>
                <Combobox.List>
                  {(item: string) => (
                    <Combobox.Item key={item} value={item}>
                      {item}
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
        <button type="button" onClick={() => setOpen(true)}>
          Open from outside
        </button>
      </section>

      <section data-testid="multiple" className="flex items-center gap-4">
        <p data-testid="multiple-value">{multiple.join(',')}</p>
        <BarrelCombobox.Root
          multiple
          items={FRUITS}
          value={multiple}
          onValueChange={setMultiple}
        >
          <BarrelCombobox.Chips ref={chipsRef} className="flex gap-2">
            <BarrelCombobox.Value>
              {(values: string[]) => (
                <>
                  {values.map((item) => (
                    <BarrelCombobox.Chip
                      key={item}
                      data-testid={`chip-${item}`}
                      aria-label={item}
                    >
                      {item}
                      <BarrelCombobox.ChipRemove aria-label={`Remove ${item}`}>
                        ×
                      </BarrelCombobox.ChipRemove>
                    </BarrelCombobox.Chip>
                  ))}
                  <BarrelCombobox.Input aria-label="Multiple" />
                </>
              )}
            </BarrelCombobox.Value>
          </BarrelCombobox.Chips>
          <BarrelCombobox.Portal>
            <BarrelCombobox.Positioner anchor={chipsRef}>
              <BarrelCombobox.Popup
                data-testid="multiple-popup"
                className="bg-white"
              >
                <BarrelCombobox.List>
                  {(item: string) => (
                    <BarrelCombobox.Item key={item} value={item}>
                      {item}
                      <BarrelCombobox.ItemIndicator
                        data-testid={`check-${item}`}
                        render={<span className="ml-2" />}
                      >
                        ✓
                      </BarrelCombobox.ItemIndicator>
                    </BarrelCombobox.Item>
                  )}
                </BarrelCombobox.List>
              </BarrelCombobox.Popup>
            </BarrelCombobox.Positioner>
          </BarrelCombobox.Portal>
        </BarrelCombobox.Root>
      </section>

      {/* shadcn/ui's chips field, its input showing a placeholder once empty. */}
      <section data-testid="chips">
        <Combobox.Root
          multiple
          items={FRAMEWORKS}
          defaultValue={['Next.js', 'Astro']}
        >
          <Combobox.Chips
            ref={fieldRef}
            data-testid="field"
            className="flex w-72 flex-wrap items-center gap-1 rounded-lg border px-2.5 py-1 has-data-[slot=combobox-chip]:px-1"
          >
            <Combobox.Value>
              {(values: string[]) => (
                <>
                  {values.map((item) => (
                    <Combobox.Chip
                      key={item}
                      data-slot="combobox-chip"
                      data-testid={`field-chip-${item}`}
                      className="flex h-5 items-center gap-1 rounded-sm border px-1.5 text-xs"
                    >
                      {item}
                      <Combobox.ChipRemove aria-label={`Remove ${item}`}>
                        ×
                      </Combobox.ChipRemove>
                    </Combobox.Chip>
                  ))}
                  <Combobox.Input
                    data-testid="field-input"
                    aria-label="Frameworks"
                    placeholder={values.length > 0 ? '' : 'Add frameworks…'}
                    className="min-w-16 flex-1 outline-none"
                  />
                </>
              )}
            </Combobox.Value>
          </Combobox.Chips>
          <Combobox.Portal>
            <Combobox.Positioner anchor={fieldRef}>
              <Combobox.Popup className="bg-white">
                <Combobox.List>
                  {(item: string) => (
                    <Combobox.Item key={item} value={item}>
                      {item}
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
      </section>

      <section data-testid="keep-mounted">
        <Combobox.Root items={FRUITS}>
          <Combobox.Input aria-label="Kept mounted" />
          <Combobox.Portal keepMounted>
            <Combobox.Positioner>
              <Combobox.Popup data-testid="kept-popup" className="bg-white">
                <Combobox.List>
                  {(item: string) => (
                    <Combobox.Item key={item} value={item}>
                      Kept {item}
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
      </section>

      <section data-testid="custom-transition">
        <Combobox.Root items={FRUITS}>
          <Combobox.Input aria-label="Instant" />
          <Combobox.Portal>
            <Combobox.Positioner>
              <Combobox.Popup
                data-testid="instant-popup"
                transition={{ duration: 0 }}
                exitTransition={{ duration: 0 }}
              >
                <Combobox.List>
                  {(item: string) => (
                    <Combobox.Item key={item} value={item}>
                      Instant {item}
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
      </section>
    </div>
  );
}
