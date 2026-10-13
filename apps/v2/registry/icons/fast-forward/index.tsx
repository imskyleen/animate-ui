'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type FastForwardProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    back: {
      initial: { x: 0 },
      animate: {
        x: [0, 1.5, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    front: {
      initial: { x: 0 },
      animate: {
        x: [0, 0.6, 0],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.05 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: FastForwardProps) {
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
        d="M2 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 2 18z"
        variants={variants.back}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 12 18z"
        variants={variants.front}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function FastForward(props: FastForwardProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  FastForward,
  FastForward as FastForwardIcon,
  type FastForwardProps,
  type FastForwardProps as FastForwardIconProps,
};
