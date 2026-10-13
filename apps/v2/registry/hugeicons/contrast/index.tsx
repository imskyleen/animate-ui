'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

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
      {...props}
    >
      <motion.circle
        cx={12}
        cy={12}
        r={10}
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.circle}
        initial="initial"
        animate={controls}
      />
      <motion.g variants={variants.path} initial="initial" animate={controls}>
        <path d="M12 22V2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20.5 17L12 17" strokeLinecap="round" />
        <path d="M22 12L12 12" strokeLinecap="round" />
        <path d="M20.5 7L12 7" strokeLinecap="round" />
      </motion.g>
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
