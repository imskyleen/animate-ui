'use client';

import * as React from 'react';
import { PreviewCard } from '@animate-ui/react/primitives/base-ui/preview-card';

export default function BaseUIPreviewCardFixture() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col items-start gap-16">
      <section data-testid="controlled" className="flex items-center gap-4">
        <p data-testid="controlled-open">{open ? 'open' : 'closed'}</p>
        <button type="button" onClick={() => setOpen((value) => !value)}>
          Toggle from outside
        </button>
        <PreviewCard.Root open={open} onOpenChange={setOpen}>
          <PreviewCard.Trigger href="#controlled" delay={0} closeDelay={0}>
            Controlled link
          </PreviewCard.Trigger>
          <PreviewCard.Portal>
            <PreviewCard.Positioner side="right">
              <PreviewCard.Popup data-testid="controlled-content">
                Controlled card
              </PreviewCard.Popup>
            </PreviewCard.Positioner>
          </PreviewCard.Portal>
        </PreviewCard.Root>
      </section>

      <section data-testid="keep-mounted">
        <PreviewCard.Root>
          <PreviewCard.Trigger href="#kept" delay={0} closeDelay={0}>
            Kept mounted link
          </PreviewCard.Trigger>
          <PreviewCard.Portal keepMounted>
            <PreviewCard.Positioner side="right">
              <PreviewCard.Popup data-testid="keep-mounted-content">
                Kept mounted
              </PreviewCard.Popup>
            </PreviewCard.Positioner>
          </PreviewCard.Portal>
        </PreviewCard.Root>
      </section>
    </div>
  );
}
