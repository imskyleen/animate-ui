'use client';

import {
  ArrowDown01Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  ChatGptIcon,
  ClaudeIcon,
  Copy01Icon,
  File02Icon,
  GithubIcon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';
import { DropdownMenu } from '@animate-ui/react/primitives/radix-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'cn';
import Link from 'next/link';
import { useState, type ComponentProps, type ReactNode } from 'react';

import { siteUrl } from '@/lib/shared';

import { IconSwap } from './icon-swap';

const button =
  'inline-flex h-8 items-center justify-center gap-1.5 bg-accent text-sm text-accent-foreground transition-colors hover:bg-accent/70';

function V0Logo(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 40 20" fill="currentColor" aria-hidden {...props}>
      <path d="M23.3919 0H32.9188C36.7819 0 39.9136 3.13165 39.9136 6.99475V16.0805H36.0006V6.99475C36.0006 6.90167 35.9969 6.80925 35.9898 6.71766L26.4628 16.079C26.4949 16.08 26.5272 16.0805 26.5595 16.0805H36.0006V19.7762H26.5595C22.6964 19.7762 19.4788 16.6139 19.4788 12.7508V3.68923H23.3919V12.7508C23.3919 12.9253 23.4054 13.0977 23.4316 13.2668L33.1682 3.6995C33.0861 3.6927 33.003 3.68923 32.9188 3.68923H23.3919V0Z" />
      <path d="M13.7688 19.0956L0 3.68759H5.53933L13.6231 12.7337V3.68759H17.7535V17.5746C17.7535 19.6705 15.1654 20.6584 13.7688 19.0956Z" />
    </svg>
  );
}

export function CopyPage({
  markdownUrl,
  githubUrl,
  v0Url,
}: {
  markdownUrl: string;
  githubUrl: string;
  v0Url?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const markdown = await fetch(markdownUrl).then((res) => res.text());
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const prompt = encodeURIComponent(
    `Read ${siteUrl}${markdownUrl} so I can ask questions about it.`,
  );
  const hugeicon = (icon: typeof File02Icon) => (
    <HugeiconsIcon icon={icon} strokeWidth={2} size={14} />
  );
  const items: { title: string; href: string; icon: ReactNode }[] = [
    {
      title: 'View as Markdown',
      href: markdownUrl,
      icon: hugeicon(File02Icon),
    },
    {
      title: 'Open in ChatGPT',
      href: `https://chatgpt.com/?hints=search&q=${prompt}`,
      icon: hugeicon(ChatGptIcon),
    },
    {
      title: 'Open in Claude',
      href: `https://claude.ai/new?q=${prompt}`,
      icon: hugeicon(ClaudeIcon),
    },
    ...(v0Url
      ? [
          {
            title: 'Open in v0',
            href: `https://v0.dev/chat/api/open?url=${encodeURIComponent(v0Url)}`,
            icon: <V0Logo className="w-3.5" />,
          },
        ]
      : []),
    { title: 'Edit on GitHub', href: githubUrl, icon: hugeicon(GithubIcon) },
  ];

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={copy}
        className={cn(button, 'rounded-l-md pr-3 pl-2.5')}
      >
        <IconSwap
          active={copied}
          icon={Copy01Icon}
          activeIcon={Tick02Icon}
          size={14}
        />
        Copy page
      </button>
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger
          aria-label="More page actions"
          className={cn(button, 'w-8 rounded-r-md border-l border-background')}
        >
          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} size={14} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="z-50 flex w-48 origin-(--radix-dropdown-menu-content-transform-origin) flex-col rounded-xl border bg-popover p-1 text-sm text-popover-foreground shadow-md"
          >
            {items.map((item) => (
              <DropdownMenu.Item key={item.title} asChild>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground outline-none transition-colors data-highlighted:bg-accent data-highlighted:text-foreground"
                >
                  {item.icon}
                  {item.title}
                </a>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}

type Neighbour = { name: string; url: string } | undefined;

export function PageNavigation({
  previous,
  next,
}: {
  previous: Neighbour;
  next: Neighbour;
}) {
  const arrow = (target: Neighbour, label: string, icon: typeof Copy01Icon) =>
    target ? (
      <Link
        href={target.url}
        aria-label={`${label}: ${target.name}`}
        title={target.name}
        className={cn(button, 'w-8 rounded-md')}
      >
        <HugeiconsIcon icon={icon} strokeWidth={2} size={14} />
      </Link>
    ) : (
      <span className={cn(button, 'w-8 rounded-md opacity-40')} aria-hidden>
        <HugeiconsIcon icon={icon} strokeWidth={2} size={14} />
      </span>
    );

  return (
    <div className="flex items-center gap-2">
      {arrow(previous, 'Previous', ArrowLeft02Icon)}
      {arrow(next, 'Next', ArrowRight02Icon)}
    </div>
  );
}
