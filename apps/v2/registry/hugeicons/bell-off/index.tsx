'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type BellOffProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 5, -4, 2, -1, 0],
        transformOrigin: 'top center',
        transition: { duration: 0.7, ease: 'easeInOut' },
      },
    },
    path1: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, -1.5, 1, -0.5, 0],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    path2: {},
    path3: {},
    path4: {},
  } satisfies Record<string, Variants>,
  off: {
    path1: {},
    path2: {},
    path3: {
      initial: {
        opacity: 0,
        pathLength: 0,
      },
      animate: {
        opacity: 1,
        pathLength: 1,
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path4: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BellOffProps) {
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
          d="M8 18C8 20.2091 9.79086 22 12 22C14.2091 22 16 20.2091 16 18"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M18 18H4.43654C3.70878 18 3.3449 18 3.13431 17.8951C2.72509 17.6913 2.50621 17.2359 2.60268 16.789C2.65233 16.559 2.87964 16.2749 3.33427 15.7066L3.50401 15.4944C3.95985 14.9246 4.18779 14.6397 4.38067 14.3409C4.98035 13.4119 5.35143 12.354 5.46349 11.254C5.49954 10.9002 5.49954 10.5353 5.49954 9.8056V8.5C5.49954 8.03572 5.49954 7.80358 5.51239 7.60758C5.54913 7.04701 5.66232 6.50772 5.84168 6"
          strokeLinecap="round"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M8 3.12589C8.88491 2.48978 9.95074 2.08864 11.1071 2.01285C11.3031 2 11.5353 2 11.9995 2C12.4638 2 12.696 2 12.892 2.01285C15.8965 2.20977 18.2898 4.60304 18.4867 7.60758C18.4995 7.80358 18.4995 8.03572 18.4995 8.5V9.8056C18.4995 10.5353 18.4995 10.9002 18.5356 11.254C18.6477 12.354 19.0187 13.4119 19.6184 14.3409C19.8113 14.6397 20.0392 14.9246 20.4951 15.4944L20.6648 15.7066C20.7508 15.814 20.8286 15.9113 20.8986 16"
          strokeLinecap="round"
          variants={variants.path4}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.path
        d="M2 2L22 22"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function BellOff(props: BellOffProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  BellOff,
  BellOff as BellOffIcon,
  type BellOffProps,
  type BellOffProps as BellOffIconProps,
};
