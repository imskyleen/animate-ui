'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type FlagProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    cloth: {
      initial: { skewY: 0, scaleX: 1, transformOrigin: '0% 50%' },
      animate: {
        skewY: [0, 3, -3, 1.5, 0],
        scaleX: [1, 0.9, 1, 0.95, 1],
        transformOrigin: '0% 50%',
        transition: { duration: 0.9, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: FlagProps) {
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
      <path d="M4 22V4" />
      <motion.path
        d="M4 4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"
        variants={variants.cloth}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Flag(props: FlagProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Flag,
  Flag as FlagIcon,
  type FlagProps,
  type FlagProps as FlagIconProps,
};
