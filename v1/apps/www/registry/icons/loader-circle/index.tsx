'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type LoaderCircleProps = IconProps<keyof typeof animations>;

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
    path: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: LoaderCircleProps) {
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
        d="M21 12a9 9 0 1 1-6.219-8.56"
        variants={variants.path}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function LoaderCircle(props: LoaderCircleProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  LoaderCircle,
  LoaderCircle as LoaderCircleIcon,
  type LoaderCircleProps,
  type LoaderCircleProps as LoaderCircleIconProps,
};
