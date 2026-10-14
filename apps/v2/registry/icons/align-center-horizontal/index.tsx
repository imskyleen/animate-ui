'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type AlignCenterHorizontalProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    bar: {
      initial: { y: 0 },
      animate: {
        y: [0, -3, 0],
        transition: {
          duration: 0.6,
          times: [0, 0.45, 1],
          ease: ['easeOut', 'backOut'],
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: AlignCenterHorizontalProps) {
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
      <path d="M2 12h20" />
      <g>
        <path d="M10 16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4" />
        <path d="M10 8V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4" />
      </g>
      <motion.g variants={variants.bar} initial="initial" animate={controls}>
        <path d="M20 16v1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1" />
        <path d="M14 8V7c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v1" />
      </motion.g>
    </motion.svg>
  );
}

function AlignCenterHorizontal(props: AlignCenterHorizontalProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  AlignCenterHorizontal,
  AlignCenterHorizontal as AlignCenterHorizontalIcon,
  type AlignCenterHorizontalProps,
  type AlignCenterHorizontalProps as AlignCenterHorizontalIconProps,
};
