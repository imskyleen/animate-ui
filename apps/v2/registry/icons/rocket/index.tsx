'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type RocketProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { x: 0, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
      animate: {
        x: [0, -0.3, 0.3, -0.3, 0.3, 0.8],
        y: [0, 0.3, -0.3, 0.3, -0.3, -0.8],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    trails: {
      initial: { scale: 1, x: 0, y: 0, transformOrigin: '100% 0%' },
      animate: {
        scale: [1, 0.6, 1.1, 1],
        x: [0, 0, 0, 0.8],
        y: [0, 0, 0, -0.8],
        transformOrigin: '100% 0%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: RocketProps) {
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
          d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05"
          variants={variants.path3}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.path
        d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09"
        variants={variants.trails}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Rocket(props: RocketProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Rocket,
  Rocket as RocketIcon,
  type RocketProps,
  type RocketProps as RocketIconProps,
};
