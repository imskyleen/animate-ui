'use client';

import * as React from 'react';
import { Menubar } from '@animate-ui/react/primitives/radix-ui/menubar';
import * as MenubarStar from '@animate-ui/react/primitives/radix-ui/menubar';

const content = 'min-w-40 rounded-md border bg-white p-1 shadow-md';

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
                <Menubar.Content
                  data-slot="menubar-content"
                  className={content}
                >
                  <Menubar.Item>
                    {menu === 'alpha' ? 'Alpha item' : 'Beta item'}
                  </Menubar.Item>
                  {menu === 'alpha' && (
                    <Menubar.Sub>
                      <Menubar.SubTrigger>Alpha more</Menubar.SubTrigger>
                      <Menubar.Portal>
                        <Menubar.SubContent
                          data-slot="menubar-sub-content"
                          className={content}
                        >
                          <Menubar.Item>Alpha sub item</Menubar.Item>
                        </Menubar.SubContent>
                      </Menubar.Portal>
                    </Menubar.Sub>
                  )}
                </Menubar.Content>
              </Menubar.Portal>
            </Menubar.Menu>
          ))}
        </Menubar.Root>
      </section>

      <section>
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

      <section>
        <Menubar.Root className="flex gap-2">
          {['Gamma', 'Delta'].map((menu) => (
            <Menubar.Menu key={menu} value={menu}>
              <Menubar.Trigger>{menu}</Menubar.Trigger>
              <Menubar.Portal forceMount>
                <Menubar.Content
                  data-slot="menubar-content"
                  align="start"
                  className={content}
                >
                  <Menubar.Item>{menu} item</Menubar.Item>
                  {menu === 'Delta' && (
                    <>
                      <Menubar.Item>Delta second item</Menubar.Item>
                      <Menubar.Item>Delta third, longer item</Menubar.Item>
                    </>
                  )}
                </Menubar.Content>
              </Menubar.Portal>
            </Menubar.Menu>
          ))}
        </Menubar.Root>
      </section>
    </div>
  );
}
