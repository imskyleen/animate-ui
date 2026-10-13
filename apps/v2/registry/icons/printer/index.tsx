'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type PrinterProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    body: {
      initial: { x: 0 },
      animate: {
        x: [0, -0.3, 0.3, -0.3, 0.3, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    sheet: {
      initial: { scaleY: 1, transformOrigin: '50% 0%' },
      animate: {
        scaleY: [0.3, 1],
        transformOrigin: '50% 0%',
        transition: { duration: 0.6, ease: 'easeOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PrinterProps) {
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
      <motion.g variants={variants.body} initial="initial" animate={controls}>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
      </motion.g>
      <motion.rect
        x={6}
        y={14}
        width={12}
        height={8}
        rx={1}
        variants={variants.sheet}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Printer(props: PrinterProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Printer,
  Printer as PrinterIcon,
  type PrinterProps,
  type PrinterProps as PrinterIconProps,
};
