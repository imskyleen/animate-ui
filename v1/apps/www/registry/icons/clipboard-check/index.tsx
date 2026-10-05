'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type ClipboardCheckProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rect: {},
    path1: {},
    path2: {
      initial: {
        pathLength: 1,
        opacity: 1,
        scale: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1, 1.1, 1],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
  check: {
    rect: {},
    path1: {},
    path2: {
      initial: {
        pathLength: 0,
        opacity: 0,
        scale: 0,
      },
      animate: {
        pathLength: 1,
        opacity: 1,
        scale: [1.1, 1],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ClipboardCheckProps) {
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
        width="8"
        height="4"
        x="8"
        y="2"
        rx="1"
        ry="1"
        variants={variants.rect}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m9 14 2 2 4-4"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ClipboardCheck(props: ClipboardCheckProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ClipboardCheck,
  ClipboardCheck as ClipboardCheckIcon,
  type ClipboardCheckProps,
  type ClipboardCheckProps as ClipboardCheckIconProps,
};
