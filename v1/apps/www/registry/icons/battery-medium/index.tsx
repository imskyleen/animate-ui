'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type BatteryMediumProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rect: {},
    line1: {},
    line2: {
      initial: {
        opacity: 1,
        scale: 1,
      },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          opacity: {
            duration: 0.3,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0,
          },
          scale: {
            duration: 0.3,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0,
          },
        },
      },
    },
    line3: {
      initial: {
        opacity: 1,
        scale: 1,
      },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          opacity: {
            duration: 0.3,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.3,
          },
          scale: {
            duration: 0.3,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.3,
          },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BatteryMediumProps) {
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
      <motion.rect
        width={16}
        height={10}
        x={2}
        y={7}
        rx={2}
        ry={2}
        variants={variants.rect}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={22}
        x2={22}
        y1={11}
        y2={13}
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={6}
        x2={6}
        y1={11}
        y2={13}
        variants={variants.line2}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={10}
        x2={10}
        y1={11}
        y2={13}
        variants={variants.line3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function BatteryMedium(props: BatteryMediumProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  BatteryMedium,
  BatteryMedium as BatteryMediumIcon,
  type BatteryMediumProps,
  type BatteryMediumProps as BatteryMediumIconProps,
};
