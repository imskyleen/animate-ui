'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type EqualNotProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    line1: {},
    line2: {},
    line3: {
      initial: {
        pathLength: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          opacity: { duration: 0.1 },
        },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    line1: {},
    line2: {},
    line3: {
      initial: {
        pathLength: 1,
      },
      animate: {
        pathLength: [1, 0, 1],
        transition: { duration: 1.2, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  'to-not': {
    line1: {},
    line2: {},
    line3: {
      initial: {
        pathLength: 0,
        opacity: 0,
      },
      animate: {
        pathLength: 1,
        opacity: 1,
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          opacity: { duration: 0.1 },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: EqualNotProps) {
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
        d="M5 9H19"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M5 15H19"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M19 4L5 20"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function EqualNot(props: EqualNotProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  EqualNot,
  EqualNot as EqualNotIcon,
  type EqualNotProps,
  type EqualNotProps as EqualNotIconProps,
};
