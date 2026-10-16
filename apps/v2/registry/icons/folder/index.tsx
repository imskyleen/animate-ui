'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type FolderProps = IconProps<keyof typeof animations>;

const CLOSED_FRONT =
  'M20 20 a2 2 0 0 0 2 -2 V8 a2 2 0 0 0 -2 -2 h-7.9 a2 2 0 0 1 -1.69 -0.9 L9.6 3.9 A2 2 0 0 0 7.93 3 H4 a2 2 0 0 0 -2 2 v13 a2 2 0 0 0 2 2 Z';
const OPEN_FRONT =
  'M20 20 a2 2 0 0 0 2 -2 V11 a2 2 0 0 0 -2 -2 h-7.9 a20 20 0 0 1 -1.69 0 L9.6 9 A20 20 0 0 0 7.93 9 H4 a2 2 0 0 0 -2 2 v7 a2 2 0 0 0 2 2 Z';

const animations = {
  default: {
    group: {},
    back: {},
    path: {
      initial: { d: CLOSED_FRONT },
      animate: {
        d: [CLOSED_FRONT, OPEN_FRONT, CLOSED_FRONT],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  wiggle: {
    group: {
      initial: {
        scale: 1,
        rotate: 0,
        y: 0,
      },
      animate: {
        scale: [1, 0.92, 1.05, 0.98, 1],
        rotate: [0, -3, 3, -1.5, 0],
        y: [0, -1, 0.5, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    back: {},
    path: {},
  } satisfies Record<string, Variants>,
  bounce: {
    group: {
      initial: {
        scale: 1,
        y: 0,
      },
      animate: {
        scale: [1, 0.9, 1.06, 0.97, 1],
        y: [0, -1.5, 0.5, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    back: {},
    path: {},
  } satisfies Record<string, Variants>,
  fill: {
    group: {
      initial: {
        scale: 1,
        rotate: 0,
        y: 0,
      },
      animate: {
        scale: [1, 0.92, 1.05, 0.98, 1],
        rotate: [0, -3, 3, -1.5, 0],
        y: [0, -1, 0.5, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    back: {},
    path: {
      initial: {
        fill: 'currentColor',
        fillOpacity: 0,
      },
      animate: {
        fillOpacity: 1,
        transition: { delay: 0.15 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: FolderProps) {
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
          d={CLOSED_FRONT}
          variants={variants.back}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d={CLOSED_FRONT}
          variants={variants.path}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function Folder(props: FolderProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Folder,
  Folder as FolderIcon,
  type FolderProps,
  type FolderProps as FolderIconProps,
};
