'use client';

import {
  AiElementsIcon,
  BookOpen02Icon,
  Cursor01Icon,
  MagicWand01Icon,
  Menu01Icon,
  SparklesIcon,
  TextFontIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { cn } from 'cn';
import {
  SidebarContent,
  SidebarDrawerContent,
  SidebarDrawerOverlay,
  SidebarItem,
  SidebarViewport,
} from 'fumadocs-ui/components/sidebar/base';
import { useTreeContext } from 'fumadocs-ui/contexts/tree';
import type { SidebarProps } from 'fumadocs-ui/layouts/docs/slots/sidebar';
import type * as PageTree from 'fumadocs-core/page-tree';
import { usePathname } from 'next/navigation';
import { useMemo, type ReactNode } from 'react';

import { LIBRARIES, type LibraryId } from '@/lib/libraries';
import { usePreferredLibrary } from '@/lib/preferred-library';
import {
  primitiveSection,
  type PrimitiveSection,
} from '@/lib/primitive-sections';

import { GitHubLink, NAV_ITEMS, ThemeToggle } from './header';

type Link = { name: ReactNode; url: string; active: boolean };

const PRIMITIVES_URL = '/docs/primitives';

const PRIMITIVE_SECTIONS: {
  id: PrimitiveSection;
  title: string;
  icon: IconSvgElement;
}[] = [
  { id: 'components', title: 'Components', icon: AiElementsIcon },
  { id: 'animate-ui', title: 'Animate UI', icon: SparklesIcon },
  { id: 'buttons', title: 'Buttons', icon: Cursor01Icon },
  { id: 'texts', title: 'Texts', icon: TextFontIcon },
  { id: 'effects', title: 'Effects', icon: MagicWand01Icon },
];

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
  icon: IconSvgElement;
  children: ReactNode;
}) {
  return (
    <p className="mb-2 flex items-center gap-2 px-2">
      <span className="relative flex size-5 items-center justify-center rounded-[5px] bg-border text-muted-foreground">
        <HugeiconsIcon icon={icon} strokeWidth={2} size={12} />
        <span className="absolute top-full left-1/2 h-2 w-px translate-x-[calc(-50%-0.5px)] bg-border" />
      </span>
      <span className="text-[13px] text-neutral-500">{children}</span>
    </p>
  );
}

function Item({ name, url, active }: Link) {
  return (
    <SidebarItem
      href={url}
      active={active}
      className="group relative ml-2 flex items-center py-1.5 pl-4 text-start"
    >
      <span className="absolute inset-y-0 left-[9px] w-px bg-border" />
      <span
        className={cn(
          'absolute top-1/2 left-[8px] h-[56%] w-[3px] -translate-y-1/2 rounded-full transition-colors',
          active
            ? 'bg-primary'
            : 'bg-transparent pointer-fine:group-hover:bg-neutral-300 dark:pointer-fine:group-hover:bg-neutral-600',
        )}
      />
      <span
        className={cn(
          'w-full pl-3 text-sm text-neutral-700 transition-[color,translate] duration-200 ease-out dark:text-neutral-200',
          active
            ? 'translate-x-[3px] text-black dark:text-white'
            : 'pointer-fine:group-hover:translate-x-[3px] pointer-fine:group-hover:text-black dark:pointer-fine:group-hover:text-white',
        )}
      >
        {name}
      </span>
    </SidebarItem>
  );
}

function Section({
  title,
  icon,
  links,
}: {
  title: string;
  icon: IconSvgElement;
  links: Link[];
}) {
  if (links.length === 0) return null;
  return (
    <div className="mb-6 flex flex-col">
      <SectionTitle icon={icon}>{title}</SectionTitle>
      {links.map((link) => (
        <Item key={link.url} {...link} />
      ))}
    </div>
  );
}

function SidebarBody({ mobile }: { mobile: boolean }) {
  const { root } = useTreeContext();
  const pathname = usePathname();
  const preferred = usePreferredLibrary();

  const { guide, primitives } = useMemo(() => {
    const guide: Omit<Link, 'active'>[] = [];
    let primitivesFolder: PageTree.Folder | undefined;
    for (const node of root.children) {
      if (node.type === 'page') guide.push({ name: node.name, url: node.url });
      if (node.type === 'folder' && node.index) {
        guide.push({ name: node.name, url: node.index.url });
        if (node.index.url === PRIMITIVES_URL) primitivesFolder = node;
      }
    }
    return { guide, primitives: collectPrimitives(primitivesFolder) };
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
    <SidebarViewport className="px-2 pb-4 max-md:pt-4 md:pb-14">
      {mobile && (
        <Section
          title="Menu"
          icon={Menu01Icon}
          links={NAV_ITEMS.map((item) => ({
            name: item.title,
            url: item.url,
            active: pathname === item.url,
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
    </SidebarViewport>
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
                'absolute inset-y-0 inset-s-0 flex w-full flex-col items-end pt-6 text-sm *:w-(--fd-sidebar-width)',
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
