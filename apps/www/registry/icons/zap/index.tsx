'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type ZapProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        scale: 1,
        rotate: 0,
      },
      animate: {
        scale: [1, 0.85, 1.25, 0.95, 1],
        rotate: [0, -8, 8, -4, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    path: {},
  } satisfies Record<string, Variants>,
  fill: {
    group: {
      initial: {
        scale: 1,
        rotate: 0,
      },
      animate: {
        scale: [1, 0.85, 1.25, 0.95, 1],
        rotate: [0, -8, 8, -4, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    path: {
      initial: {
        fill: 'currentColor',
        fillOpacity: 0,
      },
      animate: {
        fillOpacity: 1,
        transition: { delay: 0.15 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ZapProps) {
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
      variants={variants.group}
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.path
        d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
        variants={variants.path}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Zap(props: ZapProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Zap,
  Zap as ZapIcon,
  type ZapProps,
  type ZapProps as ZapIconProps,
};
