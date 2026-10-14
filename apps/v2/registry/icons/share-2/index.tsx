'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Share2Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    lines: {},
    path1: {},
    path2: {},
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
  spread: {
    lines: {},
    path1: {
      initial: { pathLength: 1, transition: { duration: 0.15 } },
      animate: {
        pathLength: [0, 1],
        transition: { duration: 0.35, delay: 0.08, ease: 'easeOut' },
      },
    },
    path2: {
      initial: { pathLength: 1, transition: { duration: 0.15 } },
      animate: {
        pathLength: [0, 1],
        transition: { duration: 0.35, delay: 0.08, ease: 'easeOut' },
      },
    },
    node1: {
      initial: { x: 0, y: 0, transition: { duration: 0.15 } },
      animate: {
        x: [0, 1, 0],
        y: [0, -1, 0],
        transition: { duration: 0.45, times: [0, 0.4, 1], ease: 'easeOut' },
      },
    },
    node2: {},
    node3: {
      initial: { x: 0, y: 0, transition: { duration: 0.15 } },
      animate: {
        x: [0, 1, 0],
        y: [0, 1, 0],
        transition: { duration: 0.45, times: [0, 0.4, 1], ease: 'easeOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Share2Props) {
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
      <motion.g variants={variants.lines} initial="initial" animate={controls}>
        <motion.line
          x1={8.59}
          x2={15.42}
          y1={13.51}
          y2={17.49}
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.line
          x1={15.41}
          x2={8.59}
          y1={6.51}
          y2={10.49}
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.circle
        cx={18}
        cy={5}
        r={3}
        variants={variants.node1}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx={6}
        cy={12}
        r={3}
        variants={variants.node2}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx={18}
        cy={19}
        r={3}
        variants={variants.node3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Share2(props: Share2Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Share2,
  Share2 as Share2Icon,
  type Share2Props,
  type Share2Props as Share2IconProps,
};
