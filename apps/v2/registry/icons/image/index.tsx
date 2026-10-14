'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type ImageProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    frame: {},
    sun: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.4, delay: 0.05, ease: 'easeOut' },
      },
    },
    mountain: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.5, delay: 0.3, ease: 'easeOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ImageProps) {
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
      <motion.rect
        width="18"
        height="18"
        x="3"
        y="3"
        rx="2"
        ry="2"
        variants={variants.frame}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx="9"
        cy="9"
        r="2"
        variants={variants.sun}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
        variants={variants.mountain}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Image(props: ImageProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Image,
  Image as ImageIcon,
  type ImageProps,
  type ImageProps as ImageIconProps,
};
