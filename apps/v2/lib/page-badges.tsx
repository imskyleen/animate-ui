import { cn } from 'cn';
import type { PageTreeTransformer } from 'fumadocs-core/source';
import { Dancing_Script } from 'next/font/google';
import type { ReactNode } from 'react';

const dancing = Dancing_Script({ subsets: ['latin'] });

/** A page's name with its status written by hand on the right, as in v1. */
function Badge({
  name,
  className,
  children,
}: {
  name: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className="flex w-full items-center justify-between gap-3">
      <span>{name}</span>
      <span
        className={cn(
          dancing.className,
          'text-[17px] leading-1 font-black text-nowrap text-foreground',
          className,
        )}
      >
        {children}
      </span>
    </span>
  );
}

/** Pages released in the last 30 days are new. */
const NEW_FOR_DAYS = 30;

// The status badge (new, alpha, beta, deprecated, updated) of a sidebar item,
// from its page's frontmatter: `new` for 30 days after its `releaseDate`, or
// as long as it has `new: true`.
export const attachBadge: PageTreeTransformer['file'] = function (
  node,
  filePath,
) {
  const file = filePath ? this.storage.read(filePath) : undefined;
  if (!file || file.format !== 'page') return node;
  const data = file.data as Record<string, unknown>;

  // Released in the last 30 days, or a component v1 didn't have (new until
  // the flag is removed).
  const recent =
    typeof data.releaseDate === 'string' &&
    (Date.now() - new Date(data.releaseDate).getTime()) / 86_400_000 <=
      NEW_FOR_DAYS;
  if (recent || data.new === true)
    node.name = <Badge name={node.name}>new</Badge>;
  if (data.alpha === true)
    node.name = (
      <Badge name={node.name} className="text-pink-600 dark:text-pink-400">
        alpha
      </Badge>
    );
  if (data.beta === true)
    node.name = (
      <Badge name={node.name} className="text-blue-600 dark:text-blue-400">
        beta
      </Badge>
    );
  if (data.deprecated === true)
    node.name = (
      <Badge name={node.name} className="text-red-600 dark:text-red-400">
        deprecated
      </Badge>
    );
  if (data.updated === true)
    node.name = (
      <Badge
        name={node.name}
        className="text-emerald-600 dark:text-emerald-400"
      >
        updated
      </Badge>
    );
  return node;
};
