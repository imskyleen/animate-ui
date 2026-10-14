'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type PaletteProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    board: {},
    dab1: {
      initial: { opacity: 1 },
      animate: {
        opacity: [0, 1],
        transition: { duration: 0.3, delay: 0.38, ease: 'easeOut' },
      },
    },
    dab2: {
      initial: { opacity: 1 },
      animate: {
        opacity: [0, 1],
        transition: { duration: 0.3, delay: 0.52, ease: 'easeOut' },
      },
    },
    dab3: {
      initial: { opacity: 1 },
      animate: {
        opacity: [0, 1],
        transition: { duration: 0.3, delay: 0.1, ease: 'easeOut' },
      },
    },
    dab4: {
      initial: { opacity: 1 },
      animate: {
        opacity: [0, 1],
        transition: { duration: 0.3, delay: 0.24, ease: 'easeOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PaletteProps) {
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
      <motion.path
        d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"
        variants={variants.board}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx="13.5"
        cy="6.5"
        r=".5"
        fill="currentColor"
        variants={variants.dab1}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx="17.5"
        cy="10.5"
        r=".5"
        fill="currentColor"
        variants={variants.dab2}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx="6.5"
        cy="12.5"
        r=".5"
        fill="currentColor"
        variants={variants.dab3}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx="8.5"
        cy="7.5"
        r=".5"
        fill="currentColor"
        variants={variants.dab4}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Palette(props: PaletteProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Palette,
  Palette as PaletteIcon,
  type PaletteProps,
  type PaletteProps as PaletteIconProps,
};
