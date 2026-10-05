'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type KanbanProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    line1: {
      initial: {
        y2: 19,
      },
      animate: {
        y2: [19, 11, 16, 19],
        transition: { duration: 0.6, ease: 'linear' },
      },
    },
    line2: {
      initial: {
        y2: 11,
      },
      animate: {
        y2: [11, 16, 19, 11],
        transition: { duration: 0.6, ease: 'linear' },
      },
    },
    line3: {
      initial: {
        y2: 16,
      },
      animate: {
        y2: [16, 19, 11, 16],
        transition: { duration: 0.6, ease: 'linear' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: KanbanProps) {
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
      <motion.line
        x1={18}
        y1={5}
        x2={18}
        y2={19}
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={12}
        y1={5}
        x2={12}
        y2={11}
        variants={variants.line2}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={6}
        y1={5}
        x2={6}
        y2={16}
        variants={variants.line3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Kanban(props: KanbanProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Kanban,
  Kanban as KanbanIcon,
  type KanbanProps,
  type KanbanProps as KanbanIconProps,
};
