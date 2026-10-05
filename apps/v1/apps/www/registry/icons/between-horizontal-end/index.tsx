'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type BetweenHorizontalEndProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    topRect: {
      initial: {
        y: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        y: -2,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    bottomRect: {
      initial: {
        y: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        y: 2,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    arrow: {
      initial: {
        x: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        x: -3,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    topRect: {
      initial: { y: 0 },
      animate: {
        y: [0, -2, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    bottomRect: {
      initial: { y: 0 },
      animate: {
        y: [0, 2, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    arrow: {
      initial: { x: 0 },
      animate: {
        x: [0, -3, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BetweenHorizontalEndProps) {
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
        width={13}
        height={7}
        x={3}
        y={3}
        rx={1}
        variants={variants.topRect}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m22 15-3-3 3-3"
        variants={variants.arrow}
        initial="initial"
        animate={controls}
      />
      <motion.rect
        width={13}
        height={7}
        x={3}
        y={14}
        rx={1}
        variants={variants.bottomRect}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function BetweenHorizontalEnd(props: BetweenHorizontalEndProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  BetweenHorizontalEnd,
  BetweenHorizontalEnd as BetweenHorizontalEndIcon,
  type BetweenHorizontalEndProps,
  type BetweenHorizontalEndProps as BetweenHorizontalEndIconProps,
};
