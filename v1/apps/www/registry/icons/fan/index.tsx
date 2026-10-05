'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type FanProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { rotate: 0 },
      animate: {
        rotate: 360,
        transition: {
          duration: 1.2,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: FanProps) {
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
        d="M10.827 16.379a6.082 6.082 0 0 1-8.618-7.002l5.412 1.45a6.082 6.082 0 0 1 7.002-8.618l-1.45 5.412a6.082 6.082 0 0 1 8.618 7.002l-5.412-1.45a6.082 6.082 0 0 1-7.002 8.618l1.45-5.412Z"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 12v.01"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Fan(props: FanProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Fan,
  Fan as FanIcon,
  type FanProps,
  type FanProps as FanIconProps,
};
