'use client';

import { usePathname } from 'next/navigation';

import { PageTransition } from '@/registry/components/page-transition';

// The same component in another library is the same page: no transition.
const LIBRARY = /^\/docs\/primitives\/(?:radix-ui|base-ui|react-aria)\//;

export function DocsPageTransition(
  props: React.ComponentProps<typeof PageTransition>,
) {
  const pathname = usePathname();
  return (
    <PageTransition
      pageKey={pathname.replace(LIBRARY, '/docs/primitives/')}
      {...props}
    />
  );
}
