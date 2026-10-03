'use client';

import { cn } from 'cn';
import { useState, type ReactNode } from 'react';

export function PreviewFrame({
  children,
  code,
}: {
  children: ReactNode;
  code: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="not-prose my-6 overflow-hidden rounded-2xl border-2 border-neutral-200 dark:border-neutral-800">
      <div className="flex min-h-[340px] items-center justify-center px-6 py-14">
        {children}
      </div>

      <div className="relative border-t-2 border-neutral-200 dark:border-neutral-800">
        <div
          className={cn(
            'overflow-hidden [&_figure]:bg-fd-secondary/40',
            !expanded && 'max-h-40',
          )}
        >
          {code}
        </div>
        {!expanded && (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-b from-transparent to-background">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="h-9 rounded-lg border bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
            >
              View code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
