'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type ShrinkProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: {
        y: 0,
        x: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: -1,
        x: -1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: {
        y: 0,
        x: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: 1,
        x: -1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path3: {
      initial: {
        y: 0,
        x: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: -1,
        x: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path4: {
      initial: {
        y: 0,
        x: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: 1,
        x: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, -1, 0],
        x: [0, -1, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, 1, 0],
        x: [0, -1, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path3: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, -1, 0],
        x: [0, 1, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path4: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, 1, 0],
        x: [0, 1, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ShrinkProps) {
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
        d="m15 15 6 6m-6-6v4.8m0-4.8h4.8"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M9 19.8V15m0 0H4.2M9 15l-6 6"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M15 4.2V9m0 0h4.8M15 9l6-6"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M9 4.2V9m0 0H4.2M9 9 3 3"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Shrink(props: ShrinkProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Shrink,
  Shrink as ShrinkIcon,
  type ShrinkProps,
  type ShrinkProps as ShrinkIconProps,
};
