'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type EvChargerProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {
      initial: {
        opacity: 1,
        scale: 1,
      },
      animate: {
        opacity: [1, 0.5, 1, 0.5, 1],
        scale: [1, 0.9, 1, 0.9, 1],
        transition: {
          duration: 1.8,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: EvChargerProps) {
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
        d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0v-6.998a2 2 0 0 0-.59-1.42L18 5"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M14 21V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M2 21h13"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 7h11"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m9 11-2 3h3l-2 3"
        variants={variants.path5}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function EvCharger(props: EvChargerProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  EvCharger,
  EvCharger as EvChargerIcon,
  type EvChargerProps,
  type EvChargerProps as EvChargerIconProps,
};
