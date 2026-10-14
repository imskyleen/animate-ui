'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Redo2Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { rotate: 0 },
      animate: {
        rotate: [0, 10, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    curve: {},
    head: {},
  } satisfies Record<string, Variants>,
  draw: {
    group: {},
    curve: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [0, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    head: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.25, delay: 0.4, ease: 'easeOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Redo2Props) {
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
          d="M13 20H9.5A5.5 5.5 0 0 1 4 14.5A5.5 5.5 0 0 1 9.5 9H20"
          variants={variants.curve}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="m15 14 5-5-5-5"
          variants={variants.head}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function Redo2(props: Redo2Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Redo2,
  Redo2 as Redo2Icon,
  type Redo2Props,
  type Redo2Props as Redo2IconProps,
};
