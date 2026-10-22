'use client';

import {
  Highlight,
  HighlightItem,
} from '@animate-ui/react/primitives/effects/highlight';
import { ReactIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'cn';
import { useTreeContext } from 'fumadocs-ui/contexts/tree';
import type * as PageTree from 'fumadocs-core/page-tree';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { VueLogo } from '@/components/docs/vue-logo';
import { LIBRARIES } from '@/lib/libraries';
import { usePreferredLibrary } from '@/lib/preferred-library';
import { isVuePath } from '@/lib/vue';

export type Framework = 'react' | 'vue';

const REACT_PRIMITIVE = /^\/docs\/primitives\/[^/]+\/([^/]+)$/;
const VUE_PRIMITIVE = /^\/docs\/vue\/primitives\/[^/]+\/([^/]+)$/;

function collectUrls(nodes: PageTree.Node[], urls: Set<string>) {
  for (const node of nodes) {
    if (node.type === 'page') urls.add(node.url);
    if (node.type === 'folder') {
      if (node.index) urls.add(node.index.url);
      collectUrls(node.children, urls);
    }
  }
  return urls;
}

// Each framework names its package page after itself.
const GUIDE_PAGES: Record<string, string> = { react: 'vue' };

/** The same page in the other framework when it exists, else its introduction. */
function counterpart(
  pathname: string,
  target: Framework,
  urls: Set<string>,
  preferred: string | null,
) {
  if (target === 'vue') {
    const slug = REACT_PRIMITIVE.exec(pathname)?.[1];
    const guide = /^\/docs(?:\/(.+))?$/.exec(pathname)?.[1];
    const url = slug
      ? `/docs/vue/primitives/reka-ui/${slug}`
      : guide
        ? `/docs/vue/${GUIDE_PAGES[guide] ?? guide}`
        : '/docs/vue';
    return urls.has(url)
      ? { href: url, same: true }
      : { href: '/docs/vue', same: false };
  }
  const slug = VUE_PRIMITIVE.exec(pathname)?.[1];
  if (slug) {
    const libraries = [preferred, 'radix-ui', ...LIBRARIES.map((l) => l.id)];
    for (const library of libraries) {
      const url = `/docs/primitives/${library}/${slug}`;
      if (library && urls.has(url)) return { href: url, same: true };
    }
    return { href: '/docs', same: false };
  }
  const guide = /^\/docs\/vue(?:\/(.+))?$/.exec(pathname)?.[1];
  const react = Object.entries(GUIDE_PAGES).find(
    ([, vue]) => vue === guide,
  )?.[0];
  const url = guide ? `/docs/${react ?? guide}` : '/docs';
  return urls.has(url)
    ? { href: url, same: true }
    : { href: '/docs', same: false };
}

// In color on the active tab only: react.dev's blue, Vue's green.
const FRAMEWORKS: {
  id: Framework;
  title: string;
  logo: (active: boolean) => React.ReactNode;
}[] = [
  {
    id: 'react',
    title: 'React',
    logo: (active) => (
      <HugeiconsIcon
        icon={ReactIcon}
        strokeWidth={2}
        size={14}
        className={cn(
          'transition-colors duration-300',
          active && 'text-[#087ea4] dark:text-[#58c4dc]',
        )}
      />
    ),
  },
  {
    id: 'vue',
    title: 'Vue',
    logo: (active) => <VueLogo className="size-3.5" colored={active} />,
  },
];

export function FrameworkTabs({
  current,
  target,
  className,
  itemClassName,
  pill = false,
}: {
  pill?: boolean;
  current: Framework;
  target: (framework: Framework) => {
    href: string;
    same: boolean;
    scroll?: boolean;
  };
  className?: string;
  itemClassName?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Framework"
      className={cn(
        'flex items-center gap-1 bg-accent p-1 dark:bg-accent/50',
        pill ? 'rounded-full' : 'rounded-xl',
        className,
      )}
    >
      <Highlight
        controlledItems
        value={current}
        className={cn(
          'inset-0 bg-background shadow-xs dark:bg-accent',
          pill ? 'rounded-full' : 'rounded-lg',
        )}
      >
        {FRAMEWORKS.map((framework) => {
          const active = framework.id === current;
          const { href, same, scroll = !same } = target(framework.id);
          return (
            <HighlightItem
              key={framework.id}
              value={framework.id}
              className={itemClassName}
            >
              <Link
                role="tab"
                aria-selected={active}
                href={href}
                scroll={scroll}
                transitionTypes={same ? ['library'] : undefined}
                className={cn(
                  'flex h-7 w-full items-center justify-center gap-2 px-3 text-sm font-medium transition-colors duration-300',
                  pill ? 'rounded-full' : 'rounded-lg',
                  active
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {framework.logo(active)}
                {framework.title}
              </Link>
            </HighlightItem>
          );
        })}
      </Highlight>
    </div>
  );
}

export function FrameworkSwitch() {
  const pathname = usePathname();
  const { full } = useTreeContext();
  const preferred = usePreferredLibrary();
  const urls = useMemo(
    () =>
      collectUrls(
        [...full.children, ...(full.fallback?.children ?? [])],
        new Set(),
      ),
    [full],
  );
  const current: Framework = isVuePath(pathname) ? 'vue' : 'react';

  return (
    <FrameworkTabs
      current={current}
      target={(framework) =>
        framework === current
          ? { href: pathname, same: true }
          : counterpart(pathname, framework, urls, preferred)
      }
      className="mb-6"
      itemClassName="flex-1"
    />
  );
}
