'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Target01Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    ring1: {},
    ring2: {},
    arrow: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, -1.5, 0],
        y: [0, 1.5, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Target01Props) {
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
        d="M15.1312 2.5C14.1462 2.17555 13.0936 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 10.9548 21.8396 9.94704 21.5422 9"
        strokeLinecap="round"
        variants={variants.ring1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.ring2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M19.5 4.5L12 12M19.5 4.5V2M19.5 4.5H22"
        strokeLinecap="round"
        variants={variants.arrow}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Target01(props: Target01Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Target01,
  Target01 as Target01Icon,
  type Target01Props,
  type Target01Props as Target01IconProps,
};
