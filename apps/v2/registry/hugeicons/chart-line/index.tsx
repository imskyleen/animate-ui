'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

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
      {...props}
    >
      <motion.path
        d="M3 3L3 14C3 17.2998 3 18.9497 4.02513 19.9749C5.05025 21 6.70017 21 10 21L21 21"
        strokeLinecap="round"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M21 10.0764L20.3701 9.42505C19.264 8.28139 18.7109 7.70956 18.0414 7.7479C17.3719 7.78624 16.8833 8.41772 15.9061 9.68068L15.1262 10.6887C14.8757 11.0124 14.7505 11.1742 14.6138 11.2852C14.2025 11.6189 13.6529 11.7071 13.1632 11.518C13.0003 11.4552 12.8336 11.3402 12.5 11.1103C12.1664 10.8804 11.9997 10.7654 11.8368 10.7026C11.3471 10.5135 10.7975 10.6017 10.3862 10.9354C10.2495 11.0464 10.1242 11.2082 9.87381 11.5319L7 15.2461"
        strokeLinecap="round"
        strokeLinejoin="round"
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
