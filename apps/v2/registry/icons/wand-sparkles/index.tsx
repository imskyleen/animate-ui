'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type WandSparklesProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    wand: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, -0.3, 0.3, -0.3, 0],
        y: [0, 0.3, -0.3, 0.3, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    sparkle1: {
      initial: { scale: 1, opacity: 1 },
      animate: {
        scale: [1, 0.2, 1.15, 1],
        opacity: [1, 0.4, 1, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    sparkle2: {
      initial: { scale: 1, opacity: 1 },
      animate: {
        scale: [1, 0.2, 1.15, 1],
        opacity: [1, 0.4, 1, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.12 },
      },
    },
    sparkle3: {
      initial: { scale: 1, opacity: 1 },
      animate: {
        scale: [1, 0.2, 1.15, 1],
        opacity: [1, 0.4, 1, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.24 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: WandSparklesProps) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <motion.g variants={variants.wand} initial="initial" animate={controls}>
        <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />
        <path d="m14 7 3 3" />
      </motion.g>
      <motion.g
        variants={variants.sparkle1}
        initial="initial"
        animate={controls}
      >
        <path d="M10 2v2" />
        <path d="M11 3H9" />
      </motion.g>
      <motion.g
        variants={variants.sparkle2}
        initial="initial"
        animate={controls}
      >
        <path d="M5 6v4" />
        <path d="M7 8H3" />
      </motion.g>
      <motion.g
        variants={variants.sparkle3}
        initial="initial"
        animate={controls}
      >
        <path d="M19 14v4" />
        <path d="M21 16h-4" />
      </motion.g>
    </motion.svg>
  );
}

function WandSparkles(props: WandSparklesProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  WandSparkles,
  WandSparkles as WandSparklesIcon,
  type WandSparklesProps,
  type WandSparklesProps as WandSparklesIconProps,
};
