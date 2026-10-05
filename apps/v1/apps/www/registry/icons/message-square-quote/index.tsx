'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type MessageSquareQuoteProps = IconProps<keyof typeof animations>;

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
        x: 0,
        y: 0,
      },
      animate: {
        x: [0, 1.5, 0],
        y: [0, -0.5, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path3: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: [0, 1, 0],
        y: [0, -0.5, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MessageSquareQuoteProps) {
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
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M8 12a2 2 0 0 0 2-2V8H8"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M14 12a2 2 0 0 0 2-2V8h-2"
          variants={variants.path3}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function MessageSquareQuote(props: MessageSquareQuoteProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MessageSquareQuote,
  MessageSquareQuote as MessageSquareQuoteIcon,
  type MessageSquareQuoteProps,
  type MessageSquareQuoteProps as MessageSquareQuoteIconProps,
};
