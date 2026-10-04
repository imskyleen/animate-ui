'use client';

import {
  AiElementsIcon,
  BookOpen02Icon,
  Cursor01Icon,
  GridIcon,
  Image02Icon,
  MagicWand01Icon,
  Menu01Icon,
  TextFontIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { ScrollFade } from '@animate-ui/react/primitives/effects/scroll-fade';
import { cn } from 'cn';
import {
  SidebarContent,
  SidebarDrawerContent,
  SidebarDrawerOverlay,
  SidebarItem,
} from 'fumadocs-ui/components/sidebar/base';
import { useTreeContext } from 'fumadocs-ui/contexts/tree';
import type { SidebarProps } from 'fumadocs-ui/layouts/docs/slots/sidebar';
import type * as PageTree from 'fumadocs-core/page-tree';
import { usePathname } from 'next/navigation';
import { useMemo, type ReactNode } from 'react';

import { AnimateUILogo, LIBRARIES, type LibraryId } from '@/lib/libraries';
import { ICON_LIBRARY_LOGOS } from '@/lib/icon-libraries';
import { usePreferredLibrary } from '@/lib/preferred-library';
import {
  primitiveSection,
  type PrimitiveSection,
} from '@/lib/primitive-sections';

import { AnimatedNav, NavItemContent, useNavHover } from './animated-nav';
import { GitHubLink, NAV_ITEMS, ThemeToggle } from './header';

type Link = { name: ReactNode; url: string; active: boolean };

const PRIMITIVES_URL = '/docs/primitives';
const BACKGROUNDS_URL = '/docs/backgrounds';
const ICONS_URL = '/docs/icons';

/** A Hugeicons icon, or a logo (Animate UI's). */
type SectionIcon = IconSvgElement | ReactNode;

const PRIMITIVE_SECTIONS: {
  id: PrimitiveSection;
  title: string;
  icon: SectionIcon;
}[] = [
  { id: 'libraries', title: 'Libraries', icon: AiElementsIcon },
  {
    id: 'animate-ui',
    title: 'Animate UI',
    icon: <AnimateUILogo className="size-3" />,
  },
  { id: 'buttons', title: 'Buttons', icon: Cursor01Icon },
  { id: 'texts', title: 'Texts', icon: TextFontIcon },
  { id: 'effects', title: 'Effects', icon: MagicWand01Icon },
];

/** The pages of a folder (Backgrounds, Icons), with an optional suffix cut. */
function folderLinks(folder: PageTree.Folder, suffix?: RegExp) {
  return folder.children.flatMap((page) =>
    page.type === 'page'
      ? [
          {
            name:
              suffix && typeof page.name === 'string'
                ? page.name.replace(suffix, '')
                : page.name,
            url: page.url,
          },
        ]
      : [],
  );
}

/** One entry per primitive, with the URL of each library that has it. */
type PrimitiveEntry = {
  name: ReactNode;
  slug: string;
  urls: Partial<Record<LibraryId, string>>;
};

function collectPrimitives(folder: PageTree.Folder | undefined) {
  const entries = new Map<string, PrimitiveEntry>();
  for (const library of folder?.children ?? []) {
    if (library.type !== 'folder') continue;
    for (const page of library.children) {
      if (page.type !== 'page') continue;
      const [, , , libraryId, slug] = page.url.split('/') as LibraryId[];
      if (!slug || !libraryId) continue;
      const entry = entries.get(slug) ?? { name: page.name, slug, urls: {} };
      entry.urls[libraryId] = page.url;
      entries.set(slug, entry);
    }
  }
  return [...entries.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}

function SectionTitle({
  icon,
  children,
}: {
  icon: SectionIcon;
  children: ReactNode;
}) {
  return (
    <p className="mb-2 flex items-center gap-2 px-2">
      <span className="relative flex size-5 items-center justify-center rounded-[5px] bg-border text-muted-foreground">
        {Array.isArray(icon) ? (
          <HugeiconsIcon
            icon={icon as IconSvgElement}
            strokeWidth={2}
            size={12}
          />
        ) : (
          (icon as ReactNode)
        )}
        <span className="absolute top-full left-1/2 h-2 w-px translate-x-[calc(-50%-0.5px)] bg-border" />
      </span>
      <span className="text-[13px] text-neutral-500">{children}</span>
    </p>
  );
}

function Item({ id, name, url, active }: Link & { id: string }) {
  const { hovered, hoverProps } = useNavHover(id);
  return (
    <SidebarItem
      href={url}
      active={active}
      className="relative ml-2 flex items-center py-1.5 pl-4 text-start"
      {...hoverProps}
    >
      <NavItemContent active={active} hovered={hovered}>
        {name}
      </NavItemContent>
    </SidebarItem>
  );
}

function Section({
  title,
  icon,
  links,
}: {
  title: string;
  icon: SectionIcon;
  links: Link[];
}) {
  if (links.length === 0) return null;
  return (
    <div className="mb-6 flex flex-col">
      <SectionTitle icon={icon}>{title}</SectionTitle>
      {links.map((link) => (
        <Item key={link.url} id={`${title}:${link.url}`} {...link} />
      ))}
    </div>
  );
}

// The scrolling list: no rubber-band bounce, and edges that fade only where
// there's more to scroll (Fumadocs' viewport masks them all the time).
function SidebarScroll({ children }: { children: ReactNode }) {
  return (
    <ScrollFade
      size={24}
      className="min-h-0 flex-1 overflow-y-auto overscroll-none p-4 px-2 pb-4 [scrollbar-width:none] max-md:pt-4 md:pb-14"
    >
      {children}
    </ScrollFade>
  );
}

function SidebarBody({ mobile }: { mobile: boolean }) {
  const { root } = useTreeContext();
  const pathname = usePathname();
  const preferred = usePreferredLibrary();

  const { guide, primitives, backgrounds, icons } = useMemo(() => {
    const guide: Omit<Link, 'active'>[] = [];
    let primitivesFolder: PageTree.Folder | undefined;
    let backgrounds: Omit<Link, 'active'>[] = [];
    let icons: Omit<Link, 'active'>[] = [];
    for (const node of root.children) {
      if (node.type === 'page') guide.push({ name: node.name, url: node.url });
      if (node.type === 'folder' && node.index) {
        guide.push({ name: node.name, url: node.index.url });
        if (node.index.url === PRIMITIVES_URL) primitivesFolder = node;
        // The section says it: "Bubble", not "Bubble Background".
        if (node.index.url === BACKGROUNDS_URL)
          backgrounds = folderLinks(node, / Background$/);
        // Icon libraries show their logo before their name.
        if (node.index.url === ICONS_URL)
          icons = folderLinks(node).map((link) =>
            ICON_LIBRARY_LOGOS[link.url]
              ? {
                  ...link,
                  name: (
                    <span className="flex items-center gap-2">
                      {ICON_LIBRARY_LOGOS[link.url]}
                      {link.name}
                    </span>
                  ),
                }
              : link,
          );
      }
    }
    return {
      guide,
      primitives: collectPrimitives(primitivesFolder),
      backgrounds,
      icons,
    };
  }, [root]);

  const sections = new Map<PrimitiveSection, Link[]>();
  for (const entry of primitives) {
    const libraries = LIBRARIES.filter((library) => entry.urls[library.id]);
    const library = libraries.find((l) => l.id === preferred) ?? libraries[0]!;
    const onlyAnimateUI = libraries.every((l) => l.id === 'animate-ui');
    const section = primitiveSection(entry.slug, onlyAnimateUI);
    sections.set(section, [
      ...(sections.get(section) ?? []),
      {
        name: entry.name,
        url: entry.urls[library.id]!,
        active: Object.values(entry.urls).includes(pathname),
      },
    ]);
  }

  return (
    <SidebarScroll>
      <AnimatedNav>
        {mobile && (
          <Section
            title="Menu"
            icon={Menu01Icon}
            // The Guide marks the current page: one active bar at a time.
            links={NAV_ITEMS.map((item) => ({
              name: item.title,
              url: item.url,
              active: false,
            }))}
          />
        )}
        <Section
          title="Guide"
          icon={BookOpen02Icon}
          links={guide.map((link) => ({
            ...link,
            active: pathname === link.url,
          }))}
        />
        {PRIMITIVE_SECTIONS.map((section) => (
          <Section
            key={section.id}
            title={section.title}
            icon={section.icon}
            links={sections.get(section.id) ?? []}
          />
        ))}
        <Section
          title="Backgrounds"
          icon={Image02Icon}
          links={backgrounds.map((link) => ({
            ...link,
            active: pathname === link.url,
          }))}
        />
        <Section
          title="Icons"
          icon={GridIcon}
          links={icons.map((link) => ({
            ...link,
            active: pathname === link.url,
          }))}
        />
      </AnimatedNav>
    </SidebarScroll>
  );
}

// `slots.sidebar.root` of DocsLayout: Fumadocs' placement, Animate UI's
// sections. Desktop shows it in the grid, mobile in a drawer.
export function Sidebar({ className }: SidebarProps) {
  return (
    <>
      <SidebarContent>
        {({ ref }) => (
          <div className="sticky top-(--fd-docs-row-1) z-20 h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] [grid-area:sidebar] max-md:hidden md:layout:[--fd-sidebar-width:268px]">
            <aside
              id="nd-sidebar"
              ref={ref as React.Ref<HTMLElement>}
              className={cn(
                'absolute inset-y-0 inset-s-0 flex w-full flex-col items-end pt-3 text-sm *:w-(--fd-sidebar-width)',
                className,
              )}
            >
              <SidebarBody mobile={false} />
            </aside>
          </div>
        )}
      </SidebarContent>

      <SidebarDrawerOverlay className="fixed inset-0 z-40 backdrop-blur-xs data-[state=closed]:animate-fd-fade-out data-[state=open]:animate-fd-fade-in" />
      <SidebarDrawerContent className="fixed inset-y-0 inset-e-0 z-40 flex w-[85%] max-w-[380px] flex-col border-s bg-background text-[0.9375rem] shadow-lg data-[state=closed]:animate-fd-sidebar-out data-[state=open]:animate-fd-sidebar-in">
        <SidebarBody mobile />
        <div className="flex items-center justify-between border-t p-3">
          <GitHubLink />
          <ThemeToggle />
        </div>
      </SidebarDrawerContent>
    </>
  );
}
