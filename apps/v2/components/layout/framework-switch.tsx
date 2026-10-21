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

type Framework = 'react' | 'vue';

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

/** The same page in the other framework when it exists, else its introduction. */
function counterpart(
  pathname: string,
  target: Framework,
  urls: Set<string>,
  preferred: string | null,
) {
  if (target === 'vue') {
    const slug = REACT_PRIMITIVE.exec(pathname)?.[1];
    const url = slug && `/docs/vue/primitives/reka-ui/${slug}`;
    return url && urls.has(url)
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
  }
  return { href: '/docs', same: false };
}

const FRAMEWORKS: { id: Framework; title: string; logo: React.ReactNode }[] = [
  {
    id: 'react',
    title: 'React',
    logo: <HugeiconsIcon icon={ReactIcon} strokeWidth={2} size={14} />,
  },
  { id: 'vue', title: 'Vue', logo: <VueLogo className="size-3.5" /> },
];

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
    <div
      role="tablist"
      aria-label="Framework"
      className="mb-6 flex items-center gap-1 rounded-xl bg-accent/50 p-1"
    >
      <Highlight
        controlledItems
        value={current}
        className="inset-0 rounded-lg bg-background shadow-xs dark:bg-accent"
      >
        {FRAMEWORKS.map((framework) => {
          const active = framework.id === current;
          const target = active
            ? { href: pathname, same: true }
            : counterpart(pathname, framework.id, urls, preferred);
          return (
            <HighlightItem
              key={framework.id}
              value={framework.id}
              className="flex-1"
            >
              <Link
                role="tab"
                aria-selected={active}
                href={target.href}
                scroll={!target.same}
                transitionTypes={target.same ? ['library'] : undefined}
                className={cn(
                  'flex h-7 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors duration-300',
                  active
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {framework.logo}
                {framework.title}
              </Link>
            </HighlightItem>
          );
        })}
      </Highlight>
    </div>
  );
}
