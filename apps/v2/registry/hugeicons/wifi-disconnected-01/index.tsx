'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type WifiDisconnected01Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    arc1: {},
    arc2: {},
    arc3: {},
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

function IconComponent({ size, ...props }: WifiDisconnected01Props) {
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
          d="M8.5 15.9996C9.36651 15.1331 10.4207 14.642 11.5 14.5264"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.arc1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M5.5 12.5C8.67327 9.32673 12.6221 8.67087 16 10.5324"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.arc2}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M2 8.5C8.31579 3.16669 15.6842 3.16668 22 8.49989"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.arc3}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.path
        d="M21.0002 13.5L15.0002 19.5"
        strokeLinecap="round"
        variants={variants.x1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M21.0002 19.5L15.0002 13.5"
        strokeLinecap="round"
        variants={variants.x2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function WifiDisconnected01(props: WifiDisconnected01Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  WifiDisconnected01,
  WifiDisconnected01 as WifiDisconnected01Icon,
  type WifiDisconnected01Props,
  type WifiDisconnected01Props as WifiDisconnected01IconProps,
};
