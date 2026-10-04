'use client';

import {
  ArrowDown01Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  ChatGptIcon,
  ClaudeIcon,
  Copy01Icon,
  File02Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'cn';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'fumadocs-ui/components/ui/popover';
import Link from 'next/link';
import { useState } from 'react';

import { siteUrl } from '@/lib/shared';

const button =
  'inline-flex h-8 items-center justify-center gap-1.5 bg-accent text-sm text-accent-foreground transition-colors hover:bg-accent/70';

export function CopyPage({ markdownUrl }: { markdownUrl: string }) {
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
  const items = [
    { title: 'View as Markdown', href: markdownUrl, icon: File02Icon },
    {
      title: 'Open in ChatGPT',
      href: `https://chatgpt.com/?hints=search&q=${prompt}`,
      icon: ChatGptIcon,
    },
    {
      title: 'Open in Claude',
      href: `https://claude.ai/new?q=${prompt}`,
      icon: ClaudeIcon,
    },
  ];

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={copy}
        className={cn(button, 'rounded-l-md pr-3 pl-2.5')}
      >
        <HugeiconsIcon
          icon={copied ? Tick02Icon : Copy01Icon}
          strokeWidth={2}
          size={14}
        />
        Copy page
      </button>
      <Popover>
        <PopoverTrigger
          aria-label="More page actions"
          className={cn(button, 'w-8 rounded-r-md border-l border-background')}
        >
          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} size={14} />
        </PopoverTrigger>
        <PopoverContent align="end" className="flex w-48 flex-col p-1 text-sm">
          {items.map((item) => (
            <a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <HugeiconsIcon icon={item.icon} strokeWidth={2} size={14} />
              {item.title}
            </a>
          ))}
        </PopoverContent>
      </Popover>
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
