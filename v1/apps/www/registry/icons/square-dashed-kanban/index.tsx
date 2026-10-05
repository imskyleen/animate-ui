'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type SquareDashedKanbanProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
    path6: {},
    path7: {},
    path8: {},
    path9: {},
    path10: {},
    path11: {},
    path12: {},
    line1: {
      initial: {
        y2: 16,
      },
      animate: {
        y2: [16, 11, 14, 16],
        transition: { duration: 0.6, ease: 'linear' },
      },
    },
    line2: {
      initial: {
        y2: 11,
      },
      animate: {
        y2: [11, 14, 16, 11],
        transition: { duration: 0.6, ease: 'linear' },
      },
    },
    line3: {
      initial: {
        y2: 14,
      },
      animate: {
        y2: [14, 16, 11, 14],
        transition: { duration: 0.6, ease: 'linear' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SquareDashedKanbanProps) {
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
        d="M5 3a2 2 0 0 0-2 2"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M9 3h1"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M14 3h1"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M19 3a2 2 0 0 1 2 2"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M21 9v1"
        variants={variants.path5}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M21 14v1"
        variants={variants.path6}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M21 19a2 2 0 0 1-2 2"
        variants={variants.path7}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M14 21h1"
        variants={variants.path8}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M9 21h1"
        variants={variants.path9}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M5 21a2 2 0 0 1-2-2"
        variants={variants.path10}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 14v1"
        variants={variants.path11}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 9v1"
        variants={variants.path12}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={16}
        y1={7}
        x2={16}
        y2={16}
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={12}
        y1={7}
        x2={12}
        y2={11}
        variants={variants.line2}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={8}
        y1={7}
        x2={8}
        y2={14}
        variants={variants.line3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function SquareDashedKanban(props: SquareDashedKanbanProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SquareDashedKanban,
  SquareDashedKanban as SquareDashedKanbanIcon,
  type SquareDashedKanbanProps,
  type SquareDashedKanbanProps as SquareDashedKanbanIconProps,
};
