'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type PanelBottomCloseProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rect: {},
    line: {
      initial: { x1: 3, y1: 15, x2: 21, y2: 15 },
      animate: {
        x1: 3,
        y1: 17,
        x2: 21,
        y2: 17,
        transition: { type: 'spring', damping: 18, stiffness: 200 },
      },
    },
    arrow: {
      initial: { y: 0 },
      animate: {
        y: 2,
        transition: { type: 'spring', damping: 18, stiffness: 200 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PanelBottomCloseProps) {
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
        x1={3}
        y1={15}
        x2={21}
        y2={15}
        variants={variants.line}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m15 8-3 3-3-3"
        variants={variants.arrow}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function PanelBottomClose(props: PanelBottomCloseProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  PanelBottomClose,
  PanelBottomClose as PanelBottomCloseIcon,
  type PanelBottomCloseProps,
  type PanelBottomCloseProps as PanelBottomCloseIconProps,
};
