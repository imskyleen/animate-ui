'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type RefreshCcwProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        transition: { type: 'spring', stiffness: 150, damping: 25 },
      },
      animate: {
        rotate: -45,
        transition: { type: 'spring', stiffness: 150, damping: 25 },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
  } satisfies Record<string, Variants>,
  rotate: {
    group: {
      initial: {
        rotate: 0,
        transition: { type: 'spring', stiffness: 100, damping: 25 },
      },
      animate: {
        rotate: -360,
        transition: { type: 'spring', stiffness: 100, damping: 25 },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: RefreshCcwProps) {
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
      variants={variants.group}
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.path
        d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 3v5h5"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16 16h5v5"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function RefreshCcw(props: RefreshCcwProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  RefreshCcw,
  RefreshCcw as RefreshCcwIcon,
  type RefreshCcwProps,
  type RefreshCcwProps as RefreshCcwIconProps,
};
