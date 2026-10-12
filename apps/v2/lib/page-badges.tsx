import { cn } from 'cn';
import type { PageTreeTransformer } from 'fumadocs-core/source';
import { Dancing_Script } from 'next/font/google';

const dancing = Dancing_Script({ subsets: ['latin'] });

/** A status written by hand, as in v1's sidebar. */
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
        'text-[17px] leading-1 font-black text-nowrap text-foreground',
        BADGE_COLORS[badge],
        className,
      )}
    >
      {badge}
    </span>
  );
}

/** Pages released in the last 30 days are new. */
const NEW_FOR_DAYS = 30;

export type PageBadge = 'new' | 'alpha' | 'beta' | 'deprecated' | 'updated';

const BADGE_COLORS: Record<PageBadge, string> = {
  new: '',
  alpha: 'text-pink-600 dark:text-pink-400',
  beta: 'text-blue-600 dark:text-blue-400',
  deprecated: 'text-red-600 dark:text-red-400',
  updated: 'text-emerald-600 dark:text-emerald-400',
};

/**
 * A page's status, from its frontmatter: `new` for 30 days after its
 * `releaseDate`, or as long as it has `new: true` (a component v1 didn't
 * have); `alpha`, `beta`, `deprecated`, `updated` win over it.
 */
export function pageBadge(frontmatter: object): PageBadge | null {
  const data = frontmatter as Record<string, unknown>;
  if (data.updated === true) return 'updated';
  if (data.deprecated === true) return 'deprecated';
  if (data.beta === true) return 'beta';
  if (data.alpha === true) return 'alpha';
  const recent =
    typeof data.releaseDate === 'string' &&
    (Date.now() - new Date(data.releaseDate).getTime()) / 86_400_000 <=
      NEW_FOR_DAYS;
  return recent || data.new === true ? 'new' : null;
}

// The status badge of a sidebar item, written on the right of its name.
export const attachBadge: PageTreeTransformer['file'] = function (
  node,
  filePath,
) {
  const file = filePath ? this.storage.read(filePath) : undefined;
  if (!file || file.format !== 'page') return node;
  const badge = pageBadge(file.data);
  if (!badge) return node;
  node.name = (
    <span className="flex w-full items-center justify-between gap-3">
      <span>{node.name}</span>
      <BadgeLabel badge={badge} />
    </span>
  );
  return node;
};
