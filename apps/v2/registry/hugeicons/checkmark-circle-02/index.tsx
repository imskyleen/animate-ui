'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type CheckmarkCircle02Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    circle: {},
    path: {
      initial: { pathLength: 1, opacity: 1, scale: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1, 1.1, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CheckmarkCircle02Props) {
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
        d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z"
        variants={variants.circle}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8 12.5L10.5 15L16 9"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function CheckmarkCircle02(props: CheckmarkCircle02Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CheckmarkCircle02,
  CheckmarkCircle02 as CheckmarkCircle02Icon,
  type CheckmarkCircle02Props,
  type CheckmarkCircle02Props as CheckmarkCircle02IconProps,
};
