'use client';

import { cn } from 'cn';
import { useInView, useReducedMotion } from 'motion/react';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

import { PAGE_TRANSITION_EFFECTS } from '@/lib/page-transition-effects';

function EffectTile({
  effect,
  description,
}: {
  effect: string;
  description: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(rootRef, { amount: 0.5 });
  const reduce = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const running = reduce ? hovered : inView;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!running) {
      video.pause();
      return;
    }
    const theme = document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light';
    const src = `/previews/page-transition/${effect}-${theme}.webm`;
    if (!video.src.endsWith(src)) video.src = src;
    void video.play().catch(() => {});
  }, [running, resolvedTheme, effect]);

  return (
    <div
      ref={rootRef}
      data-slot="page-transition-effect"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className="flex flex-col rounded-2xl bg-accent p-1.5"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-background">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/previews/page-transition/${effect}-light.jpg`}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-cover dark:hidden"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/previews/page-transition/${effect}-dark.jpg`}
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
      </div>
      <div className="flex flex-col gap-0.5 px-2.5 pt-2.5 pb-1.5">
        <code className="text-sm font-medium">{effect}</code>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </div>
  );
}

export function PageTransitionEffects() {
  return (
    <div className="not-prose grid grid-cols-1 gap-4 text-foreground sm:grid-cols-2 lg:grid-cols-3">
      {PAGE_TRANSITION_EFFECTS.map(([effect, description]) => (
        <EffectTile key={effect} effect={effect} description={description} />
      ))}
    </div>
  );
}
