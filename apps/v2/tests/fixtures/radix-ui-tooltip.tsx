'use client';

import * as React from 'react';
import { Tooltip } from '@animate-ui/react/primitives/radix-ui/tooltip';
import * as TooltipStar from '@animate-ui/react/primitives/radix-ui/tooltip';

// A toolbar of tooltips, for their warm-up.
const TOOLS = [
  { label: 'Bold', shortcut: '⌘B' },
  { label: 'Italic', shortcut: '⌘I' },
  { label: 'Underline', shortcut: '⌘U' },
];

// API compatibility: the primitive must behave exactly like Radix's.
export default function RadixTooltipFixture() {
  const [open, setOpen] = React.useState(false);

  return (
    <Tooltip.Provider delayDuration={0}>
      <div className="flex flex-col items-start gap-16">
        <section data-testid="controlled" className="flex items-center gap-4">
          <p data-testid="controlled-open">{open ? 'open' : 'closed'}</p>
          <button type="button" onClick={() => setOpen((value) => !value)}>
            Toggle from outside
          </button>
          <Tooltip.Root open={open} onOpenChange={setOpen}>
            <Tooltip.Trigger>Controlled trigger</Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content data-testid="controlled-content" side="right">
                Controlled tip
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </section>

        <section data-testid="default-open">
          <Tooltip.Root defaultOpen>
            <Tooltip.Trigger>Default open trigger</Tooltip.Trigger>
            <Tooltip.Content data-testid="default-open-content" side="right">
              Open on load
            </Tooltip.Content>
          </Tooltip.Root>
        </section>

        <section data-testid="force-mount">
          <Tooltip.Root>
            <Tooltip.Trigger>Force mounted trigger</Tooltip.Trigger>
            <Tooltip.Portal forceMount>
              <Tooltip.Content data-testid="force-mount-content" side="right">
                Kept mounted
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </section>

        <section data-testid="star">
          {/* The `import * as` style of @radix-ui/react-tooltip. */}
          <TooltipStar.Provider>
            <TooltipStar.Root delayDuration={0}>
              <TooltipStar.Trigger>Star trigger</TooltipStar.Trigger>
              <TooltipStar.Portal>
                <TooltipStar.Content data-testid="star-content" side="right">
                  Star tip
                  <TooltipStar.Arrow />
                </TooltipStar.Content>
              </TooltipStar.Portal>
            </TooltipStar.Root>
          </TooltipStar.Provider>
        </section>

        <section data-testid="toolbar">
          {/* Under their own Provider, like shadcn/ui's TooltipProvider. */}
          <Tooltip.Provider delayDuration={0}>
            <div className="flex items-center gap-1 rounded-xl border p-1">
              {TOOLS.map((tool) => (
                <Tooltip.Root key={tool.label}>
                  <Tooltip.Trigger aria-label={tool.label} className="size-8">
                    {tool.label[0]}
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      data-testid="toolbar-content"
                      className="bg-foreground text-background inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs"
                    >
                      {tool.label}
                      <span className="opacity-60">{tool.shortcut}</span>
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              ))}
            </div>
          </Tooltip.Provider>
        </section>
      </div>
    </Tooltip.Provider>
  );
}
