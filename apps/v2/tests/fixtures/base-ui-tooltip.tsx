'use client';

import * as React from 'react';
import { Tooltip } from '@animate-ui/react/primitives/base-ui/tooltip';

// A toolbar of tooltips, for their warm-up.
const TOOLS = [
  { label: 'Bold', shortcut: '⌘B' },
  { label: 'Italic', shortcut: '⌘I' },
  { label: 'Underline', shortcut: '⌘U' },
];

// API compatibility: the primitive must behave exactly like Base UI's.
export default function BaseUITooltipFixture() {
  const [open, setOpen] = React.useState(false);

  return (
    <Tooltip.Provider delay={0}>
      <div className="flex flex-col items-start gap-16">
        <section data-testid="controlled" className="flex items-center gap-4">
          <p data-testid="controlled-open">{open ? 'open' : 'closed'}</p>
          <button type="button" onClick={() => setOpen((value) => !value)}>
            Toggle from outside
          </button>
          <Tooltip.Root open={open} onOpenChange={setOpen}>
            <Tooltip.Trigger>Controlled trigger</Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner side="right">
                <Tooltip.Popup data-testid="controlled-content">
                  Controlled tip
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        </section>

        <section data-testid="default-open">
          <Tooltip.Root defaultOpen>
            <Tooltip.Trigger>Default open trigger</Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner side="right">
                <Tooltip.Popup data-testid="default-open-content">
                  Open on load
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        </section>

        <section data-testid="keep-mounted">
          <Tooltip.Root>
            <Tooltip.Trigger>Kept mounted trigger</Tooltip.Trigger>
            <Tooltip.Portal keepMounted>
              <Tooltip.Positioner side="right">
                <Tooltip.Popup data-testid="keep-mounted-content">
                  Kept mounted
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        </section>

        <section data-testid="toolbar">
          {/* In the Provider (delay 0, like shadcn/ui's TooltipProvider): the
              first one to open closes the tooltip open on load. */}
          <div className="flex items-center gap-1 rounded-xl border p-1">
            {TOOLS.map((tool) => (
              <Tooltip.Root key={tool.label}>
                <Tooltip.Trigger aria-label={tool.label} className="size-8">
                  {tool.label[0]}
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Positioner sideOffset={4}>
                    <Tooltip.Popup
                      data-testid="toolbar-content"
                      className="bg-foreground text-background inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs"
                    >
                      {tool.label}
                      <span className="opacity-60">{tool.shortcut}</span>
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            ))}
          </div>
        </section>
      </div>
    </Tooltip.Provider>
  );
}
