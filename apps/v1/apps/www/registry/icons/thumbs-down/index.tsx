'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type ThumbsDownProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, -20, -12],
        transformOrigin: 'top right',
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, -20, 5, 0],
        transformOrigin: 'top right',
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
        },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ThumbsDownProps) {
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
        d="M17 14V2"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ThumbsDown(props: ThumbsDownProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ThumbsDown,
  ThumbsDown as ThumbsDownIcon,
  type ThumbsDownProps,
  type ThumbsDownProps as ThumbsDownIconProps,
};
