'use client';

import { ease } from '@animate-ui/react/utils/motion';
import { motion } from 'motion/react';
import Link from 'next/link';

import { GitHubLink, ThemeToggle } from '@/components/layout/header';

import { FullLogo, LOGO_GLIDE, useIntroPlaying } from './intro';

const LINKS = [
  { title: 'Docs', url: '/docs' },
  { title: 'Primitives', url: '/docs/primitives' },
  { title: 'Icons', url: '/docs/icons' },
];

export function HomeHeader() {
  const playing = useIntroPlaying();

  return (
    <header
      data-slot="home-header"
      className="fixed inset-x-0 top-0 z-40 h-20 bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center gap-3 px-5">
        <Link href="/" aria-label="Animate UI" className="flex items-center">
          {!playing && (
            <motion.div
              layoutId="home-logo"
              transition={{ layout: LOGO_GLIDE }}
              className="w-[150px] text-foreground md:w-[168px]"
            >
              <FullLogo />
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
            {LINKS.map((link, index) => (
              <Link
                key={link.url}
                href={link.url}
                className={
                  index === 0
                    ? 'inline-flex h-8 items-center rounded-md px-3 text-sm text-neutral-700 transition-colors hover:text-black dark:text-neutral-200 dark:hover:text-white'
                    : 'hidden h-8 items-center rounded-md px-3 text-sm text-neutral-700 transition-colors hover:text-black sm:inline-flex dark:text-neutral-200 dark:hover:text-white'
                }
              >
                {link.title}
              </Link>
            ))}
          </nav>
          <GitHubLink />
          <ThemeToggle />
        </motion.div>
      </div>
    </header>
  );
}
