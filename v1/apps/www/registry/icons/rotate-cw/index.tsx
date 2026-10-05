'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type RotateCwProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        transition: { type: 'spring', stiffness: 150, damping: 25 },
      },
      animate: {
        rotate: 45,
        transition: { type: 'spring', stiffness: 150, damping: 25 },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  rotate: {
    group: {
      initial: {
        rotate: 0,
        transition: { type: 'spring', stiffness: 100, damping: 25 },
      },
      animate: {
        rotate: 360,
        transition: { type: 'spring', stiffness: 100, damping: 25 },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: RotateCwProps) {
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
        d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M21 3v5h-5"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function RotateCw(props: RotateCwProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  RotateCw,
  RotateCw as RotateCwIcon,
  type RotateCwProps,
  type RotateCwProps as RotateCwIconProps,
};
