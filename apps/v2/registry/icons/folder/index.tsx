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

const animations = {
  default: {
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
          d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"
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
