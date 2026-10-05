'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type ClipboardListProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rect: {},
    path1: {},
    path2: {
      initial: {
        pathLength: 1,
        opacity: 1,
        scale: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1.1, 1],
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    path3: {
      initial: {
        pathLength: 1,
        opacity: 1,
        scale: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1.1, 1],
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
          delay: 0.2,
        },
      },
    },
    path4: {
      initial: {
        pathLength: 1,
        opacity: 1,
        scale: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1.1, 1],
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
          delay: 0.5,
        },
      },
    },
    path5: {
      initial: {
        pathLength: 1,
        opacity: 1,
        scale: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1.1, 1],
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
          delay: 0.7,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ClipboardListProps) {
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
        width="8"
        height="4"
        x="8"
        y="2"
        rx="1"
        ry="1"
        variants={variants.rect}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8 11h.01"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 11h4"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8 16h.01"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 16h4"
        variants={variants.path5}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ClipboardList(props: ClipboardListProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ClipboardList,
  ClipboardList as ClipboardListIcon,
  type ClipboardListProps,
  type ClipboardListProps as ClipboardListIconProps,
};
