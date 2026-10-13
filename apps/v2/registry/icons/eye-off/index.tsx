'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type EyeOffProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    eye: {
      initial: { scaleY: 1 },
      animate: {
        scaleY: [1, 0.8, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    slash: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: EyeOffProps) {
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
      <motion.g variants={variants.eye} initial="initial" animate={controls}>
        <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
        <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
        <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      </motion.g>
      <motion.path
        d="m2 2 20 20"
        variants={variants.slash}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function EyeOff(props: EyeOffProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  EyeOff,
  EyeOff as EyeOffIcon,
  type EyeOffProps,
  type EyeOffProps as EyeOffIconProps,
};
