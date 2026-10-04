'use client';

import { Button } from '@animate-ui/react/primitives/buttons/button';
import { RefreshIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'cn';
import { useState, type ReactNode } from 'react';

import { DocsTabs } from './tabs';

/**
 * v1's preview: Preview | Code tabs (Animate UI Tabs), the demo on the
 * background inside an accent frame, with a replay button that remounts it.
 */
export function PreviewFrame({
  children,
  code,
  fullBleed = false,
}: {
  children: ReactNode;
  code: ReactNode;
  fullBleed?: boolean;
}) {
  const [run, setRun] = useState(0);

  return (
    <DocsTabs
      label="Preview"
      lazy
      className="not-prose"
      tabs={[
        {
          value: 'preview',
          label: 'Preview',
          content: (
            <div className="rounded-xl bg-accent p-1.5">
              <div
                data-slot="preview"
                className={cn(
                  'relative flex items-center justify-center rounded-md bg-background',
                  fullBleed
                    ? 'h-[420px] overflow-hidden'
                    : 'min-h-[400px] px-6 py-16 sm:px-10',
                )}
              >
                <Button
                  type="button"
                  aria-label="Replay"
                  title="Replay"
                  hoverScale={1.05}
                  onClick={() => setRun((r) => r + 1)}
                  className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-lg bg-accent text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} size={14} />
                </Button>
                <div
                  key={run}
                  className={cn(
                    'flex w-full items-center justify-center',
                    fullBleed && 'absolute inset-0',
                  )}
                >
                  {children}
                </div>
              </div>
            </div>
          ),
        },
        { value: 'code', label: 'Code', content: code },
      ]}
    />
  );
}
