'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type FolderOpenProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    front: {
      initial: { scaleY: 1, transformOrigin: '50% 100%' },
      animate: {
        scaleY: [1, 0.78, 1],
        transformOrigin: '50% 100%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: FolderOpenProps) {
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
      <path d="M18.45 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
      <motion.path
        d="M6 14l1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5"
        variants={variants.front}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function FolderOpen(props: FolderOpenProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  FolderOpen,
  FolderOpen as FolderOpenIcon,
  type FolderOpenProps,
  type FolderOpenProps as FolderOpenIconProps,
};
