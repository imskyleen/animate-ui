'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type LeafProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { rotate: 0, transformOrigin: '0% 100%' },
      animate: {
        rotate: [0, 3, -3, 1.5, 0],
        transformOrigin: '0% 100%',
        transition: { duration: 0.9, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: LeafProps) {
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
        <path d="M11 20a10 10 0 0010-10 25.9 25.9 0 00-1.04-7.281 1 1 0 00-1.755-.325C15.833 5.5 13 5.5 9.8 6.1A7 7 0 0011 20" />
        <path d="M2 21a5 5 0 012.911-4.544C7.613 15.212 8.351 15.24 11 13" />
      </motion.g>
    </motion.svg>
  );
}

function Leaf(props: LeafProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Leaf,
  Leaf as LeafIcon,
  type LeafProps,
  type LeafProps as LeafIconProps,
};
