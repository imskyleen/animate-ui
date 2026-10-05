'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type ContrastProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    circle: {},
    path: {
      initial: { rotate: 0 },
      animate: {
        rotate: 180,
        transformOrigin: 'left center',
        transition: {
          type: 'spring',
          stiffness: 80,
          damping: 10,
        },
      },
    },
  } satisfies Record<string, Variants>,
  rotate: {
    circle: {},
    path: {
      initial: { rotate: 0 },
      animate: {
        rotate: 360,
        transformOrigin: 'left center',
        transition: {
          type: 'spring',
          stiffness: 80,
          damping: 10,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ContrastProps) {
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
        cy={12}
        r={10}
        variants={variants.circle}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 18a6 6 0 0 0 0-12v12z"
        variants={variants.path}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Contrast(props: ContrastProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Contrast,
  Contrast as ContrastIcon,
  type ContrastProps,
  type ContrastProps as ContrastIconProps,
};
