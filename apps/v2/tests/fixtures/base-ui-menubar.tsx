'use client';

import { Menu } from '@animate-ui/react/primitives/base-ui/menu';
import { Menubar } from '@animate-ui/react/primitives/base-ui/menubar';

const popup = 'min-w-40 rounded-md border bg-white p-1 shadow-md outline-none';

export default function BaseMenubarFixture() {
  return (
    <div className="flex flex-col items-start gap-10">
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

      <Menubar className="flex gap-2">
        {['Gamma', 'Delta'].map((name) => (
          <Menu.Root key={name}>
            <Menu.Trigger>{name}</Menu.Trigger>
            <Menu.Portal keepMounted>
              <Menu.Positioner sideOffset={4} align="start">
                <Menu.Popup data-slot="menubar-content" className={popup}>
                  <Menu.Item>{name} item</Menu.Item>
                  {name === 'Delta' && (
                    <>
                      <Menu.Item>Delta second item</Menu.Item>
                      <Menu.Item>Delta third, longer item</Menu.Item>
                    </>
                  )}
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        ))}
      </Menubar>
    </div>
  );
}
