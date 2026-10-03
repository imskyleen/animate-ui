'use client';

import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ReducedMotionConfig,
  transition,
} from '@animate-ui/react/utils/motion';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';

import { LIBRARIES } from '@/lib/libraries';

const COMMAND = 'pnpm dlx @animate-ui/cli@latest animate all';

// Each block rises into place in turn; reduced motion keeps only the fade.
const rise = (index: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { ...transition.dropdown, delay: index * 0.08 },
});

function CopyCommand() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(COMMAND);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="group flex h-11 max-w-full items-center gap-3 rounded-xl border bg-accent/40 pr-3 pl-4 font-mono text-sm transition-colors hover:bg-accent"
    >
      <span className="text-muted-foreground select-none">$</span>
      <span className="truncate">{COMMAND}</span>
      <HugeiconsIcon
        icon={copied ? Tick02Icon : Copy01Icon}
        size={16}
        className="shrink-0 text-muted-foreground group-hover:text-foreground"
      />
    </button>
  );
}

export function Hero() {
  return (
    <ReducedMotionConfig>
      <section className="flex flex-col items-center px-5 pt-32 text-center md:pt-40">
        <motion.div {...rise(0)}>
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
          {...rise(1)}
          className="max-w-[800px] text-4xl font-medium text-balance md:text-6xl"
        >
          Animate your shadcn/ui components in one command
        </motion.h1>

        <motion.p
          {...rise(2)}
          className="mt-5 max-w-[620px] text-lg text-balance text-muted-foreground"
        >
          Drop-in animated primitives for Radix UI, Base UI and React Aria. Swap
          the import, keep your components, your styles and your API.
        </motion.p>

        <motion.div
          {...rise(3)}
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
          {...rise(4)}
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
