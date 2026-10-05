'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type MessageCircleWarningProps = IconProps<keyof typeof animations>;

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
    path1: {},
    path2: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 1, -0.25, 0],
        transition: {
          ease: 'easeInOut',
          duration: 0.8,
          times: [0, 0.4, 0.7, 1],
        },
      },
    },
    path3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MessageCircleWarningProps) {
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
          d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M12 8v4"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M12 16h.01"
          variants={variants.path3}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function MessageCircleWarning(props: MessageCircleWarningProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MessageCircleWarning,
  MessageCircleWarning as MessageCircleWarningIcon,
  type MessageCircleWarningProps,
  type MessageCircleWarningProps as MessageCircleWarningIconProps,
};
