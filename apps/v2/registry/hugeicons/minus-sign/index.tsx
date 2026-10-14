'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type MinusSignProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: { rotate: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
      animate: {
        rotate: 180,
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  shrink: {
    path1: {},
    left: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0, 1],
        transition: { duration: 0.9, times: [0, 0.4, 1], ease: 'easeInOut' },
      },
    },
    right: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0, 1],
        transition: { duration: 0.9, times: [0, 0.4, 1], ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MinusSignProps) {
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
      <motion.g variants={variants.path1} initial="initial" animate={controls}>
        <motion.path
          d="M12 12L4 12"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.left}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M12 12L20 12"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.right}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function MinusSign(props: MinusSignProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MinusSign,
  MinusSign as MinusSignIcon,
  type MinusSignProps,
  type MinusSignProps as MinusSignIconProps,
};
