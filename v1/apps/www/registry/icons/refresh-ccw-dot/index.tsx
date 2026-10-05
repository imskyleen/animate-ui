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
    circle: {},
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
    circle: {},
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
        d="M21 12A9 9 0 0 0 6 5.3L3 8"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 2v6h6"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 12a9 9 0 0 0 15 6.7l3-2.7"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M21 22v-6h-6"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx="12"
        cy="12"
        r="1"
        variants={variants.circle}
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
