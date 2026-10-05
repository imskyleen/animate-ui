'use client';

import * as React from 'react';
import { motion, Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type MapPinProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        scale: 1,
        rotate: 0,
        x: 0,
        y: 0,
        transformOrigin: 'bottom center',
      },
      animate: {
        scale: [1, 0.75, 1, 1],
        rotate: [0, 30, -15, 0],
        x: [0, 0, 0, 0],
        y: [0, -6, 0, 0],
        transformOrigin: 'bottom center',
        transition: { ease: 'easeInOut', duration: 1 },
      },
    },
    circle: {},
    path: {},
  } satisfies Record<string, Variants>,
  wiggle: {
    group: {
      initial: {
        rotate: 0,
        transformOrigin: 'bottom center',
      },
      animate: {
        rotate: [0, 12, -10, 0],
        transformOrigin: 'bottom center',
        transition: { ease: 'easeInOut', duration: 1 },
      },
    },
    circle: {},
    path: {},
  } satisfies Record<string, Variants>,
  rotate: {
    group: {
      initial: {
        transform: 'rotate3d(0, 1, 0, 0deg)',
        perspective: 600,
      },
      animate: {
        transform: 'rotate3d(0, 1, 0, 360deg)',
        perspective: 600,
        transition: { ease: 'easeInOut', duration: 0.7 },
      },
    },
    circle: {},
    path: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MapPinProps) {
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
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.circle
          cx={12}
          cy={10}
          r={3}
          variants={variants.circle}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
          variants={variants.path}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function MapPin(props: MapPinProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MapPin,
  MapPin as MapPinIcon,
  type MapPinProps,
  type MapPinProps as MapPinIconProps,
};
