'use client';

import { AnimateIcon } from '@animate-ui/react/icons';
import { Button } from '@animate-ui/react/primitives/buttons/button';
import {
  ArrowUpRight01Icon,
  PlayIcon,
  StopIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'cn';
import { useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { getLibrary, LIBRARIES, type LibraryId } from '@/lib/libraries';
import { BadgeLabel, type PageBadge } from '@/lib/page-badges';
import { usePreferredLibrary } from '@/lib/preferred-library';

import { IconSwap } from './icon-swap';

export function PreviewCard({
  href,
  title,
  logo,
  badge,
  preview,
  children,
}: {
  href: string;
  title: ReactNode;
  logo?: ReactNode;
  badge?: PageBadge | null;
  preview?: string;
  children?: (hovered: boolean) => ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [playing, setPlaying] = useState(false);
  const reduce = useReducedMotion();
  const running = Boolean(preview) && hovered && !stopped;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !preview) return;
    if (running) {
      const theme = document.documentElement.classList.contains('dark')
        ? 'dark'
        : 'light';
      const src = `/previews/${preview}-${theme}.webm`;
      if (!video.src.endsWith(src)) video.src = src;
      void video.play().catch(() => {});
      return;
    }
    video.pause();
    video.currentTime = 0;
  }, [running, preview]);

  const enter = () => {
    if (hovered) return;
    setStopped(Boolean(reduce));
    setHovered(true);
  };
  const leave = () => {
    setHovered(false);
    setStopped(false);
  };

  return (
    <div
      data-slot="preview-card-root"
      className="group relative"
      onPointerEnter={enter}
      onPointerLeave={leave}
      onFocus={enter}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) leave();
      }}
    >
      <Link
        href={href}
        data-slot="preview-card"
        className="flex flex-col rounded-2xl bg-accent p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-background">
          {preview && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/previews/${preview}-light.jpg`}
                alt=""
                loading="lazy"
                className="absolute inset-0 size-full object-cover dark:hidden"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/previews/${preview}-dark.jpg`}
                alt=""
                loading="lazy"
                className="absolute inset-0 hidden size-full object-cover dark:block"
              />
              <video
                ref={videoRef}
                muted
                loop
                playsInline
                preload="none"
                aria-hidden="true"
                onPlaying={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                className={cn(
                  'absolute inset-0 size-full object-cover',
                  !playing && 'invisible',
                )}
              />
            </>
          )}
          {children?.(hovered)}
        </div>
        <div className="flex items-center gap-2 px-2.5 pt-2.5 pb-1.5 text-sm font-medium">
          {logo}
          <span className="min-w-0 truncate">{title}</span>
          {badge && <BadgeLabel badge={badge} />}
          <HugeiconsIcon
            icon={ArrowUpRight01Icon}
            strokeWidth={2}
            size={16}
            className="ml-auto shrink-0 text-muted-foreground transition-[color,translate] duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
          />
        </div>
      </Link>
      {preview && (
        <div className="pointer-events-none absolute inset-x-1.5 top-1.5 aspect-[4/3]">
          <Button
            type="button"
            data-slot="preview-card-play"
            aria-label={running ? 'Stop preview' : 'Play preview'}
            onClick={() => setStopped(running)}
            className="pointer-events-auto absolute right-2.5 bottom-2.5 flex size-8 scale-90 items-center justify-center rounded-full border bg-background/80 text-foreground opacity-0 shadow-sm backdrop-blur-sm transition-[opacity,scale] duration-150 ease-out outline-none group-hover:scale-100 group-hover:opacity-100 focus-visible:scale-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50 group-has-[:focus-visible]:scale-100 group-has-[:focus-visible]:opacity-100"
          >
            <IconSwap
              active={running}
              icon={PlayIcon}
              activeIcon={StopIcon}
              size={14}
            />
          </Button>
        </div>
      )}
    </div>
  );
}

export type PrimitiveCardEntry = {
  slug: string;
  title: string;
  badge: PageBadge | null;
  urls: Partial<Record<LibraryId, string>>;
};

export function PrimitiveCard({ entry }: { entry: PrimitiveCardEntry }) {
  const preferred = usePreferredLibrary();
  const libraries = LIBRARIES.filter((library) => entry.urls[library.id]);
  const library =
    libraries.find((l) => l.id === preferred) ??
    libraries[0] ??
    getLibrary('base-ui')!;
  return (
    <PreviewCard
      href={entry.urls[library.id] ?? Object.values(entry.urls)[0]!}
      title={entry.title}
      badge={entry.badge}
      preview={`primitives/${entry.slug}`}
    />
  );
}

export function PreviewGrid({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose grid grid-cols-1 gap-4 text-foreground sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  );
}

export function IconLibraryCard({
  href,
  title,
  logo,
  icons,
}: {
  href: string;
  title: string;
  logo: ReactNode;
  icons: React.ComponentType<{ size?: number }>[];
}) {
  return (
    <PreviewCard href={href} title={title} logo={logo}>
      {(hovered) => (
        <div className="absolute inset-0 grid grid-cols-4 place-items-center p-6 text-foreground">
          {icons.map((Icon) => (
            <AnimateIcon
              key={Icon.displayName ?? Icon.name}
              animate={hovered}
              loop
              loopDelay={400}
            >
              <span className="inline-flex">
                <Icon size={30} />
              </span>
            </AnimateIcon>
          ))}
        </div>
      )}
    </PreviewCard>
  );
}
