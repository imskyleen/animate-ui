'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type HeadphonesProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    cup1: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.06, 1, 1.06, 1],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    cup2: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.06, 1, 1.06, 1],
        transition: { duration: 0.8, ease: 'easeInOut', delay: 0.12 },
      },
    },
  } satisfies Record<string, Variants>,
  wiggle: {
    group: {
      initial: { rotate: 0, transformOrigin: '50% 0%' },
      animate: {
        rotate: [0, -5, 5, -3, 0],
        transformOrigin: '50% 0%',
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: HeadphonesProps) {
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
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path
          d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5"
          variants={variants.cup1}
          initial="initial"
          animate={controls}
        />
        <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
        <motion.path
          d="M21 14v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"
          variants={variants.cup2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function Headphones(props: HeadphonesProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Headphones,
  Headphones as HeadphonesIcon,
  type HeadphonesProps,
  type HeadphonesProps as HeadphonesIconProps,
};
