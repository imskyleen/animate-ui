'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type CheckCheckProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        scale: 1,
      },
      animate: {
        scale: [1, 1.1, 1],
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
        },
      },
    },
    path1: {
      initial: {
        pathLength: 1,
        opacity: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],

        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    path2: {
      initial: {
        pathLength: 1,
        opacity: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],

        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          delay: 0.2,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CheckCheckProps) {
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
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path
          d="m2 12 5 5L18 6"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="m13 16 1.5 1.5L22 10"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function CheckCheck(props: CheckCheckProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CheckCheck,
  CheckCheck as CheckCheckIcon,
  type CheckCheckProps,
  type CheckCheckProps as CheckCheckIconProps,
};
