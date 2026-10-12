'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Share08Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    lines: {},
    node1: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.25, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    node2: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.25, 1],
        transition: { duration: 0.4, ease: 'easeInOut', delay: 0.15 },
      },
    },
    node3: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.25, 1],
        transition: { duration: 0.4, ease: 'easeInOut', delay: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Share08Props) {
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
        d="M8.72852 10.7495L15.2285 7.75M8.72852 13.25L15.2285 16.2495"
        variants={variants.lines}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12Z"
        variants={variants.node1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M21 6.5C21 8.15685 19.6569 9.5 18 9.5C16.3431 9.5 15 8.15685 15 6.5C15 4.84315 16.3431 3.5 18 3.5C19.6569 3.5 21 4.84315 21 6.5Z"
        variants={variants.node2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M21 17.5C21 19.1569 19.6569 20.5 18 20.5C16.3431 20.5 15 19.1569 15 17.5C15 15.8431 16.3431 14.5 18 14.5C19.6569 14.5 21 15.8431 21 17.5Z"
        variants={variants.node3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Share08(props: Share08Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Share08,
  Share08 as Share08Icon,
  type Share08Props,
  type Share08Props as Share08IconProps,
};
