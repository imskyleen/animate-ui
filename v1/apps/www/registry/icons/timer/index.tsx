'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type TimerProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    circle: {},
    line1: {
      initial: {
        rotate: 0,
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
      animate: {
        transformOrigin: 'bottom left',
        rotate: 360,
        transition: { ease: 'easeInOut', duration: 0.6, delay: 0.15 },
      },
    },
    line2: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 1.5, 0],
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
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
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <motion.circle
        cx={12}
        cy={14}
        r={8}
        variants={variants.circle}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={12}
        x2={15}
        y1={14}
        y2={11}
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={10}
        x2={14}
        y1={2}
        y2={2}
        variants={variants.line2}
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
