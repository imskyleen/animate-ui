'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Popover as RadixPopover } from '@animate-ui/react/primitives/radix-ui/popover';
import { Tooltip as RadixTooltip } from '@animate-ui/react/primitives/radix-ui/tooltip';
import { HoverCard as RadixHoverCard } from '@animate-ui/react/primitives/radix-ui/hover-card';
import { DropdownMenu as RadixDropdownMenu } from '@animate-ui/react/primitives/radix-ui/dropdown-menu';
import { Menubar as RadixMenubar } from '@animate-ui/react/primitives/radix-ui/menubar';
import { Select as RadixSelect } from '@animate-ui/react/primitives/radix-ui/select';
import { NavigationMenu as RadixNavigationMenu } from '@animate-ui/react/primitives/radix-ui/navigation-menu';
import { Popover as BasePopover } from '@animate-ui/react/primitives/base-ui/popover';
import { Tooltip as BaseTooltip } from '@animate-ui/react/primitives/base-ui/tooltip';
import { PreviewCard as BasePreviewCard } from '@animate-ui/react/primitives/base-ui/preview-card';
import { Menu as BaseMenu } from '@animate-ui/react/primitives/base-ui/menu';
import { Menubar as BaseMenubar } from '@animate-ui/react/primitives/base-ui/menubar';
import { ContextMenu as BaseContextMenu } from '@animate-ui/react/primitives/base-ui/context-menu';
import { Select as BaseSelect } from '@animate-ui/react/primitives/base-ui/select';
import { Combobox as BaseCombobox } from '@animate-ui/react/primitives/base-ui/combobox';
import { NavigationMenu as BaseNavigationMenu } from '@animate-ui/react/primitives/base-ui/navigation-menu';
import {
  Button,
  Dialog,
  DialogTrigger,
  Label,
  Link,
  ListBox,
  ListBoxItem,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  PreviewTrigger,
  Select,
  SelectValue,
  Tooltip,
  TooltipTrigger,
} from '@animate-ui/react/primitives/react-aria';

// One overlay open from the start per page (`?case=<name>`): it must play its
// entrance on page load, like Animate UI v1. The animated popup carries
// `data-testid="overlay"`.

const panel = 'rounded-md border bg-white p-2 shadow-md';
const FRUITS = ['Apple', 'Banana', 'Cherry'];

function RadixPopoverCase() {
  return (
    <RadixPopover.Root defaultOpen>
      <RadixPopover.Trigger>Trigger</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          data-testid="overlay"
          side="bottom"
          sideOffset={4}
          className={panel}
        >
          Open on load
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}

function RadixTooltipCase() {
  return (
    <RadixTooltip.Provider delayDuration={0}>
      <RadixTooltip.Root defaultOpen>
        <RadixTooltip.Trigger>Trigger</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            data-testid="overlay"
            side="bottom"
            sideOffset={4}
            className={panel}
          >
            Open on load
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}

function RadixHoverCardCase() {
  return (
    <RadixHoverCard.Root defaultOpen>
      <RadixHoverCard.Trigger href="#card">Trigger</RadixHoverCard.Trigger>
      <RadixHoverCard.Portal>
        <RadixHoverCard.Content
          data-testid="overlay"
          side="bottom"
          sideOffset={4}
          className={panel}
        >
          Open on load
        </RadixHoverCard.Content>
      </RadixHoverCard.Portal>
    </RadixHoverCard.Root>
  );
}

function RadixDropdownMenuCase() {
  return (
    <RadixDropdownMenu.Root defaultOpen>
      <RadixDropdownMenu.Trigger>Trigger</RadixDropdownMenu.Trigger>
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          data-testid="overlay"
          sideOffset={4}
          className={panel}
        >
          <RadixDropdownMenu.Item>Open on load</RadixDropdownMenu.Item>
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
}

function RadixMenubarCase() {
  return (
    <RadixMenubar.Root defaultValue="file" className="flex gap-2">
      <RadixMenubar.Menu value="file">
        <RadixMenubar.Trigger>File</RadixMenubar.Trigger>
        <RadixMenubar.Portal>
          <RadixMenubar.Content
            data-testid="overlay"
            sideOffset={4}
            className={panel}
          >
            <RadixMenubar.Item>Open on load</RadixMenubar.Item>
          </RadixMenubar.Content>
        </RadixMenubar.Portal>
      </RadixMenubar.Menu>
    </RadixMenubar.Root>
  );
}

function RadixSelectCase({
  position,
}: {
  position: 'popper' | 'item-aligned';
}) {
  return (
    <RadixSelect.Root defaultOpen defaultValue="banana">
      <RadixSelect.Trigger aria-label="Fruit">
        <RadixSelect.Value />
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          data-testid="overlay"
          position={position}
          sideOffset={position === 'popper' ? 4 : undefined}
          className={panel}
        >
          <RadixSelect.Viewport>
            {FRUITS.map((fruit) => (
              <RadixSelect.Item key={fruit} value={fruit.toLowerCase()}>
                <RadixSelect.ItemText>{fruit}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

function RadixNavigationMenuCase() {
  return (
    <RadixNavigationMenu.Root defaultValue="one" className="relative">
      <RadixNavigationMenu.List className="flex gap-2">
        <RadixNavigationMenu.Item value="one">
          <RadixNavigationMenu.Trigger>Trigger</RadixNavigationMenu.Trigger>
          <RadixNavigationMenu.Content className="absolute top-0 left-0 p-2">
            <RadixNavigationMenu.Link href="#one">
              Open on load
            </RadixNavigationMenu.Link>
          </RadixNavigationMenu.Content>
        </RadixNavigationMenu.Item>
      </RadixNavigationMenu.List>
      <div className="absolute top-full left-0 mt-2">
        <RadixNavigationMenu.Viewport
          data-testid="overlay"
          className="relative h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width) overflow-hidden rounded-md border bg-white"
        />
      </div>
    </RadixNavigationMenu.Root>
  );
}

function BasePopoverCase() {
  return (
    <BasePopover.Root defaultOpen>
      <BasePopover.Trigger>Trigger</BasePopover.Trigger>
      <BasePopover.Portal>
        <BasePopover.Positioner sideOffset={4}>
          <BasePopover.Popup data-testid="overlay" className={panel}>
            Open on load
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}

function BaseTooltipCase() {
  return (
    <BaseTooltip.Provider delay={0}>
      <BaseTooltip.Root defaultOpen>
        <BaseTooltip.Trigger>Trigger</BaseTooltip.Trigger>
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner sideOffset={4}>
            <BaseTooltip.Popup data-testid="overlay" className={panel}>
              Open on load
            </BaseTooltip.Popup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  );
}

function BasePreviewCardCase() {
  return (
    <BasePreviewCard.Root defaultOpen>
      <BasePreviewCard.Trigger href="#card">Trigger</BasePreviewCard.Trigger>
      <BasePreviewCard.Portal>
        <BasePreviewCard.Positioner sideOffset={4}>
          <BasePreviewCard.Popup data-testid="overlay" className={panel}>
            Open on load
          </BasePreviewCard.Popup>
        </BasePreviewCard.Positioner>
      </BasePreviewCard.Portal>
    </BasePreviewCard.Root>
  );
}

function BaseMenuCase() {
  return (
    <BaseMenu.Root defaultOpen>
      <BaseMenu.Trigger>Trigger</BaseMenu.Trigger>
      <BaseMenu.Portal>
        <BaseMenu.Positioner sideOffset={4}>
          <BaseMenu.Popup data-testid="overlay" className={panel}>
            <BaseMenu.Item>Open on load</BaseMenu.Item>
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

function BaseMenubarCase() {
  return (
    <BaseMenubar className="flex gap-2">
      <BaseMenu.Root defaultOpen>
        <BaseMenu.Trigger>File</BaseMenu.Trigger>
        <BaseMenu.Portal>
          <BaseMenu.Positioner sideOffset={4}>
            <BaseMenu.Popup data-testid="overlay" className={panel}>
              <BaseMenu.Item>Open on load</BaseMenu.Item>
            </BaseMenu.Popup>
          </BaseMenu.Positioner>
        </BaseMenu.Portal>
      </BaseMenu.Root>
    </BaseMenubar>
  );
}

function BaseContextMenuCase() {
  return (
    <BaseContextMenu.Root defaultOpen>
      <BaseContextMenu.Trigger className="flex h-24 w-64 items-center justify-center rounded-md border">
        Area
      </BaseContextMenu.Trigger>
      <BaseContextMenu.Portal>
        <BaseContextMenu.Positioner>
          <BaseContextMenu.Popup data-testid="overlay" className={panel}>
            <BaseContextMenu.Item>Open on load</BaseContextMenu.Item>
          </BaseContextMenu.Popup>
        </BaseContextMenu.Positioner>
      </BaseContextMenu.Portal>
    </BaseContextMenu.Root>
  );
}

function BaseSelectCase({ aligned }: { aligned: boolean }) {
  return (
    <BaseSelect.Root
      defaultOpen
      defaultValue="banana"
      items={FRUITS.map((fruit) => ({
        value: fruit.toLowerCase(),
        label: fruit,
      }))}
    >
      <BaseSelect.Trigger aria-label="Fruit">
        <BaseSelect.Value />
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner alignItemWithTrigger={aligned} sideOffset={4}>
          <BaseSelect.Popup data-testid="overlay" className={panel}>
            <BaseSelect.List>
              {FRUITS.map((fruit) => (
                <BaseSelect.Item key={fruit} value={fruit.toLowerCase()}>
                  <BaseSelect.ItemText>{fruit}</BaseSelect.ItemText>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}

function BaseComboboxCase() {
  return (
    <BaseCombobox.Root items={FRUITS} defaultOpen>
      <BaseCombobox.Input aria-label="Fruit" />
      <BaseCombobox.Portal>
        <BaseCombobox.Positioner sideOffset={4}>
          <BaseCombobox.Popup data-testid="overlay" className={panel}>
            <BaseCombobox.List>
              {(item: string) => (
                <BaseCombobox.Item key={item} value={item}>
                  {item}
                </BaseCombobox.Item>
              )}
            </BaseCombobox.List>
          </BaseCombobox.Popup>
        </BaseCombobox.Positioner>
      </BaseCombobox.Portal>
    </BaseCombobox.Root>
  );
}

function BaseNavigationMenuCase() {
  return (
    <BaseNavigationMenu.Root defaultValue="one">
      <BaseNavigationMenu.List className="flex gap-2">
        <BaseNavigationMenu.Item value="one">
          <BaseNavigationMenu.Trigger>Trigger</BaseNavigationMenu.Trigger>
          <BaseNavigationMenu.Content className="p-2">
            <BaseNavigationMenu.Link href="#one">
              Open on load
            </BaseNavigationMenu.Link>
          </BaseNavigationMenu.Content>
        </BaseNavigationMenu.Item>
      </BaseNavigationMenu.List>
      <BaseNavigationMenu.Portal>
        <BaseNavigationMenu.Positioner sideOffset={8}>
          <BaseNavigationMenu.Popup
            data-testid="overlay"
            className="relative h-(--popup-height) w-(--popup-width) rounded-md border bg-white"
          >
            <BaseNavigationMenu.Viewport className="relative size-full overflow-hidden" />
          </BaseNavigationMenu.Popup>
        </BaseNavigationMenu.Positioner>
      </BaseNavigationMenu.Portal>
    </BaseNavigationMenu.Root>
  );
}

function AriaPopoverCase() {
  return (
    <DialogTrigger defaultOpen>
      <Button>Trigger</Button>
      <Popover data-testid="overlay" placement="bottom" className={panel}>
        <Dialog aria-label="Open on load">Open on load</Dialog>
      </Popover>
    </DialogTrigger>
  );
}

function AriaTooltipCase() {
  return (
    <TooltipTrigger defaultOpen>
      <Button>Trigger</Button>
      <Tooltip data-testid="overlay" placement="bottom" className={panel}>
        Open on load
      </Tooltip>
    </TooltipTrigger>
  );
}

function AriaHoverCardCase() {
  return (
    <PreviewTrigger defaultOpen>
      <Link href="#card">Trigger</Link>
      <Popover data-testid="overlay" placement="bottom" className={panel}>
        Open on load
      </Popover>
    </PreviewTrigger>
  );
}

function AriaMenuCase() {
  return (
    <MenuTrigger defaultOpen>
      <Button>Trigger</Button>
      <Popover data-testid="overlay" className={panel}>
        <Menu aria-label="Actions">
          <MenuItem>Open on load</MenuItem>
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}

function AriaSelectCase() {
  return (
    <Select defaultOpen defaultValue="banana">
      <Label>Fruit</Label>
      <Button>
        <SelectValue />
      </Button>
      <Popover data-testid="overlay" className={panel}>
        <ListBox>
          {FRUITS.map((fruit) => (
            <ListBoxItem key={fruit} id={fruit.toLowerCase()}>
              {fruit}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </Select>
  );
}

const CASES: Record<string, () => React.ReactNode> = {
  'radix-popover': () => <RadixPopoverCase />,
  'radix-tooltip': () => <RadixTooltipCase />,
  'radix-hover-card': () => <RadixHoverCardCase />,
  'radix-dropdown-menu': () => <RadixDropdownMenuCase />,
  'radix-menubar': () => <RadixMenubarCase />,
  'radix-select': () => <RadixSelectCase position="popper" />,
  'radix-select-aligned': () => <RadixSelectCase position="item-aligned" />,
  'radix-navigation-menu': () => <RadixNavigationMenuCase />,
  'base-popover': () => <BasePopoverCase />,
  'base-tooltip': () => <BaseTooltipCase />,
  'base-preview-card': () => <BasePreviewCardCase />,
  'base-menu': () => <BaseMenuCase />,
  'base-menubar': () => <BaseMenubarCase />,
  'base-context-menu': () => <BaseContextMenuCase />,
  'base-select': () => <BaseSelectCase aligned={false} />,
  'base-select-aligned': () => <BaseSelectCase aligned />,
  'base-combobox': () => <BaseComboboxCase />,
  'base-navigation-menu': () => <BaseNavigationMenuCase />,
  'aria-popover': () => <AriaPopoverCase />,
  'aria-tooltip': () => <AriaTooltipCase />,
  'aria-hover-card': () => <AriaHoverCardCase />,
  'aria-menu': () => <AriaMenuCase />,
  'aria-select': () => <AriaSelectCase />,
};

function Case() {
  const name = useSearchParams().get('case') ?? '';
  const render = CASES[name];
  if (render) return <div className="pt-4 pl-40">{render()}</div>;
  return (
    <ul>
      {Object.keys(CASES).map((key) => (
        <li key={key}>
          <a href={`?case=${key}`}>{key}</a>
        </li>
      ))}
    </ul>
  );
}

export default function DefaultOpenOverlaysFixture() {
  return (
    <React.Suspense>
      <Case />
    </React.Suspense>
  );
}
