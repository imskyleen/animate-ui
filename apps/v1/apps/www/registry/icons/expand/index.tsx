'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type ExpandProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group1: {
      initial: {
        y: 0,
        x: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: 2,
        x: 2,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    group2: {
      initial: {
        y: 0,
        x: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: -2,
        x: 2,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    group3: {
      initial: {
        y: 0,
        x: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: 2,
        x: -2,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    group4: {
      initial: {
        y: 0,
        x: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: -2,
        x: -2,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
    path6: {},
    path7: {},
    path8: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    group1: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, 2, 0],
        x: [0, 2, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    group2: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, -2, 0],
        x: [0, 2, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    group3: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, 2, 0],
        x: [0, -2, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    group4: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, -2, 0],
        x: [0, -2, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
    path6: {},
    path7: {},
    path8: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ExpandProps) {
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
        <motion.path
          d="m15 15 6 6"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M21 16v5h-5"
          variants={variants.path3}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.g variants={variants.group2} initial="initial" animate={controls}>
        <motion.path
          d="m15 9 6-6"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M21 8V3h-5"
          variants={variants.path4}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.g variants={variants.group3} initial="initial" animate={controls}>
        <motion.path
          d="M3 16v5h5"
          variants={variants.path5}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="m3 21 6-6"
          variants={variants.path6}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.g variants={variants.group4} initial="initial" animate={controls}>
        <motion.path
          d="M3 8V3h5"
          variants={variants.path7}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M9 9 3 3"
          variants={variants.path8}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function Expand(props: ExpandProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Expand,
  Expand as ExpandIcon,
  type ExpandProps,
  type ExpandProps as ExpandIconProps,
};
