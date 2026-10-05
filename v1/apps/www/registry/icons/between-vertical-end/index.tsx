'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type BetweenVerticalEndProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    leftRect: {
      initial: {
        x: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        x: -2,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    rightRect: {
      initial: {
        x: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        x: 2,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    arrow: {
      initial: {
        y: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        y: -3,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    leftRect: {
      initial: { x: 0 },
      animate: {
        x: [0, -2, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    rightRect: {
      initial: { x: 0 },
      animate: {
        x: [0, 2, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    arrow: {
      initial: { y: 0 },
      animate: {
        y: [0, -3, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BetweenVerticalEndProps) {
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
        width={7}
        height={13}
        x={3}
        y={3}
        rx={1}
        variants={variants.leftRect}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m9 22 3-3 3 3"
        variants={variants.arrow}
        initial="initial"
        animate={controls}
      />
      <motion.rect
        width={7}
        height={13}
        x={14}
        y={3}
        rx={1}
        variants={variants.rightRect}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function BetweenVerticalEnd(props: BetweenVerticalEndProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  BetweenVerticalEnd,
  BetweenVerticalEnd as BetweenVerticalEndIcon,
  type BetweenVerticalEndProps,
  type BetweenVerticalEndProps as BetweenVerticalEndIconProps,
};
