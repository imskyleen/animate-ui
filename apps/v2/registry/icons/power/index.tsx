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
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <motion.path
        d="M12 2v10"
        variants={variants.stem}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M18.4 6.6a9 9 0 1 1-12.77.04"
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
