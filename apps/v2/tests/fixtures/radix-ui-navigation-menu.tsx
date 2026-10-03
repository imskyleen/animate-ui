'use client';

import * as React from 'react';
import { NavigationMenu } from '@animate-ui/react/primitives/radix-ui/navigation-menu';
import * as NavigationMenuStar from '@animate-ui/react/primitives/radix-ui/navigation-menu';

const panel = 'w-48 rounded-md border bg-white p-2 shadow-md';

// API compatibility: the primitive must behave exactly like Radix's.
export default function RadixNavigationMenuFixture() {
  const [value, setValue] = React.useState('');

  return (
    <div className="flex flex-col items-start gap-24">
      <section className="flex items-center gap-4">
        <p data-testid="value">{value || 'none'}</p>
        <button type="button" onClick={() => setValue('')}>
          Close it
        </button>
        <NavigationMenu.Root
          value={value}
          onValueChange={setValue}
          className="relative"
        >
          <NavigationMenu.List className="flex gap-2">
            <NavigationMenu.Item value="one">
              <NavigationMenu.Trigger>Controlled one</NavigationMenu.Trigger>
              <NavigationMenu.Content className="absolute top-0 left-0 p-2">
                <NavigationMenu.Link href="#one">Link one</NavigationMenu.Link>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>
          <div className="absolute top-full left-0">
            <NavigationMenu.Viewport className="relative h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width) overflow-hidden rounded-md border bg-white" />
          </div>
        </NavigationMenu.Root>
      </section>

      <section data-testid="inline">
        {/* No Viewport: each Content is displayed under its item. */}
        <NavigationMenu.Root>
          <NavigationMenu.List className="flex gap-2">
            <NavigationMenu.Item className="relative">
              <NavigationMenu.Trigger>Inline</NavigationMenu.Trigger>
              <NavigationMenu.Content
                className={`absolute top-full left-0 ${panel}`}
              >
                <NavigationMenu.Link href="#inline">
                  Inline link
                </NavigationMenu.Link>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </section>

      <section>
        {/* The `import * as` style of @radix-ui/react-navigation-menu. */}
        <NavigationMenuStar.Root className="relative">
          <NavigationMenuStar.List className="flex gap-8">
            {['one', 'two'].map((item) => (
              <NavigationMenuStar.Item key={item}>
                <NavigationMenuStar.Trigger className="w-28">
                  {item === 'one' ? 'Star one' : 'Star two'}
                </NavigationMenuStar.Trigger>
                <NavigationMenuStar.Content className="absolute top-0 left-0 p-2">
                  <NavigationMenuStar.Link href={`#${item}`}>
                    Star link {item}
                  </NavigationMenuStar.Link>
                </NavigationMenuStar.Content>
              </NavigationMenuStar.Item>
            ))}
            <NavigationMenuStar.Indicator
              data-testid="indicator"
              className="top-full h-1 bg-black"
            />
          </NavigationMenuStar.List>
          <div className="absolute top-full left-0 mt-2">
            <NavigationMenuStar.Viewport className="relative h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width) overflow-hidden rounded-md border bg-white" />
          </div>
        </NavigationMenuStar.Root>
      </section>
    </div>
  );
}
