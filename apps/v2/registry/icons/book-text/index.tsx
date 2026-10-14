'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type BookTextProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    title1: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.4, delay: 0.05, ease: 'easeOut' },
      },
    },
    title2: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.35, delay: 0.4, ease: 'easeOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BookTextProps) {
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
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
      <motion.path
        d="M8 7h6"
        variants={variants.title1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8 11h8"
        variants={variants.title2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function BookText(props: BookTextProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  BookText,
  BookText as BookTextIcon,
  type BookTextProps,
  type BookTextProps as BookTextIconProps,
};
