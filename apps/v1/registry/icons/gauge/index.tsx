'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type GaugeProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: {
        rotate: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        transformOrigin: 'bottom left',
        rotate: 70,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    path2: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: {
      initial: {
        rotate: 0,
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
      animate: {
        transformOrigin: 'bottom left',
        rotate: [0, 70, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: GaugeProps) {
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
        d="m12 14 4-4"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3.34 19a10 10 0 1 1 17.32 0"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Gauge(props: GaugeProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Gauge,
  Gauge as GaugeIcon,
  type GaugeProps,
  type GaugeProps as GaugeIconProps,
};
