'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type SkipForwardProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    triangle: {
      initial: { x: 0 },
      animate: {
        x: [0, 2, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SkipForwardProps) {
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
      <path d="M21 4v16" />
      <motion.path
        d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z"
        variants={variants.triangle}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function SkipForward(props: SkipForwardProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SkipForward,
  SkipForward as SkipForwardIcon,
  type SkipForwardProps,
  type SkipForwardProps as SkipForwardIconProps,
};
