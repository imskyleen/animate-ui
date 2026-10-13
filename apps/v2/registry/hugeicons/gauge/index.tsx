'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type GaugeProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: {
        rotate: 0,
        transformOrigin: '50% 75%',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        rotate: 70,
        transformOrigin: '50% 75%',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    path2: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: {
      initial: {
        rotate: 0,
        transformOrigin: '50% 75%',
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
      animate: {
        rotate: [0, 70, 0],
        transformOrigin: '50% 75%',
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
      {...props}
    >
      <circle cx={12.0} cy={12.0} r={10.0} />
      <path
        d="M18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12"
        strokeLinecap="round"
      />
      <motion.g variants={variants.path1} initial="initial" animate={controls}>
        <circle cx={12.0} cy={16.0} r={2.0} />
        <path d="M12 14V10" strokeLinecap="round" />
      </motion.g>
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
