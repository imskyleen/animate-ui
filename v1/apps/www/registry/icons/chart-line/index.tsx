'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type ChartLineProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {},
    path2: {
      initial: { opacity: 1, pathLength: 1, pathOffset: 0 },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        pathOffset: [1, 0],
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
          opacity: { duration: 0.01 },
        },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: {},
    path2: {
      initial: { opacity: 1, pathLength: 1, pathOffset: 0 },
      animate: {
        opacity: [1, 0, 1],
        pathLength: [1, 0, 1],
        pathOffset: [0, 1, 0],
        transition: {
          duration: 1.6,
          ease: 'easeInOut',
          opacity: { duration: 0.01 },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ChartLineProps) {
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
        d="M3 3v16a2 2 0 0 0 2 2h16"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m19 9-5 5-4-4-3 3"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ChartLine(props: ChartLineProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ChartLine,
  ChartLine as ChartLineIcon,
  type ChartLineProps,
  type ChartLineProps as ChartLineIconProps,
};
