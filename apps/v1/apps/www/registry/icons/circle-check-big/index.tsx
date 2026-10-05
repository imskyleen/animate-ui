'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type CircleCheckBigProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {},
    path2: {
      initial: {
        pathLength: 1,
        opacity: 1,
        scale: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1, 1.1, 1],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CircleCheckBigProps) {
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
        d="M21.801 10A10 10 0 1 1 17 3.335"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m9 11 3 3L22 4"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function CircleCheckBig(props: CircleCheckBigProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CircleCheckBig,
  CircleCheckBig as CircleCheckBigIcon,
  type CircleCheckBigProps,
  type CircleCheckBigProps as CircleCheckBigIconProps,
};
