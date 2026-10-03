'use client';

import * as React from 'react';
import { Menubar } from '@animate-ui/react/primitives/radix-ui/menubar';
import * as MenubarStar from '@animate-ui/react/primitives/radix-ui/menubar';

const content = 'min-w-40 rounded-md border bg-white p-1 shadow-md';

// API compatibility: the primitive must behave exactly like Radix's.
export default function RadixMenubarFixture() {
  const [value, setValue] = React.useState('');

  return (
    <div className="flex flex-col items-start gap-10">
      <section className="flex items-center gap-4">
        <p data-testid="value">{value || 'none'}</p>
        <Menubar.Root
          value={value}
          onValueChange={setValue}
          className="flex gap-2"
        >
          {['alpha', 'beta'].map((menu) => (
            <Menubar.Menu key={menu} value={menu}>
              <Menubar.Trigger>
                {menu === 'alpha' ? 'Alpha' : 'Beta'}
              </Menubar.Trigger>
              <Menubar.Portal>
                <Menubar.Content className={content}>
                  <Menubar.Item>
                    {menu === 'alpha' ? 'Alpha item' : 'Beta item'}
                  </Menubar.Item>
                </Menubar.Content>
              </Menubar.Portal>
            </Menubar.Menu>
          ))}
        </Menubar.Root>
      </section>

      <section>
        {/* The `import * as` style of @radix-ui/react-menubar, menus without
            a value (Radix generates one). */}
        <MenubarStar.Root className="flex gap-2">
          <MenubarStar.Menu>
            <MenubarStar.Trigger>Star menu</MenubarStar.Trigger>
            <MenubarStar.Portal>
              <MenubarStar.Content className={content}>
                <MenubarStar.Item>Star item</MenubarStar.Item>
              </MenubarStar.Content>
            </MenubarStar.Portal>
          </MenubarStar.Menu>
          <MenubarStar.Menu>
            <MenubarStar.Trigger>Other menu</MenubarStar.Trigger>
            <MenubarStar.Portal>
              <MenubarStar.Content className={content}>
                <MenubarStar.Item>Other item</MenubarStar.Item>
              </MenubarStar.Content>
            </MenubarStar.Portal>
          </MenubarStar.Menu>
        </MenubarStar.Root>
      </section>
    </div>
  );
}
