'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type GavelProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        transformOrigin: 'bottom left',
        rotate: [0, 30, -5, 0],
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: GavelProps) {
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
        d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m16 16 6-6"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m8 8 6-6"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m9 7 8 8"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m21 11-8-8"
        variants={variants.path5}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Gavel(props: GavelProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Gavel,
  Gavel as GavelIcon,
  type GavelProps,
  type GavelProps as GavelIconProps,
};
