'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type BrushProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
      animate: {
        rotate: [0, -6, 6, 0],
        transformOrigin: 'top right',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BrushProps) {
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
        d="m11 10 3 3"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M6.5 21A3.5 3.5 0 1 0 3 17.5a2.62 2.62 0 0 1-.708 1.792A1 1 0 0 0 3 21z"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M9.969 17.031 21.378 5.624a1 1 0 0 0-3.002-3.002L6.967 14.031"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Brush(props: BrushProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Brush,
  Brush as BrushIcon,
  type BrushProps,
  type BrushProps as BrushIconProps,
};
