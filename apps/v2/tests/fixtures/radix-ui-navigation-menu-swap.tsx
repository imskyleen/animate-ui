'use client';

import * as React from 'react';
import { NavigationMenu } from '@animate-ui/react/primitives/radix-ui/navigation-menu';

// The content changing between items, in setups the demo doesn't cover.

const content = 'absolute top-0 left-0 w-64 p-2';
const link = 'block rounded px-2 py-1 hover:bg-[rgb(255,0,0)]';
const sizes = [
  { name: 'Small', className: 'h-24 w-48' },
  { name: 'Medium', className: 'h-40 w-80' },
  { name: 'Large', className: 'h-56 w-[28rem]' },
];

function Menu({ names, dir }: { names: string[]; dir?: 'ltr' | 'rtl' }) {
  return (
    <NavigationMenu.Root dir={dir} className="relative">
      <NavigationMenu.List className="flex gap-2">
        {names.map((name) => (
          <NavigationMenu.Item key={name} value={name}>
            <NavigationMenu.Trigger className="w-28 px-2 py-1">
              {name}
            </NavigationMenu.Trigger>
            <NavigationMenu.Content
              data-slot="navigation-menu-content"
              className={content}
            >
              <NavigationMenu.Link href={`#${name}`} className={link}>
                {name} link
              </NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        ))}
      </NavigationMenu.List>
      <div
        className={`absolute top-full mt-2 ${dir === 'rtl' ? 'right-0' : 'left-0'}`}
      >
        <NavigationMenu.Viewport className="relative h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width) overflow-hidden rounded-md border bg-white" />
      </div>
    </NavigationMenu.Root>
  );
}

export default function RadixNavigationMenuSwapFixture() {
  return (
    <div className="flex flex-col items-start gap-40">
      <section data-testid="strict">
        {/* React's StrictMode (Next.js's default) remounts effects. */}
        <React.StrictMode>
          <Menu names={['Strict one', 'Strict two']} />
        </React.StrictMode>
      </section>

      <section data-testid="rtl" dir="rtl" className="self-stretch">
        <Menu names={['Right one', 'Right two']} dir="rtl" />
      </section>

      <section data-testid="inline">
        {/* No Viewport: the Content shows under its item, on its own
            background. */}
        <NavigationMenu.Root>
          <NavigationMenu.List className="flex gap-2">
            <NavigationMenu.Item className="relative">
              <NavigationMenu.Trigger className="px-2 py-1">
                Panel
              </NavigationMenu.Trigger>
              <NavigationMenu.Content
                data-slot="navigation-menu-content"
                className="absolute top-full left-0 w-48 rounded-md border bg-white p-2"
              >
                <NavigationMenu.Link href="#panel" className={link}>
                  Panel link
                </NavigationMenu.Link>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </section>
      <section data-testid="sizes" className="pb-96">
        {/* Contents of growing sizes. */}
        <NavigationMenu.Root className="relative">
          <NavigationMenu.List className="flex gap-2">
            {sizes.map(({ name, className }) => (
              <NavigationMenu.Item key={name} value={name}>
                <NavigationMenu.Trigger className="w-28 px-2 py-1">
                  {name}
                </NavigationMenu.Trigger>
                <NavigationMenu.Content
                  data-slot="navigation-menu-content"
                  className={`absolute top-0 left-0 p-2 ${className}`}
                >
                  <NavigationMenu.Link href={`#${name}`} className={link}>
                    {name} link
                  </NavigationMenu.Link>
                </NavigationMenu.Content>
              </NavigationMenu.Item>
            ))}
          </NavigationMenu.List>
          <div className="absolute top-full left-0 mt-2">
            <NavigationMenu.Viewport
              data-testid="sizes-viewport"
              className="relative h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width) overflow-hidden rounded-md border bg-white"
            />
          </div>
        </NavigationMenu.Root>
      </section>
    </div>
  );
}
