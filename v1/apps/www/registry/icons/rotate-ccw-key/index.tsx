'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type RotateCcwKeyProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        transition: { type: 'spring', stiffness: 150, damping: 25 },
      },
      animate: {
        rotate: -45,
        transition: { type: 'spring', stiffness: 150, damping: 25 },
      },
    },
    arrowArc: {},
    arrowHead: {},
    keyPart1: {},
    keyPart2: {},
    circle: {},
  } satisfies Record<string, Variants>,
  rotate: {
    group: {
      initial: {
        rotate: 0,
        transition: { type: 'spring', stiffness: 150, damping: 25 },
      },
      animate: {
        rotate: -360,
        transition: { type: 'spring', stiffness: 150, damping: 25 },
      },
    },
    arrowArc: {},
    arrowHead: {},
    keyPart1: {},
    keyPart2: {},
    circle: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: RotateCcwKeyProps) {
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
        d="m14.5 9.5 1 1"
        variants={variants.keyPart1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m15.5 8.5-4 4"
        variants={variants.keyPart2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 12a9 9 0 1 0 9-9 9.74 9.74 0 0 0-6.74 2.74L3 8"
        variants={variants.arrowArc}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 3v5h5"
        variants={variants.arrowHead}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx="10"
        cy="14"
        r="2"
        variants={variants.circle}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function RotateCcwKey(props: RotateCcwKeyProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  RotateCcwKey,
  RotateCcwKey as RotateCcwKeyIcon,
  type RotateCcwKeyProps,
  type RotateCcwKeyProps as RotateCcwKeyIconProps,
};
