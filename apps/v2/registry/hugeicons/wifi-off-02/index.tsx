'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type WifiOff02Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    waves: {},
    slash: {},
    group: {
      initial: { x: 0 },
      animate: {
        x: [0, -0.6, 0.6, -0.6, 0.6, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  off: {
    waves: {},
    slash: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    group: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: WifiOff02Props) {
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
          d="M2 8.81966C3.05591 7.87522 4.23126 7.09293 5.4875 6.4875M22 8.81966C19.2499 6.35989 15.6897 5 12 5C10.7883 5 9.5905 5.14667 8.4308 5.4308M5 12.8587C6.22581 11.6571 7.72851 10.8022 9.35595 10.3559M19 12.8587C17.3838 11.2744 15.2862 10.2927 13.056 10.056M8.5 16.4287C9.43464 15.5125 10.6912 14.9994 12 14.9994C13.0878 14.9994 14.1392 15.3543 15 16M12.1256 19.75H12.0006M12.2506 19.75C12.2506 19.8881 12.1387 20 12.0006 20C11.8625 20 11.7506 19.8881 11.7506 19.75C11.7506 19.6119 11.8625 19.5 12.0006 19.5C12.1387 19.5 12.2506 19.6119 12.2506 19.75Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.waves}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M3 4L19 20"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.slash}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function WifiOff02(props: WifiOff02Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  WifiOff02,
  WifiOff02 as WifiOff02Icon,
  type WifiOff02Props,
  type WifiOff02Props as WifiOff02IconProps,
};
