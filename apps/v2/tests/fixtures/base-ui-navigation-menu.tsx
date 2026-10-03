'use client';

import * as React from 'react';
import { NavigationMenu } from '@animate-ui/react/primitives/base-ui/navigation-menu';

// API compatibility: the primitive must behave exactly like Base UI's.
export default function BaseNavigationMenuFixture() {
  const [value, setValue] = React.useState<string | null>(null);
  const [complete, setComplete] = React.useState('none');
  const actionsRef = React.useRef<NavigationMenu.Root.Actions | null>(null);
  const [hasActions, setHasActions] = React.useState(false);

  return (
    <div className="flex items-center gap-4">
      <p data-testid="value">{value ?? 'none'}</p>
      <p data-testid="complete">{complete}</p>
      <p data-testid="has-actions">{String(hasActions)}</p>
      <button type="button" data-testid="close" onClick={() => setValue(null)}>
        Close from outside
      </button>
      <button
        type="button"
        data-testid="check-actions"
        onClick={() =>
          setHasActions(typeof actionsRef.current?.unmount === 'function')
        }
      >
        Check actions
      </button>
      <NavigationMenu.Root
        value={value}
        onValueChange={setValue}
        onOpenChangeComplete={(open) => setComplete(open ? 'open' : 'closed')}
        actionsRef={actionsRef}
      >
        <NavigationMenu.List className="flex gap-2">
          <NavigationMenu.Item value="one">
            <NavigationMenu.Trigger>Controlled one</NavigationMenu.Trigger>
            <NavigationMenu.Content className="p-2">
              <NavigationMenu.Link href="#one">Link one</NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
        <NavigationMenu.Portal>
          <NavigationMenu.Positioner sideOffset={8}>
            <NavigationMenu.Popup className="relative h-(--popup-height) w-(--popup-width) rounded-md border bg-white">
              <NavigationMenu.Viewport className="relative size-full overflow-hidden" />
            </NavigationMenu.Popup>
          </NavigationMenu.Positioner>
        </NavigationMenu.Portal>
      </NavigationMenu.Root>
    </div>
  );
}
