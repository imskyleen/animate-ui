'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type ArchiveProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    lid: {
      initial: {
        y: 0,
        rotate: 0,
        transformOrigin: '2px 5.5px',
        transition: { duration: 0.15 },
      },
      animate: {
        y: [0, -1, 0],
        rotate: [0, -2, 0],
        transformOrigin: '2px 5.5px',
        transition: { duration: 0.5, times: [0, 0.4, 1], ease: 'easeInOut' },
      },
    },
    body: {},
    handle: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ArchiveProps) {
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
        width="20"
        height="5"
        x="2"
        y="3"
        rx="1"
        variants={variants.lid}
        initial="initial"
        animate={controls}
        style={{ transformBox: 'view-box' }}
      />
      <motion.path
        d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"
        variants={variants.body}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M10 12h4"
        variants={variants.handle}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Archive(props: ArchiveProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Archive,
  Archive as ArchiveIcon,
  type ArchiveProps,
  type ArchiveProps as ArchiveIconProps,
};
