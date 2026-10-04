'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type FrameProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    line1: {
      initial: {
        y: 0,
        transition: { type: 'spring', stiffness: 150, damping: 15 },
      },
      animate: {
        y: -4,
        transition: { type: 'spring', stiffness: 150, damping: 15 },
      },
    },
    line2: {
      initial: {
        y: 0,
        transition: { type: 'spring', stiffness: 150, damping: 15 },
      },
      animate: {
        y: 4,
        transition: { type: 'spring', stiffness: 150, damping: 15 },
      },
    },
    line3: {
      initial: {
        x: 0,
        transition: { type: 'spring', stiffness: 150, damping: 15 },
      },
      animate: {
        x: -4,
        transition: { type: 'spring', stiffness: 150, damping: 15 },
      },
    },
    line4: {
      initial: {
        x: 0,
        transition: { type: 'spring', stiffness: 150, damping: 15 },
      },
      animate: {
        x: 4,
        transition: { type: 'spring', stiffness: 150, damping: 15 },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    line1: {
      initial: {
        y: 0,
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
      animate: {
        y: [0, -4, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line2: {
      initial: {
        y: 0,
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
      animate: {
        y: [0, 4, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line3: {
      initial: {
        x: 0,
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
      animate: {
        x: [0, -4, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line4: {
      initial: {
        x: 0,
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
      animate: {
        x: [0, 4, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: FrameProps) {
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
      <motion.line
        x1="22"
        x2="2"
        y1="6"
        y2="6"
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1="22"
        x2="2"
        y1="18"
        y2="18"
        variants={variants.line2}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1="6"
        x2="6"
        y1="2"
        y2="22"
        variants={variants.line3}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1="18"
        x2="18"
        y1="2"
        y2="22"
        variants={variants.line4}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Frame(props: FrameProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Frame,
  Frame as FrameIcon,
  type FrameProps,
  type FrameProps as FrameIconProps,
};
