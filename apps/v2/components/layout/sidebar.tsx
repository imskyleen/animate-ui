'use client';

import {
  BookOpen02Icon,
  ComponentIcon,
  Cursor01Icon,
  GridIcon,
  Image02Icon,
  MagicWand01Icon,
  Menu01Icon,
  TextFontIcon,
  TextNumberSignIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  motionTokens,
  scaleTransition,
  useMotionTokens,
  useShouldReduceMotion,
} from '@animate-ui/react/utils/motion';
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
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { usePathname } from 'next/navigation';
import { Fragment, useMemo, useState, type ReactNode } from 'react';

import { AnimateUILogo, LIBRARIES, type LibraryId } from '@/lib/libraries';
import { ICON_LIBRARY_LOGOS } from '@/lib/icon-libraries';
import { usePreferredLibrary } from '@/lib/preferred-library';
import {
  primitiveSection,
  type PrimitiveSection,
} from '@/lib/primitive-sections';

import { AnimatedNav, NavItemContent, useNavHover } from './animated-nav';
import { FrameworkSwitch } from './framework-switch';
import { GitHubLink, NAV_ITEMS, ThemeToggle } from './header';

type Link = { name: ReactNode; url: string; active: boolean };

const CHANGELOG_URL = '/docs/changelog';

type SectionIcon = IconSvgElement | ReactNode;

const PRIMITIVE_SECTIONS: {
  id: PrimitiveSection;
  title: string;
  icon: SectionIcon;
}[] = [
  { id: 'components', title: 'Components', icon: ComponentIcon },
  {
    id: 'animate-ui',
    title: 'Animate UI',
    icon: <AnimateUILogo className="size-3" />,
  },
  { id: 'buttons', title: 'Buttons', icon: Cursor01Icon },
  { id: 'texts', title: 'Texts', icon: TextFontIcon },
  { id: 'numbers', title: 'Numbers', icon: TextNumberSignIcon },
  { id: 'effects', title: 'Effects', icon: MagicWand01Icon },
];

const SECTION_SUFFIX: Partial<Record<PrimitiveSection, RegExp>> = {
  texts: /(?<=\S) Text$/,
  buttons: /(?<=\S) Button$/,
  numbers: /(?<=\S) Number$/,
};

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
      const [libraryId, slug] = page.url.split('/').slice(-2) as LibraryId[];
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
      className="relative ml-2 flex items-center py-1.5 pr-1 pl-4 text-start"
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
  hideSuffix,
}: {
  title: string;
  icon: SectionIcon;
  links: Link[];
  hideSuffix?: boolean;
}) {
  if (links.length === 0) return null;
  return (
    <div
      className={cn(
        'mb-6 flex flex-col',
        hideSuffix && '[&_[data-slot=name-suffix]]:hidden',
      )}
    >
      <SectionTitle icon={icon}>{title}</SectionTitle>
      {links.map((link) => (
        <Item key={link.url} id={`${title}:${link.url}`} {...link} />
      ))}
    </div>
  );
}

function SidebarScroll({ children }: { children: ReactNode }) {
  return (
    <div
      data-slot="sidebar-scroll"
      className="min-h-0 flex-1 scroll-fade-y overflow-y-auto overscroll-none px-6 pt-6 pb-8 [scrollbar-width:none] md:pb-18"
    >
      {children}
    </div>
  );
}

const FRAMEWORK_ORDER = { react: 0, vue: 1 };

const panel: Variants = {
  hidden: ({ way, reduce }: Slide) => ({
    opacity: 0,
    x: reduce ? 0 : way * motionTokens.shift.tabs,
    filter: motionTokens.blur.panel,
  }),
  shown: ({ tempo }: Slide) => ({
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transitionEnd: { filter: 'none' },
    transition: scaleTransition(motionTokens.transition.panelIn, tempo),
  }),
  gone: ({ way, reduce, tempo }: Slide) => ({
    opacity: 0,
    x: reduce ? 0 : -way * motionTokens.shift.tabs,
    filter: motionTokens.blur.panel,
    transition: scaleTransition(motionTokens.transition.panelOut, tempo),
  }),
};

type Slide = { way: number; reduce: boolean; tempo: number };

/** The sidebar's links change framework like tab panels: out, then in, sliding toward the tab picked. */
function FrameworkPanel({
  framework,
  children,
}: {
  framework: keyof typeof FRAMEWORK_ORDER;
  children: ReactNode;
}) {
  const reduce = useShouldReduceMotion();
  const { tempo } = useMotionTokens();
  const [shown, setShown] = useState({ framework, way: 1 });
  if (shown.framework !== framework)
    setShown({
      framework,
      way:
        FRAMEWORK_ORDER[framework] > FRAMEWORK_ORDER[shown.framework] ? 1 : -1,
    });
  const slide: Slide = { way: shown.way, reduce, tempo };

  return (
    <AnimatePresence mode="wait" initial={false} custom={slide}>
      <motion.div
        key={framework}
        custom={slide}
        variants={panel}
        initial="hidden"
        animate="shown"
        exit="gone"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function MenuSection() {
  return (
    <Section
      title="Menu"
      icon={Menu01Icon}
      links={NAV_ITEMS.map((item) => ({
        name: item.title,
        url: item.url,
        active: false,
      }))}
    />
  );
}

function SidebarBody({ mobile }: { mobile: boolean }) {
  const { root, full } = useTreeContext();
  const pathname = usePathname();
  const preferred = usePreferredLibrary();
  const frameworkRoot =
    root.type === 'folder' && (root as PageTree.Folder).root
      ? (root as PageTree.Folder)
      : null;

  const { guide, primitives, backgrounds, icons } = useMemo(() => {
    const docs = frameworkRoot ? '/docs/vue' : '/docs';
    const guide: Omit<Link, 'active'>[] = [];
    let primitivesFolder: PageTree.Folder | undefined;
    let backgrounds: Omit<Link, 'active'>[] = [];
    let icons: Omit<Link, 'active'>[] = [];
    for (const node of root.children) {
      if (node.type === 'page') guide.push({ name: node.name, url: node.url });
      if (node.type === 'folder' && node.root) continue;
      if (node.type === 'folder' && node.index) {
        guide.push({ name: node.index.name, url: node.index.url });
        if (node.index.url === `${docs}/primitives`) primitivesFolder = node;
        if (node.index.url === `${docs}/backgrounds`)
          backgrounds = folderLinks(node, / Background$/);
        if (node.index.url === `${docs}/icons`)
          icons = folderLinks(node).map((link) => {
            const logo = ICON_LIBRARY_LOGOS[link.url.replace(docs, '/docs')];
            return logo
              ? {
                  ...link,
                  name: (
                    <span className="flex items-center gap-2">
                      <Fragment key="logo">{logo}</Fragment>
                      <Fragment key="name">{link.name}</Fragment>
                    </span>
                  ),
                }
              : link;
          });
      }
    }
    // The changelog covers every framework.
    const changelog = full.children.find(
      (node) => node.type === 'page' && node.url === CHANGELOG_URL,
    );
    if (frameworkRoot && changelog?.type === 'page')
      guide.push({ name: changelog.name, url: changelog.url });
    return {
      guide,
      primitives: collectPrimitives(primitivesFolder),
      backgrounds,
      icons,
    };
  }, [root, full, frameworkRoot]);

  const sections = new Map<PrimitiveSection, Link[]>();
  for (const entry of primitives) {
    const libraries = LIBRARIES.filter((library) => entry.urls[library.id]);
    const library = libraries.find((l) => l.id === preferred) ?? libraries[0]!;
    const onlyAnimateUI = libraries.every((l) => l.id === 'animate-ui');
    const section = primitiveSection(entry.slug, onlyAnimateUI);
    sections.set(section, [
      ...(sections.get(section) ?? []),
      {
        name:
          typeof entry.name === 'string' && SECTION_SUFFIX[section]
            ? entry.name.replace(SECTION_SUFFIX[section], '')
            : entry.name,
        url: entry.urls[library.id]!,
        active: Object.values(entry.urls).includes(pathname),
      },
    ]);
  }

  return (
    <>
      <div className="shrink-0 px-6 pt-4 max-md:pt-8">
        <FrameworkSwitch />
      </div>
      <SidebarScroll>
        <FrameworkPanel framework={frameworkRoot ? 'vue' : 'react'}>
          <AnimatedNav>
            {mobile && <MenuSection />}
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
                hideSuffix={section.id in SECTION_SUFFIX}
              />
            ))}
            <Section
              title="Backgrounds"
              icon={Image02Icon}
              hideSuffix
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
        </FrameworkPanel>
      </SidebarScroll>
    </>
  );
}

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
