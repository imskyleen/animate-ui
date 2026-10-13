'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type WifiDisconnected02Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    arc1: {},
    arc2: {},
    x1: {
      initial: { rotate: 0 },
      animate: {
        rotate: [0, 45, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    x2: {
      initial: { rotate: 0 },
      animate: {
        rotate: [0, 45, 0],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.05 },
      },
    },
    group: {
      initial: { x: 0 },
      animate: {
        x: [0, -0.6, 0.6, -0.6, 0.6, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: WifiDisconnected02Props) {
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
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path
          d="M18.5 13C14.7324 9 9.5 9 5.5 13"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.arc1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M2 8C8.31579 2.66669 15.6842 2.66668 22 7.99989"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.arc2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.path
        d="M14.5002 15L9.50016 20"
        strokeLinecap="round"
        variants={variants.x1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M14.5002 20L9.50016 15"
        strokeLinecap="round"
        variants={variants.x2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function WifiDisconnected02(props: WifiDisconnected02Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  WifiDisconnected02,
  WifiDisconnected02 as WifiDisconnected02Icon,
  type WifiDisconnected02Props,
  type WifiDisconnected02Props as WifiDisconnected02IconProps,
};
