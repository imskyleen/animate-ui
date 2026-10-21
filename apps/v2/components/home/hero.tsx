'use client';

import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@animate-ui/react/primitives/buttons/button';
import {
  CopyButton,
  CopyButtonIcon,
} from '@animate-ui/react/primitives/buttons/copy';
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from '@animate-ui/react/primitives/tabs';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ease,
  motionTokens,
  ReducedMotionConfig,
  scaleTransition,
  useMotionTokens,
} from '@animate-ui/react/utils/motion';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { HeroTitle } from '@/components/home/hero-title';
import { useIntroDone } from '@/components/home/intro';
import {
  MANAGER_GROUP,
  MANAGER_NAMES,
  MANAGERS,
  type Manager,
} from '@/components/docs/package-managers';
import { useSyncedValue } from '@/components/docs/tabs';
import {
  FrameworkTabs,
  type Framework,
} from '@/components/layout/framework-switch';
import { LIBRARIES } from '@/lib/libraries';
import { frameworkOf, VUE_HOME } from '@/lib/vue';

export const HOMES = {
  react: {
    href: '/',
    libraries: ['shadcn/ui', 'Radix UI', 'Base UI', 'React Aria'],
    subtitle:
      'Drop-in animated primitives for Radix UI, Base UI and React Aria. Swap the import, keep your components, your styles and your API.',
    docs: '/docs',
    primitives: '/docs/primitives',
    logos: LIBRARIES.filter((library) => library.peer),
  },
  vue: {
    href: VUE_HOME,
    libraries: ['shadcn-vue', 'Reka UI'],
    subtitle:
      'Drop-in animated primitives for Reka UI. Swap the import, keep your components, your styles and your API.',
    docs: '/docs/vue',
    primitives: '/docs/vue/primitives',
    logos: LIBRARIES.filter((library) => library.id === 'reka-ui'),
  },
} satisfies Record<Framework, unknown>;

export const useHomeFramework = () => frameworkOf(usePathname());

const animateAll = (dlx: string) => `${dlx} @animate-ui/cli@latest animate all`;

const rise = (index: number, done: boolean) => ({
  initial: { opacity: 0, y: 20, filter: 'blur(10px)' },
  animate: done
    ? { opacity: 1, y: 0, filter: 'blur(0px)' }
    : { opacity: 0, y: 20, filter: 'blur(10px)' },
  transition: { duration: 0.7, ease: ease.out, delay: index * 0.09 },
});

export function CopyCommand({
  command: build = animateAll,
}: {
  command?: (dlx: string) => string;
}) {
  const command = (manager: Manager) => build(MANAGERS[manager].dlx);
  const [manager, setManager] = useSyncedValue(MANAGER_NAMES, {
    groupId: MANAGER_GROUP,
    persist: true,
  });
  return (
    <Tabs
      value={manager}
      onValueChange={setManager}
      className="flex w-[min(100%,30rem)] flex-col items-center gap-2"
    >
      <TabsHighlight className="absolute inset-0 z-0 rounded-lg bg-accent">
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
      <div className="relative w-full rounded-xl bg-accent p-1">
        <TabsContents className="rounded-lg bg-background font-mono text-sm">
          {MANAGER_NAMES.map((name) => (
            <TabsContent
              key={name}
              value={name}
              className="flex h-11 items-center gap-3 pr-12 pl-4"
            >
              <span className="text-muted-foreground select-none">$</span>
              <span className="truncate">{command(name as Manager)}</span>
            </TabsContent>
          ))}
        </TabsContents>
        <span
          aria-hidden="true"
          data-slot="command-cover"
          className="pointer-events-none absolute inset-y-1 right-1 w-16 rounded-r-lg bg-linear-to-r from-transparent via-background via-40% to-background"
        />
        <CopyButton
          content={command(manager as Manager)}
          aria-label="Copy the command"
          className="absolute top-1/2 right-2.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <CopyButtonIcon
            icon={<HugeiconsIcon icon={Copy01Icon} strokeWidth={2} size={16} />}
            copiedIcon={
              <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} size={16} />
            }
          />
        </CopyButton>
      </div>
    </Tabs>
  );
}

export function CallsToAction({
  framework = 'react',
}: {
  framework?: Framework;
}) {
  const home = HOMES[framework];
  return (
    <div className="flex gap-3">
      <Button
        asChild
        className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
      >
        <Link href={home.docs}>Get started</Link>
      </Button>
      <Button
        asChild
        className="inline-flex h-10 items-center rounded-lg bg-accent px-5 text-sm font-medium transition-colors hover:bg-accent/70"
      >
        <Link href={home.primitives}>Browse primitives</Link>
      </Button>
    </div>
  );
}

/** Swaps a framework's own text in place, fading through a blur. */
function Swap({
  framework,
  className,
  children,
}: {
  framework: Framework;
  className?: string;
  children: React.ReactNode;
}) {
  const { tempo } = useMotionTokens();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={framework}
        className={className}
        initial={{ opacity: 0, filter: motionTokens.blur.panel }}
        animate={{
          opacity: 1,
          filter: 'blur(0px)',
          transitionEnd: { filter: 'none' },
          transition: scaleTransition(motionTokens.transition.panelIn, tempo),
        }}
        exit={{
          opacity: 0,
          filter: motionTokens.blur.panel,
          transition: scaleTransition(motionTokens.transition.panelOut, tempo),
        }}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}

export function Hero() {
  const done = useIntroDone();
  const framework = useHomeFramework();
  const home = HOMES[framework];
  return (
    <ReducedMotionConfig>
      <section className="flex flex-col items-center px-5 pt-36 text-center md:pt-44">
        <motion.div {...rise(0, done)} className="mb-8">
          <FrameworkTabs
            pill
            current={framework}
            target={(id) => ({
              href: HOMES[id].href,
              same: false,
              scroll: false,
            })}
          />
        </motion.div>

        <HeroTitle done={done} libraries={home.libraries} />

        <motion.p
          {...rise(5, done)}
          className="mt-5 max-w-[620px] text-lg text-balance text-muted-foreground"
        >
          <Swap framework={framework}>{home.subtitle}</Swap>
        </motion.p>

        <motion.div
          {...rise(6, done)}
          className="mt-8 flex max-w-full flex-col items-center gap-4"
        >
          <CopyCommand />
          <CallsToAction framework={framework} />
        </motion.div>

        <motion.div {...rise(7, done)} className="mt-12">
          <Swap
            framework={framework}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            {home.logos.map(({ id, title, Logo }) => (
              <span key={id} className="flex items-center gap-2">
                <Logo className="size-4" />
                {title}
              </span>
            ))}
          </Swap>
        </motion.div>
      </section>
    </ReducedMotionConfig>
  );
}
