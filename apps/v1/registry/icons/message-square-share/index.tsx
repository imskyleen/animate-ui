'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type MessageSquareShareProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        transformOrigin: 'bottom left',
        rotate: [0, 8, -8, 2, 0],
        transition: {
          ease: 'easeInOut',
          duration: 0.8,
          times: [0, 0.4, 0.6, 0.8, 1],
        },
      },
    },
    group2: {},
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
  'arrow-up': {
    group: {},
    group2: {
      initial: {
        x: 0,
        y: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        x: 2,
        y: -2,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
  'arrow-up-loop': {
    group: {},
    group2: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: [0, 2, 0],
        y: [0, -2, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MessageSquareShareProps) {
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
        <motion.path
          d="M21 12v3a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h7"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.g
          variants={variants.group2}
          initial="initial"
          animate={controls}
        >
          <motion.path
            d="M16 3h5v5"
            variants={variants.path2}
            initial="initial"
            animate={controls}
          />
          <motion.path
            d="m16 8 5-5"
            variants={variants.path3}
            initial="initial"
            animate={controls}
          />
        </motion.g>
      </motion.g>
    </motion.svg>
  );
}

function MessageSquareShare(props: MessageSquareShareProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MessageSquareShare,
  MessageSquareShare as MessageSquareShareIcon,
  type MessageSquareShareProps,
  type MessageSquareShareProps as MessageSquareShareIconProps,
};
