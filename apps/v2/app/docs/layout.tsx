import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from 'fumadocs-ui/layouts/docs/slots/sidebar';

import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { source } from '@/lib/source';
import { PageTransition } from '@/registry/components/page-transition';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      slots={{
        header: Header,
        sidebar: {
          provider: SidebarProvider,
          root: Sidebar,
          trigger: SidebarTrigger,
          useSidebar,
        },
      }}
      containerProps={{
        className:
          'mx-auto max-w-[1670px] pt-(--fd-banner-height) [--fd-banner-height:--spacing(14)] md:[--fd-banner-height:--spacing(17)]',
      }}
    >
      <PageTransition
        effect="stack"
        className="col-[main-start/toc-end] row-[1/-1] grid grid-cols-subgrid grid-rows-subgrid"
      >
        {children}
      </PageTransition>
    </DocsLayout>
  );
}
