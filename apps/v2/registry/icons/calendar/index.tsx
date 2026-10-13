'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type CalendarProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    ring1: {
      initial: { y: 0 },
      animate: {
        y: [0, -1, 0, -0.3, 0],
        transition: {
          duration: 0.5,
          ease: 'easeInOut',
          times: [0, 0.3, 0.55, 0.75, 1],
        },
      },
    },
    ring2: {
      initial: { y: 0 },
      animate: {
        y: [0, -1, 0, -0.3, 0],
        transition: {
          duration: 0.5,
          ease: 'easeInOut',
          times: [0, 0.3, 0.55, 0.75, 1],
          delay: 0.08,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CalendarProps) {
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
        d="M8 2v3"
        variants={variants.ring1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16 2v3"
        variants={variants.ring2}
        initial="initial"
        animate={controls}
      />
      <rect x={3} y={3} width={18} height={18} rx={2} />
      <path d="M3 9h18" />
    </motion.svg>
  );
}

function Calendar(props: CalendarProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Calendar,
  Calendar as CalendarIcon,
  type CalendarProps,
  type CalendarProps as CalendarIconProps,
};
