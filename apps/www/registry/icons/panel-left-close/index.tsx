'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type PanelLeftCloseProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rect: {},
    line: {
      initial: { x1: 9, y1: 3, x2: 9, y2: 21 },
      animate: {
        x1: 7,
        y1: 3,
        x2: 7,
        y2: 21,
        transition: { type: 'spring', damping: 20, stiffness: 200 },
      },
    },
    arrow: {
      initial: { x: 0 },
      animate: {
        x: -2,
        transition: { type: 'spring', damping: 20, stiffness: 200 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PanelLeftCloseProps) {
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
        width={18}
        height={18}
        x={3}
        y={3}
        rx={2}
        ry={2}
        variants={variants.rect}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={9}
        y1={3}
        x2={9}
        y2={21}
        variants={variants.line}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m16 15-3-3 3-3"
        variants={variants.arrow}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function PanelLeftClose(props: PanelLeftCloseProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  PanelLeftClose,
  PanelLeftClose as PanelLeftCloseIcon,
  type PanelLeftCloseProps,
  type PanelLeftCloseProps as PanelLeftCloseIconProps,
};
