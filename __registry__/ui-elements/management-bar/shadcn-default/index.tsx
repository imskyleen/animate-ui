'use client';

import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Ban,
  X,
  Command,
  IdCard,
} from 'lucide-react';
import { SlidingNumber } from '@/__registry__/text/sliding-number/shadcn-default';
import { motion, Variants, Transition } from 'motion/react';

const buttonMotionConfig = {
  initial: { maxWidth: '40px' },
  animate: 'rest',
  whileHover: 'hover',
  variants: {
    rest: {
      maxWidth: '40px',
      transition: { type: 'spring', stiffness: 200, damping: 25, delay: 0.1 },
    },
    hover: { maxWidth: '140px' },
  },
  transition: { type: 'spring', stiffness: 200, damping: 25 },
};

const labelVariants: Variants = {
  rest: { opacity: 0, x: 4 },
  hover: { opacity: 1, x: 0, visibility: 'visible' },
};

const labelTransition: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
};

function ManagementBar() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPages = 10;

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="flex w-fit flex-wrap items-center gap-y-2 rounded-2xl border border-border bg-background p-2 shadow-lg">
      <div className="mx-auto flex shrink-0 items-center">
        <button
          disabled={currentPage === 1}
          className="p-1 text-muted-foreground transition-colors hover:text-foreground disabled:text-muted-foreground/30 disabled:hover:text-muted-foreground/30"
          onClick={handlePrevPage}
        >
          <ChevronLeft size={20} />
        </button>
        <div className="mx-2 flex items-center space-x-1 text-sm tabular-nums">
          <SlidingNumber
            className="text-foreground"
            padStart
            number={currentPage}
          />
          <span className="text-muted-foreground">/ {totalPages}</span>
        </div>
        <button
          disabled={currentPage === totalPages}
          className="p-1 text-muted-foreground transition-colors hover:text-foreground disabled:text-muted-foreground/30 disabled:hover:text-muted-foreground/30"
          onClick={handleNextPage}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="mx-3 h-5 w-px bg-border rounded-full" />

      <motion.div
        layout
        layoutRoot
        className="mx-auto flex flex-wrap space-x-2 sm:flex-nowrap"
      >
        <motion.button
          {...buttonMotionConfig}
          className="flex h-10 items-center space-x-2 overflow-hidden whitespace-nowrap rounded-lg bg-neutral-500/80 dark:bg-neutral-600/80 px-2.5 py-2 text-white"
          aria-label="Blacklist"
        >
          <Ban size={20} className="shrink-0" />
          <motion.span
            variants={labelVariants}
            transition={labelTransition}
            className="invisible text-sm"
          >
            Blacklist
          </motion.span>
        </motion.button>

        <motion.button
          {...buttonMotionConfig}
          className="flex h-10 items-center space-x-2 overflow-hidden whitespace-nowrap rounded-lg bg-red-500/80 dark:bg-red-800/80 px-2.5 py-2 text-white dark:text-red-300"
          aria-label="Reject"
        >
          <X size={20} className="shrink-0" />
          <motion.span
            variants={labelVariants}
            transition={labelTransition}
            className="invisible text-sm"
          >
            Reject
          </motion.span>
        </motion.button>

        <motion.button
          {...buttonMotionConfig}
          className="flex h-10 items-center space-x-2 overflow-hidden whitespace-nowrap rounded-lg bg-green-500/80 dark:bg-green-800/80 px-2.5 py-2 text-white dark:text-green-300"
          aria-label="Hire"
        >
          <IdCard size={20} className="shrink-0" />
          <motion.span
            variants={labelVariants}
            transition={labelTransition}
            className="invisible text-sm"
          >
            Hire
          </motion.span>
        </motion.button>
      </motion.div>

      <div className="mx-3 hidden h-5 w-px bg-border sm:block rounded-full" />

      <button className="flex w-full h-10 text-sm cursor-pointer items-center justify-center rounded-lg bg-teal-500/80 dark:bg-teal-600/80 px-3 py-2 text-white transition-colors duration-300 hover:bg-teal-700 sm:w-auto">
        <span className="mr-1 text-neutral-100 dark:text-neutral-200">
          Move to:
        </span>
        <span>Interview I</span>
        <div className="mx-3 h-5 w-px bg-white/40 rounded-full" />
        <div className="flex items-center gap-1 rounded-md bg-white/20 px-1.5 py-0.5 -mr-1">
          <Command size={14} />E
        </div>
      </button>
    </div>
  );
}

export { ManagementBar };
