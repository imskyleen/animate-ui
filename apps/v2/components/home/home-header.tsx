'use client';

import { ease } from '@animate-ui/react/utils/motion';
import { GithubIcon, StarIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'cn';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { GitHubLink, ThemeToggle } from '@/components/layout/header';
import {
  GitHubStarsButton,
  GitHubStarsButtonIcon,
  GitHubStarsButtonNumber,
  GitHubStarsButtonParticles,
} from '@/registry/buttons/github-stars';
import { gitConfig } from '@/lib/shared';
import { frameworkOf, VUE_HOME } from '@/lib/vue';

import { FullLogo, LOGO_GLIDE, useIntroPlaying } from './intro';

const LINKS = {
  react: [
    { title: 'Docs', url: '/docs' },
    { title: 'Primitives', url: '/docs/primitives' },
    { title: 'Icons', url: '/docs/icons' },
  ],
  vue: [
    { title: 'Docs', url: '/docs/vue' },
    { title: 'Primitives', url: '/docs/vue/primitives' },
  ],
};

function Stars({ stars }: { stars: number }) {
  return (
    <GitHubStarsButton
      value={stars}
      asChild
      variant={null}
      size={null}
      className="group inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <a
        href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`GitHub, ${stars} stars`}
      >
        <HugeiconsIcon
          icon={GithubIcon}
          strokeWidth={2}
          size={18}
          className="size-[18px]"
        />
        <GitHubStarsButtonNumber className="tabular-nums" />
        <GitHubStarsButtonParticles className="text-yellow-500">
          <GitHubStarsButtonIcon
            icon={Star}
            className="size-4 fill-neutral-300 stroke-neutral-300 dark:fill-neutral-700 dark:stroke-neutral-700"
            color="var(--color-yellow-500)"
          />
        </GitHubStarsButtonParticles>
      </a>
    </GitHubStarsButton>
  );
}

function Star(props: Omit<React.ComponentProps<typeof HugeiconsIcon>, 'icon'>) {
  return (
    <HugeiconsIcon
      icon={StarIcon}
      strokeWidth={2}
      {...props}
      className={cn('[&_path]:[stroke:inherit]', props.className)}
    />
  );
}

export function HomeHeader({ stars }: { stars?: number }) {
  const playing = useIntroPlaying();
  const framework = frameworkOf(usePathname());

  return (
    <header
      data-slot="home-header"
      className="fixed inset-x-0 top-0 z-[70] h-20 bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center gap-3 px-5">
        <Link
          href={framework === 'vue' ? VUE_HOME : '/'}
          aria-label="Animate UI"
          className="flex items-center"
        >
          {!playing && (
            <motion.div
              layoutId="home-logo"
              transition={{ layout: LOGO_GLIDE }}
              className="w-[150px] text-foreground md:w-[168px]"
            >
              <FullLogo vue={framework === 'vue'} />
            </motion.div>
          )}
        </Link>

        <motion.div
          className="ml-auto flex items-center gap-1"
          initial={false}
          animate={
            playing
              ? { opacity: 0, x: 24, filter: 'blur(6px)' }
              : { opacity: 1, x: 0, filter: 'blur(0px)' }
          }
          transition={{ duration: 0.6, ease: ease.out, delay: 0.25 }}
        >
          <nav className="mr-1 flex items-center">
            {LINKS[framework].map((link) => (
              <Link
                key={link.url}
                href={link.url}
                className="hidden h-8 items-center rounded-md px-3 text-sm text-neutral-700 transition-colors hover:text-black sm:inline-flex dark:text-neutral-200 dark:hover:text-white"
              >
                {link.title}
              </Link>
            ))}
          </nav>
          {stars === undefined ? (
            <GitHubLink />
          ) : (
            !playing && <Stars stars={stars} />
          )}
          <ThemeToggle />
        </motion.div>
      </div>
    </header>
  );
}
