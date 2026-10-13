'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type TimerProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    circle: {},
    line1: {
      initial: {
        rotate: 0,
        transformOrigin: '74.28% 78.19%',
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
      animate: {
        rotate: 360,
        transformOrigin: '74.28% 78.19%',
        transition: { ease: 'easeInOut', duration: 0.6, delay: 0.15 },
      },
    },
    line2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: TimerProps) {
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
      <path
        d="M5 4.82C3.14864 6.63902 2 9.17385 2 11.9776C2 17.5129 6.47715 22.0001 12 22.0001C17.5228 22.0001 22 17.5129 22 11.9776C22 7.1242 18.5581 3.07656 13.9872 2.15288C13.1512 1.98394 12.7332 1.89947 12.3666 2.20022C12 2.50097 12 2.98714 12 3.95949V4.96175"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.path
        d="M11.0809 13.152L8 7L13.4196 11.2796C14.1901 11.888 14.1941 13.0472 13.4277 13.6607C12.6614 14.2743 11.5189 14.0266 11.0809 13.152Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Timer(props: TimerProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Timer,
  Timer as TimerIcon,
  type TimerProps,
  type TimerProps as TimerIconProps,
};
