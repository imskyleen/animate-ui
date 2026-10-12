'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Wifi01Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    circle: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    arc1: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.12 },
      },
    },
    arc2: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.24 },
      },
    },
    arc3: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.36 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Wifi01Props) {
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
      <motion.circle
        cx={12}
        cy={18}
        r={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.circle}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8.25 14.5C10.25 12.5 13.75 12.5 15.75 14.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.arc1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M18.5 11.5C14.7324 8.16667 9.5 8.16667 5.5 11.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.arc2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M2 8.5C8.31579 3.16669 15.6842 3.16668 22 8.49989"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.arc3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Wifi01(props: Wifi01Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Wifi01,
  Wifi01 as Wifi01Icon,
  type Wifi01Props,
  type Wifi01Props as Wifi01IconProps,
};
