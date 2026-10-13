'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type MoveRightProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group1: {},
    group2: {},
    path1: {},
    path2: {},
    circle: {
      initial: { x: 0, transition: { ease: 'easeInOut', duration: 0.3 } },
      animate: { x: 3, transition: { ease: 'easeInOut', duration: 0.3 } },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    group1: {},
    group2: {},
    path1: {},
    path2: {},
    circle: {
      initial: { x: 0 },
      animate: {
        x: [0, 3, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
  pointing: {
    group1: {},
    group2: {},
    path1: {
      initial: {
        d: 'M22 12L12 12',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        d: 'M17 12L12 12',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    path2: {
      initial: { x: 0, transition: { ease: 'easeInOut', duration: 0.3 } },
      animate: { x: -5, transition: { ease: 'easeInOut', duration: 0.3 } },
    },
    circle: {},
  } satisfies Record<string, Variants>,
  'pointing-loop': {
    group1: {},
    group2: {},
    path1: {
      initial: { d: 'M22 12L12 12' },
      animate: {
        d: ['M22 12L12 12', 'M17 12L12 12', 'M22 12L12 12'],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    path2: {
      initial: { x: 0 },
      animate: {
        x: [0, -5, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    circle: {},
  } satisfies Record<string, Variants>,
  out: {
    group1: {},
    group2: {
      initial: { x: 0 },
      animate: {
        x: [0, '150%', '-150%', 0],
        transition: {
          default: { ease: 'easeInOut', duration: 0.6 },
          x: { ease: 'easeInOut', duration: 0.6, times: [0, 0.5, 0.5, 1] },
        },
      },
    },
    path1: {},
    path2: {},
    circle: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MoveRightProps) {
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
      variants={variants.group1}
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.g variants={variants.group1} initial="initial" animate={controls}>
        <motion.g
          variants={variants.group2}
          initial="initial"
          animate={controls}
        >
          <motion.circle
            cx={5}
            cy={12}
            r={3}
            variants={variants.circle}
            initial="initial"
            animate={controls}
          />
          <motion.path
            d="M22 12L12 12"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={variants.path1}
            initial="initial"
            animate={controls}
          />
          <motion.g
            variants={variants.path2}
            initial="initial"
            animate={controls}
          >
            <path
              d="M22 12C22 12.562 21.5619 12.9893 20.6857 13.8437L19.0294 15.5001"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 12C22 11.4379 21.5619 11.0107 20.6857 10.1563L19.0296 8.50012"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>
        </motion.g>
      </motion.g>
    </motion.svg>
  );
}

function MoveRight(props: MoveRightProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MoveRight,
  MoveRight as MoveRightIcon,
  type MoveRightProps,
  type MoveRightProps as MoveRightIconProps,
};
