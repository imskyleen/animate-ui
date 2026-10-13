'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type FileXProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    x: {
      initial: { rotate: 0 },
      animate: { rotate: 90, transition: { duration: 0.5, ease: 'easeInOut' } },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: FileXProps) {
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
      <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
      <path d="M14 2v5a1 1 0 0 0 1 1h5" />
      <motion.g variants={variants.x} initial="initial" animate={controls}>
        <path d="m14.5 12.5-5 5" />
        <path d="m9.5 12.5 5 5" />
      </motion.g>
    </motion.svg>
  );
}

function FileX(props: FileXProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  FileX,
  FileX as FileXIcon,
  type FileXProps,
  type FileXProps as FileXIconProps,
};
