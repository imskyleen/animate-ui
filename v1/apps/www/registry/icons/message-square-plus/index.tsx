'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type MessageSquarePlusProps = IconProps<keyof typeof animations>;

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
        rotate: 0,
      },
      animate: {
        rotate: [0, 45, 0],
        transition: {
          ease: 'easeInOut',
          duration: 0.6,
        },
      },
    },
    path3: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 45, 0],
        transition: {
          ease: 'easeInOut',
          duration: 0.6,
          delay: 0.05,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MessageSquarePlusProps) {
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
          d="M12 7v6"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M9 10h6"
          variants={variants.path3}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function MessageSquarePlus(props: MessageSquarePlusProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MessageSquarePlus,
  MessageSquarePlus as MessageSquarePlusIcon,
  type MessageSquarePlusProps,
  type MessageSquarePlusProps as MessageSquarePlusIconProps,
};
