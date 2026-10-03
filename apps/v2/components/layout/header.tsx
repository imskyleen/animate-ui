'use client';

import {
  ArrowDown01Icon,
  CommandIcon,
  GithubIcon,
  Menu01Icon,
  Moon02Icon,
  SunMediumIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'cn';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { useSidebar } from 'fumadocs-ui/layouts/docs/slots/sidebar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'fumadocs-ui/components/ui/popover';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';

import { AnimateUILogo } from '@/lib/libraries';
import { gitConfig } from '@/lib/shared';

export const NAV_ITEMS = [
  { title: 'Home', url: '/' },
  { title: 'Docs', url: '/docs' },
  { title: 'Primitives', url: '/docs/primitives' },
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
    <Popover>
      <PopoverTrigger className="inline-flex h-6 items-center gap-1 rounded-md bg-accent px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
        v2.0
        <HugeiconsIcon icon={ArrowDown01Icon} size={12} />
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-40 flex-col p-1 text-sm">
        <span className="rounded-sm bg-accent px-2 py-1.5 font-medium">
          v2.0 (latest)
        </span>
        <a
          href="https://v1.animate-ui.com"
          className="rounded-sm px-2 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          v1
        </a>
      </PopoverContent>
    </Popover>
  );
}

function SearchButton() {
  const { setOpenSearch } = useSearchContext();

  return (
    <button
      type="button"
      onClick={() => setOpenSearch(true)}
      className="flex h-8 w-48 items-center justify-between rounded-md bg-accent pr-1.5 pl-3 text-sm text-muted-foreground transition-colors hover:bg-accent/70 lg:w-56 xl:w-64"
    >
      <span>Search...</span>
      <span className="flex items-center gap-1">
        <kbd className="flex size-5 items-center justify-center rounded-[4px] border bg-background">
          <HugeiconsIcon icon={CommandIcon} size={10} />
        </kbd>
        <kbd className="flex size-5 items-center justify-center rounded-[4px] border bg-background text-[0.625rem] leading-none">
          K
        </kbd>
      </span>
    </button>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className={cn(iconButton, className)}
    >
      {/* Both icons render; CSS shows the right one, so SSR matches. */}
      <HugeiconsIcon icon={SunMediumIcon} size={18} className="dark:hidden" />
      <HugeiconsIcon
        icon={Moon02Icon}
        size={18}
        className="hidden dark:block"
      />
    </button>
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
      <HugeiconsIcon icon={GithubIcon} size={18} />
    </a>
  );
}

// `slots.header` of DocsLayout: fixed and full width above the docs grid;
// the layout reserves its height through `--fd-banner-height`.
export function Header(props: ComponentProps<'header'>) {
  const pathname = usePathname();
  const { setOpen } = useSidebar();

  return (
    <header
      {...props}
      className="fixed inset-x-0 top-0 z-40 h-14 bg-background md:h-17"
    >
      <div className="mx-auto flex h-full max-w-[1670px] items-center gap-3 px-3 md:px-5">
        <Link
          href="/"
          aria-label="Animate UI"
          className="flex size-8 items-center justify-center rounded-md transition-colors hover:bg-accent"
        >
          <AnimateUILogo className="size-5 md:size-4.5" />
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

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <VersionMenu />
          <div className="max-md:hidden">
            <SearchButton />
          </div>
          <GitHubLink className="max-md:hidden" />
          <ThemeToggle className="max-md:hidden" />
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className={cn(iconButton, 'md:hidden')}
          >
            <HugeiconsIcon icon={Menu01Icon} size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
