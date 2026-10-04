'use client';

import {
  Highlight,
  HighlightItem,
} from '@animate-ui/react/primitives/effects/highlight';
import { cn } from 'cn';
import Link from 'next/link';
import { useEffect } from 'react';

import { getLibrary, LIBRARIES, type LibraryId } from '@/lib/libraries';
import { setPreferredLibrary } from '@/lib/preferred-library';

/**
 * The libraries a primitive exists in; only those get a tab. Animate UI's
 * Highlight slides to the clicked library while its page loads.
 */
export function LibraryTabs({
  current,
  urls,
}: {
  current: LibraryId;
  urls: Partial<Record<LibraryId, string>>;
}) {
  // Opening a primitive in a library makes it the reader's default.
  useEffect(() => setPreferredLibrary(current), [current]);

  return (
    <div
      role="tablist"
      aria-label="Library"
      // Sits right on top of the preview, like a tab list on its panel.
      className="-mb-2 flex flex-wrap items-center gap-1"
    >
      <Highlight
        controlledItems
        value={current}
        className="inset-0 rounded-lg bg-accent"
      >
        {LIBRARIES.filter((library) => urls[library.id]).map((library) => {
          const active = library.id === current;
          const { Logo } = getLibrary(library.id)!;
          return (
            <HighlightItem key={library.id} value={library.id}>
              <Link
                role="tab"
                aria-selected={active}
                href={urls[library.id]!}
                scroll={false}
                className={cn(
                  'inline-flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors duration-300',
                  active
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Logo className="size-3.5" />
                {library.title}
              </Link>
            </HighlightItem>
          );
        })}
      </Highlight>
    </div>
  );
}
