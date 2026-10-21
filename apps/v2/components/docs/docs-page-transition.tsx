'use client';

import { usePathname } from 'next/navigation';

import { PageTransition } from '@/registry/components/page-transition';

// The same component in another library or framework is the same page: no
// transition.
const LIBRARY =
  /^\/docs\/primitives\/(?:radix-ui|base-ui|react-aria|reka-ui)\//;

// A page and its Vue version are the same page too (`/docs/vue/vue` is
// `/docs/react`'s).
const pageKey = (pathname: string) =>
  (pathname === '/docs/vue/vue'
    ? '/docs/react'
    : pathname.replace(/^\/docs\/vue(?=\/|$)/, '/docs')
  ).replace(LIBRARY, '/docs/primitives/');

export function DocsPageTransition(
  props: React.ComponentProps<typeof PageTransition>,
) {
  const pathname = usePathname();
  return <PageTransition pageKey={pageKey(pathname)} {...props} />;
}
