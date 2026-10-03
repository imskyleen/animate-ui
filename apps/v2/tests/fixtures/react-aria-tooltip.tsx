'use client';

import * as React from 'react';
import {
  Button,
  Tooltip,
  TooltipTrigger,
} from '@animate-ui/react/primitives/react-aria';

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
    </div>
  );
}
