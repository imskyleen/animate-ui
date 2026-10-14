'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type ZoomOutProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    lens: {
      initial: { scale: 1, transformOrigin: '44.44% 44.44%' },
      animate: {
        scale: [1, 1.1, 1],
        transformOrigin: '44.44% 44.44%',
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    sign: {
      initial: { scaleX: 1 },
      animate: {
        scaleX: [1, 0.4, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  shrink: {
    lens: {
      initial: { scale: 1, transformOrigin: '44.44% 44.44%' },
      animate: {
        scale: [1, 0.86, 1],
        transformOrigin: '44.44% 44.44%',
        transition: { duration: 0.9, times: [0, 0.45, 1], ease: 'easeInOut' },
      },
    },
    sign: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ZoomOutProps) {
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
      <motion.g variants={variants.lens} initial="initial" animate={controls}>
        <path d="M17 17L21 21" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <motion.path
          d="M7.5 11L14.5 11"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.sign}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function ZoomOut(props: ZoomOutProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ZoomOut,
  ZoomOut as ZoomOutIcon,
  type ZoomOutProps,
  type ZoomOutProps as ZoomOutIconProps,
};
