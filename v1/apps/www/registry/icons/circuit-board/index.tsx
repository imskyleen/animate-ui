'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type CircuitBoardProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rect: {},
    path1: {
      initial: { pathLength: 1, opacity: 1, pathOffset: 0 },
      animate: {
        pathLength: [0.05, 1],
        pathOffset: [1, 0],
        opacity: [0, 1],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    circle1: {},
    path2: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0.05, 1],
        opacity: [0, 1],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    circle2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CircuitBoardProps) {
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
      <motion.rect
        width="18"
        height="18"
        x="3"
        y="3"
        rx="2"
        variants={variants.rect}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M11 9h4a2 2 0 0 0 2-2V3"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx="9"
        cy="9"
        r="2"
        variants={variants.circle1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M7 21v-4a2 2 0 0 1 2-2h4"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx="15"
        cy="15"
        r="2"
        variants={variants.circle2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function CircuitBoard(props: CircuitBoardProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CircuitBoard,
  CircuitBoard as CircuitBoardIcon,
  type CircuitBoardProps,
  type CircuitBoardProps as CircuitBoardIconProps,
};
