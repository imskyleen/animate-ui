'use client';

import * as React from 'react';
import { Select } from '@animate-ui/react/primitives/radix-ui/select';
import * as SelectStar from '@animate-ui/react/primitives/radix-ui/select';
import { AnimateUIProvider } from '@animate-ui/react/provider';

const FRUITS = ['Apple', 'Banana', 'Cherry'];

function Items({ prefix }: { prefix: string }) {
  return FRUITS.map((fruit) => (
    <Select.Item key={fruit} value={fruit.toLowerCase()}>
      <Select.ItemText>
        {prefix} {fruit}
      </Select.ItemText>
    </Select.Item>
  ));
}

export default function RadixSelectFixture() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('banana');
  const [forceMounted, setForceMounted] = React.useState(false);

  return (
    <div className="flex flex-col items-start gap-10">
      <section data-testid="controlled" className="flex items-center gap-4">
        <p data-testid="controlled-open">{open ? 'open' : 'closed'}</p>
        <p data-testid="controlled-value">{value}</p>
        <Select.Root
          open={open}
          onOpenChange={setOpen}
          value={value}
          onValueChange={setValue}
        >
          <Select.Trigger aria-label="Controlled">
            <Select.Value />
          </Select.Trigger>
          <Select.Portal>
            <Select.Content
              position="popper"
              data-testid="controlled-content"
              className="bg-white"
            >
              <Select.Viewport>
                <Items prefix="Controlled" />
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
        <button type="button" onClick={() => setOpen(true)}>
          Open from outside
        </button>
      </section>

      <section data-testid="item-aligned">
        <SelectStar.Root defaultValue="cherry">
          <SelectStar.Trigger aria-label="Aligned">
            <SelectStar.Value placeholder="Pick one" />
          </SelectStar.Trigger>
          <SelectStar.Portal>
            <SelectStar.Content
              data-testid="aligned-content"
              className="bg-white"
            >
              <SelectStar.Viewport>
                {FRUITS.map((fruit) => (
                  <SelectStar.Item key={fruit} value={fruit.toLowerCase()}>
                    <SelectStar.ItemText>Aligned {fruit}</SelectStar.ItemText>
                  </SelectStar.Item>
                ))}
              </SelectStar.Viewport>
            </SelectStar.Content>
          </SelectStar.Portal>
        </SelectStar.Root>
      </section>

      <section data-testid="custom-transition">
        <Select.Root defaultValue="apple">
          <Select.Trigger aria-label="Instant">
            <Select.Value />
          </Select.Trigger>
          <Select.Portal>
            <Select.Content
              position="popper"
              data-testid="instant-content"
              transition={{ duration: 0 }}
              exitTransition={{ duration: 0 }}
            >
              <Select.Viewport>
                <Items prefix="Instant" />
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </section>

      <section data-testid="force-mount">
        <button type="button" onClick={() => setForceMounted(true)}>
          Mount forceMount
        </button>
        {forceMounted && (
          <Select.Root defaultValue="apple">
            <Select.Trigger aria-label="Force mounted">
              <Select.Value />
            </Select.Trigger>
            <Select.Portal forceMount>
              <Select.Content position="popper" data-testid="forced-content">
                <Select.Viewport>
                  <Items prefix="Forced" />
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        )}
      </section>

      <section data-testid="own-animation">
        <AnimateUIProvider checkAnimation="pop">
          <Select.Root defaultValue="apple">
            <Select.Trigger aria-label="Own animation">
              <Select.Value />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content position="popper" className="bg-white">
                <Select.Viewport>
                  {FRUITS.map((fruit) => (
                    <Select.Item key={fruit} value={fruit.toLowerCase()}>
                      <span>
                        <Select.ItemIndicator animation="draw">
                          <svg viewBox="0 0 24 24" width={16} height={16}>
                            <path
                              d="M5 12l5 5L20 7"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                            />
                          </svg>
                        </Select.ItemIndicator>
                      </span>
                      <Select.ItemText>Own {fruit}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </AnimateUIProvider>
      </section>
    </div>
  );
}
