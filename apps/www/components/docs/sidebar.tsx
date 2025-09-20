'use client';

import { SidebarIcon } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import {
  Sidebar,
  SidebarCollapseTrigger,
  SidebarComponents,
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarFolderTrigger,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarSeparator,
  SidebarViewport,
} from 'fumadocs-ui/components/layout/sidebar';
import { HideIfEmpty } from 'fumadocs-core/hide-if-empty';
import Link from 'next/link';
import { CollapsibleControl } from 'fumadocs-ui/layouts/docs-client';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { LargeSearchToggle } from 'fumadocs-ui/components/layout/search-toggle';
import { RootToggle } from 'fumadocs-ui/components/layout/root-toggle';
import { getSidebarTabsFromOptions } from 'fumadocs-ui/layouts/docs/shared';
import { BaseLinkItem, LinkItemType } from 'fumadocs-ui/layouts/links';
import { DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
import { Fragment, useMemo, useState } from 'react';
import { getLinks } from 'fumadocs-ui/layouts/shared';
import { ThemeSwitcher } from '../animate/theme-switcher';
import { PageTree } from 'fumadocs-core/server';
import { useTreeContext } from 'fumadocs-ui/provider';
import { usePathname } from 'next/navigation';
import { isActive } from 'fumadocs-ui/utils/is-active';
import { AnimatePresence, motion } from 'motion/react';
import { Separator } from '@/lib/attach-separator';

const sidebarItemClassName =
  'relative hover:bg-transparent !bg-transparent ml-2 !pl-4 data-[active=true]:bg-transparent';

const getIsActive = (pathname: string, href: string) => {
  return href !== undefined && isActive(href, pathname, false);
};

export function SidebarPageTree(props: {
  components?: Partial<SidebarComponents>;
}) {
  const { root } = useTreeContext();
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return useMemo(() => {
    const { Separator, Item, Folder } = props.components ?? {};

    function renderSidebarList(items: PageTree.Node[]): React.ReactNode[] {
      return items.map((item, i) => {
        if (item.type === 'separator') {
          // @ts-ignore
          if (Separator) return <Separator key={i} item={item} />;
          return (
            <SidebarSeparator
              key={i}
              className={cn(i === 0 ? 'mb-2 mt-4' : 'mb-2 mt-8')}
            >
              {item.icon}
              {item.name}
            </SidebarSeparator>
          );
        }

        // @ts-ignore
        if (Item || Folder) return <Item key={item.url} item={item} />;

        // @ts-ignore
        const url = item.index?.url ?? item.url;
        const isActive = getIsActive(pathname, url);
        const isHovered = hoveredItem === url;

        return (
          <SidebarItem
            key={url}
            title={item.name as string}
            href={url}
            className={sidebarItemClassName}
            onMouseEnter={() => setHoveredItem(url)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <span className="h-full w-px bg-border absolute left-[9px] inset-y-0" />

            <AnimatePresence initial={false} mode="wait">
              {isActive && (
                <motion.span
                  layoutId="sidebar-item-active-indicator"
                  className="pointer-events-none absolute z-11 left-[9px] top-1/2 h-[50%] w-0.5 -translate-y-1/2 rounded-full bg-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 35,
                  }}
                />
              )}
            </AnimatePresence>

            <AnimatePresence initial={false} mode="wait">
              {isHovered && (
                <motion.span
                  layoutId="sidebar-item-hover-indicator"
                  className="pointer-events-none absolute z-10 left-[9px] top-1/2 h-[50%] w-0.5 -translate-y-1/2 rounded-full dark:bg-neutral-600 bg-neutral-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 35,
                  }}
                />
              )}
            </AnimatePresence>

            <motion.span
              className="text-sm font-medium w-full pl-[9px]"
              animate={{
                x: isHovered || isActive ? 3 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 20,
              }}
            >
              {item.name as string}
            </motion.span>
          </SidebarItem>
        );
      });
    }

    return (
      // @ts-ignore
      <Fragment key={root.$id}>{renderSidebarList(root.children, 1)}</Fragment>
    );
  }, [props.components, root, hoveredItem, pathname]);
}

export function SidebarLinkItem({
  item,
  ...props
}: {
  item: LinkItemType;
  className?: string;
}) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const pathname = usePathname();

  if (item.type === 'menu')
    return (
      <SidebarFolder {...props}>
        {item.url ? (
          <SidebarFolderLink href={item.url}>
            {item.icon}
            {item.text}
          </SidebarFolderLink>
        ) : (
          <SidebarFolderTrigger>
            {item.icon}
            {item.text}
          </SidebarFolderTrigger>
        )}
        <SidebarFolderContent>
          {item.items.map((child, i) => (
            <SidebarLinkItem key={i} item={child} />
          ))}
        </SidebarFolderContent>
      </SidebarFolder>
    );

  if (item.type === 'custom') {
    return <div {...props}>{item.children as React.ReactNode}</div>;
  }

  if (item.type === ('separator' as any)) {
    return (
      <SidebarSeparator className="mb-2">
        <Separator icon={item.icon} name={(item as any).name} />
      </SidebarSeparator>
    );
  }

  const isHovered = hoveredItem === item.url;
  const isActive = getIsActive(pathname, item.url);

  return (
    <SidebarItem
      href={item.url}
      icon={item.icon}
      external={item.external}
      className={sidebarItemClassName}
      onMouseEnter={() => setHoveredItem(item.url)}
      onMouseLeave={() => setHoveredItem(null)}
      {...props}
    >
      <span className="h-full w-px bg-border absolute left-[9px] inset-y-0" />

      <AnimatePresence initial={false} mode="wait">
        {isActive && (
          <motion.span
            layoutId="sidebar-item-active-indicator"
            className="pointer-events-none absolute z-11 left-[9px] top-1/2 h-[50%] w-0.5 -translate-y-1/2 rounded-full bg-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 35,
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence initial={false} mode="wait">
        {isHovered && (
          <motion.span
            layoutId="sidebar-item-hover-indicator"
            className="pointer-events-none absolute z-10 left-[9px] top-1/2 h-[50%] w-0.5 -translate-y-1/2 rounded-full dark:bg-neutral-600 bg-neutral-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 35,
            }}
          />
        )}
      </AnimatePresence>

      <motion.span
        className="text-sm font-medium w-full pl-[9px]"
        animate={{
          x: isHovered || isActive ? 3 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20,
        }}
      >
        {item.text as string}
      </motion.span>
    </SidebarItem>
  );
}

export const DocsSidebar = ({
  nav: { transparentMode, ...nav } = {},
  sidebar: {
    tabs: sidebarTabs,
    footer: sidebarFooter,
    banner: sidebarBanner,
    enabled: sidebarEnabled = true,
    collapsible: sidebarCollapsible = true,
    component: sidebarComponent,
    components: sidebarComponents,
    ...sidebarProps
  } = {},
  searchToggle = {},
  disableThemeSwitch = false,
  themeSwitch = { enabled: !disableThemeSwitch },
  i18n = false,
  children,
  ...props
}: DocsLayoutProps) => {
  const tabs = useMemo(
    () => getSidebarTabsFromOptions(sidebarTabs, props.tree) ?? [],
    [sidebarTabs, props.tree],
  );
  const links = getLinks(props.links ?? [], props.githubUrl);

  return (
    <>
      {sidebarCollapsible ? <CollapsibleControl /> : null}
      <Sidebar collapsible={sidebarCollapsible} {...sidebarProps}>
        <HideIfEmpty>
          <SidebarHeader className="data-[empty=true]:hidden mb-2">
            <div className="flex max-md:hidden">
              <Link
                href={nav.url ?? '/'}
                className="inline-flex text-[15px] items-center gap-2.5 font-medium me-auto"
              >
                {nav.title as React.ReactNode}
              </Link>
              {nav.children as React.ReactNode}
              {sidebarCollapsible && (
                <SidebarCollapseTrigger
                  className={cn(
                    buttonVariants({
                      color: 'ghost',
                      size: 'icon-sm',
                      className:
                        'mb-auto text-fd-muted-foreground max-md:hidden',
                    }),
                  )}
                >
                  <SidebarIcon />
                </SidebarCollapseTrigger>
              )}
            </div>
            {searchToggle.enabled !== false &&
              (searchToggle.components?.lg ?? (
                <LargeSearchToggle hideIfDisabled className="max-md:hidden" />
              ))}
            {tabs.length > 0 && <RootToggle options={tabs} />}

            {sidebarBanner}
          </SidebarHeader>
        </HideIfEmpty>

        <SidebarViewport className="[&_[data-radix-scroll-area-viewport]]:pb-8">
          {links
            .filter((v) => v.type !== 'icon')
            .map((item, i, list) => (
              <SidebarLinkItem
                key={i}
                item={item}
                className={cn(
                  item.type !== 'custom' && sidebarItemClassName,
                  i === list.length - 1 && 'mb-4',
                )}
              />
            ))}

          <SidebarPageTree components={sidebarComponents} />
        </SidebarViewport>

        <HideIfEmpty>
          <SidebarFooter className="data-[empty=true]:hidden">
            <div className="flex items-center justify-end empty:hidden">
              {links
                .filter((item) => item.type === 'icon')
                .map((item, i, arr) => (
                  // @ts-ignore
                  <BaseLinkItem
                    key={i}
                    item={item}
                    className={cn(
                      buttonVariants({ size: 'icon', color: 'ghost' }),
                      'text-fd-muted-foreground md:[&_svg]:size-4.5',
                      i === arr.length - 1 && 'me-auto',
                    )}
                    aria-label={item.label}
                  >
                    {item.icon}
                  </BaseLinkItem>
                ))}

              <ThemeSwitcher />
            </div>
            {sidebarFooter}
          </SidebarFooter>
        </HideIfEmpty>
      </Sidebar>
    </>
  );
};
