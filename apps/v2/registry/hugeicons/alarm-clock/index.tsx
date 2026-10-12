'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type AlarmClockProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, 0.5, -0.5, 0.5, -0.5, 0.5, -0.5, 0.5, -0.5, 0.5, -0.5, 0],
        y: [0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    hands: {},
    bell1: {
      initial: { y: 0, rotate: 0 },
      animate: {
        y: [0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0],
        rotate: [0, 12, -12, 12, -12, 12, -12, 12, -12, 12, -12, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    bell2: {
      initial: { y: 0, rotate: 0 },
      animate: {
        y: [0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0],
        rotate: [0, -12, 12, -12, 12, -12, 12, -12, 12, -12, 12, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: AlarmClockProps) {
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
          d="M20.5 12.5C20.5 17.1944 16.6944 21 12 21C7.30558 21 3.5 17.1944 3.5 12.5C3.5 7.80558 7.30558 4 12 4C16.6944 4 20.5 7.80558 20.5 12.5Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M5.88 18.7031L3.5 21.0031"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M18.14 18.668L20.5 20.998"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path3}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M12 8V12.5L14 14.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.hands}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.path
        d="M5 3L2 6"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.bell1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M22 6L19 3"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.bell2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function AlarmClock(props: AlarmClockProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  AlarmClock,
  AlarmClock as AlarmClockIcon,
  type AlarmClockProps,
  type AlarmClockProps as AlarmClockIconProps,
};
