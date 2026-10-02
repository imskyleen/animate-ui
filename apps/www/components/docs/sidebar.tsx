'use client';

import { cn } from '@workspace/ui/lib/utils';
import {
  SidebarContent,
  SidebarDrawerContent,
  SidebarDrawerOverlay,
  SidebarItem,
  SidebarSeparator,
  SidebarViewport,
} from 'fumadocs-ui/components/sidebar/base';
import type { SidebarProps } from 'fumadocs-ui/layouts/docs/slots/sidebar';
import { useTreeContext } from 'fumadocs-ui/contexts/tree';
import type * as PageTree from 'fumadocs-core/page-tree';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SquareMenu } from 'lucide-react';
import { Separator } from '@/lib/attach-separator';
import { baseOptions } from '@/app/layout.config';
import { NAV_ITEMS, SocialLinks } from './nav';
import { ThemeSwitcher } from '../animate/theme-switcher';

type SidebarLink =
  | { type: 'separator'; name: string; icon: ReactNode }
  | { type?: 'main'; text: string; url: string };

// Guide links come from the shared layout config (separator + pages).
const GUIDE_LINKS = (baseOptions.links ?? []) as SidebarLink[];

// On mobile the top navigation is hidden: its sections move into the drawer.
const MENU_LINKS: SidebarLink[] = [
  { type: 'separator', name: 'Menu', icon: <SquareMenu /> },
  ...NAV_ITEMS.filter((item) => item.title !== 'Docs').map((item) => ({
    text: item.title,
    url: item.url,
  })),
];

const isActivePath = (pathname: string, href: string) =>
  pathname === href || pathname === `${href}/`;

const indicatorTransition = {
  type: 'spring',
  stiffness: 500,
  damping: 35,
} as const;

function AnimatedItem({
  url,
  external,
  children,
  hoveredUrl,
  onHover,
}: {
  url: string;
  external?: boolean;
  children: ReactNode;
  hoveredUrl: string | null;
  onHover: (url: string | null) => void;
}) {
  const pathname = usePathname();
  const isActive = isActivePath(pathname, url);
  const isHovered = hoveredUrl === url;

  return (
    <SidebarItem
      href={url}
      external={external}
      active={isActive}
      className="relative flex items-center ml-2 py-1.5 pl-4 text-start"
      onMouseEnter={() => onHover(url)}
      onMouseLeave={() => onHover(null)}
    >
      <span className="h-full w-px bg-border absolute left-[9px] inset-y-0" />

      <AnimatePresence initial={false} mode="wait">
        {isActive && (
          <motion.span
            layoutId="sidebar-item-active-indicator"
            className="pointer-events-none absolute z-11 left-[8px] top-1/2 h-[56%] w-[3px] -translate-y-1/2 rounded-full bg-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={indicatorTransition}
          />
        )}
      </AnimatePresence>

      <AnimatePresence initial={false} mode="wait">
        {isHovered && (
          <motion.span
            layoutId="sidebar-item-hover-indicator"
            className="pointer-events-none absolute z-10 left-[8px] top-1/2 h-[56%] w-[3px] -translate-y-1/2 rounded-full dark:bg-neutral-600 bg-neutral-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={indicatorTransition}
          />
        )}
      </AnimatePresence>

      <motion.span
        className={cn(
          'text-sm w-full pl-[12px] text-neutral-700 dark:text-neutral-200',
          (isActive || isHovered) && 'text-black dark:text-white',
        )}
        animate={{ x: isHovered || isActive ? 3 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {children}
      </motion.span>
    </SidebarItem>
  );
}

function SidebarLinks({
  links,
  className,
  hoveredUrl,
  onHover,
}: {
  links: SidebarLink[];
  className?: string;
  hoveredUrl: string | null;
  onHover: (url: string | null) => void;
}) {
  return (
    <div className={cn('flex flex-col mb-4', className)}>
      {links.map((link, i) =>
        link.type === 'separator' ? (
          <SidebarSeparator key={i} className="mb-2 px-2">
            <Separator icon={link.icon} name={link.name} />
          </SidebarSeparator>
        ) : (
          <AnimatedItem
            key={link.url}
            url={link.url}
            hoveredUrl={hoveredUrl}
            onHover={onHover}
          >
            {link.text}
          </AnimatedItem>
        ),
      )}
    </div>
  );
}

// A folder links to its index page, or to its shortest page URL when the index
// is listed as a regular page (e.g. Icons).
function getFolderUrl(folder: PageTree.Folder): string | undefined {
  if (folder.index) return folder.index.url;
  return folder.children
    .flatMap((child) => (child.type === 'page' ? [child.url] : []))
    .sort((a, b) => a.length - b.length)[0];
}

function PageTreeNodes({
  nodes,
  hoveredUrl,
  onHover,
}: {
  nodes: PageTree.Node[];
  hoveredUrl: string | null;
  onHover: (url: string | null) => void;
}) {
  return nodes.map((node, i) => {
    if (node.type === 'separator') {
      return (
        <SidebarSeparator
          key={i}
          className={cn('px-2', i === 0 ? 'mb-2 mt-4' : 'mb-2 mt-8')}
        >
          {node.icon}
          {node.name}
        </SidebarSeparator>
      );
    }

    // Folders (components, primitives, icons) link to their index page;
    // their content lives in their own sidebar tab.
    const url = node.type === 'folder' ? getFolderUrl(node) : node.url;
    if (!url) return null;

    return (
      <AnimatedItem
        key={url}
        url={url}
        external={node.type === 'page' ? node.external : undefined}
        hoveredUrl={hoveredUrl}
        onHover={onHover}
      >
        {node.name}
      </AnimatedItem>
    );
  });
}

function SidebarBody({ mobile }: { mobile: boolean }) {
  const { root } = useTreeContext();
  const pathname = usePathname();
  const [hoveredUrl, setHoveredUrl] = useState<string | null>(null);

  // Outside of components/primitives/icons, mobile only shows the menu.
  const isSection = [
    '/docs/primitives',
    '/docs/components',
    '/docs/icons',
  ].some((prefix) => pathname.startsWith(prefix));

  return (
    <SidebarViewport viewport={{ className: 'md:pb-14 pb-4 max-md:pt-2 px-2' }}>
      <SidebarLinks
        links={GUIDE_LINKS}
        hoveredUrl={hoveredUrl}
        onHover={setHoveredUrl}
      />
      {mobile && (
        <SidebarLinks
          links={MENU_LINKS}
          className="mt-4"
          hoveredUrl={hoveredUrl}
          onHover={setHoveredUrl}
        />
      )}
      {(!mobile || isSection) && (
        <PageTreeNodes
          key={root.$id}
          nodes={root.children}
          hoveredUrl={hoveredUrl}
          onHover={setHoveredUrl}
        />
      )}
    </SidebarViewport>
  );
}

// Custom `slots.sidebar.root` for DocsLayout: same placement as Fumadocs'
// default sidebar, with Animate UI's animated items.
export function DocsSidebar({ className }: SidebarProps) {
  return (
    <>
      <SidebarContent>
        {({ ref }) => (
          <div className="sticky top-(--fd-docs-row-1) z-20 [grid-area:sidebar] h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] md:layout:[--fd-sidebar-width:268px] max-md:hidden">
            <aside
              id="nd-sidebar"
              ref={ref as React.Ref<HTMLElement>}
              className={cn(
                'absolute flex flex-col w-full inset-s-0 inset-y-0 items-end text-sm *:w-(--fd-sidebar-width)',
                className,
              )}
            >
              <SidebarBody mobile={false} />
            </aside>
          </div>
        )}
      </SidebarContent>

      <SidebarDrawerOverlay className="fixed z-40 inset-0 backdrop-blur-xs data-[state=open]:animate-fd-fade-in data-[state=closed]:animate-fd-fade-out" />
      <SidebarDrawerContent className="fixed text-[0.9375rem] flex flex-col shadow-lg border-s inset-e-0 inset-y-0 w-[85%] max-w-[380px] z-40 bg-fd-background data-[state=open]:animate-fd-sidebar-in data-[state=closed]:animate-fd-sidebar-out">
        <SidebarBody mobile />
        <div className="flex items-center justify-between border-t p-3">
          <SocialLinks />
          <ThemeSwitcher />
        </div>
      </SidebarDrawerContent>
    </>
  );
}
