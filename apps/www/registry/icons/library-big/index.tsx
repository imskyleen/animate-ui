'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type LibraryBigProps = IconProps<keyof typeof animations>;

const PIVOT = '17.6px 20.96px';

const animations = {
  default: {
    standing: {},
    spine: {},
    leaning: {
      initial: {
        rotate: 0,
        transformOrigin: PIVOT,
        transition: { duration: 0.15 },
      },
      animate: {
        rotate: [0, 20, 20, 0, 2, 0],
        transformOrigin: PIVOT,
        transition: {
          duration: 1,
          times: [0, 0.3, 0.5, 0.78, 0.88, 1],
          ease: ['easeOut', 'linear', 'easeIn', 'easeOut', 'easeInOut'],
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: LibraryBigProps) {
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
        height="18"
        x="3"
        y="3"
        rx="1"
        variants={variants.standing}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M7 3v18"
        variants={variants.spine}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z"
        variants={variants.leaning}
        initial="initial"
        animate={controls}
        style={{ transformBox: 'view-box' }}
      />
    </motion.svg>
  );
}

function LibraryBig(props: LibraryBigProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  LibraryBig,
  LibraryBig as LibraryBigIcon,
  type LibraryBigProps,
  type LibraryBigProps as LibraryBigIconProps,
};
