import type * as React from 'react';
import { cn } from 'cn';
import type { PageTreeTransformer } from 'fumadocs-core/source';
import { Dancing_Script } from 'next/font/google';
import { ChangelogBadge } from '@/components/docs/changelog-badge';
import { isNewPage, isUpdatedPage } from '@/lib/new-badge';

const dancing = Dancing_Script({ subsets: ['latin'] });

export function BadgeLabel({
  badge,
  className,
}: {
  badge: PageBadge;
  className?: string;
}) {
  return (
    <span
      data-slot="badge"
      className={cn(
        dancing.className,
        'text-[15px] leading-1 font-black text-nowrap text-foreground',
        BADGE_COLORS[badge],
        className,
      )}
    >
      {badge}
    </span>
  );
}

export type PageBadge = 'new' | 'alpha' | 'beta' | 'deprecated' | 'updated';

const BADGE_COLORS: Record<PageBadge, string> = {
  new: '',
  alpha: 'text-pink-600 dark:text-pink-400',
  beta: 'text-blue-600 dark:text-blue-400',
  deprecated: 'text-red-600 dark:text-red-400',
  updated: 'text-muted-foreground',
};

export function pageBadge(frontmatter: object): PageBadge | null {
  const data = frontmatter as Record<string, unknown>;
  if (data.deprecated === true) return 'deprecated';
  if (data.beta === true) return 'beta';
  if (data.alpha === true) return 'alpha';
  if (isNewPage(data)) return 'new';
  return isUpdatedPage(data) ? 'updated' : null;
}

export const attachBadge: PageTreeTransformer['file'] = function (
  node,
  filePath,
) {
  const file = filePath ? this.storage.read(filePath) : undefined;
  if (!file || file.format !== 'page') return node;
  const { version } = file.data as { version?: unknown };
  if (typeof version === 'string') {
    node.name = (
      <span className="flex w-full items-center justify-between gap-3">
        <span>{node.name}</span>
        <ChangelogBadge version={version} />
      </span>
    );
    return node;
  }
  const badge = pageBadge(file.data);
  if (!badge) return node;
  node.name = (
    <span className="flex w-full items-center justify-between gap-3">
      <span>{splitSuffix(node.name)}</span>
      <BadgeLabel badge={badge} />
    </span>
  );
  return node;
};

function splitSuffix(name: React.ReactNode) {
  if (typeof name !== 'string') return name;
  const match = name.match(/^(.*\S)( Background| Text| Button| Number)$/);
  if (!match) return name;
  return (
    <>
      {match[1]}
      <span data-slot="name-suffix">{match[2]}</span>
    </>
  );
}
