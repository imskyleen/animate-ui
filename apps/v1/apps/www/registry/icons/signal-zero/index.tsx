'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type SignalZeroProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: {
        pathLength: 1,
        opacity: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SignalZeroProps) {
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
        d="M2 20h.01"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function SignalZero(props: SignalZeroProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SignalZero,
  SignalZero as SignalZeroIcon,
  type SignalZeroProps,
  type SignalZeroProps as SignalZeroIconProps,
};
