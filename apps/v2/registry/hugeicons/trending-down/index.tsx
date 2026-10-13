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
      {...props}
    >
      <motion.path
        d="M3 7L7 11C7.88256 11.8826 8.32385 12.3238 8.86543 12.3726C8.95496 12.3807 9.04504 12.3807 9.13457 12.3726C9.67615 12.3238 10.1174 11.8826 11 11C11.8826 10.1174 12.3238 9.67615 12.8654 9.62737C12.955 9.6193 13.045 9.6193 13.1346 9.62737C13.6762 9.67615 14.1174 10.1174 15 11L20 16"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M20.7234 12C20.7234 12 21.3457 16.101 20.7234 16.7234C20.101 17.3458 16 16.7234 16 16.7234"
        strokeLinecap="round"
        strokeLinejoin="round"
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
