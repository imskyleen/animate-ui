'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type BatteryChargingProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {},
    path2: {},
    path3: {
      initial: {
        opacity: 1,
        scale: 1,
      },
      animate: {
        opacity: [1, 0.5, 1, 0.5, 1],
        scale: [1, 0.9, 1, 0.9, 1],
        transition: {
          duration: 1.8,
          ease: 'easeInOut',
        },
      },
    },
    line: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BatteryChargingProps) {
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
      <motion.path
        d="M15 7h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M6 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h1"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m11 7-3 5h4l-3 5"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={22}
        x2={22}
        y1={11}
        y2={13}
        variants={variants.line}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function BatteryCharging(props: BatteryChargingProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  BatteryCharging,
  BatteryCharging as BatteryChargingIcon,
  type BatteryChargingProps,
  type BatteryChargingProps as BatteryChargingIconProps,
};
