'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type LoaderPinwheelProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: 360,
        transition: {
          duration: 1.5,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        },
      },
    },
    circle: {},
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: LoaderPinwheelProps) {
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
        <motion.circle
          cx={12}
          cy={12}
          r={10}
          variants={variants.circle}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M22 12a1 1 0 0 1-10 0 1 1 0 0 0-10 0"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M7 20.7a1 1 0 1 1 5-8.7 1 1 0 1 0 5-8.6"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M7 3.3a1 1 0 1 1 5 8.6 1 1 0 1 0 5 8.6"
          variants={variants.path3}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function LoaderPinwheel(props: LoaderPinwheelProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  LoaderPinwheel,
  LoaderPinwheel as LoaderPinwheelIcon,
  type LoaderPinwheelProps,
  type LoaderPinwheelProps as LoaderPinwheelIconProps,
};
