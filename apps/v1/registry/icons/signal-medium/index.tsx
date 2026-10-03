'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type SignalMediumProps = IconProps<keyof typeof animations>;

const pathAnimation: Variants = {
  initial: {
    pathLength: 1,
    opacity: 1,
  },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};

const animations = {
  default: {
    group: {
      initial: {},
      animate: {
        transition: {
          staggerChildren: 0.2,
        },
      },
    },
    path1: pathAnimation,
    path2: pathAnimation,
    path3: pathAnimation,
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SignalMediumProps) {
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
      <motion.path d="M2 20h.01" variants={variants.path1} />
      <motion.path d="M7 20v-4" variants={variants.path2} />
      <motion.path d="M12 20v-8" variants={variants.path3} />
    </motion.svg>
  );
}

function SignalMedium(props: SignalMediumProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SignalMedium,
  SignalMedium as SignalMediumIcon,
  type SignalMediumProps,
  type SignalMediumProps as SignalMediumIconProps,
};
