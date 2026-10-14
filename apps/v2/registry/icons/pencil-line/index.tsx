'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type PencilLineProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    pencil: {
      initial: { x: 0, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
      animate: {
        x: [0, 0.9, 0],
        y: [0, -0.9, 0],
        transition: { duration: 0.5, times: [0, 0.4, 1], ease: 'easeOut' },
      },
    },
    line: {
      initial: { pathLength: 1, opacity: 1, transition: { duration: 0.15 } },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.3, delay: 0.12, ease: 'easeOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PencilLineProps) {
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
        d="M13 21h8"
        variants={variants.line}
        initial="initial"
        animate={controls}
      />
      <motion.g variants={variants.pencil} initial="initial" animate={controls}>
        <path d="m15 5 4 4" />
        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
      </motion.g>
    </motion.svg>
  );
}

function PencilLine(props: PencilLineProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  PencilLine,
  PencilLine as PencilLineIcon,
  type PencilLineProps,
  type PencilLineProps as PencilLineIconProps,
};
