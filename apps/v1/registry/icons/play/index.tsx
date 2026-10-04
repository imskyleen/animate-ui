'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type PlayProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    polygon: {
      initial: {
        x: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        x: 3,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    polygon: {
      initial: {
        x: 0,
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
      animate: {
        x: [0, 3, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PlayProps) {
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
      <motion.polygon
        points="6 3 20 12 6 21 6 3"
        variants={variants.polygon}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Play(props: PlayProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Play,
  Play as PlayIcon,
  type PlayProps,
  type PlayProps as PlayIconProps,
};
