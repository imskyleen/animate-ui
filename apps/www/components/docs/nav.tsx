'use client';

import { Navbar } from 'fumadocs-ui/layouts/docs-client';
import Link from 'next/link';
import React from 'react';
import { IconLogo } from '../icon-logo';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { cn } from '@workspace/ui/lib/utils';
import { CommandIcon } from 'lucide-react';
import { useSearchContext, useSidebar } from 'fumadocs-ui/provider';
import { ThemeSwitcher } from '../animate/theme-switcher';
import XIcon from '@workspace/ui/components/icons/x-icon';
import { GithubStarsLogo } from '@/registry/primitives/animate/github-stars';
import { Menu } from '@/registry/icons/menu';

export const NAV_ITEMS = [
  {
    title: 'Docs',
    url: '/docs',
  },
  {
    title: 'Components',
    url: '/docs/components',
  },
  {
    title: 'Primitives',
    url: '/docs/primitives',
  },
  {
    title: 'Icons',
    url: '/docs/icons',
  },
];

const NavItem = ({ title, url }: { title: string; url: string }) => {
  return (
    <Link
      href={url}
      className={buttonVariants({
        color: 'ghost',
        size: 'sm',
        className: cn(
          '!text-sm !font-normal text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white !h-8 !px-3 transition-colors duration-200 ease-in-out',
        ),
      })}
    >
      {title}
    </Link>
  );
};

export const Nav = () => {
  const { setOpenSearch } = useSearchContext();
  const { open, setOpen } = useSidebar();

  return (
    <Navbar className="md:h-17 h-14 border-b-0 bg-background md:px-5 px-3 flex items-center gap-3 max-w-[1670px] w-full left-1/2 -translate-x-1/2">
      <Link
        href="/"
        className={buttonVariants({
          color: 'ghost',
          size: 'icon-sm',
          className:
            '[&_svg]:!size-5 md:[&_svg]:!size-4.5 !p-0 !size-8 transition-colors duration-200 ease-in-out',
        })}
      >
        <IconLogo size="sm" />
      </Link>

      <div className="flex items-center md:justify-between justify-end gap-2 flex-1">
        <div className="md:flex hidden items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.title} title={item.title} url={item.url} />
          ))}
        </div>

        <div className="flex items-center md:gap-3 gap-2">
          <button
            className="pl-3 pr-1.5 h-8 w-48 lg:w-56 xl:w-64 bg-accent hover:bg-accent/70 transition-colors duration-200 ease-in-out text-sm text-muted-foreground rounded-md flex items-center justify-between"
            onClick={() => setOpenSearch(true)}
          >
            <span className="font-normal">Search...</span>

            <div className="flex items-center gap-1">
              <kbd className="size-5 leading-none flex items-center justify-center border rounded-[4px] bg-background">
                <CommandIcon className="size-2.5" />
              </kbd>
              <kbd className="size-5 flex items-center justify-center border rounded-[4px] bg-background">
                <span className="leading-none text-[0.625rem] pt-px">K</span>
              </kbd>
            </div>
          </button>

          <div className="flex items-center gap-1 max-md:hidden">
            <a
              href="https://github.com/imskyleen/animate-ui"
              rel="noreferrer noopener"
              target="_blank"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-100 disabled:pointer-events-none disabled:opacity-50 hover:bg-fd-accent hover:text-fd-accent-foreground size-8 [&_svg]:size-5 text-fd-muted-foreground"
              data-active="false"
            >
              <GithubStarsLogo />
            </a>

            <a
              href="https://x.com/animate_ui"
              rel="noreferrer noopener"
              target="_blank"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-100 disabled:pointer-events-none disabled:opacity-50 hover:bg-fd-accent hover:text-fd-accent-foreground size-8 [&_svg]:size-5 text-fd-muted-foreground"
              data-active="false"
            >
              <XIcon />
            </a>
          </div>

          <ThemeSwitcher className="max-md:hidden" />

          <button
            className={cn(
              buttonVariants({
                color: 'ghost',
                size: 'icon-sm',
                className:
                  '!size-8 [&_svg]:!size-5 text-fd-muted-foreground md:hidden',
              }),
            )}
            onClick={() => setOpen((prev) => !prev)}
          >
            <Menu animate={open} />
          </button>
        </div>
      </div>
    </Navbar>
  );
};
