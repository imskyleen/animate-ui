'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type BlendProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    circle1: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: 6,
        y: 6,
        transition: { type: 'spring', stiffness: 100, damping: 12 },
      },
    },
    circle2: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: -6,
        y: -6,
        transition: { type: 'spring', stiffness: 100, damping: 12 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BlendProps) {
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
        cx="9"
        cy="9"
        r="7"
        variants={variants.circle1}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx="15"
        cy="15"
        r="7"
        variants={variants.circle2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Blend(props: BlendProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Blend,
  Blend as BlendIcon,
  type BlendProps,
  type BlendProps as BlendIconProps,
};
