import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from 'fumadocs-ui/layouts/docs/slots/sidebar';
import type { ReactNode } from 'react';
import { DocsSidebar } from '@/components/docs/sidebar';
import { source } from '@/lib/source';
import { SIDEBAR_TABS } from '@/lib/sidebar';
import { Nav } from '@/components/docs/nav';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      tabs={SIDEBAR_TABS}
      githubUrl="https://github.com/imskyleen/animate-ui"
      slots={{
        header: Nav,
        sidebar: {
          provider: SidebarProvider,
          root: DocsSidebar,
          trigger: SidebarTrigger,
          useSidebar,
        },
      }}
      containerProps={{
        // Reserve room for the fixed, full-width <Nav />.
        className:
          '[--fd-banner-height:--spacing(14)] md:[--fd-banner-height:--spacing(17)] pt-(--fd-banner-height) max-w-[1670px] mx-auto',
      }}
    >
      {children}
    </DocsLayout>
  );
}
