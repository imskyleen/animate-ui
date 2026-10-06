'use client';

import * as React from 'react';
import {
  Button,
  Tooltip,
  TooltipTrigger,
} from '@animate-ui/react/primitives/react-aria';

// A toolbar of tooltips, for React Aria's own warmup.
const TOOLS = [
  { label: 'Bold', shortcut: '⌘B' },
  { label: 'Italic', shortcut: '⌘I' },
  { label: 'Underline', shortcut: '⌘U' },
];

// API compatibility: the primitive must behave exactly like React Aria's.
export default function ReactAriaTooltipFixture() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col items-start gap-16">
      <section data-testid="controlled" className="flex items-center gap-4">
        <p data-testid="controlled-open">{open ? 'open' : 'closed'}</p>
        <TooltipTrigger isOpen={open} onOpenChange={setOpen} delay={0}>
          <Button>Controlled trigger</Button>
          <Tooltip
            placement="end"
            data-testid="controlled-content"
            className={({ isExiting }) =>
              isExiting ? 'is-exiting' : 'is-open'
            }
          >
            Controlled tip
          </Tooltip>
        </TooltipTrigger>
      </section>

      <section data-testid="default-open">
        <TooltipTrigger defaultOpen>
          <Button>Default open trigger</Button>
          <Tooltip placement="end" data-testid="default-open-content">
            Open on load
          </Tooltip>
        </TooltipTrigger>
      </section>

      <section data-testid="own-state">
        {/* Controlled on the Tooltip itself. */}
        <TooltipTrigger delay={0}>
          <Button>Tooltip state trigger</Button>
          <Tooltip
            placement="end"
            isOpen={open}
            data-testid="own-state-content"
          >
            Follows the controlled state
          </Tooltip>
        </TooltipTrigger>
      </section>

      <section data-testid="toolbar">
        <div className="flex items-center gap-1 rounded-xl border p-1">
          {TOOLS.map((tool) => (
            <TooltipTrigger key={tool.label} delay={0}>
              <Button aria-label={tool.label} className="size-8">
                {tool.label[0]}
              </Button>
              <Tooltip
                offset={4}
                data-testid="toolbar-content"
                className="bg-foreground text-background inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs"
              >
                {tool.label}
                <span className="opacity-60">{tool.shortcut}</span>
              </Tooltip>
            </TooltipTrigger>
          ))}
        </div>
      </section>
    </div>
  );
}
