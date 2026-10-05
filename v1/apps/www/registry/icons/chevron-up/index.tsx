'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type ChevronUpProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path: {
      initial: {
        y: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: -4,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    path: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, -4, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ChevronUpProps) {
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
        d="m18 15-6-6-6 6"
        variants={variants.path}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ChevronUp(props: ChevronUpProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ChevronUp,
  ChevronUp as ChevronUpIcon,
  type ChevronUpProps,
  type ChevronUpProps as ChevronUpIconProps,
};
