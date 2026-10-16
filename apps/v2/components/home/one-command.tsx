'use client';

import { ease } from '@animate-ui/react/utils/motion';
import { motion } from 'motion/react';

import { CallsToAction, CopyCommand } from './hero';

const reveal = (index: number) => ({
  initial: { opacity: 0, y: 24, filter: 'blur(8px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: ease.out, delay: index * 0.09 },
});

export function OneCommand() {
  return (
    <section
      data-slot="home-one-command"
      className="mx-auto mt-32 flex w-full max-w-[900px] flex-col items-center px-5 text-center"
    >
      <motion.h2
        {...reveal(0)}
        className="text-4xl font-medium text-balance md:text-6xl"
      >
        One command. Your whole app, animated.
      </motion.h2>
      <motion.p
        {...reveal(1)}
        className="mt-5 max-w-[560px] text-lg text-balance text-muted-foreground"
      >
        The CLI swaps your shadcn/ui imports for Animate UI primitives. Your
        components, your styles and your API stay the same.
      </motion.p>
      <motion.div
        {...reveal(2)}
        className="mt-8 flex max-w-full flex-col items-center gap-4"
      >
        <CopyCommand />
        <CallsToAction />
      </motion.div>
    </section>
  );
}
