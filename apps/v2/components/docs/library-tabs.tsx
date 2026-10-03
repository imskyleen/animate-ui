'use client';

import { cn } from 'cn';
import Link from 'next/link';
import { useEffect } from 'react';

import { getLibrary, LIBRARIES, type LibraryId } from '@/lib/libraries';
import { setPreferredLibrary } from '@/lib/preferred-library';

/** The libraries a primitive exists in; only those get a tab. */
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
      className="flex flex-wrap items-center gap-1"
    >
      {LIBRARIES.filter((library) => urls[library.id]).map((library) => {
        const active = library.id === current;
        const { Logo } = getLibrary(library.id)!;
        return (
          <Link
            key={library.id}
            role="tab"
            aria-selected={active}
            href={urls[library.id]!}
            scroll={false}
            className={cn(
              'inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm transition-colors',
              active
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Logo className="size-3.5" />
            {library.title}
          </Link>
        );
      })}
    </div>
  );
}
