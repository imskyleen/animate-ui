'use client';

import { AnimateIcon } from '@animate-ui/react/icons';
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'cn';
import { useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useRef, useState, type ReactNode } from 'react';

import { getLibrary, LIBRARIES, type LibraryId } from '@/lib/libraries';
import { BadgeLabel, type PageBadge } from '@/lib/page-badges';
import { usePreferredLibrary } from '@/lib/preferred-library';

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
  const [playing, setPlaying] = useState(false);
  const reduce = useReducedMotion();

  const start = () => {
    setHovered(true);
    const video = videoRef.current;
    if (!video || !preview || reduce) return;
    const theme = document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light';
    const src = `/previews/${preview}-${theme}.webm`;
    if (!video.src.endsWith(src)) video.src = src;
    void video.play().catch(() => {});
  };
  const stop = () => {
    setHovered(false);
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setPlaying(false);
  };

  return (
    <Link
      href={href}
      data-slot="preview-card"
      onPointerEnter={start}
      onPointerLeave={stop}
      onFocus={start}
      onBlur={stop}
      className="group flex flex-col rounded-2xl bg-accent p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-background">
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
        <span className="flex-1 truncate">{title}</span>
        {badge && <BadgeLabel badge={badge} className="mr-1" />}
        <HugeiconsIcon
          icon={ArrowUpRight01Icon}
          strokeWidth={2}
          size={16}
          className="shrink-0 text-muted-foreground transition-[color,translate] duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
        />
      </div>
    </Link>
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
