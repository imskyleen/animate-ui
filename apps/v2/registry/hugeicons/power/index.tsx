'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type PowerProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    stem: {
      initial: { y: 0 },
      animate: {
        y: [0, 2, 0],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    ring: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 0.94, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PowerProps) {
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
      <motion.path
        d="M12 3V12"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.stem}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M18.7083 6C20.1334 7.59227 21 9.69494 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 9.69494 3.86656 7.59227 5.29168 6"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.ring}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Power(props: PowerProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Power,
  Power as PowerIcon,
  type PowerProps,
  type PowerProps as PowerIconProps,
};
