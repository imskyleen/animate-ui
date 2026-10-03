'use client';

import * as React from 'react';
import { Select } from '@animate-ui/react/primitives/base-ui/select';

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

function Items({ prefix, check }: { prefix: string; check?: boolean }) {
  return FRUITS.map((fruit) => (
    <Select.Item key={fruit.value} value={fruit.value}>
      <Select.ItemText>
        {prefix} {fruit.label}
      </Select.ItemText>
      {check && (
        <Select.ItemIndicator
          data-testid={`check-${fruit.value}`}
          render={<span className="ml-2" />}
        >
          ✓
        </Select.ItemIndicator>
      )}
    </Select.Item>
  ));
}

// API compatibility: the primitive must behave exactly like Base UI's.
export default function BaseSelectFixture() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<string | null>('banana');
  const [completed, setCompleted] = React.useState<string[]>([]);
  const [multiple, setMultiple] = React.useState<string[]>(['apple']);
  const actionsRef = React.useRef<Select.Root.Actions | null>(null);
  const [hasActions, setHasActions] = React.useState(false);
  React.useEffect(() => {
    setHasActions(typeof actionsRef.current?.unmount === 'function');
  }, []);

  return (
    <div className="flex flex-col items-start gap-10">
      <section data-testid="controlled" className="flex items-center gap-4">
        <p data-testid="controlled-open">{open ? 'open' : 'closed'}</p>
        <p data-testid="controlled-value">{value}</p>
        <p data-testid="completed">{completed.join(',')}</p>
        <p data-testid="actions">{hasActions ? 'actions' : 'none'}</p>
        <Select.Root
          items={FRUITS.map((f) => ({ ...f, label: `Controlled ${f.label}` }))}
          open={open}
          onOpenChange={setOpen}
          onOpenChangeComplete={(next) =>
            setCompleted((list) => [...list, String(next)])
          }
          value={value}
          onValueChange={setValue}
          actionsRef={actionsRef}
        >
          <Select.Trigger aria-label="Controlled">
            <Select.Value />
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner alignItemWithTrigger={false} sideOffset={4}>
              <Select.Popup data-testid="controlled-popup" className="bg-white">
                <Select.List>
                  <Items prefix="Controlled" />
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
        <button type="button" onClick={() => setOpen(true)}>
          Open from outside
        </button>
      </section>

      <section data-testid="aligned">
        {/* Base UI's default: the list is laid over the trigger. */}
        <Select.Root defaultValue="cherry" items={FRUITS}>
          <Select.Trigger aria-label="Aligned">
            <Select.Value />
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner>
              <Select.Popup data-testid="aligned-popup" className="bg-white">
                <Select.List>
                  <Items prefix="Aligned" />
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </section>

      <section data-testid="multiple" className="flex items-center gap-4">
        <p data-testid="multiple-value">{multiple.join(',')}</p>
        <Select.Root
          multiple
          value={multiple}
          onValueChange={setMultiple}
          items={FRUITS}
        >
          <Select.Trigger aria-label="Multiple">
            <Select.Value />
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner alignItemWithTrigger={false}>
              <Select.Popup data-testid="multiple-popup" className="bg-white">
                <Select.List>
                  <Items prefix="Multiple" check />
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </section>

      <section data-testid="custom-transition">
        <Select.Root defaultValue="apple" items={FRUITS}>
          <Select.Trigger aria-label="Instant">
            <Select.Value />
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner alignItemWithTrigger={false}>
              <Select.Popup
                data-testid="instant-popup"
                transition={{ duration: 0 }}
                exitTransition={{ duration: 0 }}
              >
                <Select.List>
                  <Items prefix="Instant" />
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </section>
    </div>
  );
}
