'use client';

import { usePathname } from 'next/navigation';

import { PageTransition } from '@/registry/components/page-transition';

// The same component in another library or framework is the same page: no
// transition.
const LIBRARY =
  /^\/docs\/(?:vue\/)?primitives\/(?:radix-ui|base-ui|react-aria|reka-ui)\//;

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
