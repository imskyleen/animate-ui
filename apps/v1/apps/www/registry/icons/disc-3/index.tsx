'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type Disc3Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { rotate: 0 },
      animate: {
        rotate: 360,
        transition: {
          duration: 1,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        },
      },
    },
    circle1: {},
    circle2: {},
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Disc3Props) {
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
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        variants={variants.circle1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M6 12c0-1.7.7-3.2 1.8-4.2"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx="12"
        cy="12"
        r="2"
        variants={variants.circle2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M18 12c0 1.7-.7 3.2-1.8 4.2"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Disc3(props: Disc3Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Disc3,
  Disc3 as Disc3Icon,
  type Disc3Props,
  type Disc3Props as Disc3IconProps,
};
