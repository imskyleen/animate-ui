'use client';

import * as React from 'react';
import { Menu } from '@animate-ui/react/primitives/base-ui/menu';

const popup = 'min-w-40 rounded-md border bg-white p-1 shadow-md outline-none';

// API compatibility: the primitive must behave exactly like Base UI's.
export default function BaseMenuFixture() {
  const [open, setOpen] = React.useState(false);
  const [complete, setComplete] = React.useState('none');
  const [size, setSize] = React.useState('small');
  const [bold, setBold] = React.useState(false);
  const actionsRef = React.useRef<Menu.Root.Actions | null>(null);

  return (
    <div className="flex flex-col items-start gap-10">
      <section className="flex items-center gap-4">
        <p data-testid="open">{open ? 'open' : 'closed'}</p>
        <p data-testid="complete">{complete}</p>
        <Menu.Root
          open={open}
          onOpenChange={setOpen}
          onOpenChangeComplete={(next) => setComplete(next ? 'open' : 'closed')}
          actionsRef={actionsRef}
          modal={false}
        >
          <Menu.Trigger>Controlled</Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner sideOffset={4}>
              <Menu.Popup className={popup}>
                <Menu.Item>Controlled item</Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
        <button
          type="button"
          data-testid="close"
          onClick={() => setOpen(false)}
        >
          Close from outside
        </button>
        <button
          type="button"
          data-testid="imperative-close"
          onClick={() => actionsRef.current?.close()}
        >
          Close with actionsRef
        </button>
      </section>

      <section>
        <Menu.Root modal={false}>
          <Menu.Trigger>Kept</Menu.Trigger>
          <Menu.Portal keepMounted>
            <Menu.Positioner sideOffset={4}>
              <Menu.Popup className={popup}>
                <Menu.Item>Kept item</Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </section>

      <section className="flex items-center gap-4">
        <p data-testid="size">{size}</p>
        <p data-testid="bold">{String(bold)}</p>
        <Menu.Root modal={false}>
          <Menu.Trigger>Options</Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner sideOffset={4}>
              <Menu.Popup className={popup}>
                <Menu.RadioGroup value={size} onValueChange={setSize}>
                  {['small', 'large'].map((value) => (
                    <Menu.RadioItem
                      key={value}
                      value={value}
                      closeOnClick={false}
                    >
                      <Menu.RadioItemIndicator>•</Menu.RadioItemIndicator>
                      {value === 'small' ? 'Small' : 'Large'}
                    </Menu.RadioItem>
                  ))}
                </Menu.RadioGroup>
                <Menu.CheckboxItem checked={bold} onCheckedChange={setBold}>
                  <Menu.CheckboxItemIndicator>✓</Menu.CheckboxItemIndicator>
                  Bold
                </Menu.CheckboxItem>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </section>
    </div>
  );
}
