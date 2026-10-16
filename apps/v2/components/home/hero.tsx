'use client';

import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@animate-ui/react/primitives/buttons/button';
import {
  CopyButton,
  CopyButtonIcon,
} from '@animate-ui/react/primitives/buttons/copy';
import {
  Tabs,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from '@animate-ui/react/primitives/tabs';
import { HugeiconsIcon } from '@hugeicons/react';
import { ease, ReducedMotionConfig } from '@animate-ui/react/utils/motion';
import { motion } from 'motion/react';
import Link from 'next/link';

import { HeroTitle } from '@/components/home/hero-title';
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
  const [manager, setManager] = useSyncedValue(MANAGER_NAMES, {
    groupId: MANAGER_GROUP,
    persist: true,
  });
  const COMMAND = command(manager as Manager);
  return (
    <div className="flex max-w-full flex-col items-center gap-2">
      <Tabs value={manager} onValueChange={setManager}>
        <TabsHighlight className="absolute inset-0 z-0 rounded-md bg-accent">
          <TabsList
            aria-label="Package manager"
            className="inline-flex items-center gap-1 text-xs"
          >
            {MANAGER_NAMES.map((name) => (
              <TabsHighlightItem key={name} value={name}>
                <TabsTrigger
                  value={name}
                  className="relative z-10 rounded-md px-2 py-1 text-muted-foreground transition-colors duration-300 hover:text-foreground data-[state=active]:text-foreground"
                >
                  {name}
                </TabsTrigger>
              </TabsHighlightItem>
            ))}
          </TabsList>
        </TabsHighlight>
      </Tabs>
      <CopyButton
        content={COMMAND}
        aria-label="Copy the command"
        className="group flex h-11 max-w-full items-center gap-3 rounded-xl border bg-accent/40 pr-3 pl-4 font-mono text-sm transition-colors hover:bg-accent"
      >
        <span className="text-muted-foreground select-none">$</span>
        <span className="truncate">{COMMAND}</span>
        <CopyButtonIcon
          className="text-muted-foreground group-hover:text-foreground"
          icon={<HugeiconsIcon icon={Copy01Icon} strokeWidth={2} size={16} />}
          copiedIcon={
            <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} size={16} />
          }
        />
      </CopyButton>
    </div>
  );
}

export function CallsToAction() {
  return (
    <div className="flex gap-3">
      <Button
        asChild
        className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
      >
        <Link href="/docs">Get started</Link>
      </Button>
      <Button
        asChild
        className="inline-flex h-10 items-center rounded-lg border px-5 text-sm font-medium transition-colors hover:bg-accent"
      >
        <Link href="/docs/primitives">Browse primitives</Link>
      </Button>
    </div>
  );
}

export function Hero() {
  const done = useIntroDone();
  return (
    <ReducedMotionConfig>
      <section className="flex flex-col items-center px-5 pt-36 text-center md:pt-44">
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

        <HeroTitle done={done} />

        <motion.p
          {...rise(5, done)}
          className="mt-5 max-w-[620px] text-lg text-balance text-muted-foreground"
        >
          Drop-in animated primitives for Radix UI, Base UI and React Aria. Swap
          the import, keep your components, your styles and your API.
        </motion.p>

        <motion.div
          {...rise(6, done)}
          className="mt-8 flex max-w-full flex-col items-center gap-4"
        >
          <CopyCommand />
          <CallsToAction />
        </motion.div>

        <motion.div
          {...rise(7, done)}
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
