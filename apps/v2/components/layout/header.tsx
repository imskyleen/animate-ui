'use client';

import {
  ArrowDown01Icon,
  CommandIcon,
  GithubIcon,
  Menu01Icon,
  Moon02Icon,
  SunMediumIcon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';
import { DropdownMenu } from '@animate-ui/react/primitives/radix-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'cn';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { useSidebar } from 'fumadocs-ui/layouts/docs/slots/sidebar';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore, type ComponentProps } from 'react';

import { AnimateUILogo } from '@/lib/libraries';
import { docsVersions, gitConfig } from '@/lib/shared';
import { isVuePath, VUE_COLORS } from '@/lib/vue';
import {
  ThemeTogglerButton,
  ThemeTogglerButtonIcon,
  type Resolved,
  type ThemeSelection,
} from '@/registry/buttons/theme-toggler';

export const NAV_ITEMS = [
  { title: 'Home', url: '/' },
  { title: 'Docs', url: '/docs' },
  { title: 'Primitives', url: '/docs/primitives' },
  { title: 'Backgrounds', url: '/docs/backgrounds' },
  { title: 'Icons', url: '/docs/icons' },
];

const iconButton =
  'inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground';

function isActive(pathname: string, url: string) {
  if (url === '/' || url === '/docs') return pathname === url;
  return pathname === url || pathname.startsWith(`${url}/`);
}

function VersionMenu() {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger className="inline-flex h-6 items-center gap-1 rounded-md bg-accent px-2 text-xs font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50">
        {docsVersions[0].label}
        <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} size={12} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 flex w-40 origin-(--radix-dropdown-menu-content-transform-origin) flex-col rounded-xl border bg-popover p-1 text-sm text-popover-foreground shadow-md"
        >
          {docsVersions.map((version) => (
            <DropdownMenu.Item key={version.id} asChild>
              <a
                href={version.url}
                aria-current={version.id === 'v2' ? 'page' : undefined}
                className="flex items-center justify-between rounded-[9px] px-2 py-1.5 text-muted-foreground outline-none transition-colors data-highlighted:bg-accent data-highlighted:text-foreground aria-[current=page]:text-foreground"
              >
                <span>
                  {version.label}
                  {version.note && (
                    <span className="text-muted-foreground">
                      {' '}
                      ({version.note})
                    </span>
                  )}
                </span>
                {version.id === 'v2' && (
                  <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} size={14} />
                )}
              </a>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function SearchButton() {
  const { setOpenSearch } = useSearchContext();

  return (
    <button
      type="button"
      onClick={() => setOpenSearch(true)}
      className="flex h-8 w-48 max-w-full min-w-0 items-center justify-between gap-2 rounded-md bg-accent pr-1.5 pl-3 text-sm text-muted-foreground transition-colors hover:bg-accent/70 lg:w-56 xl:w-64"
    >
      <span className="truncate">Search...</span>
      <span className="flex shrink-0 items-center gap-1">
        <kbd className="flex size-5 items-center justify-center rounded-[4px] border bg-background">
          <HugeiconsIcon icon={CommandIcon} strokeWidth={2} size={10} />
        </kbd>
        <kbd className="flex size-5 items-center justify-center rounded-[4px] border bg-background text-[0.625rem] leading-none">
          K
        </kbd>
      </span>
    </button>
  );
}

const subscribeNever = () => () => {};

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const hydrated = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  if (!hydrated)
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={cn(iconButton, className)}
      >
        <HugeiconsIcon
          icon={SunMediumIcon}
          strokeWidth={2}
          size={18}
          className="dark:hidden"
        />
        <HugeiconsIcon
          icon={Moon02Icon}
          strokeWidth={2}
          size={18}
          className="hidden dark:block"
        />
      </button>
    );

  return (
    <ThemeTogglerButton
      theme={(theme ?? 'system') as ThemeSelection}
      resolvedTheme={(resolvedTheme ?? 'light') as Resolved}
      setTheme={setTheme}
      modes={['light', 'dark']}
      aria-label="Toggle theme"
      variant={null}
      size={null}
      className={cn(iconButton, className)}
    >
      <ThemeTogglerButtonIcon
        light={
          <HugeiconsIcon
            icon={SunMediumIcon}
            strokeWidth={2}
            size={18}
            className="size-[18px]"
          />
        }
        dark={
          <HugeiconsIcon
            icon={Moon02Icon}
            strokeWidth={2}
            size={18}
            className="size-[18px]"
          />
        }
      />
    </ThemeTogglerButton>
  );
}

export function GitHubLink({ className }: { className?: string }) {
  return (
    <a
      href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
      rel="noreferrer noopener"
      target="_blank"
      aria-label="GitHub"
      className={cn(iconButton, className)}
    >
      <HugeiconsIcon icon={GithubIcon} strokeWidth={2} size={18} />
    </a>
  );
}

export function SiteHeader({
  menu,
  ...props
}: ComponentProps<'header'> & { menu?: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <header
      {...props}
      className="fixed inset-x-0 top-0 z-40 h-14 bg-background [view-transition-name:header] md:h-17"
    >
      <div className="mx-auto flex h-full max-w-[1670px] items-center gap-3 px-3 md:px-5">
        <Link
          href="/"
          aria-label="Animate UI"
          className="flex size-8 items-center justify-center rounded-md transition-colors hover:bg-accent"
        >
          <AnimateUILogo
            className="size-5 md:size-4.5"
            style={
              isVuePath(pathname) ? { color: VUE_COLORS.green } : undefined
            }
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.url}
              href={item.url}
              className={cn(
                'inline-flex h-8 items-center rounded-md px-3 text-sm text-neutral-700 transition-colors hover:text-black dark:text-neutral-200 dark:hover:text-white',
                isActive(pathname, item.url) && 'text-black dark:text-white',
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-2 md:gap-3">
          <VersionMenu />
          <div className="min-w-0 shrink">
            <SearchButton />
          </div>
          <div className="flex items-center gap-1.5">
            <GitHubLink className="max-md:hidden" />
            <ThemeToggle className={menu ? 'max-md:hidden' : undefined} />
          </div>
          {menu ?? (
            <Link
              href="/docs"
              className="inline-flex h-8 items-center rounded-md px-3 text-sm md:hidden"
            >
              Docs
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function Header(props: ComponentProps<'header'>) {
  const { setOpen } = useSidebar();

  return (
    <SiteHeader
      {...props}
      menu={
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className={cn(iconButton, 'md:hidden')}
        >
          <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} size={20} />
        </button>
      }
    />
  );
}
