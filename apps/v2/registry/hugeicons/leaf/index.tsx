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
      {...props}
    >
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <path
          d="M7.64584 15.7108C7.23279 14.8966 7 13.9755 7 13C7 9.78484 9.5 7.5 13 7C17.0817 6.4169 18.8333 4.16667 20 3C23.5 16 17 19 13 19C11.9071 19 10.8825 18.7078 10 18.1973"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 21C3.5 18 5.45791 16.1355 10 15C13.2167 14.1958 15.4634 12.1791 17 10.0549"
          strokeLinecap="round"
        />
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
