'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

import { CHANGELOG_SEEN_KEY } from '@/lib/changelog-seen';
import { BadgeLabel } from '@/lib/page-badges';

function markSeen(version: string) {
  try {
    localStorage.setItem(CHANGELOG_SEEN_KEY, version);
  } catch {
    // Blocked storage: the badge still hides until the next visit.
  }
  document.documentElement.dataset.changelogSeen = '';
}

/** "new" until the visitor opens the changelog of this version. */
export function ChangelogBadge({ version }: { version: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  React.useEffect(() => {
    if (pathname === '/docs/changelog') markSeen(version);
    const link = ref.current?.closest('a');
    if (!link) return;
    const onClick = () => markSeen(version);
    link.addEventListener('click', onClick);
    return () => link.removeEventListener('click', onClick);
  }, [pathname, version]);

  return (
    <span ref={ref} className="[[data-changelog-seen]_&]:hidden">
      <BadgeLabel badge="new" />
    </span>
  );
}
