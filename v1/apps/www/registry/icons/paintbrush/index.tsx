'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type PaintbrushProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
      animate: {
        rotate: [0, -6, 6, 0],
        transformOrigin: 'top right',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PaintbrushProps) {
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
      variants={variants.group}
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.path
        d="m14.622 17.897-10.68-2.913"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Paintbrush(props: PaintbrushProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Paintbrush,
  Paintbrush as PaintbrushIcon,
  type PaintbrushProps,
  type PaintbrushProps as PaintbrushIconProps,
};
