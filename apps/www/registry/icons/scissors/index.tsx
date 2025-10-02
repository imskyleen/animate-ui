'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type ScissorsProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group1: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, -26, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    group2: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 26, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ScissorsProps) {
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
      <motion.g variants={variants.group1} initial="initial" animate={controls}>
        <motion.circle
          cx="6"
          cy="6"
          r="3"
          variants={variants.circle1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M8.12 8.12 12 12"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M14.8 14.8 20 20"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.g variants={variants.group2} initial="initial" animate={controls}>
        <motion.circle
          cx="6"
          cy="18"
          r="3"
          variants={variants.circle2}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M20 4 8.12 15.88"
          variants={variants.path3}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function Scissors(props: ScissorsProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Scissors,
  Scissors as ScissorsIcon,
  type ScissorsProps,
  type ScissorsProps as ScissorsIconProps,
};
