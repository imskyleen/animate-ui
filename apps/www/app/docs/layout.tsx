import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { DocsSidebar } from '@/components/docs/sidebar';
import { DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/app/layout.config';
import { source } from '@/lib/source';
import { ThemeSwitcher } from '@/components/animate/theme-switcher';
import XIcon from '@workspace/ui/components/icons/x-icon';
import { SIDEBAR_TABS } from '@/lib/sidebar';

const DOCS_LAYOUT_PROPS: DocsLayoutProps = {
  tree: source.pageTree,
  sidebar: {
    tabs: SIDEBAR_TABS,
    // tabs: [
    //   {
    //     title: 'Components',
    //     description: 'Animated Components',
    //     icon: (
    //       <div className="[&_svg]:size-full rounded-lg size-full text-muted-foreground max-md:bg-(--tab-color)/10 max-md:border max-md:p-1.5">
    //         <Component />
    //       </div>
    //     ),
    //     url: '/docs/components',
    //   },
    //   {
    //     title: 'Primitives',
    //     description: 'Animated Primitives',
    //     icon: (
    //       <div className="[&_svg]:size-full rounded-lg size-full text-muted-foreground max-md:bg-(--tab-color)/10 max-md:border max-md:p-1.5">
    //         <Cuboid />
    //       </div>
    //     ),
    //     url: '/docs/primitives',
    //   },
    //   {
    //     title: (
    //       <span>
    //         Icons{' '}
    //         <span
    //           className={cn(
    //             dancing.className,
    //             'text-sm ml-2 text-blue-600 dark:text-blue-400',
    //           )}
    //         >
    //           beta
    //         </span>
    //       </span>
    //     ),
    //     description: 'Animated Icons',
    //     icon: (
    //       <div className="[&_svg]:size-full rounded-lg size-full text-muted-foreground max-md:bg-(--tab-color)/10 max-md:border max-md:p-1.5">
    //         <LucideIcons />
    //       </div>
    //     ),
    //     url: '/docs/icons',
    //   },
    // ],
  },

  githubUrl: 'https://github.com/imskyleen/animate-ui',
  themeSwitch: {
    component: <ThemeSwitcher />,
  },
  ...baseOptions,
  links: [
    ...(baseOptions.links || []),
    {
      icon: <XIcon />,
      url: 'https://x.com/animate_ui',
      text: 'X',
      type: 'icon',
    },
  ],
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      {...DOCS_LAYOUT_PROPS}
      sidebar={{
        component: <DocsSidebar {...DOCS_LAYOUT_PROPS} />,
      }}
    >
      {children}
    </DocsLayout>
  );
}
