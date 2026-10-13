'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type WavesProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    wave1: {
      initial: { scaleY: 1 },
      animate: {
        scaleY: [1, 1.5, 0.8, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    wave2: {
      initial: { scaleY: 1 },
      animate: {
        scaleY: [1, 1.5, 0.8, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.1 },
      },
    },
    wave3: {
      initial: { scaleY: 1 },
      animate: {
        scaleY: [1, 1.5, 0.8, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.2 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: WavesProps) {
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
        d="M2 5q2.5 2 5 0t5 0 5 0 5 0"
        variants={variants.wave1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M2 12q2.5 2 5 0t5 0 5 0 5 0"
        variants={variants.wave2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M2 19q2.5 2 5 0t5 0 5 0 5 0"
        variants={variants.wave3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Waves(props: WavesProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Waves,
  Waves as WavesIcon,
  type WavesProps,
  type WavesProps as WavesIconProps,
};
