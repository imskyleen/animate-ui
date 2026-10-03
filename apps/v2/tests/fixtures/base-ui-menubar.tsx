'use client';

import { Menu } from '@animate-ui/react/primitives/base-ui/menu';
import { Menubar } from '@animate-ui/react/primitives/base-ui/menubar';

const popup = 'min-w-40 rounded-md border bg-white p-1 shadow-md outline-none';

// API compatibility: the primitives must behave exactly like Base UI's.
export default function BaseMenubarFixture() {
  return (
    <Menubar className="flex gap-2">
      {['Alpha', 'Beta'].map((name) => (
        <Menu.Root key={name}>
          <Menu.Trigger>{name}</Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner sideOffset={4}>
              <Menu.Popup className={popup}>
                <Menu.Item>{name} item</Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      ))}
    </Menubar>
  );
}
