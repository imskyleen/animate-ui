import type { BuildPageTreeOptions } from 'fumadocs-core/source';
import { cn } from '@workspace/ui/lib/utils';
import { Dancing_Script } from 'next/font/google';

const dancing = Dancing_Script({ subsets: ['latin'] });

const Badge = ({
  name,
  className,
  children,
}: {
  name: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <span className="flex items-center gap-3 w-full justify-between">
      {name}{' '}
      <span
        className={cn(
          'text-[17px] text-nowrap text-foreground leading-1 font-black',
          className,
        )}
      >
        <span className={cn(dancing.className, 'leading-1')}>{children}</span>
      </span>
    </span>
  );
};

export const attachFile: BuildPageTreeOptions['attachFile'] = (node, file) => {
  if (!file) return node;
  const data = file.data;

  if ('releaseDate' in data) {
    const now = new Date();
    const release = new Date(data.releaseDate as string);
    const diffMs = now.getTime() - release.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays <= 30) {
      node.name = <Badge name={node.name}>new</Badge>;
    }
  }

  if ('alpha' in data && typeof data.alpha === 'boolean' && data.alpha) {
    node.name = (
      <Badge
        name={node.name}
        className="bg-gradient-to-br text-pink-600 dark:text-pink-400"
      >
        alpha
      </Badge>
    );
  }

  if ('beta' in data && typeof data.beta === 'boolean' && data.beta) {
    node.name = (
      <Badge name={node.name} className="text-blue-600 dark:text-blue-400">
        beta
      </Badge>
    );
  }

  if (
    'deprecated' in data &&
    typeof data.deprecated === 'boolean' &&
    data.deprecated
  ) {
    node.name = (
      <Badge name={node.name} className="text-red-600 dark:text-red-400">
        deprecated
      </Badge>
    );
  }

  if ('updated' in data && typeof data.updated === 'boolean' && data.updated) {
    node.name = (
      <Badge
        name={node.name}
        className="text-emerald-600 dark:text-emerald-400"
      >
        updated
      </Badge>
    );
  }

  return node;
};
