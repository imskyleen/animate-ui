'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type ScissorsProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group1: {
      initial: { transformOrigin: '56.5% 55.1%', rotate: 0 },
      animate: {
        transformOrigin: '56.5% 55.1%',
        rotate: [0, -18, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    group2: {
      initial: { transformOrigin: '56.5% 46%', rotate: 0 },
      animate: {
        transformOrigin: '56.5% 46%',
        rotate: [0, 18, 0],
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
      {...props}
    >
      <motion.g variants={variants.group1} initial="initial" animate={controls}>
        <motion.path
          d="M2.99219 6C2.99219 7.65685 4.33533 9 5.99219 9C7.64904 9 8.99219 7.65685 8.99219 6C8.99219 4.34315 7.64904 3 5.99219 3C4.33533 3 2.99219 4.34315 2.99219 6Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.circle1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M8.99219 8L20.9922 19"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.g variants={variants.group2} initial="initial" animate={controls}>
        <motion.path
          d="M2.99219 18C2.99219 19.6569 4.33533 21 5.99219 21C7.64904 21 8.99219 19.6569 8.99219 18C8.99219 16.3431 7.64904 15 5.99219 15C4.33533 15 2.99219 16.3431 2.99219 18Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.circle2}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M20.9922 4L15.4922 9.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path3}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M8.99193 16L12.9922 12"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path1}
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
