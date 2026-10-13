'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type BookmarkProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { scaleY: 1, transformOrigin: '50% 0%' },
      animate: {
        scaleY: [1, 0.82, 1.03, 1],
        transformOrigin: '50% 0%',
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    path: {},
  } satisfies Record<string, Variants>,
  fill: {
    group: {
      initial: { scaleY: 1, transformOrigin: '50% 0%' },
      animate: {
        scaleY: [1, 0.82, 1.03, 1],
        transformOrigin: '50% 0%',
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    path: {
      initial: { fill: 'currentColor', fillOpacity: 0 },
      animate: { fillOpacity: 1, transition: { delay: 0.2 } },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BookmarkProps) {
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
          d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"
          variants={variants.path}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function Bookmark(props: BookmarkProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Bookmark,
  Bookmark as BookmarkIcon,
  type BookmarkProps,
  type BookmarkProps as BookmarkIconProps,
};
