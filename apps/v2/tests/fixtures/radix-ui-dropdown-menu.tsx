'use client';

import * as React from 'react';
import { Tick02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { DropdownMenu } from '@animate-ui/react/primitives/radix-ui/dropdown-menu';
import * as DropdownMenuStar from '@animate-ui/react/primitives/radix-ui/dropdown-menu';

const content = 'min-w-40 rounded-md border bg-white p-1 shadow-md';

export default function RadixDropdownMenuFixture() {
  const [open, setOpen] = React.useState(false);
  const [size, setSize] = React.useState('small');
  const [bold, setBold] = React.useState(false);
  const [grid, setGrid] = React.useState(false);
  const [showStar, setShowStar] = React.useState(false);
  const [showKept, setShowKept] = React.useState(false);

  return (
    <div className="flex flex-col items-start gap-10">
      <section className="flex items-center gap-4">
        <p data-testid="controlled-open">{open ? 'open' : 'closed'}</p>
        <DropdownMenu.Root open={open} onOpenChange={setOpen} modal={false}>
          <DropdownMenu.Trigger>Controlled</DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className={content}>
              <DropdownMenu.Item>Controlled item</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        <button type="button" onClick={() => setOpen(false)}>
          Close from outside
        </button>
      </section>

      <section className="flex items-center gap-4">
        <p data-testid="size">{size}</p>
        <p data-testid="bold">{String(bold)}</p>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>Options</DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className={content}>
              <DropdownMenu.RadioGroup value={size} onValueChange={setSize}>
                {['small', 'large'].map((value) => (
                  <DropdownMenu.RadioItem key={value} value={value}>
                    <DropdownMenu.ItemIndicator>•</DropdownMenu.ItemIndicator>
                    {value === 'small' ? 'Small' : 'Large'}
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
              <DropdownMenu.CheckboxItem
                checked={bold}
                onCheckedChange={setBold}
              >
                <DropdownMenu.ItemIndicator>✓</DropdownMenu.ItemIndicator>
                Bold
              </DropdownMenu.CheckboxItem>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </section>

      <section className="flex items-center gap-4">
        <p data-testid="grid">{String(grid)}</p>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>View</DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className={content}>
              <DropdownMenu.CheckboxItem
                checked={grid}
                onCheckedChange={setGrid}
                onSelect={(event) => event.preventDefault()}
              >
                <DropdownMenu.ItemIndicator>
                  <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />
                </DropdownMenu.ItemIndicator>
                Show grid
              </DropdownMenu.CheckboxItem>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </section>

      <section className="flex items-center gap-4">
        <button type="button" onClick={() => setShowStar(true)}>
          Show star menu
        </button>
        {showStar && (
          <DropdownMenuStar.Root defaultOpen>
            <DropdownMenuStar.Trigger>Star</DropdownMenuStar.Trigger>
            <DropdownMenuStar.Content className={content} side="right">
              <DropdownMenuStar.Item>Star item</DropdownMenuStar.Item>
            </DropdownMenuStar.Content>
          </DropdownMenuStar.Root>
        )}
      </section>

      <section className="flex items-center gap-4">
        <button type="button" onClick={() => setShowKept(true)}>
          Show force-mounted menu
        </button>
        {showKept && (
          <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger>Force mounted</DropdownMenu.Trigger>
            <DropdownMenu.Portal forceMount>
              <DropdownMenu.Content className={content}>
                <DropdownMenu.Item>Kept item</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </section>
    </div>
  );
}
