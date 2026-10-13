'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type TrendingDownProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    line: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    tip: {
      initial: { opacity: 1, scale: 1, transformOrigin: '100% 100%' },
      animate: {
        opacity: [0, 0, 1],
        scale: [0.3, 0.3, 1],
        transformOrigin: '100% 100%',
        transition: { duration: 0.6, ease: 'easeOut', times: [0, 0.6, 1] },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: TrendingDownProps) {
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
        d="M2 7l6.5 6.5 5-5L22 17"
        variants={variants.line}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16 17h6v-6"
        variants={variants.tip}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function TrendingDown(props: TrendingDownProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  TrendingDown,
  TrendingDown as TrendingDownIcon,
  type TrendingDownProps,
  type TrendingDownProps as TrendingDownIconProps,
};
