'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Undo2Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { rotate: 0 },
      animate: {
        rotate: [0, -10, 0],
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

function IconComponent({ size, ...props }: Undo2Props) {
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
          d="M11 20h3.5a5.5 5.5 0 0 0 5.5-5.5a5.5 5.5 0 0 0-5.5-5.5H4"
          variants={variants.curve}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M9 14 4 9l5-5"
          variants={variants.head}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function Undo2(props: Undo2Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Undo2,
  Undo2 as Undo2Icon,
  type Undo2Props,
  type Undo2Props as Undo2IconProps,
};
