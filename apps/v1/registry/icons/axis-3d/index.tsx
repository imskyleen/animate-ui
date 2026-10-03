'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type Axis3DProps = IconProps<keyof typeof animations>;

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
    path1: {},
    path2: pathAnimation,
    path3: pathAnimation,
    path4: pathAnimation,
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Axis3DProps) {
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
        d="M4 4v15a1 1 0 0 0 1 1h15"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path d="M4.293 19.707 6 18" variants={variants.path2} />
        <motion.path d="m9 15 1.5-1.5" variants={variants.path3} />
        <motion.path d="M13.5 10.5 15 9" variants={variants.path4} />
      </motion.g>
    </motion.svg>
  );
}

function Axis3D(props: Axis3DProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Axis3D,
  Axis3D as Axis3DIcon,
  type Axis3DProps,
  type Axis3DProps as Axis3DIconProps,
};
