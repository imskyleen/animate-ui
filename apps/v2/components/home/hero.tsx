'use client';

import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@animate-ui/react/primitives/buttons/button';
import { ease, ReducedMotionConfig } from '@animate-ui/react/utils/motion';
import { motion } from 'motion/react';
import { cn } from 'cn';
import Link from 'next/link';
import { useState } from 'react';

import { IconSwap } from '@/components/docs/icon-swap';
import { useIntroDone } from '@/components/home/intro';
import {
  MANAGER_GROUP,
  MANAGER_NAMES,
  MANAGERS,
  type Manager,
} from '@/components/docs/package-managers';
import { useSyncedValue } from '@/components/docs/tabs';
import { LIBRARIES } from '@/lib/libraries';

const command = (manager: Manager) =>
  `${MANAGERS[manager].dlx} @animate-ui/cli@latest animate all`;

const rise = (index: number, done: boolean) => ({
  initial: { opacity: 0, y: 20, filter: 'blur(10px)' },
  animate: done
    ? { opacity: 1, y: 0, filter: 'blur(0px)' }
    : { opacity: 0, y: 20, filter: 'blur(10px)' },
  transition: { duration: 0.7, ease: ease.out, delay: index * 0.09 },
});

export function CopyCommand() {
  const [copied, setCopied] = useState(false);
  const [manager, setManager] = useSyncedValue(MANAGER_NAMES, {
    groupId: MANAGER_GROUP,
    persist: true,
  });
  const COMMAND = command(manager as Manager);
  return (
    <div className="flex max-w-full flex-col items-center gap-2">
      <div
        role="radiogroup"
        aria-label="Package manager"
        className="flex gap-1 text-xs"
      >
        {MANAGER_NAMES.map((name) => (
          <button
            key={name}
            type="button"
            role="radio"
            aria-checked={name === manager}
            onClick={() => setManager(name)}
            className={cn(
              'rounded-md px-2 py-1 transition-colors',
              name === manager
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {name}
          </button>
        ))}
      </div>
      <Button
        type="button"
        aria-label={copied ? 'Copied' : 'Copy the command'}
        onClick={async () => {
          await navigator.clipboard.writeText(COMMAND);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="group flex h-11 max-w-full items-center gap-3 rounded-xl border bg-accent/40 pr-3 pl-4 font-mono text-sm transition-colors hover:bg-accent"
      >
        <span className="text-muted-foreground select-none">$</span>
        <span className="truncate">{COMMAND}</span>
        <IconSwap
          active={copied}
          icon={Copy01Icon}
          activeIcon={Tick02Icon}
          size={16}
          className="text-muted-foreground group-hover:text-foreground"
        />
      </Button>
    </div>
  );
}

export function Hero() {
  const done = useIntroDone();
  return (
    <ReducedMotionConfig>
      <section className="flex flex-col items-center px-5 pt-32 text-center md:pt-40">
        <motion.div {...rise(0, done)}>
          <Link
            href="/docs/changelog"
            className="mb-8 inline-flex items-center gap-2 rounded-full bg-accent py-1 pr-3 pl-1 text-sm text-neutral-600 dark:text-neutral-400"
          >
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              v2
            </span>
            Animate UI is now a package
          </Link>
        </motion.div>

        <motion.h1
          {...rise(1, done)}
          className="max-w-[800px] text-4xl font-medium text-balance md:text-6xl"
        >
          Animate your shadcn/ui components in one command
        </motion.h1>

        <motion.p
          {...rise(2, done)}
          className="mt-5 max-w-[620px] text-lg text-balance text-muted-foreground"
        >
          Drop-in animated primitives for Radix UI, Base UI and React Aria. Swap
          the import, keep your components, your styles and your API.
        </motion.p>

        <motion.div
          {...rise(3, done)}
          className="mt-8 flex max-w-full flex-col items-center gap-4"
        >
          <CopyCommand />
          <div className="flex gap-3">
            <Link
              href="/docs"
              className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
            >
              Get started
            </Link>
            <Link
              href="/docs/primitives"
              className="inline-flex h-10 items-center rounded-lg border px-5 text-sm font-medium transition-colors hover:bg-accent"
            >
              Browse primitives
            </Link>
          </div>
        </motion.div>

        <motion.div
          {...rise(4, done)}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
        >
          {LIBRARIES.filter((library) => library.peer).map(
            ({ id, title, Logo }) => (
              <span key={id} className="flex items-center gap-2">
                <Logo className="size-4" />
                {title}
              </span>
            ),
          )}
        </motion.div>
      </section>
    </ReducedMotionConfig>
  );
}
