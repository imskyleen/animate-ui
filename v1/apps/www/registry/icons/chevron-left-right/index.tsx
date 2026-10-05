'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type ChevronLeftRightProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: {
        x: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        x: -3,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: {
        x: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        x: 3,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, -3, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, 3, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ChevronLeftRightProps) {
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
        d="m9 7-5 5 5 5"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m15 7 5 5-5 5"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ChevronLeftRight(props: ChevronLeftRightProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ChevronLeftRight,
  ChevronLeftRight as ChevronLeftRightIcon,
  type ChevronLeftRightProps,
  type ChevronLeftRightProps as ChevronLeftRightIconProps,
};
