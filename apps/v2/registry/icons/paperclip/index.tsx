'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type PaperclipProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path: {
      initial: { rotate: 0 },
      animate: {
        rotate: [0, -12, 8, -4, 0],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  draw: {
    path: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [0.02, 1],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
  'draw-loop': {
    path: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0.02, 1],
        transition: {
          duration: 2.4,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PaperclipProps) {
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
      <motion.path
        d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"
        variants={variants.path}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Paperclip(props: PaperclipProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Paperclip,
  Paperclip as PaperclipIcon,
  type PaperclipProps,
  type PaperclipProps as PaperclipIconProps,
};
