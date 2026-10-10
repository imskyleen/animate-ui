'use client';

import * as React from 'react';
import { NavigationMenu } from '@animate-ui/react/primitives/base-ui/navigation-menu';

// The content changing between items, in setups the demo doesn't cover.

const popup =
  'relative h-(--popup-height) w-(--popup-width) rounded-md border bg-white';
const content = 'w-64 p-2';
const link = 'block rounded px-2 py-1 hover:bg-[rgb(255,0,0)]';
const sizes = [
  { name: 'Small', className: 'h-24 w-48' },
  { name: 'Medium', className: 'h-40 w-80' },
  { name: 'Large', className: 'h-56 w-[28rem]' },
];

function Popup({ className }: { className?: string }) {
  return (
    <NavigationMenu.Portal>
      <NavigationMenu.Positioner sideOffset={8} align="start">
        <NavigationMenu.Popup className={`${popup} ${className ?? ''}`}>
          <NavigationMenu.Viewport className="relative size-full overflow-hidden" />
        </NavigationMenu.Popup>
      </NavigationMenu.Positioner>
    </NavigationMenu.Portal>
  );
}

function Items({
  names,
  keepMounted,
}: {
  names: string[];
  keepMounted?: boolean;
}) {
  return names.map((name) => (
    <NavigationMenu.Item key={name} value={name}>
      <NavigationMenu.Trigger className="w-28 px-2 py-1">
        {name}
      </NavigationMenu.Trigger>
      <NavigationMenu.Content
        data-slot="navigation-menu-content"
        keepMounted={keepMounted}
        className={content}
      >
        <NavigationMenu.Link href={`#${name}`} className={link}>
          {name} link
        </NavigationMenu.Link>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  ));
}

export default function BaseNavigationMenuSwapFixture() {
  return (
    <div className="flex flex-col items-start gap-40">
      <section data-testid="keep">
        {/* Contents kept mounted while closed. */}
        <NavigationMenu.Root>
          <NavigationMenu.List className="flex gap-2">
            <Items names={['Alpha', 'Beta', 'Gamma']} keepMounted />
          </NavigationMenu.List>
          <Popup />
        </NavigationMenu.Root>
      </section>

      <section data-testid="nested">
        {/* A submenu in a content, shown in place: no Popup of its own. */}
        <NavigationMenu.Root>
          <NavigationMenu.List className="flex gap-2">
            <NavigationMenu.Item value="parent">
              <NavigationMenu.Trigger className="px-2 py-1">
                Parent
              </NavigationMenu.Trigger>
              <NavigationMenu.Content
                data-slot="navigation-menu-content"
                className="flex w-[30rem] gap-2 p-2"
              >
                <NavigationMenu.Root
                  orientation="vertical"
                  className="flex gap-2"
                >
                  <NavigationMenu.List className="flex flex-col">
                    {['One', 'Two'].map((name) => (
                      <NavigationMenu.Item key={name} value={name}>
                        <NavigationMenu.Trigger className="px-2 py-1">
                          {name}
                        </NavigationMenu.Trigger>
                        <NavigationMenu.Content
                          data-slot="navigation-menu-content"
                          className={content}
                        >
                          <NavigationMenu.Link
                            href={`#${name}`}
                            className={link}
                          >
                            {name} link
                          </NavigationMenu.Link>
                        </NavigationMenu.Content>
                      </NavigationMenu.Item>
                    ))}
                  </NavigationMenu.List>
                  <NavigationMenu.Viewport className="relative h-24 w-64 overflow-hidden" />
                </NavigationMenu.Root>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>
          <Popup />
        </NavigationMenu.Root>
      </section>

      <section data-testid="render">
        {/* A link whose label is in its render element. */}
        <NavigationMenu.Root>
          <NavigationMenu.List className="flex gap-2">
            <NavigationMenu.Item>
              <NavigationMenu.Link
                className={link}
                render={<a href="#docs">Docs in render</a>}
              />
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </section>

      <section data-testid="translate">
        {/* A Popup with its own `translate`. */}
        <NavigationMenu.Root>
          <NavigationMenu.List className="flex gap-2">
            <Items names={['Delta', 'Epsilon']} />
          </NavigationMenu.List>
          <Popup className="translate-y-1.5" />
        </NavigationMenu.Root>
      </section>
      <section data-testid="sizes" className="pb-96">
        {/* Contents of growing sizes. */}
        <NavigationMenu.Root>
          <NavigationMenu.List className="flex gap-2">
            {sizes.map(({ name, className }) => (
              <NavigationMenu.Item key={name} value={name}>
                <NavigationMenu.Trigger className="w-28 px-2 py-1">
                  {name}
                </NavigationMenu.Trigger>
                <NavigationMenu.Content
                  data-slot="navigation-menu-content"
                  className={`p-2 ${className}`}
                >
                  <NavigationMenu.Link href={`#${name}`} className={link}>
                    {name} link
                  </NavigationMenu.Link>
                </NavigationMenu.Content>
              </NavigationMenu.Item>
            ))}
          </NavigationMenu.List>
          <Popup className="sizes-popup" />
        </NavigationMenu.Root>
      </section>
    </div>
  );
}
